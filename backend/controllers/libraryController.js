const Book = require("../models/Book");
const BookTransaction = require("../models/BookTransaction");

const LOAN_PERIOD_DAYS = 14;
const FINE_PER_DAY = 5; // currency units

// @route GET /api/library/books
// Public catalog view - shows availability status for every book
exports.getAllBooks = async (req, res) => {
  try {
    const { search, category } = req.query;
    const filter = {};
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { author: { $regex: search, $options: "i" } },
      ];
    }
    if (category) filter.category = category;

    const books = await Book.find(filter).select(
      "title author isbn category totalCopies availableCopies"
    );
    res.json(books);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route GET /api/library/books/:id
// @access librarian, admin - shows WHO currently holds each copy (private info)
exports.getBookDetail = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id)
      .populate("currentlyIssuedTo.studentId", "name rollNumber email")
      .populate("reservationQueue.studentId", "name rollNumber email");
    if (!book) return res.status(404).json({ message: "Book not found" });
    res.json(book);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route POST /api/library/books
// @access librarian, admin
exports.addBook = async (req, res) => {
  try {
    const { title, author, isbn, category, totalCopies } = req.body;
    const book = await Book.create({
      title,
      author,
      isbn,
      category,
      totalCopies,
      availableCopies: totalCopies,
    });
    res.status(201).json(book);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route POST /api/library/books/:id/issue
// @access librarian, admin
// Body: { studentId }
exports.issueBook = async (req, res) => {
  try {
    const { studentId } = req.body;
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: "Book not found" });

    if (book.availableCopies <= 0) {
      return res.status(400).json({
        message: "No copies available. Student can join the reservation queue instead.",
      });
    }

    const alreadyHas = book.currentlyIssuedTo.some(
      (entry) => entry.studentId.toString() === studentId
    );
    if (alreadyHas) {
      return res.status(400).json({ message: "This student already holds a copy of this book" });
    }

    const issueDate = new Date();
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + LOAN_PERIOD_DAYS);

    book.availableCopies -= 1;
    book.currentlyIssuedTo.push({ studentId, issueDate, dueDate });
    await book.save();

    await BookTransaction.create({
      bookId: book._id,
      studentId,
      issueDate,
      dueDate,
    });

    // NOTE: emit a socket.io event here in server.js integration, e.g.
    // io.emit("book:issued", { bookId: book._id, availableCopies: book.availableCopies })

    res.json({ message: "Book issued successfully", dueDate, book });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route POST /api/library/books/:id/return
// @access librarian, admin
// Body: { studentId }
exports.returnBook = async (req, res) => {
  try {
    const { studentId } = req.body;
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: "Book not found" });

    const entryIndex = book.currentlyIssuedTo.findIndex(
      (e) => e.studentId.toString() === studentId
    );
    if (entryIndex === -1) {
      return res.status(400).json({ message: "No active issue record for this student" });
    }

    const entry = book.currentlyIssuedTo[entryIndex];
    const returnDate = new Date();

    // Calculate fine if overdue
    let fineAmount = 0;
    if (returnDate > entry.dueDate) {
      const overdueDays = Math.ceil((returnDate - entry.dueDate) / (1000 * 60 * 60 * 24));
      fineAmount = overdueDays * FINE_PER_DAY;
    }

    book.currentlyIssuedTo.splice(entryIndex, 1);
    book.availableCopies += 1;
    await book.save();

    await BookTransaction.findOneAndUpdate(
      { bookId: book._id, studentId, returnDate: null },
      { returnDate, fineAmount },
      { sort: { issueDate: -1 } }
    );

    // Notify the next person in the reservation queue (if any)
    let notifiedStudentId = null;
    if (book.reservationQueue.length > 0) {
      notifiedStudentId = book.reservationQueue[0].studentId;
      // NOTE: trigger email/socket notification here to notifiedStudentId
      // io.to(notifiedStudentId).emit("book:available", { bookId: book._id })
    }

    res.json({ message: "Book returned", fineAmount, notifiedStudentId });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route POST /api/library/books/:id/reserve
// @access student
exports.reserveBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: "Book not found" });

    if (book.availableCopies > 0) {
      return res.status(400).json({ message: "Book is currently available, no need to reserve" });
    }

    const alreadyQueued = book.reservationQueue.some(
      (e) => e.studentId.toString() === req.user._id.toString()
    );
    if (alreadyQueued) {
      return res.status(400).json({ message: "You are already in the queue for this book" });
    }

    book.reservationQueue.push({ studentId: req.user._id });
    await book.save();

    res.json({
      message: "Added to reservation queue",
      positionInQueue: book.reservationQueue.length,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route GET /api/library/overdue
// @access librarian, admin
exports.getOverdueBooks = async (req, res) => {
  try {
    const now = new Date();
    const books = await Book.find({ "currentlyIssuedTo.dueDate": { $lt: now } })
      .populate("currentlyIssuedTo.studentId", "name rollNumber email");

    const overdueList = [];
    books.forEach((book) => {
      book.currentlyIssuedTo.forEach((entry) => {
        if (entry.dueDate < now) {
          overdueList.push({
            bookTitle: book.title,
            bookId: book._id,
            student: entry.studentId,
            dueDate: entry.dueDate,
            daysOverdue: Math.ceil((now - entry.dueDate) / (1000 * 60 * 60 * 24)),
          });
        }
      });
    });

    res.json(overdueList);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

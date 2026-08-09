// Run with: npm run seed
// Populates sample admin/faculty/student users, a subject, some attendance
// records, and a couple of library books so you can test the API immediately.

require("dotenv").config();
const connectDB = require("./config/db");
const User = require("./models/User");
const Subject = require("./models/Subject");
const Attendance = require("./models/Attendance");
const Book = require("./models/Book");

const run = async () => {
  await connectDB();

  await Promise.all([
    User.deleteMany({}),
    Subject.deleteMany({}),
    Attendance.deleteMany({}),
    Book.deleteMany({}),
  ]);

  const admin = await User.create({
    name: "Dr. Admin",
    email: "admin@college.edu",
    password: "password123",
    role: "admin",
    employeeId: "ADM001",
  });

  const faculty = await User.create({
    name: "Prof. Faculty",
    email: "faculty@college.edu",
    password: "password123",
    role: "faculty",
    employeeId: "FAC001",
    department: "CSE",
  });

  const student = await User.create({
    name: "Sample Student",
    email: "student@college.edu",
    password: "password123",
    role: "student",
    rollNumber: "CSE2023001",
    department: "CSE",
    year: 3,
    cgpa: 8.2,
  });

  const librarian = await User.create({
    name: "Ms. Librarian",
    email: "librarian@college.edu",
    password: "password123",
    role: "librarian",
    employeeId: "LIB001",
  });

  const subject = await Subject.create({
    name: "Data Structures & Algorithms",
    code: "CSE301",
    department: "CSE",
    year: 3,
    semester: 5,
    facultyId: faculty._id,
  });

  // Seed 20 classes: 14 present, 6 absent -> 70% (below threshold, to demo the alert)
  const records = [];
  for (let i = 0; i < 20; i++) {
    const date = new Date();
    date.setDate(date.getDate() - (20 - i));
    records.push({
      studentId: student._id,
      subjectId: subject._id,
      date,
      status: i < 14 ? "present" : "absent",
      markedBy: faculty._id,
    });
  }
  await Attendance.insertMany(records);

  await Book.create([
    {
      title: "Introduction to Algorithms",
      author: "Cormen, Leiserson, Rivest, Stein",
      isbn: "9780262033848",
      category: "Computer Science",
      totalCopies: 2,
      availableCopies: 1,
      currentlyIssuedTo: [
        {
          studentId: student._id,
          issueDate: new Date(),
          dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        },
      ],
    },
    {
      title: "Clean Code",
      author: "Robert C. Martin",
      isbn: "9780132350884",
      category: "Software Engineering",
      totalCopies: 3,
      availableCopies: 3,
    },
  ]);

  console.log("Seed data created:");
  console.log("  admin@college.edu / password123");
  console.log("  faculty@college.edu / password123");
  console.log("  student@college.edu / password123 (70% attendance in CSE301 — below threshold)");
  console.log("  librarian@college.edu / password123");

  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});

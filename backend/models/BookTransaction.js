const mongoose = require("mongoose");

const bookTransactionSchema = new mongoose.Schema(
  {
    bookId: { type: mongoose.Schema.Types.ObjectId, ref: "Book", required: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    issueDate: { type: Date, required: true, default: Date.now },
    dueDate: { type: Date, required: true },
    returnDate: { type: Date }, // null while still issued
    fineAmount: { type: Number, default: 0 },
    finePaid: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("BookTransaction", bookTransactionSchema);

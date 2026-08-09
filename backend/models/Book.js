const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    author: { type: String, required: true },
    isbn: { type: String, required: true, unique: true },
    category: { type: String },
    totalCopies: { type: Number, required: true, default: 1 },
    availableCopies: { type: Number, required: true, default: 1 },
    // Current holders - array since totalCopies can be > 1
    currentlyIssuedTo: [
      {
        studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        issueDate: { type: Date },
        dueDate: { type: Date },
      },
    ],
    reservationQueue: [
      {
        studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        requestedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

bookSchema.virtual("status").get(function () {
  return this.availableCopies > 0 ? "available" : "unavailable";
});
bookSchema.set("toJSON", { virtuals: true });

module.exports = mongoose.model("Book", bookSchema);

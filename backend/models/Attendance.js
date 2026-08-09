const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    subjectId: { type: mongoose.Schema.Types.ObjectId, ref: "Subject", required: true },
    date: { type: Date, required: true },
    status: { type: String, enum: ["present", "absent"], required: true },
    markedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // faculty
  },
  { timestamps: true }
);

// Prevent duplicate attendance entries for same student/subject/date
attendanceSchema.index({ studentId: 1, subjectId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("Attendance", attendanceSchema);

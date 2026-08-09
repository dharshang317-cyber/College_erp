const mongoose = require("mongoose");

const subjectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    code: { type: String, required: true, unique: true },
    department: { type: String, required: true },
    year: { type: Number, required: true },
    semester: { type: Number, required: true },
    facultyId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    totalClassesPlanned: { type: Number, default: 0 }, // used for workload/reporting
  },
  { timestamps: true }
);

module.exports = mongoose.model("Subject", subjectSchema);

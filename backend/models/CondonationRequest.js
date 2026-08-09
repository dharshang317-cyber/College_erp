const mongoose = require("mongoose");

const condonationRequestSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    subjectId: { type: mongoose.Schema.Types.ObjectId, ref: "Subject", required: true },
    reason: { type: String, required: true },
    proofDocumentUrl: { type: String }, // medical certificate etc. (Cloudinary/S3 URL)
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    reviewComment: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("CondonationRequest", condonationRequestSchema);

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6, select: false },
    role: {
      type: String,
      enum: ["student", "faculty", "librarian", "admin", "placement_officer"],
      required: true,
      default: "student",
    },
    // Student-specific fields
    rollNumber: { type: String, unique: true, sparse: true },
    department: { type: String },
    year: { type: Number, min: 1, max: 4 },
    cgpa: { type: Number, min: 0, max: 10 },

    // Faculty-specific fields
    employeeId: { type: String, unique: true, sparse: true },
    subjectsHandled: [{ type: mongoose.Schema.Types.ObjectId, ref: "Subject" }],

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("User", userSchema);

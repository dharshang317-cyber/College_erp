const Attendance = require("../models/Attendance");
const CondonationRequest = require("../models/CondonationRequest");

const ELIGIBILITY_THRESHOLD = 75; // %

// @route POST /api/attendance/mark
// @access faculty, admin
// Body: { subjectId, date, records: [{ studentId, status }] }
exports.markAttendance = async (req, res) => {
  try {
    const { subjectId, date, records } = req.body;

    if (!subjectId || !date || !Array.isArray(records) || records.length === 0) {
      return res.status(400).json({ message: "subjectId, date and records[] are required" });
    }

    const ops = records.map((r) => ({
      updateOne: {
        filter: { studentId: r.studentId, subjectId, date: new Date(date) },
        update: {
          $set: {
            status: r.status,
            markedBy: req.user._id,
          },
        },
        upsert: true,
      },
    }));

    await Attendance.bulkWrite(ops);

    res.status(200).json({ message: "Attendance recorded", count: records.length });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route GET /api/attendance/student/:studentId/subject/:subjectId
// Returns per-subject attendance % + eligibility status + bunk calculator
exports.getStudentSubjectAttendance = async (req, res) => {
  try {
    const { studentId, subjectId } = req.params;

    const total = await Attendance.countDocuments({ studentId, subjectId });
    const present = await Attendance.countDocuments({ studentId, subjectId, status: "present" });

    const percentage = total === 0 ? 100 : (present / total) * 100;
    const isEligible = percentage >= ELIGIBILITY_THRESHOLD;

    // Bunk calculator: how many more classes can the student miss
    // and still stay >= 75%, assuming no more classes are added to the denominator
    // beyond what's already conducted (simple model; can be refined with planned classes).
    let classesCanBunk = 0;
    if (isEligible) {
      // Find max n such that present / (total + n) >= 0.75
      // present >= 0.75 * (total + n)  =>  n <= (present / 0.75) - total
      classesCanBunk = Math.floor(present / (ELIGIBILITY_THRESHOLD / 100) - total);
      if (classesCanBunk < 0) classesCanBunk = 0;
    }

    // Classes needed to attend consecutively to reach 75% if currently below
    let classesNeededToAttend = 0;
    if (!isEligible) {
      // Find min n such that (present + n) / (total + n) >= 0.75
      // present + n >= 0.75 * (total + n)  => 0.25n >= 0.75*total - present
      // n >= (0.75*total - present) / 0.25
      const needed = (0.75 * total - present) / 0.25;
      classesNeededToAttend = Math.ceil(needed > 0 ? needed : 0);
    }

    res.json({
      studentId,
      subjectId,
      totalClasses: total,
      present,
      absent: total - present,
      percentage: Number(percentage.toFixed(2)),
      isEligible,
      threshold: ELIGIBILITY_THRESHOLD,
      classesCanBunk, // relevant when eligible
      classesNeededToAttend, // relevant when NOT eligible
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route GET /api/attendance/student/:studentId/summary
// Returns attendance across ALL subjects for a student
exports.getStudentSummary = async (req, res) => {
  try {
    const { studentId } = req.params;

    const records = await Attendance.aggregate([
      { $match: { studentId: new (require("mongoose").Types.ObjectId)(studentId) } },
      {
        $group: {
          _id: "$subjectId",
          total: { $sum: 1 },
          present: { $sum: { $cond: [{ $eq: ["$status", "present"] }, 1, 0] } },
        },
      },
      {
        $lookup: {
          from: "subjects",
          localField: "_id",
          foreignField: "_id",
          as: "subject",
        },
      },
      { $unwind: "$subject" },
      {
        $project: {
          subjectName: "$subject.name",
          subjectCode: "$subject.code",
          total: 1,
          present: 1,
          percentage: {
            $round: [{ $multiply: [{ $divide: ["$present", "$total"] }, 100] }, 2],
          },
        },
      },
    ]);

    const summary = records.map((r) => ({
      ...r,
      isEligible: r.percentage >= ELIGIBILITY_THRESHOLD,
    }));

    res.json(summary);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route POST /api/attendance/condonation
// @access student
exports.requestCondonation = async (req, res) => {
  try {
    const { subjectId, reason, proofDocumentUrl } = req.body;
    const request = await CondonationRequest.create({
      studentId: req.user._id,
      subjectId,
      reason,
      proofDocumentUrl,
    });
    res.status(201).json(request);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route PUT /api/attendance/condonation/:id/review
// @access admin (HOD)
exports.reviewCondonation = async (req, res) => {
  try {
    const { status, reviewComment } = req.body; // status: approved | rejected
    const request = await CondonationRequest.findByIdAndUpdate(
      req.params.id,
      { status, reviewComment, reviewedBy: req.user._id },
      { new: true }
    );
    if (!request) return res.status(404).json({ message: "Request not found" });
    res.json(request);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route GET /api/attendance/condonation/pending
// @access admin
exports.getPendingCondonations = async (req, res) => {
  try {
    const requests = await CondonationRequest.find({ status: "pending" })
      .populate("studentId", "name rollNumber")
      .populate("subjectId", "name code");
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

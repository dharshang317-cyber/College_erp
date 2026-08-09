const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const { authorize } = require("../middleware/role");
const ctrl = require("../controllers/attendanceController");

router.post("/mark", protect, authorize("faculty", "admin"), ctrl.markAttendance);

router.get(
  "/student/:studentId/subject/:subjectId",
  protect,
  ctrl.getStudentSubjectAttendance
);

router.get("/student/:studentId/summary", protect, ctrl.getStudentSummary);

router.post("/condonation", protect, authorize("student"), ctrl.requestCondonation);
router.put(
  "/condonation/:id/review",
  protect,
  authorize("admin"),
  ctrl.reviewCondonation
);
router.get(
  "/condonation/pending",
  protect,
  authorize("admin"),
  ctrl.getPendingCondonations
);

module.exports = router;

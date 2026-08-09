const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const { authorize } = require("../middleware/role");
const ctrl = require("../controllers/libraryController");

router.get("/books", protect, ctrl.getAllBooks);
router.get("/books/:id", protect, authorize("librarian", "admin"), ctrl.getBookDetail);
router.post("/books", protect, authorize("librarian", "admin"), ctrl.addBook);

router.post("/books/:id/issue", protect, authorize("librarian", "admin"), ctrl.issueBook);
router.post("/books/:id/return", protect, authorize("librarian", "admin"), ctrl.returnBook);
router.post("/books/:id/reserve", protect, authorize("student"), ctrl.reserveBook);

router.get("/overdue", protect, authorize("librarian", "admin"), ctrl.getOverdueBooks);

module.exports = router;

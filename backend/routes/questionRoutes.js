const express = require("express");
const router = express.Router();
const {
  getNextQuestion,
  getQuestionById,
  listQuestions,
  listCompanies,
  createQuestion,
} = require("../controllers/questionController");
const { protect } = require("../middleware/authMiddleware");

router.get("/next", protect, getNextQuestion);
router.get("/companies/list", protect, listCompanies); // must come before "/:id"
router.get("/", protect, listQuestions);
router.get("/:id", protect, getQuestionById);
router.post("/", protect, createQuestion); // in production, restrict this to admin users

module.exports = router;

const express = require("express");
const {
  getCategories,
  createCategory,
} = require("../controllers/categoryController");
const { protect, authorize } = require("../middlewares/auth");

const router = express.Router();

router
  .route("/")
  .get(getCategories)
  .post(protect, authorize("admin"), createCategory);

module.exports = router;

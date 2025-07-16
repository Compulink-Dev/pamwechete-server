const Category = require("../models/Category");
const asyncHandler = require("../middlewares/async");
const ErrorResponse = require("../utils/errorResponse");

// @desc    Get all categories
// @route   GET /api/v1/categories
// @access  Public
exports.getCategories = asyncHandler(async (req, res, next) => {
  const categories = await Category.find().sort({ name: 1 });
  res.status(200).json({ success: true, data: categories });
});

// @desc    Create a category
// @route   POST /api/v1/categories
// @access  Private/Admin
exports.createCategory = asyncHandler(async (req, res, next) => {
  const { name } = req.body;
  const slug = name.toLowerCase().replace(/\s+/g, "-");
  const category = await Category.create({ name, slug });
  res.status(201).json({ success: true, data: category });
});

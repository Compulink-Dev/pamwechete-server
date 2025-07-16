const Trade = require("../models/Trade");
const User = require("../models/User");
const Receipt = require("../models/Receipt");
const Category = require("../models/Category");
const mongoose = require("mongoose");
const ErrorResponse = require("../utils/errorResponse");
const { fiscalizeTransaction } = require("../services/zimraService");
const asyncHandler = require("../middlewares/async");

// @desc    Get all trades or trades by userId
// @route   GET /api/v1/trades
// @route   GET /api/v1/users/:userId/trades
// @access  Public
exports.getTrades = asyncHandler(async (req, res, next) => {
  let query;

  if (req.params.userId) {
    query = Trade.find({ user: req.params.userId });
  } else {
    query = Trade.find();
  }

  const trades = await query
    .populate("user", "username profile")
    .populate("categories", "name slug")
    .lean();

  const tradesWithValue = trades.map((trade) => ({
    ...trade,
    totalValue: trade.items.reduce((sum, item) => sum + (item.value || 0), 0),
  }));

  res.status(200).json({
    success: true,
    count: tradesWithValue.length,
    data: tradesWithValue,
  });
});

// @desc    Get single trade
// @route   GET /api/v1/trades/:id
// @access  Public
exports.getTrade = asyncHandler(async (req, res, next) => {
  const trade = await Trade.findById(req.params.id)
    .populate("user", "username profile")
    .populate("categories", "name slug");

  if (!trade) {
    return next(
      new ErrorResponse(`Trade not found with id of ${req.params.id}`, 404)
    );
  }

  const totalValue = trade.items.reduce(
    (sum, item) => sum + (item.value || 0),
    0
  );

  res.status(200).json({
    success: true,
    data: {
      ...trade.toObject(),
      totalValue,
    },
  });
});

// @desc    Create new trade
// @route   POST /api/v1/trades
// @access  Private
exports.createTrade = asyncHandler(async (req, res, next) => {
  req.body.user = req.user.id;

  // Validate categories (assumed slugs are sent)
  if (!Array.isArray(req.body.categories) || req.body.categories.length === 0) {
    return next(new ErrorResponse("At least one category is required", 400));
  }

  const foundCategories = await Category.find({
    slug: { $in: req.body.categories },
  });

  if (foundCategories.length !== req.body.categories.length) {
    return next(new ErrorResponse("One or more categories not found", 400));
  }

  req.body.categories = foundCategories.map((cat) => cat._id);

  const trade = await Trade.create(req.body);

  if (trade.cashAmount > 0) {
    const receipt = await fiscalizeTransaction({
      tradeId: trade._id,
      amount: trade.cashAmount,
      userTin: req.user.zimraTin,
    });

    trade.fiscalReceipt = receipt._id;
    await trade.save();
  }

  res.status(201).json({
    success: true,
    data: trade,
  });
});

// @desc    Update trade
// @route   PUT /api/v1/trades/:id
// @access  Private
exports.updateTrade = asyncHandler(async (req, res, next) => {
  let trade = await Trade.findById(req.params.id);

  if (!trade) {
    return next(
      new ErrorResponse(`Trade not found with id of ${req.params.id}`, 404)
    );
  }

  if (trade.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(new ErrorResponse("Not authorized to update this trade", 401));
  }

  // Handle updated categories if provided
  if (req.body.categories) {
    const foundCategories = await Category.find({
      slug: { $in: req.body.categories },
    });

    if (foundCategories.length !== req.body.categories.length) {
      return next(new ErrorResponse("One or more categories not found", 400));
    }

    req.body.categories = foundCategories.map((cat) => cat._id);
  }

  trade = await Trade.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: trade,
  });
});

// @desc    Delete trade
// @route   DELETE /api/v1/trades/:id
// @access  Private
exports.deleteTrade = asyncHandler(async (req, res, next) => {
  const trade = await Trade.findById(req.params.id);

  if (!trade) {
    return next(
      new ErrorResponse(`Trade not found with id of ${req.params.id}`, 404)
    );
  }

  if (trade.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(new ErrorResponse("Not authorized to delete this trade", 401));
  }

  await trade.remove();

  res.status(200).json({
    success: true,
    data: {},
  });
});

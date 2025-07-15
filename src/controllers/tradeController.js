const Trade = require("../models/Trade");
const User = require("../models/User");
const Receipt = require("../models/Receipt");
const ErrorResponse = require("../utils/errorResponse");
const { fiscalizeTransaction } = require("../services/zimraService");
const asyncHandler = require("../middlewares/async");

// @desc    Get all trades
// @route   GET /api/v1/trades
// @route   GET /api/v1/users/:userId/trades
// @access  Public
exports.getTrades = asyncHandler(async (req, res, next) => {
  if (req.params.userId) {
    const trades = await Trade.find({ user: req.params.userId });
    return res.status(200).json({
      success: true,
      count: trades.length,
      data: trades,
    });
  } else {
    res.status(200).json(res.advancedResults);
  }
});

// @desc    Get single trade
// @route   GET /api/v1/trades/:id
// @access  Public
exports.getTrade = asyncHandler(async (req, res, next) => {
  const trade = await Trade.findById(req.params.id).populate({
    path: "user",
    select: "username profile",
  });

  if (!trade) {
    return next(
      new ErrorResponse(`Trade not found with id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: trade,
  });
});

// @desc    Create new trade
// @route   POST /api/v1/trades
// @access  Private
exports.createTrade = asyncHandler(async (req, res, next) => {
  // Add user to req.body
  req.body.user = req.user.id;

  const trade = await Trade.create(req.body);

  // If cash amount involved, fiscalize
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

  // Make sure user is trade owner or admin
  if (trade.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to update this trade`,
        401
      )
    );
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

  // Make sure user is trade owner or admin
  if (trade.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to delete this trade`,
        401
      )
    );
  }

  await trade.remove();

  res.status(200).json({
    success: true,
    data: {},
  });
});

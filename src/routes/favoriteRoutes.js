const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/auth.js");
const Favorite = require("../models/Favorite.js");
const Trade = require("../models/Trade.js");

// @desc    Add trade to favorites
// @route   POST /api/v1/favorites
// @access  Private
router.post("/", protect, async (req, res) => {
  try {
    const { tradeId } = req.body;

    if (!tradeId) {
      return res.status(400).json({
        success: false,
        error: "Trade ID is required",
      });
    }

    const trade = await Trade.findById(tradeId);
    if (!trade) {
      return res.status(404).json({
        success: false,
        error: "Trade not found",
      });
    }

    const existingFavorite = await Favorite.findOne({
      user: req.user.id,
      trade: tradeId,
    });

    if (existingFavorite) {
      return res.status(400).json({
        success: false,
        error: "This trade is already in your favorites",
      });
    }

    const favorite = await Favorite.create({
      user: req.user.id,
      trade: tradeId,
    });

    await favorite.populate("trade");

    res.status(201).json({
      success: true,
      data: favorite,
    });
  } catch (err) {
    console.error("Error in favorites POST:", err);
    res.status(500).json({
      success: false,
      error: "Server Error",
      message: err.message, // Send the actual error message
    });
  }
});

// @desc    Get user's favorites
// @route   GET /api/v1/favorites
// @access  Private
router.get("/", protect, async (req, res) => {
  try {
    const favorites = await Favorite.find({ user: req.user.id })
      .populate("trade")
      .sort("-createdAt");

    res.status(200).json({
      success: true,
      count: favorites.length,
      data: favorites,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
});

// @desc    Remove from favorites
// @route   DELETE /api/v1/favorites/:id
// @access  Private
router.delete("/:id", protect, async (req, res) => {
  try {
    const favorite = await Favorite.findById(req.params.id);

    if (!favorite) {
      return res.status(404).json({
        success: false,
        error: "Favorite not found",
      });
    }

    // Make sure user owns the favorite
    if (favorite.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        error: "Not authorized to delete this favorite",
      });
    }

    await favorite.remove();

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
});

module.exports = router;

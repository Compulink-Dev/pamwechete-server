const mongoose = require("mongoose");

const FavoriteSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },
  trade: {
    type: mongoose.Schema.ObjectId,
    ref: "Trade",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Prevent duplicate favorites
FavoriteSchema.index({ user: 1, trade: 1 }, { unique: true });

module.exports = mongoose.model("Favorite", FavoriteSchema);

const User = require("../models/User");
const Trade = require("../models/Trade");

// Mock AI recommendation - integrate with actual ML model
exports.recommendTrades = async (user) => {
  // 1. Content-based filtering
  const similarTrades = await Trade.find({
    "items.category": { $in: user.profile.tradePreferences },
  }).limit(10);

  // 2. Collaborative filtering (mock)
  const similarUsers = await User.find({
    "profile.demographics.incomeLevel": user.profile.demographics.incomeLevel,
    "profile.location": user.profile.location,
  });

  const userTrades = await Trade.find({
    user: { $in: similarUsers.map((u) => u._id) },
  }).limit(10);

  // Combine and deduplicate
  return [...similarTrades, ...userTrades]
    .filter(
      (trade, index, self) =>
        index === self.findIndex((t) => t._id.equals(trade._id))
    )
    .slice(0, 10);
};

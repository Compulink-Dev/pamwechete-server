const express = require("express");
const {
  getTrades,
  getTrade,
  createTrade,
  updateTrade,
  deleteTrade,
} = require("../controllers/tradeController");
const { protect, authorize } = require("../middlewares/auth");
const advancedResults = require("../utils/advancedResults");
const Trade = require("../models/Trade");

const router = express.Router();

router
  .route("/")
  .get(
    advancedResults(Trade, {
      path: "user",
      select: "username profile",
    }),
    getTrades
  )
  .post(protect, authorize("user", "admin"), createTrade);

router
  .route("/:id")
  .get(getTrade)
  .put(protect, authorize("user", "admin"), updateTrade)
  .delete(protect, authorize("user", "admin"), deleteTrade);

// Protected routes
router.use(protect); // All routes below this will be protected

// Add new route for getting trades by user ID
router.get("/user/:userId", authorize("user", "admin"), getUserTrades);

module.exports = router;

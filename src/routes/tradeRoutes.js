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
  .get(advancedResults(Trade, "user"), getTrades)
  .post(protect, authorize("user", "admin"), createTrade);

router
  .route("/:id")
  .get(getTrade)
  .put(protect, authorize("user", "admin"), updateTrade)
  .delete(protect, authorize("user", "admin"), deleteTrade);

module.exports = router;

const mongoose = require("mongoose");

const ReceiptSchema = new mongoose.Schema({
  trade: {
    type: mongoose.Schema.ObjectId,
    ref: "Trade",
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  tin: String,
  receiptNumber: String,
  fiscalizedAt: {
    type: Date,
    default: Date.now,
  },
  zimraResponse: Object,
});

module.exports = mongoose.model("Receipt", ReceiptSchema);

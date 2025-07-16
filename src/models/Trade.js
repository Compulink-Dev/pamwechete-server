const mongoose = require("mongoose");

const TradeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },
  type: {
    type: String,
    enum: ["goods", "services", "cash"],
    required: true,
  },
  title: {
    type: String,
    required: [true, "Please add a title"],
    trim: true,
    maxlength: [100, "Title cannot be more than 100 characters"],
  },
  description: {
    type: String,
    required: [true, "Please add a description"],
  },
  categories: [
    {
      type: mongoose.Schema.ObjectId,
      ref: "Category",
      required: true,
    },
  ],
  items: [
    {
      name: String,
      description: String,
      condition: {
        type: String,
        enum: ["new", "used", "refurbished"],
      },
      images: [String],
      value: Number,
    },
  ],
  serviceDetails: {
    type: {
      type: String,
      enum: ["physical", "digital", "consultation"],
    },
    duration: Number, // in hours
    skillsRequired: [String],
  },
  cashAmount: {
    type: Number,
    default: 0,
  },
  location: {
    type: {
      type: String,
      enum: ["Point"],
      required: false,
    },
    coordinates: {
      type: [Number],
      required: false,
      index: "2dsphere",
    },
    formattedAddress: String,
  },
  status: {
    type: String,
    enum: ["pending", "active", "completed", "cancelled"],
    default: "pending",
  },
  fiscalReceipt: {
    type: mongoose.Schema.ObjectId,
    ref: "Receipt",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

TradeSchema.methods.calculateTotalValue = function () {
  return this.items.reduce((sum, item) => sum + (item.value || 0), 0);
};

// Geocode & create location field
TradeSchema.pre("save", async function (next) {
  // Add your geocoding logic here
  next();
});

module.exports = mongoose.model("Trade", TradeSchema);

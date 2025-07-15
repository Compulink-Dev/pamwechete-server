const express = require("express");
const path = require("path");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const sanitize = require("./middlewares/sanitize");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const hpp = require("hpp");
const cors = require("cors");
const errorHandler = require("./middlewares/error");
const connectDB = require("./config/db");

// Load env vars
require("dotenv").config();

// Connect to database
connectDB();

// Route files
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const tradeRoutes = require("./routes/tradeRoutes");
const aiRoutes = require("./routes/aiRoutes");

const app = express();

// Body parser
// 1. Basic Express middlewares (order matters!)
app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));

// 2. CORS - Should come before other security middlewares
app.use(cors());

// 3. Rate limiting
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 mins
  max: 100,
});
app.use(limiter);

// 4. Security headers
app.use(helmet());

// 5. Simplified MongoDB sanitization
app.use(sanitize);

// 6. HPP - Must come after body parser
app.use(hpp());

// 7. Static files
app.use(express.static(path.join(__dirname, "public")));

// 8. Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/trades", tradeRoutes);
app.use("/api/v1/ai", aiRoutes);

// 9. Error handler (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err, promise) => {
  console.log(`Error: ${err.message}`.red);
  // Close server & exit process
  server.close(() => process.exit(1));
});

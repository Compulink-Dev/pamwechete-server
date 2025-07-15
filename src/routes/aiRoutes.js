// src/routes/aiRoutes.js
const express = require("express");
const router = express.Router();
const { aiPromptHandler } = require("../controllers/aiController");

router.post("/prompt", aiPromptHandler);

module.exports = router;

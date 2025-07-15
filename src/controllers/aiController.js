// src/controllers/aiController.js
const asyncHandler = require("../middlewares/async");

// @desc    Handle AI prompt
// @route   POST /api/v1/ai/prompt
// @access  Public or Protected (based on your needs)
exports.aiPromptHandler = asyncHandler(async (req, res, next) => {
  const { prompt } = req.body;

  if (!prompt) {
    return res
      .status(400)
      .json({ success: false, error: "Prompt is required" });
  }

  // Dummy response — integrate with OpenAI or other LLM here
  const response = `You said: ${prompt}`;

  res.status(200).json({
    success: true,
    data: response,
  });
});

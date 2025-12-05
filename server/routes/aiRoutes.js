const express = require("express");
const router = express.Router();
const { analyzeMoodFromText } = require("../ai/geminiService");

router.post("/chat", async (req, res) => {
  const { message } = req.body;

  if (!message)
    return res.status(400).json({ error: "Message required" });

  try {
    const aiResult = await analyzeMoodFromText(message);
    res.json(aiResult);
  } catch (err) {
    console.error("AI Chat Error:", err);
    res.status(500).json({ error: "AI request failed" });
  }
});

module.exports = router;

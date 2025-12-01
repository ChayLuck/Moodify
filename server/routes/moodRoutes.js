const express = require("express");
const router = express.Router();
const MoodEntry = require("../models/MoodEntry");

// POST /api/mood/track  → mood kaydet
router.post("/track", async (req, res) => {
  try {
    console.log("Mood track BODY:", req.body); // ⚡ debug için

    // req.body undefined olursa {} kullan → destructure patlamasın
    const { mood, userId, recommendedTrack, recommendedMovie } = req.body || {};

    if (!mood || !userId) {
      return res
        .status(400)
        .json({ message: "Mood and userId are required", body: req.body });
    }

    const entry = await MoodEntry.create({
      user: userId,
      mood,
      recommendedTrack,
      recommendedMovie,
    });

    res.status(201).json(entry);
  } catch (error) {
    console.error("Mood track error:", error);
    res.status(500).json({
      message: "Server error while tracking mood",
      error: error.message,
    });
  }
});

// GET /api/mood/history/:userId?days=7 → son X gün
router.get("/history/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const days = Number(req.query.days) || 7;

    if (!userId) {
      return res.status(400).json({ message: "userId is required" });
    }

    const filter = { user: userId };

    // days > 0 ise zaman filtresi uygula, 0 ise TÜM mood'lar gelsin
    if (days > 0) {
      const since = new Date();
      since.setDate(since.getDate() - days);
      filter.createdAt = { $gte: since };
    }

    const entries = await MoodEntry.find(filter).sort({ createdAt: -1 });

    const moodCounts = {};
    entries.forEach((e) => {
      moodCounts[e.mood] = (moodCounts[e.mood] || 0) + 1;
    });

    const lastMood = entries.length ? entries[entries.length - 1].mood : null;

    res.json({
      entries,
      stats: {
        total: entries.length,
        moodCounts,
        lastMood,
      },
    });
  } catch (error) {
    console.error("Mood history error:", error);
    res.status(500).json({
      message: "Server error while fetching mood history",
      error: error.message,
    });
  }
});

module.exports = router;

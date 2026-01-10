const mongoose = require("mongoose");

const moodEntrySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    mood: {
      type: String,
      required: true,
    },

    // 🎵 ek: o mood’da önerilen müzik
    recommendedTrack: {
      id: { type: String },
      name: { type: String },
      artist: { type: String },
      image: { type: String },
    },

    // 🎬 ek: o mood’da önerilen film
    recommendedMovie: {
      id: { type: String },
      title: { type: String },
      poster: { type: String },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("MoodEntry", moodEntrySchema);

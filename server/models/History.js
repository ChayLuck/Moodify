const mongoose = require('mongoose');

const HistorySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  mood: { 
    type: String, 
    required: true // "Happy", "Sad", "Energetic" vb.
  },

  // O an önerilen şarkı (Snapshot)
  track: {
    spotifyId: String,
    name: String,
    artist: String,
    image: String,
    previewUrl: String,
    externalUrl: String
  },

  // O an önerilen film (Snapshot)
  movie: {
    tmdbId: String,
    title: String,
    poster: String,
    overview: String,
    voteAverage: Number,
    releaseDate: String
  }

}, { timestamps: true }); // created_at: Ne zaman önerildi?

module.exports = mongoose.model('History', HistorySchema);
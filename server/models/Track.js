// server/models/Track.js
const mongoose = require('mongoose');

const TrackSchema = new mongoose.Schema({
  // Spotify ID'si (Buna göre arama yapacağız, o yüzden unique)
  spotifyId: { 
    type: String, 
    required: true, 
    unique: true, 
    index: true 
  },
  
  // Şarkının bilgileri
  title: { type: String, required: true },
  artist: { type: String, required: true },
  albumCover: { type: String }, 
  previewUrl: { type: String }, 

  // ALGORİTMA İÇİN GEREKLİ VERİLER (Şimdilik boş kalabilir)
  features: {
    valence: Number,
    energy: Number,
    danceability: Number,
    tempo: Number
  }
}, { timestamps: true });

module.exports = mongoose.model('Track', TrackSchema);
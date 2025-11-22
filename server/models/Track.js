// server/models/Track.js
const mongoose = require('mongoose');

const TrackSchema = new mongoose.Schema({
  spotifyId: { 
    type: String, 
    required: true, 
    unique: true, 
    index: true 
  },
  
  title: { type: String, required: true },
  artist: { type: String, required: true },
  albumCover: { type: String }, 
  previewUrl: { type: String }, 
 
}, { timestamps: true });

module.exports = mongoose.model('Track', TrackSchema);
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: { 
    type: String, 
    required: true, 
    unique: true 
  },
  email: { 
    type: String, 
    required: true, 
    unique: true 
  },
  password: { 
    type: String, 
    required: true 
  },
  
  // Spotify Bağlantı Bilgileri (Tokenlar)
  spotifyId: { type: String },
  spotifyAccessToken: { type: String },
  spotifyRefreshToken: { type: String },

  // Favori Şarkılar (Basitleştirilmiş Özet)
  favoriteTracks: [{
    spotifyId: String,
    name: String,
    artist: String,
    image: String,
    previewUrl: String,
    addedAt: { type: Date, default: Date.now }
  }],

  // Favori Filmler
  favoriteMovies: [{
    tmdbId: String,
    title: String,
    poster: String,
    overview: String,
    addedAt: { type: Date, default: Date.now }
  }]

}, { timestamps: true }); // Kayıt tarihini otomatik tutar

module.exports = mongoose.model('User', UserSchema);
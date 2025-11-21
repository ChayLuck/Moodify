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
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Track' 
  }],

  // Filmler için de aynısını yapalım, temiz olsun
  favoriteMovies: [{
    type: String
  }],

}, { timestamps: true }); // Kayıt tarihini otomatik tutar

module.exports = mongoose.model('User', UserSchema);
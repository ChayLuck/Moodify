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

  // Favori Şarkılar (Basitleştirilmiş Özet)
  favoriteTracks: [{
    spotifyId: { type: String, required: true },
    mood: { type: String, required: true } // Kullanıcının seçtiği mod
  }],

  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);
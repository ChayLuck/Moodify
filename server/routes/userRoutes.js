const express = require('express');
const router = express.Router();

const { 
  getUserProfile, 
  addFavoriteTrack, 
  addFavoriteMovie,      // 👈 YENİ
  searchSpotify, 
  removeFavoriteTrack, 
  removeFavoriteMovie,   // 👈 YENİ
  updateFavoriteMood,
  updateUserIcon
} = require('../controllers/userController');

router.get('/search', searchSpotify);
router.get('/profile/:id', getUserProfile);

// Müzik Favorileri
router.post('/favorites/add', addFavoriteTrack);
router.post('/favorites/remove', removeFavoriteTrack);

// Film Favorileri (YENİ)
router.post('/favorites/add-movie', addFavoriteMovie);       // 👈 YENİ
router.post('/favorites/remove-movie', removeFavoriteMovie); // 👈 YENİ

// Ortak Güncellemeler
router.put('/favorites/update-mood', updateFavoriteMood);
router.put('/update-icon', updateUserIcon);

module.exports = router;
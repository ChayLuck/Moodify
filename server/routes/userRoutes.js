// server/routes/userRoutes.js
const express = require('express');
const router = express.Router();

const { 
  getUserProfile, 
  addFavoriteTrack, 
  searchSpotify, 
  removeFavoriteTrack, 
  updateFavoriteMood,
  updateUserIcon   //YENİ EKLENDİ
} = require('../controllers/userController');

router.get('/search', searchSpotify);
router.get('/profile/:id', getUserProfile);
router.post('/favorites/add', addFavoriteTrack);
router.post('/favorites/remove', removeFavoriteTrack);
router.put('/favorites/update-mood', updateFavoriteMood);

//PROFİL IKONU GÜNCELLEME ENDPOINT'I
router.put('/update-icon', updateUserIcon);

module.exports = router;

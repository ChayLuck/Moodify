// server/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const { getUserProfile, addFavoriteTrack, searchSpotify, removeFavoriteTrack, updateFavoriteMood }= require('../controllers/userController');

// Profil bilgisini çeken rota
router.get('/search', searchSpotify);
router.get('/profile/:id', getUserProfile);
router.post('/favorites/add', addFavoriteTrack);
router.post('/favorites/remove', removeFavoriteTrack);
router.put('/favorites/update-mood', updateFavoriteMood);

module.exports = router;
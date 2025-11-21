// server/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const { getUserProfile, addFavoriteTrack } = require('../controllers/userController');

// Profil bilgisini çeken rota
router.get('/profile/:id', getUserProfile);
router.post('/favorites/add', addFavoriteTrack);

module.exports = router;
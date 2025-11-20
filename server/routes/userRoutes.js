// server/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const { getUserProfile } = require('../controllers/userController');

// Profil bilgisini çeken rota
router.get('/profile/:id', getUserProfile);

module.exports = router;
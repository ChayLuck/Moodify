// server/routes/songRoutes.js
const express = require('express');
const router = express.Router();
const { searchSongs } = require('../controllers/songController');

// Arama rotası: /api/songs/search
router.get('/search', searchSongs);

module.exports = router;
const express = require('express');
const router = express.Router();
const { searchMovies } = require('../controllers/movieController');

// Rota: /api/movies/search
router.get('/search', searchMovies);

module.exports = router;
const express = require('express');
const router = express.Router();
const { getTrendingMovies, getNewReleases } = require('../controllers/contentController');

router.get('/trending-movies', getTrendingMovies);
router.get('/new-releases', getNewReleases);

module.exports = router;
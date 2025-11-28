console.log("📌 movieRoutes YÜKLENDİ");
const express = require('express');
const router = express.Router();
const { searchMovies, getMovieDetails, getMovieTrailer } = require('../controllers/movieController');
console.log("controller yüklendi mi?", searchMovies); //test

router.get('/search', searchMovies);
router.get('/details/:id', getMovieDetails); // <-- YENİ ROTA
console.log("🎬 Trailer route TANIMLANDI");
router.get('/trailer/:id', getMovieTrailer);   // <-- YENİ TRAILER ROTASI
module.exports = router; 
const express = require('express');
const router = express.Router();
const { searchSongs, getTrackDetails } = require('../controllers/songController');

router.get('/search', searchSongs);
router.get('/details/:id', getTrackDetails); // <-- YENİ

module.exports = router;
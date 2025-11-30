const express = require('express');
const router = express.Router();
const { getRecommendations } = require('../controllers/recommendationController');

// Rota: /api/recommendations (POST isteği gelir)
router.post('/', getRecommendations);

module.exports = router;
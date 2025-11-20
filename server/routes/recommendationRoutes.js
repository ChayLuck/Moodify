const express = require('express');
const router = express.Router();
const { getRecommendations } = require('../controllers/recommendationController');

router.post('/', getRecommendations);

module.exports = router;
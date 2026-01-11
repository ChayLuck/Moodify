const express = require('express');
const router = express.Router();
const { getRecommendations, getRecommendationsForAI } = require('../controllers/recommendationController');

// ÖNCE AI ROUTE (daha spesifik)
router.get('/ai/:mood', getRecommendationsForAI);

// DASHBOARD → POST İSTİYOR
router.post('/', getRecommendations);

// En sona: parametreli GET (kullanmayacağız ama dursun)
router.get('/:mood', getRecommendations);

module.exports = router;

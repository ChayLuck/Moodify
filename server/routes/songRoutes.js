const express = require('express');
const router = express.Router();

// Controller'dan fonksiyonları süslü parantez ile { } doğru aldığımıza emin olalım
const { getNewReleases, getTrackDetails } = require('../controllers/songController');

// 1. Rota: Yeni Çıkanlar
// getNewReleases fonksiyonunun dolu olduğundan emin olunuyor
router.get('/new-releases', getNewReleases);

// 2. Rota: Şarkı Detayları
// getTrackDetails fonksiyonunun dolu olduğundan emin olunuyor
router.get('/details/:id', getTrackDetails);

module.exports = router;
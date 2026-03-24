const express = require('express');
const router = express.Router();
const { 
    getRecommendations, 
    getRecommendationHistory,
    getRecommendation 
} = require('../controllers/cropController');
const { protect } = require('../config/auth');

// All recommendation routes are protected
router.use(protect);

router.post('/get-recommendations', getRecommendations);
router.get('/history', getRecommendationHistory);
router.get('/:recommendationId', getRecommendation);

module.exports = router;

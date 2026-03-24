const express = require('express');
const router = express.Router();
const { 
    createFarm, 
    getFarms, 
    getFarm, 
    updateFarm, 
    deleteFarm 
} = require('../controllers/farmController');
const { protect } = require('../config/auth');

// All farm routes are protected
router.use(protect);

router.post('/create', createFarm);
router.get('/', getFarms);
router.get('/:farmId', getFarm);
router.put('/:farmId', updateFarm);
router.delete('/:farmId', deleteFarm);

module.exports = router;

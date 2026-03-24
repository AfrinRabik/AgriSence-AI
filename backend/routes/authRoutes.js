const express = require('express');
const router = express.Router();
const { 
    register, 
    login, 
    getMe, 
    updateProfile,
    forgotPassword,
    verifyOTP,
    resetPassword 
} = require('../controllers/authController');
const { protect } = require('../config/auth');

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/verify-otp', verifyOTP);
router.post('/reset-password', resetPassword);

// Protected routes
router.get('/me', protect, getMe);
router.put('/update-profile', protect, updateProfile);

module.exports = router;

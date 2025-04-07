const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Authentication routes
router.post('/login', authController.login);
router.post('/google-signup', authController.googleSignup);
router.post('/google-login', authController.googleLogin);
router.post('/studentsignup', authController.studentSignup);
router.post('/employersignup', authController.employerSignup);
router.post('/logout', authController.logout);

module.exports = router;

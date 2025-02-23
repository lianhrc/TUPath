const express = require('express')
const cookieParser = require('cookie-parser')
const verifyToken = require('../middleware/verifyToken')

const {
    login,
    googleSignup,
    googleLogin,
    studentSignup,
    employerSignup,
    uploadProfileImage,
    logout
} = require('../controllers/userController')

const router = express.Router()

router.use(cookieParser())

// Apply verifyToken middleware to protected routes
router.post('/login', login)
router.post('/google-signup', googleSignup)
router.post('/google-login', googleLogin)
router.post('/student-signup', studentSignup)
router.post('/employer-signup', employerSignup)
router.post('/uploadProfileImage', verifyToken, uploadProfileImage) // Protect this route
router.post('/logout', logout)

module.exports = router
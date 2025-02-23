const express = require('express')

const {
    login,
    googleSignup,
    googleLogin,
    studentSignup,
    employerSignup,
    uploadProfileImage
} = require('../controllers/userController')

const router = express.Router()

router.post('/login', login)
router.post('/google-signup', googleSignup)
router.post('/google-login', googleLogin)
router.post('/student-signup', studentSignup)
router.post('/employer-signup', employerSignup)
router.post('/uploadProfileImage', uploadProfileImage)

module.exports = router
const express = require('express')

const router = express.Router()

router.post('/login', login)
router.post('/google-signup', googleSignup)
router.post('/google-login', googleLogin)
router.post('/student-signup', studentSignup)
router.post('/employer-signup', employerSignup)

module.exports = router
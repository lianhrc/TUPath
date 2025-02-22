const express = require('express')
const { createCertificate, getCertificates } = require('../controllers/certificateController')
const upload = require('../middleware/upload')
const router = express.Router()

router.post("/api/uploadCertificate", verifyToken, upload.fields ([
{name: "thumbnail", maxCount: 1},
{name: "attachments", maxCount: 10}
]), createCertificate)

router.get('/api/certificates', verifyToken, getCertificates)

module.exports = router
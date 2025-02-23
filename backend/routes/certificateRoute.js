const express = require('express')
const verifyToken = require('../middleware/verifyToken')
const { uploadCertificate, getCertificates, deleteCertificate } = require('../controllers/certificateController')
const upload = require('../middleware/upload')
const router = express.Router()

router.post("/uploadCertificate", verifyToken, upload.fields([
    { name: "thumbnail", maxCount: 1 },
    { name: "attachments", maxCount: 10 }
]), uploadCertificate)

router.get('/certificates', verifyToken, getCertificates)
router.delete('/certificates/:id', verifyToken, deleteCertificate)

module.exports = router
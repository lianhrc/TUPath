const multer = require('multer')

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/') // Define where to store the files
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname) // Define how files are named
    }
})

const upload = multer({
    storage: storage,
    limits: { fileSize: 50 * 1024 * 1024 } // 50 MB limit
})

module.exports = upload
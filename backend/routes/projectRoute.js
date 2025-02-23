const express = require('express')
const verifyToken = require('../middleware/verifyToken')
const { uploadProject, getProjects, deleteProject} = require('../controllers/projectController')
const upload = require('../middleware/upload')
const router = express.Router()

router.post("/api/uploadProject", verifyToken, upload.fields([
    {name: "thumbnail", maxCount: 1},
    {name: "attachments", maxCount: 10}
]), uploadProject)

router.get("/api/projects", verifyToken, getProjects)
router.delete("/api/projects/:projectId", verifyToken, deleteProject)

module.exports = router
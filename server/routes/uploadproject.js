


const express = require('express');
const router = express.Router();
const { Project, Tupath_usersModel, AssessmentQuestion } = require('../models/Tupath_users');
const multer = require('multer');   
const path = require('path');
const {verifyToken} = require('../middleware/auth')
const app = express();

 app.use('/uploads', express.static('uploads'));



 // Configure multer for file uploads
    const storage = multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Define where to store the files
      },
      filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname); // Define how files are named
      }
    });
   
    const upload = multer({ 
      storage: storage,
      limits: { fileSize: 50 * 1024 * 1024 } // 50 MB limit
    });
  


router.post(
    "/uploadProject",
    verifyToken,
    upload.fields([
      { name: "thumbnail", maxCount: 1 },
      { name: "selectedFiles", maxCount: 10 },
    ]),
    async (req, res) => {
      try {
        const userId = req.user.id;
        const { projectName, description, tag, tools, projectUrl, assessment,roles } = req.body;
  
        // Validate required fields
        if (!projectName || !projectName.trim()) {
          return res.status(400).json({ success: false, message: "Project name is required." });
        }
  
        if (!description || !description.trim()) {
          return res.status(400).json({ success: false, message: "Description is required." });
        }
  
        if (!tag || !tag.trim()) {
          return res.status(400).json({ success: false, message: "A single tag is required." });
        }
  
        // Ensure tools is always an array
        const toolsArray = Array.isArray(tools) ? tools : tools ? [tools] : [];
        const rolesArray = Array.isArray(roles) ? roles : roles ? [roles] : [];

              // Validate roles
      if (!rolesArray.length) {
        return res.status(400).json({ success: false, message: "At least one role must be selected." });
      }

        // Parse assessment data
        const parsedAssessment = assessment
          ? JSON.parse(assessment).map((q) => ({
              ...q,
              weightedScore: q.scoring[q.rating],
            }))
          : [];
  
        // Validate assessment data for required categories (tags and tools)
        const requiredCategories = [
          { type: "tag", name: tag },
          ...toolsArray.map((tool) => ({ type: "tool", name: tool })),
        ];
  
        for (const category of requiredCategories) {
          const relevantAssessment = parsedAssessment.filter(
            (a) => a.category === category.type && a.categoryName === category.name
          );
  
          if (!relevantAssessment.length) {
            return res.status(400).json({
              success: false,
              message: `Assessment is required for ${category.type} '${category.name}'.`,
            });
          }
  
          const isValidAssessment = relevantAssessment.every(
            (item) => item.question && item.rating >= 1 && item.rating <= 5
          );
  
          if (!isValidAssessment) {
            return res.status(400).json({
              success: false,
              message: `Invalid assessment data for ${category.type} '${category.name}'. Ratings must be between 1 and 5.`,
            });
          }
        }
  
        // Retrieve files from multer
        const thumbnail = req.files["thumbnail"]
          ? `/uploads/${req.files["thumbnail"][0].filename}`
          : null;
  
        const selectedFiles = req.files["selectedFiles"]
          ? req.files["selectedFiles"].map((file) => file.path)
          : [];
  
        // Create a new project document
        const newProject = new Project({
          projectName,
          description,
          tag,
          tools: toolsArray,
          selectedFiles,
          thumbnail,
          projectUrl,
          roles: rolesArray,
          status: "pending",
          assessment: parsedAssessment,
        });
  
        // Save project to the database
        const savedProject = await newProject.save();
  
        // Associate the project with the user
        const user = await Tupath_usersModel.findById(userId);
  
        if (!user) {
          return res.status(404).json({ success: false, message: "User not found" });
        }
  
        user.profileDetails.projects.push(savedProject._id);
  
        // Recalculate the best tag and cumulative scores
        await user.calculateBestTag();
  
        // Save the updated user
        await user.save();
  
        res.status(201).json({
          success: true,
          message: "Project uploaded successfully",
          project: savedProject,
        });
      } catch (error) {
        console.error("Error uploading project:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
      }
    }
  );

  module.exports = router;
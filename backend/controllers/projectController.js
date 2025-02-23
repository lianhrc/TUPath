const Project = require('../models/projectModel')
const User = require('../models/userModel')

// Endpoint to handle project uploads
const uploadProject = async (req, res) => {
    try {
        const userId = req.user.id
        const { projectName, description, tag, tools, projectUrl, assessment, roles } = req.body

        // Validate required fields
        if (!projectName || !projectName.trim()) {
            return res.status(400).json({ success: false, message: "Project name is required." })
        }

        if (!description || !description.trim()) {
            return res.status(400).json({ success: false, message: "Description is required." })
        }

        if (!tag || !tag.trim()) {
            return res.status(400).json({ success: false, message: "A single tag is required." })
        }

        // Ensure tools is always an array
        const toolsArray = Array.isArray(tools) ? tools : tools ? [tools] : []
        const rolesArray = Array.isArray(roles) ? roles : roles ? [roles] : []

        // Validate roles
        if (!rolesArray.length) {
            return res.status(400).json({ success: false, message: "At least one role must be selected." })
        }

        // Parse assessment data
        const parsedAssessment = assessment
            ? JSON.parse(assessment).map((q) => ({
                ...q,
                weightedScore: q.scoring[q.rating],
            }))
            : []

        // Validate assessment data for required categories (tags and tools)
        const requiredCategories = [
            { type: "tag", name: tag },
            ...toolsArray.map((tool) => ({ type: "tool", name: tool })),
        ]

        for (const category of requiredCategories) {
            const relevantAssessment = parsedAssessment.filter(
                (a) => a.category === category.type && a.categoryName === category.name
            )

            if (!relevantAssessment.length) {
                return res.status(400).json({
                    success: false,
                    message: `Assessment is required for ${category.type} '${category.name}'.`,
                })
            }

            const isValidAssessment = relevantAssessment.every(
                (item) => item.question && item.rating >= 1 && item.rating <= 5
            )

            if (!isValidAssessment) {
                return res.status(400).json({
                    success: false,
                    message: `Invalid assessment data for ${category.type} '${category.name}'. Ratings must be between 1 and 5.`,
                })
            }
        }

        // Retrieve files from multer
        const thumbnail = req.files["thumbnail"]
            ? `/uploads/${req.files["thumbnail"][0].filename}`
            : null

        const selectedFiles = req.files["selectedFiles"]
            ? req.files["selectedFiles"].map((file) => `/uploads/${file.filename}`)
            : []

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
        })

        // Save project to the database
        const savedProject = await newProject.save()

        // Associate the project with the user
        const user = await User.findById(userId)

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" })
        }

        user.profileDetails.projects.push(savedProject._id)

        // Recalculate the best tag and cumulative scores
        await user.calculateBestTag()

        // Save the updated user
        await user.save()

        res.status(201).json({
            success: true,
            message: "Project uploaded successfully",
            project: savedProject,
        })
    } catch (error) {
        console.error("Error uploading project:", error)
        res.status(500).json({ success: false, message: "Internal server error" })
    } 
}

// Fetch projects
const getProjects = async (req, res) => {
    try {
        const userId = req.user.id

        // Fetch user with populated projects
        const user = await User.findById(userId).populate("profileDetails.projects")

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" })
        }

        // Add scores and tag summary for each project
        const projectsWithScores = user.profileDetails.projects.map((project) => {
            const totalScore = project.assessment.reduce((sum, question) => sum + (question.weightedScore || 0), 0)

            return {
                _id: project._id,
                projectName: project.projectName,
                description: project.description,
                tag: project.tag,
                totalScore, // Sum of all weighted scores for the project
                tools: project.tools,
                status: project.status,
                assessment: project.assessment, // Include detailed assessment
                createdAt: project.createdAt,
                roles: project.roles,
            }
        })

        res.status(200).json({
            success: true,
            projects: projectsWithScores,
        })
    } catch (error) {
        console.error("Error fetching projects:", error)
        res.status(500).json({ success: false, message: "Internal server error" })
    }
}

// Delete project
const deleteProject = async (req, res) => {
    try {
        const userId = req.user.id // Extract user ID from the token
        const { projectId } = req.params

        // Find the user
        const user = await User.findById(userId)
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" })
        }

        // Find the project in the user's profile and remove it
        const projectIndex = user.profileDetails.projects.findIndex(
            (project) => project._id.toString() === projectId
        )
        if (projectIndex === -1) {
            return res.status(404).json({ success: false, message: "Project not found in user's profile" })
        }

        // Remove the project reference from the user's profile
        user.profileDetails.projects.splice(projectIndex, 1)
        await user.save()

        // Delete the project document from the 'projects' collection
        const deletedProject = await Project.findByIdAndDelete(projectId)
        if (!deletedProject) {
            return res.status(404).json({ success: false, message: "Project not found in projects collection" })
        }

        res.status(200).json({
            success: true,
            message: "Project deleted successfully from user's profile and projects collection",
        })
    } catch (error) {
        console.error("Error deleting project:", error)
        res.status(500).json({ success: false, message: "Internal server error" })
    }
}

module.exports = { 
    uploadProject, 
    getProjects, 
    deleteProject
}
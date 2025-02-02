const express = require('express');
const router = express.Router();
const { Tupath_usersModel, Employer_usersModel, Project, AssessmentQuestion, Admin } = require("../models/Tupath_users");


router.get('/api/students-by-tag', async (req, res) => {
    const { tag } = req.query;

    if (!tag) {
        return res.status(400).json({ success: false, message: 'Tag is required' });
    }

    try {
        const students = await Tupath_usersModel.find(
            { bestTag: tag }, // Filter by bestTag
            { 
                'profileDetails.firstName': 1, 
                'profileDetails.lastName': 1, 
                'bestTagScores': 1 
            } // Select only relevant fields
        );

        res.status(200).json({ success: true, students });
    } catch (error) {
        console.error('Error fetching students by tag:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
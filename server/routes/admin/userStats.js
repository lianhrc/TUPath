const express = require('express');
const router = express.Router();
const { Tupath_usersModel, Employer_usersModel, Project, AssessmentQuestion, Admin } = require("../models/Tupath_users");


router.get('/api/user-stats', async (req, res) => {
    try {
        const studentCount = await Tupath_usersModel.countDocuments();
        const employerCount = await Employer_usersModel.countDocuments();
        res.status(200).json({ success: true, studentCount, employerCount });
    } catch (error) {
        console.error('Error fetching user stats:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const { Tupath_usersModel, Employer_usersModel, Project, AssessmentQuestion, Admin } = require("../models/Tupath_users");


router.get('/api/student-tags', async (req, res) => {
    try {
        const tagCounts = await Tupath_usersModel.aggregate([
            { $match: { bestTag: { $ne: null } } }, // Only consider students with a `bestTag`
            { $group: { _id: '$bestTag', count: { $sum: 1 } } }, // Group by `bestTag` and count
        ]);

        res.status(200).json({ success: true, tags: tagCounts });
    } catch (error) {
        console.error('Error fetching student tags:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;

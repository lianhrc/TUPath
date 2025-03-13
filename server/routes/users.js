const express = require('express');
const router = express.Router();
const { Tupath_usersModel, Employer_usersModel } = require("../models/Tupath_users");

router.get('/api/users', async (req, res) => {
    const { type } = req.query; // Get the user type from query params

    try {
        const filter = { deletedAt: null }; // Exclude soft-deleted users

        const users =
            type === 'Students'
                ? await Tupath_usersModel.find(filter).select('profileDetails.firstName profileDetails.lastName email profileDetails.contact')
                : await Employer_usersModel.find(filter).select('profileDetails.companyName email profileDetails.contact');

        res.status(200).json({ success: true, users });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

module.exports = router;

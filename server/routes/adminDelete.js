const express = require('express');
const { Tupath_usersModel, Employer_usersModel } = require("../models/Tupath_users");
const router = express.Router();

router.delete('/api/manage-users/:id', async (req, res) => {
    const { id } = req.params;
    const { type } = req.query; // Use query parameter to identify the user type

    try {
        let userModel;
        if (type === 'Students') {
            userModel = Tupath_usersModel;
        } else if (type === 'Employers') {
            userModel = Employer_usersModel;
        } else {
            return res.status(400).json({ success: false, message: "Invalid user type" });
        }

        // Find user by ID
        const user = await userModel.findById(id);

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // Perform soft delete by setting deletedAt to current timestamp
        user.deletedAt = new Date();
        await user.save();

        return res.status(200).json({ success: true, message: "User soft deleted successfully" });
    } catch (error) {
        console.error("Error soft deleting user:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const { Tupath_usersModel, Employer_usersModel, Project, AssessmentQuestion, Admin } = require("../models/Tupath_users");

// Middleware to parse JSON bodies
router.use(express.json());

router.post('/api/admin/signup', async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ success: false, message: 'Admin already exists' });
    }

    // Create new admin
    const newAdmin = new Admin({ username, email, password });
    await newAdmin.save();

    res.status(201).json({ success: true, message: 'Admin created successfully' });
  } catch (error) {
    console.error('Error creating admin:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

module.exports = router;

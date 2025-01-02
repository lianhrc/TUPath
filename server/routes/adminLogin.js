const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Tupath_usersModel, Employer_usersModel, Project, AssessmentQuestion, Admin } = require("../models/Tupath_users");
const router = express.Router();
const JWT_SECRET = "your-secret-key";

const app = express();



// Admin Login Route
router.post('/api/admin/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    // Find admin by username
    const admin = await Admin.findOne({ username });
    if (!admin) {
      return res.status(400).json({ success: false, message: 'Invalid username or password.' });
    }

    // Check if password matches
    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      return res.status(400).json({ success: false, message: 'Invalid username or password.' });
    }

    // Generate a JWT token
    const token = jwt.sign({ id: admin._id }, JWT_SECRET, { expiresIn: '1h' });

    res.json({
      success: true,
      message: 'Login successful.',
      token,
    });
  } catch (error) {
    console.error('Error logging in admin:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

module.exports = router;

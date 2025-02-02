const express = require('express');
const router = express.Router();

// Logout Route
router.post('/api/admin/logout', (req, res) => {
  try {
    // Clear the cookie
    res.clearCookie('adminToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
      sameSite: 'Strict', // Match the sameSite setting used when setting the cookie
    });

    // Send a success response
    res.json({ success: true, message: 'Logged out successfully.' });
  } catch (error) {
    console.error('Error during logout:', error);
    res.status(500).json({ success: false, message: 'Failed to log out.' });
  }
});

module.exports = router;

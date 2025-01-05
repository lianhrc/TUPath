
const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/authenticateToken'); // Import the middleware

router.get('/api/protected', authenticateToken, (req, res) => {
  res.json({
    success: true,
    message: 'You have accessed a protected route!',
    user: req.user, // This contains the user data from the token
  });
});

module.exports = router;

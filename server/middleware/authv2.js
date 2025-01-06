const express = require("express");
const jwt = require('jsonwebtoken');
const JWT_SECRET = 'your-secret-key'; // Replace with an environment variable
const router = express.Router();

const authenticateToken = (req, res, next) => {
  const token = req.cookies.adminToken; // Get the token from cookies

  if (!token) {
    return res.status(401).json({ success: false, message: 'Unauthorized. Token missing.' });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ success: false, message: 'Token is invalid or expired.' });
    }

    req.admin = decoded; // Attach decoded token data (e.g., user ID) to the request object
    console.log('Decoded token:', decoded); // Debugging valid tokens
    next();
  });
};
router.get('/check-auth', authenticateToken, (req, res) => {
  try {
    res.json({ success: true, message: 'Authenticated successfully.', admin: req.admin });
  } catch (error) {
    console.error('Error in /check-auth:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});


module.exports = router;
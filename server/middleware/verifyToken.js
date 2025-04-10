const jwt = require('jsonwebtoken');
require('dotenv').config();

// JWT verification middleware with added debugging and error handling
const verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader) {
    console.error("Authorization header is missing.");
    return res.status(401).json({ message: "Access Denied: Authorization header missing" });
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    console.error("Token not found in Authorization header.");
    return res.status(401).json({ message: "Access Denied: Token missing" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      console.error("Token verification failed:", err);
      return res.status(403).json({ message: "Invalid Token" });
    }

    req.user = user;
    next();
  });
};

module.exports = verifyToken;

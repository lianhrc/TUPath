const jwt = require("jsonwebtoken")

const verifyToken = (req, res, next) => {
    // Get the token from the cookies
    const token = req.cookies.token // Assuming the token is stored in a cookie named "token"

    if (!token) {
        return res.status(401).json({ success: false, message: "Access denied. No token provided." })
    }

    try {
        // Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        req.user = decoded // Attach the decoded user information to the request object
        next() // Proceed to the next middleware or route handler
    } catch (error) {
        console.error("Token verification error:", error)
        res.status(400).json({ success: false, message: "Invalid token." })
    }
}

module.exports = verifyToken

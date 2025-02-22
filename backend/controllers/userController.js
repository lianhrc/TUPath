const bcrypt = require("bcrypt")
const User = require("../models/userModel")
const jwt = require("jsonwebtoken")
const axios = require("axios")

// Login endpoint
const login = async (req, res) => {
    const { email, password, role } = req.body
    try {
        const user = await User.findOne({ email, role })

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(400).json({ success: false, message: "Invalid email or password" })
        }

        const token = jwt.sign({ id: user._id, role }, JWT_SECRET, { expiresIn: "1h" })

        let redirectPath = user.isNewUser ? "/studentprofilecreation" : "/homepage"
        if (role === "employer") redirectPath = user.isNewUser ? "/employerprofilecreation" : "/homepage"

        user.isNewUser = false
        await user.save()

        res.status(200).json({ success: true, token, message: "Login successful", redirectPath })
    } catch (err) {
        res.status(500).json({ success: false, message: "Internal server error" })
    }
}

// Google Signup endpoint
const googleSignup = async (req, res) => {
    const { token, role } = req.body

    // Validate role
    if (!['student', 'employer'].includes(role)) {
        return res.status(400).json({ success: false, message: 'Invalid role specified' })
    }

    try {
        // Verify the Google token using Google API
        const googleResponse = await axios.get(`https://oauth2.googleapis.com/tokeninfo?id_token=${token}`)

        if (googleResponse.data.aud !== GOOGLE_CLIENT_ID) {
            return res.status(400).json({ success: false, message: 'Invalid Google token' })
        }

        const { email, sub: googleId, name } = googleResponse.data

        // Check if the user already exists
        const existingUser = await User.findOne({ email, role })
        if (existingUser) {
            return res.status(409).json({ success: false, message: 'Account already exists. Please log in.' })
        }

        // Create a new user
        const newUser = await User.create({
            email,
            password: googleId, // Placeholder for password
            isNewUser: true,
            googleSignup: true,
            role,
            profileDetails: role === 'student' ? { student: { firstName: name.split(' ')[0], lastName: name.split(' ')[1] } } : { employer: { firstName: name.split(' ')[0], lastName: name.split(' ')[1] } }
        })

        // Generate JWT token
        const jwtToken = jwt.sign(
            { email, googleId, name, id: newUser._id, role },
            JWT_SECRET,
            { expiresIn: '1h' }
        )

        const redirectPath = role === 'student' ? '/studentprofilecreation' : '/employerprofilecreation'

        res.json({ success: true, token: jwtToken, redirectPath })
    } catch (error) {
        console.error('Google sign-up error:', error)
        res.status(500).json({ success: false, message: 'Google sign-up failed' })
    }
}

// Google login endpoint
const googleLogin = async (req, res) => {
    const { token, role } = req.body

    try {
        const googleResponse = await axios.get(`https://oauth2.googleapis.com/tokeninfo?id_token=${token}`)

        if (googleResponse.data.aud !== GOOGLE_CLIENT_ID) {
            return res.status(400).json({ success: false, message: 'Invalid Google token' })
        }

        const { email, sub: googleId, name } = googleResponse.data

        // Check if the user exists
        const user = await User.findOne({ email, role })
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not registered. Please sign up first.' })
        }

        // Generate JWT token
        const jwtToken = jwt.sign(
            { email, googleId, name, id: user._id, role },
            JWT_SECRET,
            { expiresIn: '1h' }
        )

        const redirectPath = '/homepage'

        res.json({ success: true, token: jwtToken, redirectPath })
    } catch (error) {
        console.error('Google login error:', error)
        res.status(500).json({ success: false, message: 'Google login failed' })
    }
}

// Student signup endpoint
const studentSignup = async (req, res) => {
    const { firstName, lastName, email, password } = req.body

    try {
        const existingUser = await User.findOne({ email, role: 'student' })

        if (existingUser) {
            return res.status(400).json({ success: false, message: "User already exists." })
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        const newUser = await User.create({
            email,
            password: hashedPassword,
            isNewUser: true,
            role: 'student',
            profileDetails: { student: { firstName, lastName } }
        })

        const token = jwt.sign({ id: newUser._id, role: 'student' }, JWT_SECRET, { expiresIn: '1h' })

        return res.status(201).json({
            success: true,
            token,
            message: "Signup successful",
            redirectPath: "/studentprofilecreation",
        });
    } catch (err) {
        console.error("Error during signup:", err);
        res.status(500).json({ success: false, message: "Internal server error" })
    }
}

// Employer signup endpoint
const employerSignup = async (req, res) => {
    const { firstName, lastName, email, password } = req.body

    try {
        const existingUser = await User.findOne({ email, role: 'employer' })

        if (existingUser) {
            return res.status(400).json({ success: false, message: "User already exists." })
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        const newUser = await User.create({
            email,
            password: hashedPassword,
            isNewUser: true,
            role: 'employer',
            profileDetails: { employer: { firstName, lastName } }
        });

        const token = jwt.sign({ id: newUser._id, role: 'employer' }, JWT_SECRET, { expiresIn: '1h' })

        return res.status(201).json({
            success: true,
            token,
            message: "Signup successful",
            redirectPath: "/employerprofilecreation",
        });
    } catch (err) {
        console.error("Error during signup:", err)
        res.status(500).json({ success: false, message: "Internal server error" })
    }
}

module.exports = {
    login,
    googleSignup,
    googleLogin,
    studentSignup,
    employerSignup
}
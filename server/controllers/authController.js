const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const axios = require('axios');
const { Tupath_usersModel, Employer_usersModel } = require("../models/Tupath_users");
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET;
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;

// Login controller
exports.login = async (req, res) => {
  const { email, password, role } = req.body;

  try {
    // Find the user by email and ensure they are not soft deleted
    const user = role === "student"
      ? await Tupath_usersModel.findOne({ email, status: true, deletedAt: null })
      : await Employer_usersModel.findOne({ email, status: true, deletedAt: null });

    // If no user is found or the password is incorrect
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ success: false, message: "Invalid email or password" });
    }

    const token = jwt.sign({ id: user._id, role }, JWT_SECRET, { expiresIn: "1h" });

    let redirectPath = user.isNewUser ? "/studentprofilecreation" : "/homepage";
    if (role === "employer") redirectPath = user.isNewUser ? "/employerprofilecreation" : "/homepage";

    user.isNewUser = false;
    await user.save();

    res.status(200).json({ success: true, token, message: "Login successful", redirectPath });
  } catch (err) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Google Signup controller
exports.googleSignup = async (req, res) => {
  const { token, role } = req.body;

  // Validate role
  if (!['student', 'employer'].includes(role)) {
    return res.status(400).json({ success: false, message: 'Invalid role specified' });
  }

  try {
    // Verify the Google token using Google API
    const googleResponse = await axios.get(`https://oauth2.googleapis.com/tokeninfo?id_token=${token}`);

    if (googleResponse.data.aud !== GOOGLE_CLIENT_ID) {
      return res.status(400).json({ success: false, message: 'Invalid Google token' });
    }

    const { email, sub: googleId, name } = googleResponse.data;

    // Select the correct model based on the role
    const UserModel = role === 'student' ? Tupath_usersModel : Employer_usersModel;

    // Check if the user already exists
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'Account already exists. Please log in.' });
    }

    // Create a new user
    const newUser = await UserModel.create({
      name,
      email,
      password: googleId, // Placeholder for password
      isNewUser: true,
      googleSignup: true,
      role, // Add role explicitly
    });

    // Generate JWT token
    const jwtToken = jwt.sign(
      { email, googleId, name, id: newUser._id, role },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    const redirectPath = role === 'student' ? '/studentprofilecreation' : '/employerprofilecreation';

    res.json({ success: true, token: jwtToken, redirectPath });
  } catch (error) {
    console.error('Google sign-up error:', error);
    res.status(500).json({ success: false, message: 'Google sign-up failed' });
  }
};

// Google login controller
exports.googleLogin = async (req, res) => {
  const { token, role } = req.body;

  try {
    const googleResponse = await axios.get(`https://oauth2.googleapis.com/tokeninfo?id_token=${token}`);

    if (googleResponse.data.aud !== GOOGLE_CLIENT_ID) {
      return res.status(400).json({ success: false, message: "Invalid Google token" });
    }

    const { email, sub: googleId, name } = googleResponse.data;
    const UserModel = role === "student" ? Tupath_usersModel : Employer_usersModel;

    // Check if the user exists and is not soft-deleted
    const user = await UserModel.findOne({ email, status: true, deletedAt: null });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not registered or has been deleted." });
    }

    // Generate JWT token
    const jwtToken = jwt.sign(
      { email, googleId, name, id: user._id, role },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    const redirectPath = "/homepage"; // Same for both roles

    res.json({ success: true, token: jwtToken, redirectPath });
  } catch (error) {
    console.error("Google login error:", error);
    res.status(500).json({ success: false, message: "Google login failed" });
  }
};

// Student signup controller
exports.studentSignup = async (req, res) => {
  const { firstName, lastName, email, password } = req.body;

  try {
    const existingUser = await Tupath_usersModel.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ success: false, message: "User already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await Tupath_usersModel.create({
      name: `${firstName} ${lastName}`,
      email,
      password: hashedPassword,
      isNewUser: true,
      role: 'student', // Explicitly set the role
    });

    const token = jwt.sign({ id: newUser._id, role: 'student' }, JWT_SECRET, { expiresIn: '1h' });

    return res.status(201).json({
      success: true,
      token,
      message: "Signup successful",
      redirectPath: "/studentprofilecreation",
    });
  } catch (err) {
    console.error("Error during signup:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Employer signup controller
exports.employerSignup = async (req, res) => {
  const { firstName, lastName, email, password } = req.body;

  try {
    const existingUser = await Employer_usersModel.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ success: false, message: "User already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await Employer_usersModel.create({
      name: `${firstName} ${lastName}`,
      email,
      password: hashedPassword,
      isNewUser: true,
      role: 'employer', // Explicitly set the role
    });

    const token = jwt.sign({ id: newUser._id, role: 'employer' }, JWT_SECRET, { expiresIn: '1h' });

    return res.status(201).json({
      success: true,
      token,
      message: "Signup successful",
      redirectPath: "/employerprofilecreation",
    });
  } catch (err) {
    console.error("Error during signup:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Logout controller
exports.logout = async (req, res) => {
  res.clearCookie('token');
  res.status(200).json({ success: true, message: "Logout successful" });
};

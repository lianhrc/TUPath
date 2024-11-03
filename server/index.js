const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const axios = require('axios');
const { Tupath_usersModel, Expert_usersModel } = require("./models/Tupath_users");

const JWT_SECRET = 'your-secret-key';
const GOOGLE_CLIENT_ID = '625352349873-hrob3g09um6f92jscfb672fb87cn4kvv.apps.googleusercontent.com';

const app = express();
app.use(express.json());
app.use(cors());

// Connect to MongoDB
mongoose.connect("mongodb://127.0.0.1:27017/tupath_users")
  .then(() => console.log("MongoDB connected successfully"))
  .catch(err => console.error("MongoDB connection error:", err));

// Middleware to verify JWT
const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Access Denied' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid Token' });
    req.user = user;
    next();
  });
};

// Login endpoint
app.post("/login", async (req, res) => {
  const { email, password, role } = req.body;
  try {
    const user = role === 'student' ? await Tupath_usersModel.findOne({ email }) : await Expert_usersModel.findOne({ email });
    if (!user || !await bcrypt.compare(password, user.password)) {
      return res.status(400).json({ success: false, message: "Invalid email or password" });
    }
    const token = jwt.sign({ id: user._id, role }, JWT_SECRET, { expiresIn: '1h' });
    res.status(200).json({ success: true, token, message: "Login successful" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

//Googel Signup endpoint
app.post('/google-signup', async (req, res) => {
  const { token, role } = req.body;
  try {
      const googleResponse = await axios.get(`https://oauth2.googleapis.com/tokeninfo?id_token=${token}`);
      if (googleResponse.data.aud !== GOOGLE_CLIENT_ID) {
          return res.status(400).json({ success: false, message: 'Invalid Google token' });
      }

      const { email, sub: googleId, name } = googleResponse.data;
      const Model = role === 'student' ? Tupath_usersModel : Expert_usersModel;

      // Check if the user already exists; if not, create a new one
      let user = await Model.findOne({ email });
      if (!user) {
          user = await Model.create({ name, email, password: googleId, isNewUser: true });
      }

      const jwtToken = jwt.sign({ email, googleId, name, id: user._id, role }, JWT_SECRET, { expiresIn: '1h' });
      res.json({ success: true, token: jwtToken });
  } catch (error) {
      res.status(500).json({ success: false, message: 'Google sign-up failed' });
  }
});






// Google login endpoint
app.post('/google-login', async (req, res) => {
  const { token, role } = req.body;

  try {
    const googleResponse = await axios.get(`https://oauth2.googleapis.com/tokeninfo?id_token=${token}`);
    if (googleResponse.data.aud !== GOOGLE_CLIENT_ID) {
      return res.status(400).json({ success: false, message: 'Invalid Google token' });
    }

    const { email, sub: googleId, name } = googleResponse.data;

    // Check if user exists based on role
    let user;
    if (role === 'student') {
      user = await Tupath_usersModel.findOne({ email });
      if (!user) {
        user = await Tupath_usersModel.create({ name, email, password: '', googleSignup: true });
      }
    } else if (role === 'expert') {
      user = await Expert_usersModel.findOne({ email });
      if (!user) {
        user = await Expert_usersModel.create({ name, email, password: '', googleSignup: true });
      }
    } else {
      return res.status(400).json({ success: false, message: 'Invalid role' });
    }

    // Deny Google login if the user was not signed up via Google
    if (!user.googleSignup) {
      return res.status(400).json({ success: false, message: 'This account was not registered with Google. Please use email/password login.' });
    }

    const jwtToken = jwt.sign({ email, googleId, name, id: user._id }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ success: true, token: jwtToken });
  } catch (error) {
    console.error('Google login error:', error);
    res.status(500).json({ success: false, message: 'Google login failed' });
  }
});




// Student signup endpoint
app.post('/studentsignup', async (req, res) => {
  const { firstName, lastName, email, password } = req.body;
  const name = `${firstName} ${lastName}`;
  if (!firstName || !lastName || !email || !password) {
    return res.status(400).json({ success: false, message: "All fields are required." });
  }
  try {
    const existingUser = await Tupath_usersModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "User already exists." });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await Tupath_usersModel.create({ name, email, password: hashedPassword, isNewUser: true });
    console.log("New student registered:", newUser);
    return res.status(201).json({ success: true, user: newUser });
  } catch (err) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// Expert signup endpoint
app.post('/expertsignup', async (req, res) => {
  const { firstName, lastName, email, password } = req.body;
  const name = `${firstName} ${lastName}`;
  if (!firstName || !lastName || !email || !password) {
    return res.status(400).json({ success: false, message: "All fields are required." });
  }
  try {                             
    const existingUser = await Expert_usersModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "Expert already exists." });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await Expert_usersModel.create({ name, email, password: hashedPassword, isNewUser: true });
    console.log("New expert registered:", newUser);
    return res.status(201).json({ success: true, user: newUser });
  } catch (err) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});




// Protected route
app.get('/protected', verifyToken, (req, res) => {
  res.status(200).json({ success: true, message: "This is a protected route." });
});


app.listen(3001, () => {
  console.log("Server is running on port 3001");
});

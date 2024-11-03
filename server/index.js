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
      
      // Check for existing user in both student and expert collections
      const existingStudent = await Tupath_usersModel.findOne({ email });
      const existingExpert = await Expert_usersModel.findOne({ email });

      if ((role === 'student' && existingStudent) || (role === 'expert' && existingExpert)) {
          return res.status(409).json({ success: false, message: 'Account already exists. Please log in.' });
      } else if (existingStudent || existingExpert) {
          // Prevent sign-up if user exists in either collection
          return res.status(409).json({ success: false, message: 'Account already exists with another role. Please log in.' });
      }

      // Create a new user if they don't already exist
      const Model = role === 'student' ? Tupath_usersModel : Expert_usersModel;
      const newUser = await Model.create({ name, email, password: googleId, isNewUser: true });
      
      const jwtToken = jwt.sign({ email, googleId, name, id: newUser._id, role }, JWT_SECRET, { expiresIn: '1h' });
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
      const Model = role === 'student' ? Tupath_usersModel : Expert_usersModel;

      // Check if the user exists in the respective collection
      const user = await Model.findOne({ email });
      if (!user) {
          // If user does not exist, return an error response
          return res.status(404).json({ success: false, message: 'User not registered. Please sign up first.' });
      }

      // If user exists, generate a JWT token
      const jwtToken = jwt.sign({ email, googleId, name, id: user._id, role }, JWT_SECRET, { expiresIn: '1h' });
      res.json({ success: true, token: jwtToken });
  } catch (error) {
      res.status(500).json({ success: false, message: 'Google login failed' });
  }
});




// Student signup endpoint
app.post('/studentsignup', async (req, res) => {
  const { firstName, lastName, email, password } = req.body;
  const name = `${firstName} ${lastName}`;

  try {
      const existingStudent = await Tupath_usersModel.findOne({ email });
      const existingExpert = await Expert_usersModel.findOne({ email });

      if (existingStudent) {
          return res.status(409).json({ success: false, message: 'Student account already exists. Please log in.' });
      } else if (existingExpert) {
          return res.status(409).json({ success: false, message: 'Account with another role exists. Please log in.' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = await Tupath_usersModel.create({ name, email, password: hashedPassword, isNewUser: true });

      res.status(201).json({ success: true, user: newUser });
  } catch (err) {
      res.status(500).json({ success: false, message: 'Internal server error' });
  }
});


// Expert signup endpoint
app.post('/expertsignup', async (req, res) => {
  const { firstName, lastName, email, password } = req.body;
  const name = `${firstName} ${lastName}`;

  try {
      const existingStudent = await Tupath_usersModel.findOne({ email });
      const existingExpert = await Expert_usersModel.findOne({ email });

      if (existingExpert) {
          return res.status(409).json({ success: false, message: 'Expert account already exists. Please log in.' });
      } else if (existingStudent) {
          return res.status(409).json({ success: false, message: 'Account with another role exists. Please log in.' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = await Expert_usersModel.create({ name, email, password: hashedPassword, isNewUser: true });

      res.status(201).json({ success: true, user: newUser });
  } catch (err) {
      res.status(500).json({ success: false, message: 'Internal server error' });
  }
});




// Protected route
app.get('/protected', verifyToken, (req, res) => {
  res.status(200).json({ success: true, message: "This is a protected route." });
});


app.listen(3001, () => {
  console.log("Server is running on port 3001");
});

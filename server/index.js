const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const Tupath_usersModel = require("./models/Tupath_users");

const app = express();
app.use(express.json());
app.use(cors());

mongoose.connect("mongodb://127.0.0.1:27017/tupath_users");

app.post("/login", (req, res) => {
  const { email, password } = req.body;
  Tupath_usersModel.findOne({ email: email })
    .then(user => {
      if (!user) {
        return res.status(400).json({ success: false, message: "User not found" });
      }
      if (user.password !== password) {
        return res.status(400).json({ success: false, message: "Password is incorrect" });
      }
      return res.status(200).json({ success: true, message: "Login successful", user: user });
    })
    .catch(err => {
      console.error("Error during login:", err);
      res.status(500).json({ success: false, message: "Internal server error" });
    });
});

app.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  // Basic validation
  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: "All fields are required." });
  }

  try {
    // Check if the user already exists
    const existingUser = await Tupath_usersModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "User already exists." });
    }

    // Create a new user
    const newUser = await Tupath_usersModel.create({ name, email, password });
    return res.status(201).json({ success: true, user: newUser });

  } catch (err) {
    console.error("Error during registration:", err);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
});

app.listen(3001, () => {
  console.log("Server is running on port 3001");
});

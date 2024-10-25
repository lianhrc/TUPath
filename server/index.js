const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const { Tupath_usersModel, Expert_usersModel } = require("./models/Tupath_users");

const app = express();
app.use(express.json());
app.use(cors());

mongoose.connect("mongodb://127.0.0.1:27017/tupath_users")
  .then(() => console.log("MongoDB connected successfully"))
  .catch(err => console.error("MongoDB connection error:", err));

app.post("/login", async (req, res) => {
  const { email, password, role } = req.body;

  try {
    let user;
    if (role === 'student') {
      user = await Tupath_usersModel.findOne({ email });
    } else if (role === 'expert') {
      user = await Expert_usersModel.findOne({ email });
    } else {
      return res.status(400).json({ success: false, message: "Invalid user role." });
    }

    if (!user) {
      return res.status(400).json({ success: false, message: "User not found" });
    }
    if (user.password !== password) {
      return res.status(400).json({ success: false, message: "Password is incorrect" });
    }

    // Check if it's the user's first login
    if (role === 'student') {
      redirectPath = user.isNewUser ? '/studentprofilecreation' : '/studenthomepage';
    } else if (role === 'expert') {
      redirectPath = user.isNewUser ? '/employeeprofilecreation' : '/employerhomepage'; // Adjust for experts
    }
    // If first time login, set isNewUser to false
    if (user.isNewUser) {
      user.isNewUser = false;
      await user.save();
    }

    return res.status(200).json({ success: true, message: "Login successful", redirectPath });
  } catch (err) {
    console.error("Error during login:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

app.post('/studentsignup', async (req, res) => {
  const { firstName, lastName, email, password } = req.body;

  if (!firstName || !lastName || !email || !password) {
    return res.status(400).json({ success: false, message: "All fields are required." });
  }

  const name = `${firstName} ${lastName}`;
  try {
    const existingUser = await Tupath_usersModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "User already exists." });
    }

    const newUser = await Tupath_usersModel.create({ 
      name, 
      email, 
      password, 
      isNewUser: true // Indicate this is a first-time login user
    });

    // Log new user to verify
    console.log("New student registered:", newUser);

    return res.status(201).json({ success: true, user: newUser });
  } catch (err) {
    console.error("Error during registration:", err);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
});

app.post('/expertsignup', async (req, res) => {
  const { firstName, lastName, email, password } = req.body;

  if (!firstName || !lastName || !email || !password) {
    return res.status(400).json({ success: false, message: "All fields are required." });
  }

  const name = `${firstName} ${lastName}`;
  try {
    const existingUser = await Expert_usersModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "Expert already exists." });
    }

    const newUser = await Expert_usersModel.create({ 
      name, 
      email, 
      password, 
      isNewUser: true // Indicate this is a first-time login user
    });

    // Log new user to verify
    console.log("New expert registered:", newUser);

    return res.status(201).json({ success: true, user: newUser });
  } catch (err) {
    console.error("Error during registration:", err);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
});

app.listen(3001, () => {
  console.log("Server is running on port 3001");
});

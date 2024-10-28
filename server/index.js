const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const { Tupath_usersModel, Expert_usersModel } = require("./models/Tupath_users");
const JWT_SECRET = 'your-secret-key';





const app = express();
app.use(express.json());
app.use(cors());




mongoose.connect("mongodb://127.0.0.1:27017/tupath_users")
  .then(() => console.log("MongoDB connected successfully"))
  .catch(err => console.error("MongoDB connection error:", err));

  const verifyToken = (req, res, next) => {
    const token = req.headers['authorization'];

    if (!token) {
        return res.status(403).json({ success: false, message: "No token provided." });
    }

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ success: false, message: "Unauthorized." });
        }

        req.userId = decoded.id;
        req.userRole = decoded.role;
        next();
    });
};



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

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ success: false, message: "Password is incorrect" });
        }

        // Generate JWT
        const token = jwt.sign({ id: user._id, role }, JWT_SECRET, { expiresIn: '1h' });

        // Send token in response
        return res.status(200).json({ success: true, token, message: "Login successful" });
    } catch (err) {
        console.error("Error during login:", err);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});


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

      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser = await Tupath_usersModel.create({
          name,
          email,
          password: hashedPassword,
          isNewUser: true
      });

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

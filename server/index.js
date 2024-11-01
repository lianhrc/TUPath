// Required libraries
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const express = require("express");
const http = require("http");
const mongoose = require("mongoose");
const cors = require("cors");
const { Server } = require("socket.io");
const { Tupath_usersModel, Expert_usersModel } = require("./models/Tupath_users");

const JWT_SECRET = 'your-secret-key';

// Express app and server setup
const app = express();
const server = http.createServer(app);

// Middleware setup
app.use(express.json());
app.use(cors());

// MongoDB connection
mongoose.connect("mongodb://127.0.0.1:27017/tupath_users")
  .then(() => console.log("MongoDB connected successfully"))
  .catch(err => console.error("MongoDB connection error:", err));

// JWT verification middleware
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

// Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // Client's URL (Vite)
    methods: ["GET", "POST"],
  },
});

// Chat message schema
const messageSchema = new mongoose.Schema({
  sender: String,
  text: String,
  timestamp: { type: Date, default: Date.now },
});
const Message = mongoose.model("Message", messageSchema);

// REST endpoint to fetch chat messages
app.get("/api/messages", async (req, res) => {
  try {
    const messages = await Message.find().sort({ timestamp: 1 });
    res.json(messages);
  } catch (err) {
    console.error("Error fetching messages:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// Define Post schema
const postSchema = new mongoose.Schema({
  profileImg: String,
  name: String,
  timestamp: { type: Date, default: Date.now },
  content: String,
  postImg: String,
  upvotes: { type: Number, default: 0 },
  comments: [
    {
      author: String,
      comment: String,
      timestamp: { type: Date, default: Date.now },
    },
  ],
});
const Post = mongoose.model("Post", postSchema);

// Get all posts
app.get("/api/posts", async (req, res) => {
  try {
    const posts = await Post.find().sort({ timestamp: -1 });
    res.json(posts);
  } catch (err) {
    console.error("Error fetching posts:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// Create a new post
app.post("/api/posts", async (req, res) => {
  const { profileImg, name, content, postImg } = req.body;
  try {
    const newPost = new Post({ profileImg, name, content, postImg });
    await newPost.save();
    res.status(201).json({ success: true, post: newPost });
    io.emit("new_post", newPost);
  } catch (err) {
    console.error("Error creating post:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// Socket.IO events for real-time chat
io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on("send_message", async (data) => {
    try {
      const message = new Message(data);
      await message.save();
      io.emit("receive_message", data);
    } catch (err) {
      console.error("Error saving message:", err);
    }
  });

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

// Login endpoint
app.post("/login", async (req, res) => {
  const { email, password, role } = req.body;

  try {
    let user;
    if (role === "student") {
      user = await Tupath_usersModel.findOne({ email });
    } else if (role === "expert") {
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

    // Determine redirect path based on user role
    let redirectPath = role === "student" ? "/studenthomepage" : "/employerhomepage";
    if (user.isNewUser) {
      redirectPath = role === "student" ? "/studentprofilecreation" : "/employeeprofilecreation";
      user.isNewUser = false;
      await user.save();
    }

    res.status(200).json({ success: true, token, message: "Login successful", redirectPath });
  } catch (err) {
    console.error("Error during login:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// Student signup endpoint
app.post("/studentsignup", async (req, res) => {
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
    const newUser = await Tupath_usersModel.create({ 
      name, 
      email, 
      password: hashedPassword, 
      isNewUser: true
    });

    console.log("New student registered:", newUser);
    res.status(201).json({ success: true, user: newUser });
  } catch (err) {
    console.error("Error during registration:", err);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
});

// Expert signup endpoint
app.post("/expertsignup", async (req, res) => {
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
    const newUser = await Expert_usersModel.create({
      name,
      email,
      password: hashedPassword,
      isNewUser: true
    });

    console.log("New expert registered:", newUser);
    res.status(201).json({ success: true, user: newUser });
  } catch (err) {
    console.error("Error during registration:", err);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
});

// Protected route example
app.get('/protected', verifyToken, (req, res) => {
  res.status(200).json({ success: true, message: "This is a protected route." });
});

// Start server
const PORT = 3001;
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

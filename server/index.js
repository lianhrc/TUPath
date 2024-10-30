// Required libraries
const express = require("express");
const http = require("http");
const mongoose = require("mongoose");
const cors = require("cors");
const { Server } = require("socket.io");
const { Tupath_usersModel, Expert_usersModel } = require("./models/Tupath_users");

// Express app and server setup
const app = express();
const server = http.createServer(app);

// Middleware setup
app.use(express.json());
app.use(cors());

// MongoDB connection
mongoose.connect("mongodb://127.0.0.1:27017/tupath_users", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log("MongoDB connected successfully"))
  .catch(err => console.error("MongoDB connection error:", err));

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
  timestamp: {
    type: Date,
    default: Date.now,
  },
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
  time: String,
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
    const posts = await Post.find().sort({ time: -1 });
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
    const newPost = new Post({ profileImg, name, time: "Just now", content, postImg });
    await newPost.save();
    res.status(201).json({ success: true, post: newPost });
    io.emit("new_post", newPost);
  } catch (err) {
    console.error("Error creating post:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// Add a comment to a post
app.post("/api/posts/:postId/comments", async (req, res) => {
  const { postId } = req.params;
  const { author, comment } = req.body;
  try {
    const post = await Post.findById(postId);
    if (post) {
      const newComment = { author, comment };
      post.comments.push(newComment);
      await post.save();
      res.status(201).json({ success: true, comment: newComment });
      io.emit("receive_comment", { postId, comment: newComment });
    } else {
      res.status(404).json({ success: false, message: "Post not found" });
    }
  } catch (err) {
    console.error("Error adding comment:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// Socket.IO events for real-time chat
io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on("send_message", async (data) => {
    try {
      const message = new Message(data);
      await message.save(); // Save to MongoDB

      io.emit("receive_message", data); // Broadcast to all clients
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
    if (user.password !== password) {
      return res.status(400).json({ success: false, message: "Password is incorrect" });
    }

    let redirectPath;
    if (role === "student") {
      redirectPath = user.isNewUser ? "/studentprofilecreation" : "/studenthomepage";
    } else if (role === "expert") {
      redirectPath = user.isNewUser ? "/employeeprofilecreation" : "/employerhomepage";
    }

    if (user.isNewUser) {
      user.isNewUser = false;
      await user.save();
    }

    res.status(200).json({ success: true, message: "Login successful", redirectPath });
  } catch (err) {
    console.error("Error during login:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// Student signup endpoint
app.post("/studentsignup", async (req, res) => {
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
      isNewUser: true,
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
      isNewUser: true,
    });

    console.log("New expert registered:", newUser);
    res.status(201).json({ success: true, user: newUser });
  } catch (err) {
    console.error("Error during registration:", err);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
});

// Start server
const PORT = 3001;
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

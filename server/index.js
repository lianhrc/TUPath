const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const axios = require("axios");
const http = require("http");
const { Server } = require("socket.io");
const { Tupath_usersModel, Expert_usersModel } = require("./models/Tupath_users");

const JWT_SECRET = "your-secret-key";
const GOOGLE_CLIENT_ID = "625352349873-hrob3g09um6f92jscfb672fb87cn4kvv.apps.googleusercontent.com";

const app = express();
const server = http.createServer(app);
const multer = require("multer");
const path = require("path");

// Middleware setup
app.use(express.json());
app.use(cors({ origin: 'http://localhost:5173' })); // Updated CORS for specific origin
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/projects", express.static(path.join(__dirname, "projects")));
app.use("/certificates", express.static(path.join(__dirname, "certificates")));


// Middleware for setting COOP headers
app.use((req, res, next) => {
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups'); // Added COOP header
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin'); // Added CORP header
  next();
});


// MongoDB connection
mongoose
  .connect("mongodb://127.0.0.1:27017/tupath_users")
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => console.error("MongoDB connection error:", err));


  // Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Set upload directory
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// JWT verification middleware
// JWT verification middleware with added debugging and error handling
const verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader) {
    console.error("Authorization header is missing.");
    return res.status(401).json({ message: "Access Denied: Authorization header missing" });
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    console.error("Token not found in Authorization header.");
    return res.status(401).json({ message: "Access Denied: Token missing" });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Invalid Token" });
    }
  
    req.user = {
      id: user.id,
      username: user.username,
      lastName: user.lastName,
    }; // Add user details to the request
    next();
  });
  
};


// Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
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

// Increment upvotes for a post
app.post("/api/posts/:id/upvote", verifyToken, async (req, res) => {
  const postId = req.params.id;
  const { id: userId, username, lastName } = req.user; // Extract user info from token

  try {
    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ success: false, message: "Post not found" });
    }

    const userIndex = post.votedUsers.findIndex((user) => user.userId === userId);

    if (userIndex > -1) {
      // User already upvoted, remove upvote
      post.votedUsers.splice(userIndex, 1);
      post.upvotes -= 1;
    } else {
      // User has not upvoted, add upvote
      post.votedUsers.push({ userId, username, lastName });
      post.upvotes += 1;
    }

    await post.save();

    res.status(200).json({ success: true, post });
  } catch (err) {
    console.error("Error toggling upvote:", err);
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
  votedUsers: [
    {
      userId: String,
      username: String,
      lastName: String,
    },
  ], // Array of users who upvoted
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

});

// Login endpoint
app.post("/login", async (req, res) => {
  const { email, password, role } = req.body;
  try {
    const user = role === "student" ? await Tupath_usersModel.findOne({ email }) : await Expert_usersModel.findOne({ email });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ success: false, message: "Invalid email or password" });
    }

    const token = jwt.sign({ id: user._id, role }, JWT_SECRET, { expiresIn: "1h" });
    console.log("Generated Token:", token); // For debugging only; remove in production

    let redirectPath = user.isNewUser ? "/studentprofilecreation" : "/studenthomepage";
    if (role !== "student") redirectPath = "/employerhomepage";

    user.isNewUser = false;
    await user.save();

    res.status(200).json({ success: true, token, message: "Login successful", redirectPath });
  } catch (err) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});



// Google Signup endpoint
// Google Signup endpoint
app.post("/google-signup", async (req, res) => {
  const { token, role } = req.body;

  // Validate role from the request payload
  if (!['student', 'expert'].includes(role)) {
    return res.status(400).json({ success: false, message: 'Invalid role specified' });
  }

  try {
    // Verify the Google token using Google API
    const googleResponse = await axios.get(`https://oauth2.googleapis.com/tokeninfo?id_token=${token}`);

    if (googleResponse.data.aud !== GOOGLE_CLIENT_ID) {
      return res.status(400).json({ success: false, message: 'Invalid Google token' });
    }

    const { email, sub: googleId, name } = googleResponse.data;

    // Choose the correct model based on the role
    const UserModel = role === 'student' ? Tupath_usersModel : Expert_usersModel;

    // Check if the user already exists in the respective collection
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'Account already exists. Please log in.' });
    }

    // Create a new user (Google ID as password placeholder)
    const newUser = await UserModel.create({
      name,
      email,
      password: googleId, // Placeholder for password
      isNewUser: true,
      googleSignup: true,
    });

    // Generate JWT token
    const jwtToken = jwt.sign({ email, googleId, name, id: newUser._id, role }, JWT_SECRET, { expiresIn: '1h' });

    res.json({ success: true, token: jwtToken });
  } catch (error) {
    console.error('Google sign-up error:', error);
    res.status(500).json({ success: false, message: 'Google sign-up failed' });
  }
});




// Google login endpoint
app.post("/google-login", async (req, res) => {
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
    console.error('Google login error:', error);
    res.status(500).json({ success: false, message: 'Google login failed' });
  }
});

// Student signup endpoint
app.post("/studentsignup", async (req, res) => {
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
    });

    // Generate a token and include it in the response
    const token = jwt.sign({ id: newUser._id, role: 'student' }, JWT_SECRET, { expiresIn: '1h' });
    
    return res.status(201).json({ success: true, token, user: newUser });
  } catch (err) {
    console.error("Error during signup:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});




// Expert signup endpoint
app.post("/expertsignup", async (req, res) => {
  const { firstName, lastName, email, password } = req.body;

  try {
    const existingUser = await Tupath_usersModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "User already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await Expert_usersModel.create({
      name: `${firstName} ${lastName}`,
      email,
      password: hashedPassword,
      isNewUser: true,
    });

    // Generate a token and include it in the response
    const token = jwt.sign({ id: newUser._id, role: 'student' }, JWT_SECRET, { expiresIn: '1h' });
    
    return res.status(201).json({ success: true, token, user: newUser });
  } catch (err) {
    console.error("Error during signup:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

//---------------------------------------------NEWLY ADDED--------------------------------------------------------

app.post('/api/updateStudentProfile', verifyToken, async (req, res) => {
  try {
      const userId = req.user.id;
      const {
        studentId,
        firstName,
        lastName,
        middleName,
        department,
        yearLevel,
        dob,
        profileImg,
        gender,
        address,
        techSkills,
        softSkills,
        contact,
        email  } = req.body;

      const updatedUser = await Tupath_usersModel.findByIdAndUpdate(
          userId,
          {
              $set: {
                  profileDetails: { 
                    studentId,
                    firstName,
                    lastName,
                    middleName,
                    department,
                    yearLevel,
                    dob,
                    profileImg,
                    gender,
                    address,
                    techSkills,
                    softSkills,
                    contact,
                    email
                   }
              }
          },
          { new: true, upsert: true }
      );

      if (!updatedUser) {
          return res.status(404).json({ success: false, message: 'User not found' });
      }

      res.status(200).json({ success: true, message: 'Profile updated successfully', updatedUser });
  } catch (error) {
      res.status(500).json({ success: false, message: 'Internal server error' });
  }
});
app.post('/api/updateEmployerProfile', verifyToken, async (req, res) => {
  try {
      const userId = req.user.id;
      const {
        firstName,
        lastName,
        middleName,
        dob,
        gender,
        nationality,
        address,
        profileImg,
        companyName,
        industry,
        location,
        aboutCompany,
        contactPersonName,
        position,
        email,
        phoneNumber,
        preferredRoles,
        internshipOpportunities,
        preferredSkills } = req.body;

      const updatedUser = await Expert_usersModel.findByIdAndUpdate(
          userId,
          {
              $set: {
                  profileDetails: { 
                    firstName,
                    lastName,
                    middleName,
                    dob,
                    gender,
                    nationality,
                    address,
                    profileImg,
                    companyName,
                    industry,
                    location,
                    aboutCompany,
                    contactPersonName,
                    position,
                    email,
                    phoneNumber,
                    preferredRoles,
                    internshipOpportunities,
                    preferredSkills
                   }
              }
          },
          { new: true, upsert: true }
      );

      if (!updatedUser) {
          return res.status(404).json({ success: false, message: 'User not found' });
      }

      res.status(200).json({ success: true, message: 'Profile updated successfully', updatedUser });
  } catch (error) {
      res.status(500).json({ success: false, message: 'Internal server error' });
  }
});



// Profile fetching endpoint
app.get('/api/profile', verifyToken, async (req, res) => {
  try {
    // Get the user ID from the token
    const userId = req.user.id;

    // Find the user in the database
    const tupathUser = await Tupath_usersModel.findById(userId).select('profileDetails createdAt googleSignup');

    if (tupathUser) {
      return res.status(200).json({ success: true, profile: tupathUser });
    }

    const expertUser = await Expert_usersModel.findby(userId).select('profileDetails createdAt googleSignup');

    if (expertUser) {
      return res.status(200).json({success:true, profile:expertUser});
    }

    res.status(404).json({ success: false, profile: 'User not Found' });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});



app.post("/api/uploadProfileImage", verifyToken, upload.single("profileImg"), async (req, res) => {
  try {
      const userId = req.user.id;
      const profileImgPath = `/uploads/${req.file.filename}`;

      // Update for both student and expert models
      const updatedStudent = await Tupath_usersModel.findByIdAndUpdate(
          userId,
          { $set: { "profileDetails.profileImg": profileImgPath } },
          { new: true }
      );

      const updatedExpert = await Expert_usersModel.findByIdAndUpdate(
          userId,
          { $set: { "profileDetails.profileImg": profileImgPath } },
          { new: true }
      );

      if (!updatedStudent && !updatedExpert) {
          return res.status(404).json({ success: false, message: "User not found" });
      }

      res.status(200).json({ success: true, message: "Profile image uploaded successfully", profileImg: profileImgPath });
  } catch (error) {
      console.error("Error uploading profile image:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
  }
});


// Endpoint for uploading project files
app.post("/api/uploadProject", verifyToken, upload.array("projectFiles", 5), async (req, res) => {
  try {
    const userId = req.user.id;
    const filePaths = req.files.map(file => `/projects/${file.filename}`);

    const updatedUser = await Tupath_usersModel.findByIdAndUpdate(
      userId,
      { $push: { "profileDetails.projectFiles": { $each: filePaths } } },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({ success: true, message: "Project files uploaded successfully", projectFiles: filePaths });
  } catch (error) {
    console.error("Error uploading project files:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// Endpoint for uploading certificate photos
app.post("/api/uploadCertificate", verifyToken, upload.array("certificatePhotos", 3), async (req, res) => {
  try {
    const userId = req.user.id;
    const filePaths = req.files.map(file => `/certificates/${file.filename}`);

    const updatedUser = await Tupath_usersModel.findByIdAndUpdate(
      userId,
      { $push: { "profileDetails.certificatePhotos": { $each: filePaths } } },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({ success: true, message: "Certificate photos uploaded successfully", certificatePhotos: filePaths });
  } catch (error) {
    console.error("Error uploading certificate photos:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});












// Server setup
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

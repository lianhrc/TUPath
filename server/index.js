const express = require("express");
  const mongoose = require("mongoose");
  const cors = require("cors");
  const jwt = require("jsonwebtoken");
  const bcrypt = require("bcryptjs");
  const axios = require("axios");
  const http = require("http");
  const { Server } = require("socket.io");
  const { Tupath_usersModel, Employer_usersModel, Project, AssessmentQuestion, Admin } = require("./models/Tupath_users");
  const nodemailer = require("nodemailer");
  const crypto = require("crypto");
  const cookieParser = require('cookie-parser');
  
  //pushin purposes
 require('dotenv').config()


  const adminsignup = require("./routes/adminsignup");
  const adminLogin = require("./routes/adminLogin");
  const questions = require("./routes/questions")
  const userStats = require("./routes/userStats")
  const studentTags = require("./routes/studentTags");
  const studentByTags = require("./routes/studentsByTag")
  const users = require("./routes/users");
  const adminDelete = require("./routes/adminDelete");
  
  const checkAuth = require('./middleware/authv2')
  const adminLogout = require('./routes/adminLogout')
  

  const JWT_SECRET = "your-secret-key";
  const GOOGLE_CLIENT_ID = "625352349873-hrob3g09um6f92jscfb672fb87cn4kvv.apps.googleusercontent.com";

  const app = express();
  const server = http.createServer(app);
  const multer = require("multer");
  const path = require("path");

  // Middleware setup
  app.use(cors({ origin: 'http://localhost:5173', credentials: true, })); // Updated CORS for specific origin // SET CREDENTIALS AS TRUE
  app.use('/uploads', express.static('uploads'));
  app.use("/certificates", express.static(path.join(__dirname, "certificates")));



  app.use(express.json({ limit: '50mb' })); // Increase the limit to 50 MB
  app.use(express.urlencoded({ limit: '50mb', extended: true }));
  app.use(cookieParser());

    //ROUTES
   
    app.use('/', users);
    app.use('/', adminsignup);
    app.use('/', adminLogin);
    app.use('/', questions);
    app.use('/', userStats);
    app.use('/', studentTags);
    app.use('/', studentByTags);
    app.use('/', adminDelete);
    app.use('/', checkAuth);
    app.use('/', adminLogout);


  // Middleware for setting COOP headers
  app.use((req, res, next) => {
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups'); // Added COOP header
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin'); // Added CORP header
    next();
  });


/*
   // MongoDB connection
    mongoose
     .connect("mongodb://127.0.0.1:27017/tupath_users")
      .then(() => console.log("MongoDB connected successfully"))
     .catch((err) => console.error("MongoDB connection error:", err));
*/
 

mongoose.connect(
  "mongodb+srv://ali123:ali123@cluster0.wfrb9.mongodb.net/tupath_users?retryWrites=true&w=majority"
)
  .then(() => console.log("Connected to MongoDB Atlas successfully"))
  .catch((err) => console.error("MongoDB connection error:", err));



  // Configure multer for file uploads
    const storage = multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Define where to store the files
      },
      filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname); // Define how files are named
      }
    });
   
    const upload = multer({ 
      storage: storage,
      limits: { fileSize: 50 * 1024 * 1024 } // 50 MB limit
    });
    

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
      console.error("Token verification failed:", err);
      return res.status(403).json({ message: "Invalid Token" });
    }

    req.user = user;
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
    sender: {
      senderId: { type: String, required: true },
      name: { type: String, required: true },
      profileImg: { type: String, default: "" },
    },
    receiver: {
      receiverId: { type: String, required: true },
      name: { type: String, required: true },
      profileImg: { type: String, default: "" },
    },
    messageContent: {
      text: { type: String, required: true },
      attachments: [{ type: String }], // URLs or file paths
    },
    status: {
      read: { type: Boolean, default: false },
      delivered: { type: Boolean, default: false },
    },
    timestamp: { type: Date, default: Date.now },
    direction: { type: String, enum: ['sent', 'received'], required: true }, // Add direction field
  });
  
  // Add indexes for optimization
  messageSchema.index({ "sender.senderId": 1 });
  messageSchema.index({ "receiver.receiverId": 1 });
  messageSchema.index({ timestamp: -1 });
  messageSchema.index({ "sender.senderId": 1, "receiver.receiverId": 1 });
  messageSchema.index({ "receiver.receiverId": 1, "status.read": 1 });
  
  const Message = mongoose.model("Message", messageSchema);
  
  // Add this endpoint to fetch users
  
app.get('/api/userss', verifyToken, async (req, res) => {
  try {
    const students = await Tupath_usersModel.find().select('profileDetails.firstName profileDetails.lastName profileDetails.profileImg');
    const employers = await Employer_usersModel.find().select('profileDetails.firstName profileDetails.lastName profileDetails.profileImg');
    const users = [...students, ...employers];
    res.status(200).json({ success: true, users });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});


// REST endpoint to fetch chat messages
app.get("/api/messages", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id; // Extract userId from the token
    const messages = await Message.find({
      $or: [
        { "sender.senderId": userId },
        { "receiver.receiverId": userId }
      ]
    }).sort({ timestamp: -1 });

    // Transform messages to add correct direction for each user
    const transformedMessages = messages.map(msg => {
      const isSender = msg.sender.senderId === userId;
      return {
        ...msg.toObject(),
        direction: isSender ? 'sent' : 'received'
      };
    });

    res.json(transformedMessages);
  } catch (err) {
    console.error("Error fetching messages:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// REST endpoint to fetch unread messages
app.get("/api/unread-messages", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id; // Extract userId from the token
    const messages = await Message.find({ "receiver.receiverId": userId, "status.read": false }).sort({ timestamp: 1 });
    res.json(messages);
  } catch (err) {
    console.error("Error fetching unread messages:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// REST endpoint to mark a message as read
app.put("/api/messages/:id/read", verifyToken, async (req, res) => {
  try {
    const messageId = req.params.id;
    const userId = req.user.id; // Extract userId from the token

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ success: false, message: "Message not found" });
    }

    if (message.receiver.receiverId !== userId) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    message.status.read = true;
    await message.save();

    // Emit the message read event
    io.emit("message_read", { messageId });

    res.status(200).json({ success: true, message: "Message marked as read" });
  } catch (err) {
    console.error("Error marking message as read:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

  // Add a comment to a post
app.post("/api/posts/:id/comment", verifyToken, async (req, res) => {
  const userId = req.user.id; // Extract userId from the verified token
  const postId = req.params.id;
  const { profileImg, name, comment } = req.body;

  if (!comment || comment.trim() === "") {
      return res.status(400).json({ success: false, message: "Comment cannot be empty" });
  }

  try {
      const post = await Post.findById(postId);

      if (!post) {
          return res.status(404).json({ success: false, message: "Post not found" });
      }

      const newComment = {
          profileImg,
          username: name,
          userId, // Include userId in the comment
          comment,
          createdAt: new Date(),
      };

      post.comments.push(newComment);
      await post.save();

      io.emit("new_comment", { postId, comment: newComment });

      res.status(201).json({ success: true, comment: newComment });
  } catch (err) {
      console.error("Error adding comment:", err);
      res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// Delete a comment from a post
app.delete("/api/posts/:postId/comment/:commentId", verifyToken, async (req, res) => {
  const userId = req.user.id; // Extract userId from the verified token
  const postId = req.params.postId;
  const commentId = req.params.commentId;

  try {
      // Find the post by ID
      const post = await Post.findById(postId);

      if (!post) {
          return res.status(404).json({ success: false, message: "Post not found" });
      }

      // Find the comment to delete
      const commentIndex = post.comments.findIndex(
          (comment) => comment._id.toString() === commentId && comment.userId === userId
      );

      if (commentIndex === -1) {
          return res.status(404).json({ success: false, message: "Comment not found or unauthorized" });
      }

      // Remove the comment from the comments array
      post.comments.splice(commentIndex, 1);

      // Save the updated post
      await post.save();

      // Emit the comment deletion event
      io.emit("delete_comment", { postId, commentId });

      res.status(200).json({ success: true, message: "Comment deleted successfully" });
  } catch (err) {
      console.error("Error deleting comment:", err);
      res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// Edit a comment on a post
app.put("/api/posts/:postId/comment/:commentId", verifyToken, async (req, res) => {
  const userId = req.user.id; // Extract userId from the verified token
  const postId = req.params.postId;
  const commentId = req.params.commentId;
  const { comment } = req.body;

  if (!comment || comment.trim() === "") {
      return res.status(400).json({ success: false, message: "Comment cannot be empty" });
  }

  try {
      // Find the post by ID
      const post = await Post.findById(postId);

      if (!post) {
          return res.status(404).json({ success: false, message: "Post not found" });
      }

      // Find the comment to edit
      const existingComment = post.comments.find(
          (commentItem) => commentItem._id.toString() === commentId && commentItem.userId === userId
      );

      if (!existingComment) {
          return res.status(404).json({ success: false, message: "Comment not found or unauthorized" });
      }

      // Update the comment text
      existingComment.comment = comment;
      existingComment.updatedAt = new Date();

      // Save the updated post
      await post.save();

      // Emit the comment edit event
      io.emit("edit_comment", { postId, comment: existingComment });

      res.status(200).json({ success: true, comment: existingComment });
  } catch (err) {
      console.error("Error editing comment:", err);
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
    userId: String,
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
        userId: String,
        profileImg: String,
        username: String,
        comment: String,
        createdAt: Date,
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
  app.post("/api/posts", verifyToken, async (req, res) => {
    const userId = req.user.id; // Extract userId from the verified token
    const { profileImg, name, content, postImg } = req.body;
    try {
        const newPost = new Post({
            profileImg,
            name,
            content,
            postImg,
            userId, // Save userId for the post
        });
        await newPost.save();
        res.status(201).json({ success: true, post: newPost });
        io.emit("new_post", newPost);
    } catch (err) {
        console.error("Error creating post:", err);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
  });

  
  // update a post
  app.put("/api/posts/:postId", verifyToken, async (req, res) => {
    const userId = req.user.id; // Extract userId from the verified token
    const postId = req.params.postId;
    const { content } = req.body;

    if (!content || content.trim() === "") {
      return res.status(400).json({ success: false, message: "Post content cannot be empty" });
    }

    try {
      const post = await Post.findById(postId);

      if (!post) {
        return res.status(404).json({ success: false, message: "Post not found" });
      }

      if (post.userId.toString() !== userId) {
        return res.status(403).json({ success: false, message: "Unauthorized" });
      }

      post.content = content;
      post.postImg =  req.body.postImg;
      post.updatedAt = new Date();

      await post.save();

      res.status(200).json({ success: true, post });
    } catch (err) {
      console.error("Error editing post:", err);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });


  // delete a post
  app.delete("/api/posts/:postId", verifyToken, async (req, res) => {
    const userId = req.user.id; // Extract userId from the verified token
    const postId = req.params.postId;

    try {
      // Find the post by ID
      const post = await Post.findById(postId);

      if (!post) {
        return res.status(404).json({ success: false, message: "Post not found" });
      }

      // Check if the user is the one who created the post
      if (post.userId.toString() !== userId) {
        return res.status(403).json({ success: false, message: "Unauthorized" });
      }

      // Delete the post using deleteOne
      const deletedPost = await Post.deleteOne({ _id: postId });

      // Check if a post was deleted
      if (deletedPost.deletedCount === 0) {
        return res.status(500).json({ success: false, message: "Failed to delete post" });
      }

      // Emit post deletion event (optional)
      io.emit("delete_post", { postId });

      // Respond with a success message
      res.status(200).json({ success: true, message: "Post deleted successfully" });
    } catch (err) {
      console.error("Error deleting post:", err);
      res.status(500).json({ success: false, message: "Internal server error", error: err.message });
    }
  });



  // Socket.IO events for real-time chat and certificates
  io.on("connection", (socket) => {
    socket.on("send_message", async (data) => {
      try {
        const token = data.token; // Extract token from the data
        if (!token) {
          console.error("Token not provided");
          return;
        }
  
        jwt.verify(token, JWT_SECRET, async (err, user) => {
          if (err) {
            console.error("Token verification failed:", err);
            return;
          }
  
          const userId = user.id; // Extract userId from the token
          console.log("Sender ID:", userId); // Log the senderId for debugging
  
          const senderUser = await Tupath_usersModel.findById(userId) || await Employer_usersModel.findById(userId);
  
          if (!senderUser) {
            console.error("User not found for ID:", userId); // Log the userId if user is not found
            return;
          }
  
          // Create a single message with direction
          const message = new Message({
            sender: {
              senderId: userId,
              name: `${senderUser.profileDetails.firstName} ${senderUser.profileDetails.lastName}`,
              profileImg: senderUser.profileDetails.profileImg,
            },
            receiver: {
              receiverId: data.receiverId,
              name: data.receiverName,
              profileImg: data.receiverProfileImg,
            },
            messageContent: {
              text: data.messageContent.text,
              attachments: data.messageContent.attachments || [],
            },
            status: {
              read: false,
              delivered: true,
            },
            timestamp: new Date(),
            direction: 'sent'
          });
          await message.save();
  
          // Only emit to the specific receiver
          socket.to(data.receiverId).emit("receive_message", {
            ...message.toObject(),
            direction: 'received'
          });

          // Send confirmation back to sender
          socket.emit("message_sent", message);
        });
      } catch (err) {
        console.error("Error saving message:", err);
      }
    });
  
    socket.on("disconnect", () => {
      // console.log(`User disconnected: ${socket.id}`);
    });
  }); // Add this closing bracket

// Student Certificate Schema
const StudentCert = new mongoose.Schema({
  StudId: { type: String, required: true }, // Unique identifier for the student
  StudName: { type: String, required: true }, // Full name of the student
  timestamp: { type: Date, default: Date.now }, // Record creation timestamp
  Certificate: {
    CertName: { type: String, required: true }, // Name/title of the certificate
    CertDescription: { type: String, required: true }, // Detailed description of the certificate
    CertThumbnail: { type: String, default: "" }, // URL or path to the certificate thumbnail
    Attachments: [{ 
      type: String, 
      validate: {
        validator: function (v) {
          // Ensure each attachment has an allowed file extension
          const allowedExtensions = /\.(jpg|jpeg|png|pdf|docx|txt)$/i;
          return allowedExtensions.test(v);
        },
        message: "Attachments must be valid file URLs with extensions jpg, jpeg, png, pdf, docx, or txt.",
      },
    }],
  },
});

const StudentCertificate = mongoose.model("StudentCertificate", StudentCert);

// Endpoint to handle certificate uploads
app.post("/api/uploadCertificate", verifyToken, upload.fields([
  { name: "thumbnail", maxCount: 1 },
  { name: "attachments", maxCount: 10 }
]), async (req, res) => {
  try {
    const userId = req.user.id;
    const userName = req.user.name; // Ensure user name is extracted from the token
    const { CertName, CertDescription } = req.body;

    if (!CertName || !CertDescription) {
      return res.status(400).json({ success: false, message: "Certificate name and description are required." });
    }

    const thumbnail = req.files["thumbnail"] ? `/uploads/${req.files["thumbnail"][0].filename}` : "";
    const attachments = req.files["attachments"] ? req.files["attachments"].map(file => `/uploads/${file.filename}`) : [];

    const newCertificate = new StudentCertificate({
      StudId: userId,
      StudName: userName, // Use the extracted user name
      Certificate: {
        CertName,
        CertDescription,
        CertThumbnail: thumbnail,
        Attachments: attachments,
      },
    });

    await newCertificate.save();

    // Emit the new certificate event
    io.emit("new_certificate", newCertificate);

    res.status(201).json({ success: true, message: "Certificate uploaded successfully", certificate: newCertificate });
  } catch (error) {
    console.error("Error uploading certificate:", error);
    res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
});

// Endpoint to fetch certificates for a user
app.get('/api/certificates', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const certificates = await StudentCertificate.find({ StudId: userId });
    res.status(200).json({ success: true, certificates });
  } catch (error) {
    console.error('Error fetching certificates:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Endpoint to delete a certificate
app.delete('/api/certificates/:id', verifyToken, async (req, res) => {
  try {
    const certificateId = req.params.id;
    const userId = req.user.id;

    const certificate = await StudentCertificate.findOneAndDelete({ _id: certificateId, StudId: userId });

    if (!certificate) {
      return res.status(404).json({ success: false, message: "Certificate not found" });
    }

    // Emit the delete certificate event
    io.emit("delete_certificate", { certificateId });

    res.status(200).json({ success: true, message: "Certificate deleted successfully" });
  } catch (error) {
    console.error('Error deleting certificate:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});


// Endpoint to fetch profile data including projects and certificates
app.get('/api/profile', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const role = req.user.role; // Extract role from the token

    const userModel = role === 'student' ? Tupath_usersModel : Employer_usersModel;
    const user = await userModel.findById(userId)
      .select('email role profileDetails createdAt googleSignup')
      .populate({
        path: 'profileDetails.projects',
        select: 'projectName description tags tools thumbnail projectUrl',
        strictPopulate: false, // Allow flexible population
      });

    if (!user) {
      return res.status(404).json({ success: false, profile: 'User not Found' });
    }

    // Fetch certificates for the user
    const certificates = await StudentCertificate.find({ StudId: userId });

    // Return profile details tailored to the role
    const profile = {
      email: user.email,
      role: user.role,
      profileDetails: user.role === 'student' ? {
        ...user.profileDetails,
        certificates, // Include certificates in the profile details
      } : {
        ...user.profileDetails,
        companyName: user.profileDetails.companyName || null,
        industry: user.profileDetails.industry || null,
        aboutCompany: user.profileDetails.aboutCompany || null,
        preferredRoles: user.profileDetails.preferredRoles || [],
        internshipOpportunities: user.profileDetails.internshipOpportunities || false,
      },
      createdAt: user.createdAt,
      googleSignup: user.googleSignup,
    };

    res.status(200).json({ success: true, profile });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Endpoint to fetch profile data for a specific user including projects and certificates
app.get('/api/profile/:id', verifyToken, async (req, res) => {
  const { id } = req.params;
  try {
    const user = await Tupath_usersModel.findById(id)
      .populate({
        path: 'profileDetails.projects',
        strictPopulate: false,
      }) || await Employer_usersModel.findById(id)
      .populate({
        path: 'profileDetails.projects',
        strictPopulate: false,
      });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Fetch certificates for the user
    const certificates = await StudentCertificate.find({ StudId: id });

    // Include certificates in the profile details
    const profile = {
      ...user.toObject(),
      profileDetails: {
        ...user.profileDetails,
        certificates,
      },
    };

    res.status(200).json({ success: true, profile });
  } catch (err) {
    console.error('Error fetching profile:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});


// Login endpoint
  app.post("/login", async (req, res) => {
    const { email, password, role } = req.body;
    try {
      const user = role === "student" ? await Tupath_usersModel.findOne({ email }) : await Employer_usersModel.findOne({ email });
  
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
  });
  



  // Google Signup endpoint
  // Google Signup endpoint
  app.post("/google-signup", async (req, res) => {
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
      const UserModel = role === 'student' ? Tupath_usersModel : Employer_usersModel;
  
      // Check if the user exists
      const user = await UserModel.findOne({ email });
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not registered. Please sign up first.' });
      }
  
      // Generate JWT token
      const jwtToken = jwt.sign(
        { email, googleId, name, id: user._id, role },
        JWT_SECRET,
        { expiresIn: '1h' }
      );
  
      const redirectPath = role === 'student' ? '/homepage' : '/homepage';
      
      res.json({ success: true, token: jwtToken, redirectPath });
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
  });
  

  // Employer signup endpoint
  app.post("/employersignup", async (req, res) => {
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
          contact} = req.body;
          // email  

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
                      contact
                      // email
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
          // email,
          phoneNumber,
          preferredRoles,
          internshipOpportunities,
          preferredSkills } = req.body;

        const updatedUser = await Employer_usersModel.findByIdAndUpdate(
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
                      // email,
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
        const userId = req.user.id;
        const role = req.user.role; // Extract role from the token

        const userModel = role === 'student' ? Tupath_usersModel : Employer_usersModel;
        const user = await userModel.findById(userId)
            .select('email role profileDetails createdAt googleSignup')
            .populate({
                path: 'profileDetails.projects',
                select: 'projectName description tags tools thumbnail projectUrl',
                strictPopulate: false, // Allow flexible population
            });

        if (!user) {
            return res.status(404).json({ success: false, profile: 'User not Found' });
        }

        // Fetch certificates for the user
        const certificates = await StudentCertificate.find({ StudId: userId });

        // Return profile details tailored to the role
        const profile = {
            email: user.email,
            role: user.role,
            profileDetails: user.role === 'student' ? {
                ...user.profileDetails,
                certificates, // Include certificates in the profile details
            } : {
                ...user.profileDetails,
                companyName: user.profileDetails.companyName || null,
                industry: user.profileDetails.industry || null,
                aboutCompany: user.profileDetails.aboutCompany || null,
                preferredRoles: user.profileDetails.preferredRoles || [],
                internshipOpportunities: user.profileDetails.internshipOpportunities || false,
            },
            createdAt: user.createdAt,
            googleSignup: user.googleSignup,
        };

        res.status(200).json({ success: true, profile });
    } catch (error) {
        console.error('Error fetching profile:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});



 /*app.post("/api/uploadProfileImage", verifyToken, upload.single("profileImg"), async (req, res) => {
    try {
        const userId = req.user.id;

        // Validate if file exists
        if (!req.file) {
            return res.status(400).json({ success: false, message: "No file uploaded" });
        }

        const profileImgPath = `/uploads/${req.file.filename}`;
        console.log("Uploaded file path:", profileImgPath); // Debugging

        // Update for both student and employer models
        const updatedStudent = await Tupath_usersModel.findByIdAndUpdate(
            userId,
            { $set: { "profileDetails.profileImg": profileImgPath } },
            { new: true }
        );

        const updatedEmployer = await Employer_usersModel.findByIdAndUpdate(
            userId,
            { $set: { "profileDetails.profileImg": profileImgPath } },
            { new: true }
        );

        // If no user was updated, return an error
        if (!updatedStudent && !updatedEmployer) {
            console.log("User not found for ID:", userId); // Debugging
            return res.status(404).json({ success: false, message: "User not found" });
        }

        res.status(200).json({
            success: true,
            message: "Profile image uploaded successfully",
            profileImg: profileImgPath,
        });
    } catch (error) {
        console.error("Error uploading profile image:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
  });
  */
// api upload image endpoint
  app.post("/api/uploadProfileImage", verifyToken, upload.single("profileImg"), async (req, res) => {
    try {
      const userId = req.user.id;
  
      if (!req.file) {
        return res.status(400).json({ success: false, message: "No file uploaded" });
      }
  
      const profileImgPath = `/uploads/${req.file.filename}`;
  
      const userModel = req.user.role === "student" ? Tupath_usersModel : Employer_usersModel;
  
      const updatedUser = await userModel.findByIdAndUpdate(
        userId,
        { $set: { "profileDetails.profileImg": profileImgPath } },
        { new: true }
      );
  
      if (!updatedUser) {
        return res.status(404).json({ success: false, message: "User not found" });
      }
  
      res.status(200).json({
        success: true,
        message: "Profile image uploaded successfully",
        profileImg: profileImgPath,
      });
    } catch (error) {
      console.error("Error uploading profile image:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });
  


  app.post(
    "/api/uploadProject",
    verifyToken,
    upload.fields([
      { name: "thumbnail", maxCount: 1 },
      { name: "selectedFiles", maxCount: 10 },
    ]),
    async (req, res) => {
      try {
        const userId = req.user.id;
        const { projectName, description, tag, tools, projectUrl, assessment,roles } = req.body;
  
        // Validate required fields
        if (!projectName || !projectName.trim()) {
          return res.status(400).json({ success: false, message: "Project name is required." });
        }
  
        if (!description || !description.trim()) {
          return res.status(400).json({ success: false, message: "Description is required." });
        }
  
        if (!tag || !tag.trim()) {
          return res.status(400).json({ success: false, message: "A single tag is required." });
        }
  
        // Ensure tools is always an array
        const toolsArray = Array.isArray(tools) ? tools : tools ? [tools] : [];
        const rolesArray = Array.isArray(roles) ? roles : roles ? [roles] : [];

              // Validate roles
      if (!rolesArray.length) {
        return res.status(400).json({ success: false, message: "At least one role must be selected." });
      }

        // Parse assessment data
        const parsedAssessment = assessment
          ? JSON.parse(assessment).map((q) => ({
              ...q,
              weightedScore: q.scoring[q.rating],
            }))
          : [];
  
        // Validate assessment data for required categories (tags and tools)
        const requiredCategories = [
          { type: "tag", name: tag },
          ...toolsArray.map((tool) => ({ type: "tool", name: tool })),
        ];
  
        for (const category of requiredCategories) {
          const relevantAssessment = parsedAssessment.filter(
            (a) => a.category === category.type && a.categoryName === category.name
          );
  
          if (!relevantAssessment.length) {
            return res.status(400).json({
              success: false,
              message: `Assessment is required for ${category.type} '${category.name}'.`,
            });
          }
  
          const isValidAssessment = relevantAssessment.every(
            (item) => item.question && item.rating >= 1 && item.rating <= 5
          );
  
          if (!isValidAssessment) {
            return res.status(400).json({
              success: false,
              message: `Invalid assessment data for ${category.type} '${category.name}'. Ratings must be between 1 and 5.`,
            });
          }
        }
  
        // Retrieve files from multer
        const thumbnail = req.files["thumbnail"]
          ? `/uploads/${req.files["thumbnail"][0].filename}`
          : null;
  
        const selectedFiles = req.files["selectedFiles"]
          ? req.files["selectedFiles"].map((file) => file.path)
          : [];
  
        // Create a new project document
        const newProject = new Project({
          projectName,
          description,
          tag,
          tools: toolsArray,
          selectedFiles,
          thumbnail,
          projectUrl,
          roles: rolesArray,
          status: "pending",
          assessment: parsedAssessment,
        });
  
        // Save project to the database
        const savedProject = await newProject.save();
  
        // Associate the project with the user
        const user = await Tupath_usersModel.findById(userId);
  
        if (!user) {
          return res.status(404).json({ success: false, message: "User not found" });
        }
  
        user.profileDetails.projects.push(savedProject._id);
  
        // Recalculate the best tag and cumulative scores
        await user.calculateBestTag();
  
        // Save the updated user
        await user.save();
  
        res.status(201).json({
          success: true,
          message: "Project uploaded successfully",
          project: savedProject,
        });
      } catch (error) {
        console.error("Error uploading project:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
      }
    }
  );
  
  
  
  
  
  
  
  app.get("/api/projects", verifyToken, async (req, res) => {
    try {
      const userId = req.user.id;
  
      // Fetch user with populated projects
      const user = await Tupath_usersModel.findById(userId).populate("profileDetails.projects");
  
      if (!user) {
        return res.status(404).json({ success: false, message: "User not found" });
      }
  
      // Add scores and tag summary for each project
      const projectsWithScores = user.profileDetails.projects.map((project) => {
        const totalScore = project.assessment.reduce((sum, question) => sum + (question.weightedScore || 0), 0);
  
        return {
          _id: project._id,
          projectName: project.projectName,
          description: project.description,
          tag: project.tag,
          totalScore, // Sum of all weighted scores for the project
          tools: project.tools,
          status: project.status,
          assessment: project.assessment, // Include detailed assessment
          createdAt: project.createdAt,
          roles:project.roles,
        };
      });
  
      res.status(200).json({
        success: true,
        projects: projectsWithScores,
      });
    } catch (error) {
      console.error("Error fetching projects:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });
  
  
  
  
  app.delete("/api/projects/:projectId", verifyToken, async (req, res) => {
    try {
      const userId = req.user.id; // Extract user ID from the token
      const { projectId } = req.params;
  
      // Find the user
      const user = await Tupath_usersModel.findById(userId);
      if (!user) {
        return res.status(404).json({ success: false, message: "User not found" });
      }
  
      // Find the project in the user's profile and remove it
      const projectIndex = user.profileDetails.projects.findIndex(
        (project) => project._id.toString() === projectId
      );
      if (projectIndex === -1) {
        return res.status(404).json({ success: false, message: "Project not found in user's profile" });
      }
  
      // Remove the project reference from the user's profile
      user.profileDetails.projects.splice(projectIndex, 1);
      await user.save();
  
      // Delete the project document from the 'projects' collection
      const deletedProject = await Project.findByIdAndDelete(projectId);
      if (!deletedProject) {
        return res.status(404).json({ success: false, message: "Project not found in projects collection" });
      }
  
      res.status(200).json({
        success: true,
        message: "Project deleted successfully from user's profile and projects collection",
      });
    } catch (error) {
      console.error("Error deleting project:", error);
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

// -----------------------------------api for dynamic search----------------------------------
app.get('/api/search', verifyToken, async (req, res) => {
  const { query } = req.query;

  if (!query) {
    return res.status(400).json({ success: false, message: 'Query parameter is required' });
  }

  try {
    const regex = new RegExp(query, 'i'); // Case-insensitive regex
    const loggedInUserId = req.user.id; // Assuming verifyToken populates req.user with user details
    let results = [];

    if (req.user.role === 'student') {
      // Students can search employers
      const employerResults = await Employer_usersModel.find({
        $and: [
          {
            $or: [
              { 'profileDetails.firstName': regex },
              { 'profileDetails.middleName': regex },
              { 'profileDetails.lastName': regex }
            ]
          },
          { _id: { $ne: loggedInUserId } } // Exclude the logged-in user
        ]
      }).select('profileDetails.firstName profileDetails.middleName profileDetails.lastName profileDetails.profileImg');

      // Students can also search other students
      const fellowStudentResults = await Tupath_usersModel.find({
        $and: [
          {
            $or: [
              { 'profileDetails.firstName': regex },
              { 'profileDetails.middleName': regex },
              { 'profileDetails.lastName': regex }
            ]
          },
          { _id: { $ne: loggedInUserId } } // Exclude the logged-in user
        ]
      }).select('profileDetails.firstName profileDetails.middleName profileDetails.lastName profileDetails.profileImg');

      results = [...results, ...employerResults, ...fellowStudentResults];
    } else if (req.user.role === 'employer') {
      // Employers can search students (with bestTag)
      const studentResults = await Tupath_usersModel.find({
        $and: [
          {
            $or: [
              { 'profileDetails.firstName': regex },
              { 'profileDetails.middleName': regex },
              { 'profileDetails.lastName': regex },
              { bestTag: regex } // Search by `bestTag`
            ]
          },
          { _id: { $ne: loggedInUserId } } // Exclude the logged-in user
        ]
      }).select('profileDetails.firstName profileDetails.middleName profileDetails.lastName profileDetails.profileImg bestTag');

      results = [...results, ...studentResults];
    }

    res.status(200).json({ success: true, results });
  } catch (err) {
    console.error('Error during search:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});




app.get('/api/profile/:id', verifyToken, async (req, res) => {
  const { id } = req.params;
  try {
    const user = await Tupath_usersModel.findById(id).populate({
      path: 'profileDetails.projects',
      strictPopulate: false
    }) || await Employer_usersModel.findById(id).populate({
      path: 'profileDetails.projects',
      strictPopulate: false
    });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.status(200).json({ success: true, profile: user });
  } catch (err) {
    console.error('Error fetching profile:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

  
  app.put("/api/updateProfile", verifyToken, upload.single("profileImg"), async (req, res) => {
    try {
      const userId = req.user.id;
      const { role } = req.user;
      const userModel = role === "student" ? Tupath_usersModel : Employer_usersModel;
  
      const profileData = req.body;
  
      // Handle file upload (if any)
      if (req.file) {
        profileData.profileImg = `/uploads/${req.file.filename}`;
      }
  
      // Ensure we preserve the existing projects data
      const existingUser = await userModel.findById(userId);
      if (!existingUser) {
        return res.status(404).json({ success: false, message: "User not found" });
      }
  
      // Preserve projects in the profileData (if no projects are passed, keep the existing ones)
      const updatedProfile = {
        ...existingUser.profileDetails,
        ...profileData,
        projects: existingUser.profileDetails.projects || []  // Ensure existing projects are kept
      };
  
      // Update the user's profile details
      const updatedUser = await userModel.findByIdAndUpdate(
        userId,
        { $set: { profileDetails: updatedProfile } },
        { new: true }
      );
  
      if (!updatedUser) {
        return res.status(404).json({ success: false, message: "User not found" });
      }
  
      res.status(200).json({ success: true, message: "Profile updated successfully", updatedUser });
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });

  //----------------------------------------------------DECEMBER 13
  // Step 1: Add a reset token field to the user schemas



// Step 2: Endpoint to request password reset
app.post("/api/forgot-password", async (req, res) => {
  const { email } = req.body;
  try {
    const user = await Tupath_usersModel.findOne({ email }) || Employer_usersModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Generate a reset token
    const resetToken = crypto.randomBytes(20).toString("hex");
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // Token valid for 1 hour
    await user.save();

    // Send email
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: "woojohnhenry2@gmail.com",
        pass: "efqk hxyw jpeq sndo",
      },
    });

    const resetLink = `http://localhost:5173/reset-password/${resetToken}`;
    const mailOptions = {
      to: user.email,
      from: "no-reply@yourdomain.com",
      subject: "Password Reset Request",
      text: `You are receiving this because you (or someone else) requested the reset of your account's password.\n\nPlease click on the following link, or paste it into your browser to complete the process within one hour of receiving it:\n\n${resetLink}\n\nIf you did not request this, please ignore this email and your password will remain unchanged.`,
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ success: true, message: "Reset link sent to email" });
  } catch (error) {
    console.error("Error in forgot password endpoint:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// Step 3: Endpoint to reset password
app.post("/api/reset-password/:token", async (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;

  try {
    const user = await Tupath_usersModel.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    }) || Employer_usersModel.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid or expired token" });
    }

    // Update password and clear reset token
    user.password = await bcrypt.hash(newPassword, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({ success: true, message: "Password reset successful" });
  } catch (error) {
    console.error("Error in reset password endpoint:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

  //for pushing purposes, please delete this comment later

  //===============================================FOR ASSESSMENT QUESTIONS

  // Fetch assessment questions by category
  app.get("/api/assessment-questions", verifyToken, async (req, res) => {
    const { category, categoryName } = req.query;

    if (!category || !categoryName) {
        return res.status(400).json({ success: false, message: "Category and categoryName are required" });
    }

    try {
        const questions = await AssessmentQuestion.find({ category, categoryName });
        if (questions.length === 0) {
            return res.status(404).json({ success: false, message: "No questions found" });
        }

        res.status(200).json({ success: true, questions });
    } catch (error) {
        console.error("Error fetching assessment questions:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});

// Add authentication check endpoint
app.get('/check-auth', async (req, res) => {
  try {
    const token = req.cookies.adminToken; // Assuming you're using cookies for admin auth
    if (!token) {
      return res.status(401).json({ success: false, message: 'No token found' });
    }

    const verified = jwt.verify(token, JWT_SECRET);
    if (!verified) {
      return res.status(401).json({ success: false, message: 'Invalid token' });
    }

    res.json({ success: true });
  } catch (error) {
    res.status(401).json({ success: false, message: 'Authentication failed' });
  }
});

// Update logout endpoint to clear cookie
app.post('/api/admin/logout', (req, res) => {
  res.clearCookie('adminToken');
  res.json({ success: true, message: 'Logged out successfully' });
});

  // Server setup
  const PORT = process.env.PORT || 3001;
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });

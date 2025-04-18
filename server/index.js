const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const axios = require("axios");
const http = require("http");
const { Server } = require("socket.io");
const {
  Tupath_usersModel,
  Employer_usersModel,
  Project,
  Admin,
  SubjectTagMapping,
} = require("./models/Tupath_users");
const Post = require("./models/Post"); // Import Post model from models folder
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
require("dotenv").config();

const adminsignup = require("./routes/adminsignup");
const adminLogin = require("./routes/adminLogin");
const questions = require("./routes/questions");
const userStats = require("./routes/userStats");
const studentTags = require("./routes/studentTags");
const studentByTags = require("./routes/studentsByTag");
const users = require("./routes/users");
const adminDelete = require("./routes/adminDelete");
const corRoutes = require("./routes/corRoutes");
const postRoutes = require("./routes/postRoutes"); // Import post routes
const adminRoutes = require("./routes/adminRoutes"); // Import admin routes
const messagingRoute = require("./routes/messagingRoute"); // Import messaging routes

// const checkAuth = require('./middleware/authv2')
const adminLogout = require("./routes/adminLogout");
const authRoute = require("./routes/authRoute"); // Add the auth routes
const verifyToken = require("./middleware/verifyToken"); // Use the separated middleware

// Environment variables
const JWT_SECRET = process.env.JWT_SECRET;
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_URL = process.env.CLIENT_URL;
const PORT = process.env.PORT || 3001;
const MONGO_URI = process.env.MONGO_URI;
// const MONGO_LOCAL_URI = process.env.MONGO_LOCAL_URI;
const SESSION_SECRET = process.env.SESSION_SECRET;
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;

const app = express();
const server = http.createServer(app);
const multer = require("multer");
const path = require("path");

// Middleware setup
app.use(cors({ origin: CLIENT_URL, credentials: true })); // Use environment variable for CORS
app.use("/uploads", express.static("uploads"));
app.use("/certificates", express.static(path.join(__dirname, "certificates")));
app.use('/cor', express.static('cor'));

// Add this middleware first in your Express app
// app.use((req, res, next) => {
//   console.log(`Incoming ${req.method} request to ${req.path}`);
//   console.log("Headers:", req.headers);
//   console.log("Body:", req.body);
//   next();
// });

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(cookieParser());

app.use(
  session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: MONGO_URI }),
    cookie: { maxAge: 24 * 60 * 60 * 1000 }, // 1 day
  })
);

// Make io available to routes
const io = new Server(server, {
  cors: {
    origin: CLIENT_URL,
    methods: ["GET", "POST"],
  },
});

// Add io to req object
app.use((req, res, next) => {
  req.io = io;
  next();
});

// ROUTES
app.use("/", users);
app.use("/", adminsignup);
app.use("/", adminLogin);
app.use("/", questions);
app.use("/", userStats);
app.use("/", studentTags);
app.use("/", studentByTags);
app.use("/", adminDelete);
// app.use('/', checkAuth);
app.use("/", adminLogout);
app.use("/", corRoutes);
app.use("/api", authRoute); // Use the auth routes
app.use("/api/posts", postRoutes); // Use post routes
app.use("/api/admin", adminRoutes); // Use admin routes
app.use('/adminsubjects', require('./routes/adminSubjects')); // use admin subjects routes
app.use("/api/messaging", messagingRoute); // Use messaging routes

// Middleware for setting COOP headers
app.use((req, res, next) => {
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin-allow-popups"); // Added COOP header
  res.setHeader("Cross-Origin-Resource-Policy", "cross-origin"); // Added CORP header
  next();
});

// Connect to MongoDB using environment variables
mongoose
  .connect(MONGO_URI)
  .then(() => console.log("Connected to MongoDB successfully"))
  .catch((err) => console.error("MongoDB connection error:", err));

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'TUPath_global', // Change this to your preferred folder name
    allowed_formats: ['jpg', 'png', 'jpeg'],
    transformation: [{ width: 500, height: 500, crop: 'limit' }],
  },
});

const ProjectStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'TUPath_Projects',
    allowed_formats: ['jpg', 'png', 'jpeg', 'pdf', 'docx', 'zip'],
    resource_type: 'auto',
    transformation: [{ width: 800, height: 600, crop: 'limit' }]
  }
});

const RatingSlipStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'TUPath_RatingSlips',
    allowed_formats: ['jpg', 'png', 'jpeg', 'pdf'],
    resource_type: 'auto'
  }
});
const CertThumbStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: (req, file) => {
    return {
      folder: 'TUPath_Cert_Thumbnails',
      public_id: `${Date.now()}-${file.originalname}`,
      allowed_formats: ['jpg', 'jpeg', 'png'],
      transformation: [
        { width: 300, height: 300, crop: 'limit' },
        { quality: 'auto' }
      ]
    };
  }
});

const CertFileStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    // Sanitize filename
    const sanitizedName = file.originalname.replace(/[^\w.-]/g, '');
    const ext = sanitizedName.split('.').pop().toLowerCase();
    
    console.log(`Processing file: ${sanitizedName} (${ext})`);

    return {
      folder: 'TUPath_Cert_Attachments',
      public_id: `${Date.now()}-${sanitizedName}`,
      resource_type: ext === "docx" || ext === "txt" || ext === "pdf" ? "raw" : "auto", // Use 'raw' for non-images
    };
  }
});



const Profilestorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "TUPath_Profile",
    allowed_formats: ["jpg", "png", "jpeg"],
    transformation: [{ width: 500, height: 500, crop: "limit" }],
  },
});

          //MULTER
const uploadProjectFiles = multer({ 
  storage: ProjectStorage,
  limits: { fileSize: 15 * 1024 * 1024 } // 15MB limit
});

const uploadRatingSlip = multer({ 
  storage: RatingSlipStorage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});
const uploadImageProfile = multer({ storage: Profilestorage });
const upload = multer({ storage: storage });

// ✅ Multer Setup for Certificates
const uploadThumbnail = multer({ 
  storage: CertThumbStorage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});
const uploadCertFiles = multer({ 
  storage: CertFileStorage,
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      'image/jpeg',
      'image/png',
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // DOCX
      'text/plain'
    ];
    
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type: ${file.mimetype}`), false);
    }
  },
  limits: { fileSize: 15 * 1024 * 1024 } // 15MB limit
});

// Socket.IO events for real-time chat and certificates
io.on("connection", (socket) => {
  // Join a specific conversation room
  socket.on("join_conversation", (conversationId) => {
    socket.join(conversationId);
    console.log(`User joined conversation: ${conversationId}`);
  });

  // Handle sending messages
  socket.on("send_message", async (data) => {
    try {
      const { conversationId, message } = data;
      
      // Broadcast the message to everyone in the conversation except the sender
      socket.to(conversationId).emit("new_message", {
        conversationId,
        message
      });
    } catch (err) {
      console.error("Error handling send_message event:", err);
    }
  });

  // Handle typing indicators
  socket.on("typing", async (data) => {
    try {
      const { conversationId, isTyping } = data;
      const userId = socket.userId || "unknown"; // You may need to set this when user connects
      
      // Broadcast typing status to everyone in the conversation except the typer
      socket.to(conversationId).emit("user_typing", { 
        conversationId, 
        isTyping,
        userId
      });
    } catch (err) {
      console.error("Error handling typing event:", err);
    }
  });

  // Handle when a user disconnects
  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
  });
  
  // ...existing socket.io code if any...
});

const validateAttachment = (url) => {
  const allowedExtensions = /\.(jpg|jpeg|png|pdf|docx|txt)$/i;
  return allowedExtensions.test(url);
};

const StudentCert = new mongoose.Schema({
  StudId: { type: String, required: true },
  StudName: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  Certificate: {
    CertName: { type: String, required: true },
    CertDescription: { type: String, required: true },
    CertThumbnail: { type: String, default: "" },
    Attachments: [
      {
        type: String,
        validate: {
          validator: validateAttachment,
          message:
            "Attachments must be valid file URLs with extensions jpg, jpeg, png, pdf, docx, or txt.",
        },
      },
    ],
  },
});

const StudentCertificate = mongoose.model("StudentCertificate", StudentCert);

/// Update your uploadCertificate endpoint
app.post("/api/uploadCertificate", verifyToken, async (req, res) => {
  try {
    console.log("Processing certificate upload...");
    
    const { CertName, CertDescription, CertThumbnail, Attachments } = req.body;
    const userId = req.user.id;
    const userName = req.user.name;

    console.log("Received data:", {
      CertName,
      CertDescription,
      CertThumbnail,
      Attachments,
      userId,
      userName
    });

    // Validate inputs
    if (!CertName || !CertDescription) {
      throw new Error("Certificate name and description are required");
    }

    if (!CertThumbnail) {
      throw new Error("Thumbnail URL is required");
    }

    if (!Attachments || !Array.isArray(Attachments) || Attachments.length === 0) {
      throw new Error("At least one attachment is required");
    }

    // Filter valid attachments
    const validAttachments = Attachments.filter(url => 
      url && /\.(jpg|jpeg|png|pdf|docx|txt)$/i.test(url)
    );

    if (validAttachments.length === 0) {
      throw new Error("No valid attachments provided");
    }

    console.log("Creating new certificate document...");
    const newCertificate = new StudentCertificate({
      StudId: userId,
      StudName: userName,
      Certificate: {
        CertName,
        CertDescription,
        CertThumbnail,
        Attachments: validAttachments
      }
    });

    console.log("Saving to database...");
    await newCertificate.save();
    
    console.log("Emission new_certificate event");
    io.emit("new_certificate", newCertificate);

    console.log("Certificate saved successfully");
    res.status(201).json({ 
      success: true, 
      message: "Certificate saved successfully",
      certificate: newCertificate
    });

  } catch (error) {
    console.error("Certificate save error:", {
      message: error.message,
      stack: error.stack,
      requestBody: req.body,
      user: req.user
    });
    
    res.status(500).json({
      success: false,
      message: error.message || "Failed to save certificate",
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});
app.post("/api/uploadThumbnail", verifyToken, uploadThumbnail.single('thumbnail'), async (req, res) => {
  try {
    if (!req.file) {
      console.error("No file received in uploadThumbnail");
      return res.status(400).json({ 
        success: false, 
        message: "No thumbnail file received" 
      });
    }

    console.log("Cloudinary upload result:", req.file);

    if (!req.file.path) {
      throw new Error("Cloudinary upload failed - no URL returned");
    }

    res.status(201).json({ 
      success: true,
      message: "Thumbnail uploaded successfully",
      thumbnailUrl: req.file.path
    });

  } catch (error) {
    console.error("Thumbnail upload error:", {
      message: error.message,
      stack: error.stack,
      file: req.file
    });
    
    res.status(500).json({
      success: false,
      message: "Thumbnail upload failed",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});


// File validation middleware
const validateFileType = (req, res, next) => {
  if (!req.file) return next();
  
  const ext = req.file.originalname.split('.').pop().toLowerCase();
  const allowed = ['jpg', 'jpeg', 'png', 'pdf', 'docx', 'txt'];
  
  if (!allowed.includes(ext)) {
    return res.status(400).json({
      success: false,
      message: `Invalid file type .${ext}. Allowed: ${allowed.join(', ')}`
    });
  }
  next();
};

app.post("/api/uploadAttachments", 
  verifyToken,
  uploadCertFiles.single('attachment'),
  validateFileType,
  async (req, res) => {
    try {
      if (!req.file) throw new Error("No file uploaded");
      
      console.log("Upload successful:", req.file.path);
      res.json({
        success: true,
        url: req.file.path,
        filename: req.file.originalname
      });
      
    } catch (error) {
      console.error("Upload failed:", error.message);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
);

// Endpoint to fetch certificates for a user
app.get("/api/certificates", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const certificates = await StudentCertificate.find({ StudId: userId });
    res.status(200).json({ success: true, certificates });
  } catch (error) {
    console.error("Error fetching certificates:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// Endpoint to delete a certificate
app.delete("/api/certificates/:id", verifyToken, async (req, res) => {
  try {
    const certificateId = req.params.id;
    const userId = req.user.id;

    const certificate = await StudentCertificate.findOneAndDelete({
      _id: certificateId,
      StudId: userId,
    });

    if (!certificate) {
      return res
        .status(404)
        .json({ success: false, message: "Certificate not found" });
    }

    // Emit the delete certificate event
    io.emit("delete_certificate", { certificateId });

    res
      .status(200)
      .json({ success: true, message: "Certificate deleted successfully" });
  } catch (error) {
    console.error("Error deleting certificate:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// Endpoint to fetch profile data for a specific user including projects and certificates
app.get('/api/profile/:id', verifyToken, async (req, res) => {
  const { id } = req.params;
  const requestingUserId = req.user.id;
  const requestingUserRole = req.user.role;

  try {
    const user = await Tupath_usersModel.findById(id).populate({
      path: 'profileDetails.projects',
      select: 'projectName description tags tools thumbnail projectUrl'
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    let certificates = await StudentCertificate.find({ StudId: id });

    // Hide projects and certificates if the requesting user is another student
    if (requestingUserRole === 'student' && requestingUserId.toString() !== id.toString()) {
      user.profileDetails.projects = [];
      certificates = [];
    }

    res.status(200).json({
      success: true,
      profile: {
        ...user.toObject(),
        profileDetails: {
          ...user.profileDetails,
          certificates,
        },
      },
    });
  } catch (err) {
    console.error('Error fetching profile:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});



//---------------------------------------------NEWLY ADDED--------------------------------------------------------

app.post("/api/updateStudentProfile", verifyToken, async (req, res) => {
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
    } = req.body;
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
            contact,
            // email
          },
        },
      },
      { new: true, upsert: true }
    );

    if (!updatedUser) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      updatedUser,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

app.post("/api/updateEmployerProfile", verifyToken, async (req, res) => {
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
      preferredSkills,
    } = req.body;

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
            preferredSkills,
          },
        },
      },
      { new: true, upsert: true }
    );

    if (!updatedUser) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      updatedUser,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
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
app.post(
  "/api/uploadProfileImage",
  verifyToken,
  uploadImageProfile.single("profileImg"),
  async (req, res) => {
    try {
      const userId = req.user.id;

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No file uploaded or Cloudinary failed",
        });
      }

      console.log("Uploaded File:", req.file); // 🛠️ Debugging

      const profileImgUrl = req.file.path; // ✅ Cloudinary should return a URL

      if (!profileImgUrl) {
        return res.status(500).json({
          success: false,
          message: "Cloudinary upload failed, no URL returned",
        });
      }

      // ✅ Select the correct user model based on role
      const userModel =
        req.user.role === "student" ? Tupath_usersModel : Employer_usersModel;

      // ✅ Update user profile
      const updatedUser = await userModel.findByIdAndUpdate(
        userId,
        { $set: { "profileDetails.profileImg": profileImgUrl } },
        { new: true }
      );

      if (!updatedUser) {
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }

    res.status(200).json({
      success: true,
      message: "Profile image uploaded successfully",
      profileImg: profileImgUrl,
    });
  } catch (error) {
    console.error("Error uploading profile image:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});
// Modify API Endpoint to Use Cloudinary
app.post("/api/uploadProject", verifyToken, uploadProjectFiles.fields([
  { name: "thumbnail", maxCount: 1 },
  { name: "selectedFiles", maxCount: 10 },
  { name: "ratingSlip", maxCount: 1 }
]), async (req, res) => {
  try {
    console.log("Received project upload request with data:", req.body);
    
    // Retrieve saved subject & grade from session
    const { subject, grade, ratingSlip, year, term } = req.session.assessmentData || {};

    if (!subject || !grade) {
      console.error("Missing subject or grade in session.");
      return res.status(400).json({ success: false, message: "Missing required fields." });
    }

    // Get file URLs from Cloudinary
    const thumbnail = req.files?.thumbnail?.[0]?.path || null;
    const selectedFiles = req.files?.selectedFiles?.map(file => file.path) || [];
    const ratingSlipPath = req.files?.ratingSlip?.[0]?.path || ratingSlip;

    // Create and save the new project
    const newProject = new Project({
      user: req.user.id,
      projectName: req.body.projectName,
      description: req.body.description,
      tag: req.body.tag,
      tools: req.body.tools,
      projectUrl: req.body.projectUrl,
      roles: req.body.roles,
      subject,
      grade,
      ratingSlip: ratingSlipPath,
      status: "pending",
      thumbnail,
      selectedFiles,
      year,
      term,
    });

    await newProject.save();

    // Update user's projects list
    const userId = req.user?.id || req.body.userId;
    if (!userId) {
      console.error("User ID is missing.");
      return res.status(400).json({ success: false, message: "User ID is required." });
    }

    const user = await Tupath_usersModel.findOneAndUpdate(
      { _id: userId },
      { $addToSet: { "profileDetails.projects": newProject._id } },
      { new: true }
    );

    if (!user) {
      console.error("User not found.");
      return res.status(404).json({ success: false, message: "User not found." });
    }

    // Update best tag dynamically
    await user.calculateBestTag();

    // Clear session after successful save
    delete req.session.assessmentData;

    console.log("Project successfully saved and linked to user:", newProject);
    res.status(201).json({ success: true, project: newProject });
  } catch (error) {
    console.error("Error uploading project:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});


app.get("/api/projects", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // Fetch user with populated projects
    const user = await Tupath_usersModel.findById(userId).populate(
      "profileDetails.projects"
    );

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Add scores and tag summary for each project
    const projectsWithScores = user.profileDetails.projects.map((project) => {
      const totalScore = project.assessment.reduce(
        (sum, question) => sum + (question.weightedScore || 0),
        0
      );

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
        roles: project.roles,
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
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Find the project in the user's profile and remove it
    const projectIndex = user.profileDetails.projects.findIndex(
      (project) => project._id.toString() === projectId
    );
    if (projectIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Project not found in user's profile",
      });
    }

    // Remove the project reference from the user's profile
    user.profileDetails.projects.splice(projectIndex, 1);
    await user.save();

    // Delete the project document from the 'projects' collection
    const deletedProject = await Project.findByIdAndDelete(projectId);
    if (!deletedProject) {
      return res.status(404).json({
        success: false,
        message: "Project not found in projects collection",
      });
    }

    res.status(200).json({
      success: true,
      message:
        "Project deleted successfully from user's profile and projects collection",
    });
  } catch (error) {
    console.error("Error deleting project:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// // Endpoint for uploading certificate photos
// app.post("/api/uploadCertificate", verifyToken, upload.array("certificatePhotos", 3), async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const filePaths = req.files.map(file => `/certificates/${file.filename}`);

//     const updatedUser = await Tupath_usersModel.findByIdAndUpdate(
//       userId,
//       { $push: { "profileDetails.certificatePhotos": { $each: filePaths } } },
//       { new: true }
//     );

//     if (!updatedUser) {
//       return res.status(404).json({ success: false, message: "User not found" });
//     }

//     res.status(200).json({ success: true, message: "Certificate photos uploaded successfully", certificatePhotos: filePaths });
//   } catch (error) {
//     console.error("Error uploading certificate photos:", error);
//     res.status(500).json({ success: false, message: "Internal server error" });
//   }
// });

// -----------------------------------api for dynamic search----------------------------------
app.get("/api/search", verifyToken, async (req, res) => {
  const { query } = req.query;

  if (!query) {
    return res
      .status(400)
      .json({ success: false, message: "Query parameter is required" });
  }

  try {
    const regex = new RegExp(query, "i"); // Case-insensitive regex
    const loggedInUserId = req.user.id; // Assuming verifyToken populates req.user with user details

    // Search students only
    const studentResults = await Tupath_usersModel.find({
      $and: [
        {
          $or: [
            { "profileDetails.firstName": regex },
            { "profileDetails.middleName": regex },
            { "profileDetails.lastName": regex },
            { bestTag: regex }, // Search by `bestTag`
          ],
        },
        { _id: { $ne: loggedInUserId } }, // Exclude the logged-in user
      ],
    }).select(
      "profileDetails.firstName profileDetails.middleName profileDetails.lastName profileDetails.profileImg bestTag"
    );

    res.status(200).json({ success: true, results: studentResults });
  } catch (err) {
    console.error("Error during search:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

app.put(
  "/api/updateProfile",
  verifyToken,
  upload.single("profileImg"),
  async (req, res) => {
    try {
      const userId = req.user.id;
      const { role } = req.user;
      const userModel =
        role === "student" ? Tupath_usersModel : Employer_usersModel;

      const profileData = req.body;

      // Find existing user
      const existingUser = await userModel.findById(userId);
      if (!existingUser) {
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }

      // 🔥 **Delete old profile image from Cloudinary before uploading a new one**
      if (existingUser.profileDetails.profileImg) {
        const oldImageUrl = existingUser.profileDetails.profileImg;
        const publicId = oldImageUrl.split("/").pop().split(".")[0]; // Extract publicId
        await cloudinary.uploader.destroy(publicId);
      }

      // Handle file upload (if any)
      if (req.file) {
        const uploadedImage = await cloudinary.uploader.upload(req.file.path);
        profileData.profileImg = uploadedImage.secure_url; // Store the Cloudinary URL
      }

      // Preserve existing projects and update profile
      const updatedProfile = {
        ...existingUser.profileDetails,
        ...profileData,
        projects: existingUser.profileDetails.projects || [],
      };

      // Update user profile
      const updatedUser = await userModel.findByIdAndUpdate(
        userId,
        { $set: { profileDetails: updatedProfile } },
        { new: true }
      );

      // 🔥 **Update all posts where userId matches the updated user**
      if (profileData.profileImg) {
        await Post.updateMany(
          { userId },
          { $set: { profileImg: profileData.profileImg } }
        );

        // 🔥 **Update all comments where userId matches**
        await Post.updateMany(
          { "comments.userId": userId },
          { $set: { "comments.$[elem].profileImg": profileData.profileImg } },
          { arrayFilters: [{ "elem.userId": userId }] }
        );

        // Commented out Message updates since the Message model isn't defined
        // If you need this functionality, import the Message model at the top of the file
        /*
        // 🔥 **Update profile image in messages where user is the sender**
        await Message.updateMany(
          { "sender.senderId": userId },
          { $set: { "sender.profileImg": profileData.profileImg } }
        );

        // 🔥 **Update profile image in messages where user is the receiver**
        await Message.updateMany(
          { "receiver.receiverId": userId },
          { $set: { "receiver.profileImg": profileData.profileImg } }
        );
        */
      }

      res.status(200).json({
        success: true,
        message: "Profile updated successfully",
        updatedUser,
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  }
);

//----------------------------------------------------DECEMBER 13
// Step 1: Add a reset token field to the user schemas

// Step 2: Endpoint to request password reset
app.post("/api/forgot-password", async (req, res) => {
  const { email } = req.body;
  try {
    const user =
      (await Tupath_usersModel.findOne({ email })) ||
      Employer_usersModel.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Generate a reset token
    const resetToken = crypto.randomBytes(20).toString("hex");
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // Token valid for 1 hour
    await user.save();

    // Send email with environment variables
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS,
      },
    });

    const resetLink = `${CLIENT_URL}/reset-password/${resetToken}`;
    const mailOptions = {
      to: user.email,
      from: "no-reply@yourdomain.com",
      subject: "Password Reset Request",
      text: `You are receiving this because you (or someone else) requested the reset of your account's password.\n\nPlease click on the following link, or paste it into your browser to complete the process within one hour of receiving it:\n\n${resetLink}\n\nIf you did not request this, please ignore this email and your password will remain unchanged.`,
    };

    await transporter.sendMail(mailOptions);
    res
      .status(200)
      .json({ success: true, message: "Reset link sent to email" });
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
    const user =
      (await Tupath_usersModel.findOne({
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: Date.now() },
      })) ||
      Employer_usersModel.findOne({
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: Date.now() },
      });

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid or expired token" });
    }

    // Update password and clear reset token
    user.password = await bcrypt.hash(newPassword, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res
      .status(200)
      .json({ success: true, message: "Password reset successful" });
  } catch (error) {
    console.error("Error in reset password endpoint:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

//for pushing purposes, please delete this comment later

//===============================================FOR ASSESSMENT QUESTIONS

// Add authentication check endpoint
app.get("/check-auth", async (req, res) => {
  try {
    const token = req.cookies.adminToken; // Assuming you're using cookies for admin auth
    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: "No token found" });
    }

    const verified = jwt.verify(token, JWT_SECRET);
    if (!verified) {
      return res.status(401).json({ success: false, message: "Invalid token" });
    }

    res.json({ success: true });
  } catch (error) {
    res.status(401).json({ success: false, message: "Authentication failed" });
  }
});

// Update logout endpoint to clear cookie
app.post("/api/admin/logout", (req, res) => {
  res.clearCookie("adminToken");
  res.json({ success: true, message: "Logged out successfully" });
});

// NEW API- HIWALAY KO LANG KASI BABAKLASIN KO TO

app.post("/api/saveAssessment", verifyToken, uploadRatingSlip.single("ratingSlip"), async (req, res) => {
  try {
    const { subject, grade, year, term } = req.body;
    if (!subject || !grade || !year || !term) {
      return res.status(400).json({
        success: false,
        message: "Subject, grade, year level, and term are required."
      });
    }

    const ratingSlipPath = req.file ? req.file.path : null;

    req.session.assessmentData = { 
      subject, 
      grade, 
      ratingSlip: ratingSlipPath, 
      year, 
      term 
    };

    console.log("Saved assessment data in session:", req.session.assessmentData);
    res.status(200).json({ success: true, message: "Assessment saved successfully." });
  } catch (error) {
    console.error("Error saving assessment:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});


app.get("/api/topStudentsByTag", async (req, res) => {
  try {
    const topStudents = await Tupath_usersModel.find({
      bestTag: { $exists: true },
    })
      .sort({ bestTagScores: -1 })
      .limit(10); // Get top 10 students

    res.status(200).json(topStudents);
  } catch (error) {
    console.error("Error fetching top students:", error);
    res.status(500).json({ message: "Server error", error });
  }
});

app.get("/api/getSubjectByTag", async (req, res) => {
  try {
    const { tag } = req.query;

    // Find the mapping document by tag
    const mapping = await SubjectTagMapping.findOne({ tag });

    if (!mapping || !mapping.subjects || mapping.subjects.length === 0) {
      return res.json({
        success: false,
        message: "No subjects found for this tag.",
      });
    }

    // Return subjects as an array of objects
    res.json({ success: true, subjects: mapping.subjects });
  } catch (error) {
    console.error("Error fetching subjects:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// studentcount in clientdashboard
app.get("/api/student-counts", async (req, res) => {
  try {
    const bsitCount = await Tupath_usersModel.countDocuments({
      "profileDetails.department": "Information Technology",
    });
    const bscsCount = await Tupath_usersModel.countDocuments({
      "profileDetails.department": "Computer Science",
    });
    const bsisCount = await Tupath_usersModel.countDocuments({
      "profileDetails.department": "Information System",
    });

    res.json({
      success: true,
      counts: {
        BSIT: bsitCount,
        BSCS: bscsCount,
        BSIS: bsisCount,
      },
    });
  } catch (error) {
    console.error("Error fetching student counts:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});
app.get('/api/grades', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Find all projects for the user
    const projects = await Project.find({ 
      // Assuming projects are linked to users in your schema
      // You may need to adjust this query based on your actual schema
    }).select('subject grade');
    
    // Transform projects into grades format
    const grades = projects.map(project => ({
      code: project.subject,
      description: 'Project submission', // Or get from subject mapping
      grade: project.grade,
      corFile: null // Or include if you have this data
    }));
    
    res.status(200).json({ success: true, grades });
  } catch (error) {
    console.error('Error fetching grades:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update this route in your index.js file
app.get("/api/checkExistingGrade", verifyToken, async (req, res) => {
  try {
    const { subject, year, term } = req.query;
    
    if (!subject || !year || !term) {
      return res.status(400).json({ 
        success: false, 
        message: "Subject, year, and term are required." 
      });
    }

    // Check if grade exists in any of the user's projects
    const existingProject = await Project.findOne({
      user: req.user.id,
      subject,
      year,
      term
    }).select("grade");

    if (existingProject && existingProject.grade) {
      return res.status(200).json({ 
        success: true, 
        grade: existingProject.grade 
      });
    }

    return res.status(200).json({ 
      success: true, 
      grade: null 
    });
  } catch (error) {
    console.error("Error checking existing grade:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error" 
    });
  }
});



// Server setup
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

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
app.use("/cor", express.static("cor"));

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
    folder: "TUPath_Cert_Thumbnails", // Change this to your preferred folder name
    allowed_formats: ["jpg", "png", "jpeg"],
    transformation: [{ width: 500, height: 500, crop: "limit" }],
  },
});

const Projectstorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "TUPath_Proj", // Change this to your preferred folder name
    allowed_formats: ["jpg", "png", "jpeg"],
    transformation: [{ width: 500, height: 500, crop: "limit" }],
  },
});

const CertFileStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "TUPath_Cert_attachments",
    allowed_formats: ["pdf", "docx", "pptx", "jpg", "png"],
    resource_type: "auto", // Allows all file types (images, docs, etc.)
  },
});

const CertThumbStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "TUPath_Cert_Thumbnails",
    allowed_formats: ["jpg", "png", "jpeg"],
    transformation: [{ width: 500, height: 500, crop: "limit" }],
  },
});

const Profilestorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "TUPath_Profile",
    allowed_formats: ["jpg", "png", "jpeg"],
    transformation: [{ width: 500, height: 500, crop: "limit" }],
  },
});

// ✅ Correct Multer Setup
const uploadImageProfile = multer({ storage: Profilestorage });
const upload = multer({ storage: storage });
const UploadImageProjects = multer({ storage: Projectstorage });

// ✅ Multer Setup for Certificates
const uploadThumbnail = multer({ storage: CertThumbStorage });
const uploadCertFiles = multer({ storage: CertFileStorage });

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
  direction: { type: String, enum: ["sent", "received"], required: true }, // Add direction field
});

// Add indexes for optimization
messageSchema.index({ "sender.senderId": 1 });
messageSchema.index({ "receiver.receiverId": 1 });
messageSchema.index({ timestamp: -1 });
messageSchema.index({ "sender.senderId": 1, "receiver.receiverId": 1 });
messageSchema.index({ "receiver.receiverId": 1, "status.read": 1 });

const Message = mongoose.model("Message", messageSchema);

// Add this endpoint to fetch users

app.get("/api/userss", verifyToken, async (req, res) => {
  try {
    const students = await Tupath_usersModel.find().select(
      "profileDetails.firstName profileDetails.lastName profileDetails.profileImg"
    );
    const employers = await Employer_usersModel.find().select(
      "profileDetails.firstName profileDetails.lastName profileDetails.profileImg"
    );
    const users = [...students, ...employers];
    res.status(200).json({ success: true, users });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// REST endpoint to fetch chat messages
app.get("/api/messages", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id; // Extract userId from the token
    const messages = await Message.find({
      $or: [{ "sender.senderId": userId }, { "receiver.receiverId": userId }],
    }).sort({ timestamp: -1 });

    // Transform messages to add correct direction for each user
    const transformedMessages = messages.map((msg) => {
      const isSender = msg.sender.senderId === userId;
      return {
        ...msg.toObject(),
        direction: isSender ? "sent" : "received",
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
    const messages = await Message.find({
      "receiver.receiverId": userId,
      "status.read": false,
    }).sort({ timestamp: 1 });
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
      return res
        .status(404)
        .json({ success: false, message: "Message not found" });
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

        const senderUser =
          (await Tupath_usersModel.findById(userId)) ||
          (await Employer_usersModel.findById(userId));

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
          direction: "sent",
        });
        await message.save();

        // Only emit to the specific receiver
        socket.to(data.receiverId).emit("receive_message", {
          ...message.toObject(),
          direction: "received",
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

app.post("/api/uploadCertificate", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const userName = req.user.name;
    const { CertName, CertDescription, thumbnailUrl, attachmentUrls } =
      req.body;

    if (!CertName || !CertDescription || !thumbnailUrl || !attachmentUrls) {
      return res
        .status(400)
        .json({
          success: false,
          message:
            "All fields are required: CertName, CertDescription, thumbnailUrl, and attachmentUrls",
        });
    }

    // ✅ Save certificate to MongoDB with Cloudinary URLs
    const newCertificate = new StudentCertificate({
      StudId: userId,
      StudName: userName,
      Certificate: {
        CertName,
        CertDescription,
        CertThumbnail: thumbnailUrl,
        Attachments: attachmentUrls,
      },
    });

    await newCertificate.save();

    // Emit the new certificate event
    io.emit("new_certificate", newCertificate);

    res
      .status(201)
      .json({
        success: true,
        message: "Certificate uploaded successfully",
        certificate: newCertificate,
      });
  } catch (error) {
    console.error("Error uploading certificate:", error);
    res
      .status(500)
      .json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
  }
});

app.post(
  "/api/uploadThumbnail",
  verifyToken,
  uploadThumbnail.single("thumbnail"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res
          .status(400)
          .json({ success: false, message: "Thumbnail file is required." });
      }

      const thumbnailUrl = req.file.secure_url;

      // Return the thumbnail URL to be saved with the certificate
      res
        .status(201)
        .json({
          success: true,
          message: "Thumbnail uploaded successfully",
          thumbnailUrl,
        });
    } catch (error) {
      console.error("Error uploading thumbnail:", error);
      res
        .status(500)
        .json({
          success: false,
          message: "Internal server error",
          error: error.message,
        });
    }
  }
);

app.post(
  "/api/uploadAttachments",
  verifyToken,
  uploadCertFiles.array("attachments", 10),
  async (req, res) => {
    try {
      if (!req.files || req.files.length === 0) {
        return res
          .status(400)
          .json({
            success: false,
            message: "At least one attachment is required.",
          });
      }

      const attachmentUrls = req.files.map((file) => file.secure_url);

      // Return the attachment URLs to be saved with the certificate
      res
        .status(201)
        .json({
          success: true,
          message: "Attachments uploaded successfully",
          attachmentUrls,
        });
    } catch (error) {
      console.error("Error uploading attachments:", error);
      res
        .status(500)
        .json({
          success: false,
          message: "Internal server error",
          error: error.message,
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
app.get("/api/profile/:id", verifyToken, async (req, res) => {
  const { id } = req.params;
  const requestingUserId = req.user.id;
  const requestingUserRole = req.user.role;

  try {
    const user = await Tupath_usersModel.findById(id).populate({
      path: "profileDetails.projects",
      select: "projectName description tags tools thumbnail projectUrl",
    });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    let certificates = await StudentCertificate.find({ StudId: id });

    // Hide projects and certificates if the requesting user is another student
    if (
      requestingUserRole === "student" &&
      requestingUserId.toString() !== id.toString()
    ) {
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
    console.error("Error fetching profile:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
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

    res
      .status(200)
      .json({
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

    res
      .status(200)
      .json({
        success: true,
        message: "Profile updated successfully",
        updatedUser,
      });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// Profile fetching endpoint
app.get("/api/profile", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const role = req.user.role; // Extract role from the token

    const userModel =
      role === "student" ? Tupath_usersModel : Employer_usersModel;
    const user = await userModel
      .findById(userId)
      .select("email role profileDetails createdAt googleSignup")
      .populate({
        path: "profileDetails.projects",
        select: "projectName description tags tools thumbnail projectUrl",
        strictPopulate: false, // Allow flexible population
      });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, profile: "User not Found" });
    }

    // Fetch certificates for the user
    const certificates = await StudentCertificate.find({ StudId: userId });

    // Return profile details tailored to the role
    const profile = {
      email: user.email,
      role: user.role,
      profileDetails:
        user.role === "student"
          ? {
              ...user.profileDetails,
              certificates, // Include certificates in the profile details
            }
          : {
              ...user.profileDetails,
              companyName: user.profileDetails.companyName || null,
              industry: user.profileDetails.industry || null,
              aboutCompany: user.profileDetails.aboutCompany || null,
              preferredRoles: user.profileDetails.preferredRoles || [],
              internshipOpportunities:
                user.profileDetails.internshipOpportunities || false,
            },
      createdAt: user.createdAt,
      googleSignup: user.googleSignup,
    };

    res.status(200).json({ success: true, profile });
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
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
        return res
          .status(400)
          .json({
            success: false,
            message: "No file uploaded or Cloudinary failed",
          });
      }

      console.log("Uploaded File:", req.file); // 🛠️ Debugging

      const profileImgUrl = req.file.path; // ✅ Cloudinary should return a URL

      if (!profileImgUrl) {
        return res
          .status(500)
          .json({
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
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  }
);

// Modify API Endpoint to Use Cloudinary
app.post(
  "/api/uploadProject",
  verifyToken,
  UploadImageProjects.fields([
    { name: "thumbnail", maxCount: 1 },
    { name: "selectedFiles", maxCount: 10 },
    { name: "ratingSlip", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      console.log("Received project upload request with data:", req.body);

      // Retrieve saved subject & grade from session
      const { subject, grade, ratingSlip } = req.session.assessmentData || {};

      if (!subject || !grade) {
        return res
          .status(400)
          .json({ success: false, message: "Missing required fields." });
      }

      // Get Cloudinary URL instead of local file path
      const thumbnail = req.files["thumbnail"]
        ? req.files["thumbnail"][0].path
        : null;
      const selectedFiles = req.files["selectedFiles"]
        ? req.files["selectedFiles"].map((file) => file.path)
        : [];
      const ratingSlipPath = req.files["ratingSlip"]
        ? req.files["ratingSlip"][0].path
        : ratingSlip;

      const newProject = new Project({
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

      const userId = req.user?.id || req.body.userId;
      if (!userId)
        return res
          .status(400)
          .json({ success: false, message: "User ID is required." });

      const user = await Tupath_usersModel.findOneAndUpdate(
        { _id: userId },
        { $addToSet: { "profileDetails.projects": newProject._id } },
        { new: true }
      );

      if (!user)
        return res
          .status(404)
          .json({ success: false, message: "User not found." });

      await user.calculateBestTag();
      delete req.session.assessmentData;

      console.log("Project successfully saved and linked to user:", newProject);
      res.status(201).json({ success: true, project: newProject });
    } catch (error) {
      console.error("Error uploading project:", error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  }
);

/* //BACKUP LATEST API

  app.post("/api/uploadProject", verifyToken, upload.fields([
    { name: "thumbnail", maxCount: 1 },
    { name: "selectedFiles", maxCount: 10 },
    { name: "ratingSlip", maxCount: 1 }
  ]), async (req, res) => {
    try {
      console.log("Received project upload request with data:", req.body);
      console.log("Session before accessing assessmentData:", req.session);
  
      // Retrieve saved subject & grade from session
      const { subject, grade, ratingSlip } = req.session.assessmentData || {};
  
      console.log("Extracted assessment data from session:", { subject, grade, ratingSlip });
  
      if (!subject || !grade) {
        console.error("Missing subject or grade in session.");
        return res.status(400).json({ success: false, message: "Missing required fields." });
      }
  
      const thumbnail = req.files?.["thumbnail"]?.[0]?.filename ? `/uploads/${req.files["thumbnail"][0].filename}` : null;
      const selectedFiles = req.files?.["selectedFiles"] ? req.files["selectedFiles"].map(file => file.path) : [];
      const ratingSlipPath = req.files?.["ratingSlip"]?.[0]?.filename
      ? `/uploads/${req.files["ratingSlip"][0].filename}`
      : ratingSlip;
  
      const newProject = new Project({
        projectName: req.body.projectName,
        description: req.body.description,
        tag: req.body.tag,
        tools: req.body.tools,
        projectUrl: req.body.projectUrl,
        roles: req.body.roles,
        subject,
        grade,
        ratingSlip: ratingSlipPath, // <-- Save ratingSlip instead of corFile
        status: "pending",
        thumbnail,
        selectedFiles
      });
  
      await newProject.save();
  
      // Clear session after successful save
      delete req.session.assessmentData;
  
      console.log("Project successfully saved:", newProject);
  
      res.status(201).json({ success: true, project: newProject });
    } catch (error) {
      console.error("Error saving project:", error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  });
  
*/

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
      return res
        .status(404)
        .json({
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
      return res
        .status(404)
        .json({
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
      }

      res
        .status(200)
        .json({
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

app.post(
  "/api/saveAssessment",
  verifyToken,
  upload.single("ratingSlip"),
  async (req, res) => {
    try {
      const { subject, grade, year, term } = req.body;
      if (!subject || !grade || !year || !term) {
        return res
          .status(400)
          .json({
            success: false,
            message: "Subject, grade, year level, and term are required.",
          });
      }

      const ratingSlipPath = req.file ? `/uploads/${req.file.filename}` : null;

      req.session.assessmentData = {
        subject,
        grade,
        ratingSlip: ratingSlipPath,
        year,
        term,
      };

      // Debugging: Log the stored session data
      console.log(
        "Saved assessment data in session:",
        req.session.assessmentData
      );

      res
        .status(200)
        .json({ success: true, message: "Assessment saved successfully." });
    } catch (error) {
      console.error("Error saving assessment:", error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  }
);

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

// Server setup
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

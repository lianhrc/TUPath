const mongoose = require("mongoose");

// Schema for TUPATH students
const TupathUserSchema = new mongoose.Schema({
  /*name: {
    type: String,
    required: true,
  },*/
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  isNewUser: {
    type: Boolean,
    default: true, // Set to true for new users
  },
  googleSignup: {
    type: Boolean,
    default: false, // Track if signed up via Google
  },
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  role: { type: String, default: 'student' },
  profileDetails: {
    firstName: String,
    lastName: String,
    middleName: String,
    studentId: String,
    department: String,
    yearLevel: String,
    gender: String,
    address: String,
    contact: String,
    profileImg: String, // Add this line to store the image URL
    certificatePhotos: [String], // New field for storing certificate image paths
    techSkills: [String],
    softSkills: [String],
    // email: String,
    dob: Date,
    projects: [{ // New field for storing project details
      projectName: String,
      description: String,
      tags: [String], // Array to store multiple tags
      tools: [String], // Array to store tools used
      files: [String], // Array of project file paths
      thumbnail: String, // Add this line to store the thumbnail URL or path
      projectUrl: String,
    }],
  },
  memberSince: {
    type: Date,
    default: Date.now, // Defaults to current date when a user is created
  }
}, { timestamps: true }); // This will add createdAt and updatedAt automatically

// Schema for TUPATH employers
const EmployerUserSchema = new mongoose.Schema({
  /*name: {
    type: String,
    required: true,
  },*/
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  isNewUser: {
    type: Boolean,
    default: true, // Set to true for new users
  },
  googleSignup: {
    type: Boolean,
    default: false, // Track if signed up via Google
  },
  isEmployer: {
    type: Boolean,
    default: true,
  },
  role: { type: String, default: 'employer' },
  profileDetails: {
    firstName: String,
    lastName: String,
    middleName: String,
    dob: Date,
    gender: String,
    nationality: String,
    address: String,
    companyName: String,
    position: String,
    industry: String,
    location: String,
    aboutCompany: String,
    contactPersonName: String,
    // email: String,
    phoneNumber: String,
    profileImg: String, // Add this line for the employer profile image
    preferredRoles: { type: [String], default: [] }, // Always an array
    internshipOpportunities: { type: Boolean, default: false },
    preferredSkills: { type: [String], default: [] }, // Always an array
  },
  memberSince: {
    type: Date,
    default: Date.now, // Defaults to current date when an employer user is created
  }
}, { timestamps: true }); // Automatically adds createdAt and updatedAt

// Models
const Tupath_usersModel = mongoose.model("Student_users", TupathUserSchema);
const Employer_usersModel = mongoose.model("Employer_users", EmployerUserSchema);

module.exports = {
  Tupath_usersModel,
  Employer_usersModel,
};

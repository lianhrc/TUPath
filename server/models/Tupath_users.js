// models/Tupath_users.js
const mongoose = require("mongoose");

// Schema for TUPATH students
const TupathUserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
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
  profileDetails: { // New section for profile details
    firstName: String,
    lastName: String,
    middleName: String,
    studentId: String,
    department: String,
    yearLevel: String,
    contact: String,
    profileImg: String, // Add this line to store the image URL
    projectFiles: [String], // New field for storing project file paths
    certificatePhotos: [String], // New field for storing certificate image paths
    dob: Date,
    gender: String,
    techSkills: [String],
    softSkills: [String],
    address: String,
    email: String,

  }
});

// Schema for TUPATH experts
const ExpertUserSchema = new mongoose.Schema({
  name: {
    type: String, 
    required: true,
  },
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
  }

});

// Models
const Tupath_usersModel = mongoose.model("Tupath_users", TupathUserSchema);
const Expert_usersModel = mongoose.model("Expert_users", ExpertUserSchema);

module.exports = {
  Tupath_usersModel,
  Expert_usersModel,
};

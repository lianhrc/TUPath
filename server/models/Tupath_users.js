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
    gender: String,
    address: String,
    contact: String,
    profileImg: String, // Add this line to store the image URL
    projectFiles: [String], // New field for storing project file paths
    certificatePhotos: [String], // New field for storing certificate image paths
    techSkills: [String],
    softSkills: [String],
    email: String,
    dob: Date,

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
  },
  profileDetails:{
    firstName: String,
    lastName: String ,
    middleName: String ,
    dob: Date,
    gender: String,
    nationality: String,
    address: String,
    companyName: String,
    industry: String,
    location: String,
    aboutCompany: String,
    contactPersonName: String,
    position: String,
    email: String,
    phoneNumber: String,
    preferredRoles: [String],
    internshipOpportunities: {type: Boolean, default: false},
    preferredSkills: {String},
  }

});

// Models
const Tupath_usersModel = mongoose.model("Tupath_users", TupathUserSchema);
const Expert_usersModel = mongoose.model("Expert_users", ExpertUserSchema);

module.exports = {
  Tupath_usersModel,
  Expert_usersModel,
};

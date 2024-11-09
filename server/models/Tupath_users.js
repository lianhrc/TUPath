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
    fullName: String,
    studentId: String,
    department: String,
    yearLevel: String,
    bio: String,
    city: String,
    contact: String,
    profileImg: String, // Add this line to store the image URL
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

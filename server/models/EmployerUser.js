const mongoose = require("mongoose");

const EmployerUserSchema = new mongoose.Schema({
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
    default: true,
  },
  googleSignup: {
    type: Boolean,
    default: false,
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
    phoneNumber: String,
    profileImg: String,
    preferredRoles: { type: [String], default: [] },
    internshipOpportunities: { type: Boolean, default: false },
    preferredSkills: { type: [String], default: [] },
  },
  memberSince: {
    type: Date,
    default: Date.now,
  }
}, { timestamps: true });

const Employer_usersModel = mongoose.model("Employer_users", EmployerUserSchema);

module.exports = Employer_usersModel;

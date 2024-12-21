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
    email: String,
    dob: Date,
    projects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Project' }], 
    
  },
  memberSince: {
    type: Date,
    default: Date.now, // Defaults to current date when a user is created
  }
}, { timestamps: true }); // This will add createdAt and updatedAt automatically


const projectSchema = new mongoose.Schema({
  projectName: { type: String, required: true },
  description: { type: String, required: true },
  selectedFiles: [{ type: String }], // Array of file paths or URLs
  tags: [{ type: String }],
  tools: [{ type: String }],
  thumbnail: { type: String }, // Thumbnail URL or path
  projectUrl: String, // Optional project link
  status: { type: String, default: 'pending' }, // Status field, default is 'pending'
  createdAt: { type: Date, default: Date.now }, // Automatically set creation date
  assessment: [ // New field for assessment questions and ratings
    {
      question: { type: String, required: true },
      rating: { type: Number, required: true, min: 1, max: 5 },
    },
  ],
});



// Schema for TUPATH employers
const EmployerUserSchema = new mongoose.Schema({
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
    industry: String,
    location: String,
    aboutCompany: String,
    contactPersonName: String,
    position: String,
    email: String,
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

const AssessmentQuestionSchema = new mongoose.Schema({
  text: { type: String, required: true }, // The question text
  type: { type: String, enum: ['rating', 'indicator'], required: true }, // Specifies the input type
  scale: {
      min: { type: Number, default: 1 }, // Minimum value of the scale
      max: { type: Number, default: 5 }, // Maximum value of the scale
      step: { type: Number, default: 1 } // Step size for ratings (e.g., 1, 0.5)
  },
  required: { type: Boolean, default: true }, // Is the question mandatory?
  category: { type: String, required: false }, // Optional grouping for questions
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});






// Models
const Tupath_usersModel = mongoose.model("Student_users", TupathUserSchema);
const Employer_usersModel = mongoose.model("Employer_users", EmployerUserSchema);
const Project = mongoose.model('Project', projectSchema);
const AssessmentQuestion = mongoose.model('AssessmentQuestion', AssessmentQuestionSchema);



module.exports = {
  Tupath_usersModel,
  Employer_usersModel,
  Project,
  AssessmentQuestion,
};

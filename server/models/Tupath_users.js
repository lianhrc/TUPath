const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

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
    corDocuments: [String],  // Store COR file paths
    ratingSlips: [String],   // Store Rating Slip file paths
    // email: String,
    dob: Date,
    projects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Project' }], 
    
  },
  bestTag: { type: String }, // New field to store the tag the student excels in
  bestTagScores: {
    type: Map, // A map of tags to scores
    of: Number,
    default: {},
  },
  memberSince: {
    type: Date,
    default: Date.now, // Defaults to current date when a user is created
  }
}, { timestamps: true }); // This will add createdAt and updatedAt automatically

TupathUserSchema.methods.calculateBestTag = async function () {
  try {
    const user = this;

    // Fetch all projects associated with the user
    const projects = await mongoose.model('Project').find({
      _id: { $in: user.profileDetails.projects },
    });

    // Aggregate cumulative scores by tag
    const tagScores = projects.reduce((acc, project) => {
      if (project.tag && project.assessment.length > 0) {
        const weightedScore = project.assessment.reduce(
          (sum, a) => sum + (a.weightedScore || a.rating * 10), // Use weightedScore if available, else calculate
          0
        );

        acc[project.tag] = (acc[project.tag] || 0) + weightedScore; // Accumulate scores
      }
      return acc;
    }, {});

    // Update the bestTagScores map
    user.bestTagScores = tagScores;

    // Determine the tag with the highest cumulative score
    let bestTag = null;
    let highestScore = 0;

    for (const [tag, score] of Object.entries(tagScores)) {
      if (score > highestScore) {
        bestTag = tag;
        highestScore = score;
      }
    }

    // Update the user's bestTag field
    user.bestTag = bestTag;

    // Save the updated user document
    await user.save();
  } catch (error) {
    console.error("Error calculating best tag:", error);
    throw error;
  }
};





const projectSchema = new mongoose.Schema({
  projectName: { type: String, required: true },
  description: { type: String, required: true },
  selectedFiles: [{ type: String }],
  tag: { type: String, required: true },
  tools: [{ type: String }],
  roles: [{ type: String }],
  thumbnail: { type: String },
  projectUrl: String,
  subject: { type: String, required: true }, // New field for subject
  grade: { type: String, required: true },   // New field for grade
  createdAt: { type: Date, default: Date.now },
  ratingSlip: String, // <-- Changed from corFile to ratingSlip
});




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






//----------------------------------------ADMIN SIDE---------------------------------------

// Define the Admin schema
const AdminSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Hash password before saving to the database
AdminSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
AdminSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};




// Models
const Tupath_usersModel = mongoose.model("Student_users", TupathUserSchema);
const Employer_usersModel = mongoose.model("Employer_users", EmployerUserSchema);
const Project = mongoose.model('Project', projectSchema);
const Admin = mongoose.model('Admin', AdminSchema);



module.exports = {
  Tupath_usersModel,
  Employer_usersModel,
  Project,
  Admin,
};
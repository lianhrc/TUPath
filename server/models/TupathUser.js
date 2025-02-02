const mongoose = require("mongoose");

const TupathUserSchema = new mongoose.Schema({
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
    profileImg: String,
    certificatePhotos: [String],
    techSkills: [String],
    softSkills: [String],
    dob: Date,
    projects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Project' }],
  },
  bestTag: { type: String },
  bestTagScores: {
    type: Map,
    of: Number,
    default: {},
  },
  memberSince: {
    type: Date,
    default: Date.now,
  }
}, { timestamps: true });

TupathUserSchema.methods.calculateBestTag = async function () {
  try {
    const user = this;

    const projects = await mongoose.model('Project').find({
      _id: { $in: user.profileDetails.projects },
    });

    const tagScores = projects.reduce((acc, project) => {
      if (project.tag && project.assessment.length > 0) {
        const weightedScore = project.assessment.reduce(
          (sum, a) => sum + (a.weightedScore || a.rating * 10),
          0
        );

        acc[project.tag] = (acc[project.tag] || 0) + weightedScore;
      }
      return acc;
    }, {});

    user.bestTagScores = tagScores;

    let bestTag = null;
    let highestScore = 0;

    for (const [tag, score] of Object.entries(tagScores)) {
      if (score > highestScore) {
        bestTag = tag;
        highestScore = score;
      }
    }

    user.bestTag = bestTag;

    await user.save();
  } catch (error) {
    console.error("Error calculating best tag:", error);
    throw error;
  }
};

module.exports = mongoose.model("Student_users", TupathUserSchema);

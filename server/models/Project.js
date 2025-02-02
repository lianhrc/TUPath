const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema({
  projectName: { type: String, required: true },
  description: { type: String, required: true },
  selectedFiles: [{ type: String }], // Array of file paths or URLs
  tag: { type: String, required: true }, // Updated to accept only one tag
  tools: [{ type: String }],
  roles: [{ type: String }],
  thumbnail: { type: String }, // Thumbnail URL or path
  projectUrl: String, // Optional project link
  createdAt: { type: Date, default: Date.now }, // Automatically set creation date
  assessment: [
    {
      question: {
        text: { type: String, required: true },
        scoring: { type: Map, of: Number, required: true },
      },
      rating: { type: Number, required: true, min: 1, max: 5 },
      weightedScore: { type: Number, default: 0 },
    },
  ],
});

const Project = mongoose.model('Project', projectSchema);

module.exports = Project;

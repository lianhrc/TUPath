const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  projectName: { type: String, required: true },
  description: { type: String, required: true },
  selectedFiles: [{ type: String }], // Array of file paths or URLs
  tags: [{ type: String }],
  tools: [{ type: String }],
  thumbnail: { type: String }, // Add this line to store the thumbnail URL or path
});

const Project = mongoose.model('Project', projectSchema);

module.exports = Project;

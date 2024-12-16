const mongoose = require('mongoose');

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
});

const Project = mongoose.model('Project', projectSchema);

module.exports = Project;

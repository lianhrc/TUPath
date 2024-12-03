const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  projectName: { type: String, required: true },
  description: { type: String, required: true },
  selectedFiles: [{ type: String }], // Assuming it's an array of file paths or URLs
  tags: [{ type: String }],
  tools: [{ type: String }],
});

const Project = mongoose.model('Project', projectSchema);

module.exports = Project;

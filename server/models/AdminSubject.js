const mongoose = require('mongoose');

const adminSubjectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  code: { type: String, required: true },
});

module.exports = mongoose.model('AdminSubject', adminSubjectSchema);
const mongoose = require("mongoose");

const AssessmentQuestionSchema = new mongoose.Schema({
  text: { type: String, required: true },
  type: { type: String, enum: ['rating', 'indicator'], required: true },
  scale: {
    min: { type: Number, default: 1 },
    max: { type: Number, default: 5 },
    step: { type: Number, default: 1 },
  },
  required: { type: Boolean, default: true },
  category: { type: String, required: true },
  categoryName: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  scoring: {
    type: Map,
    of: Number,
    required: true,
  },
});

const AssessmentQuestion = mongoose.model("AssessmentQuestion", AssessmentQuestionSchema);

module.exports = AssessmentQuestion;

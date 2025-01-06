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

const Questions = [
  // React
  {
    text: "How would you rate your proficiency with React's component lifecycle methods?",
    type: "rating",
    scale: { min: 1, max: 5, step: 1 },
    required: true,
    category: "tool",
    categoryName: "React",
    scoring: { "1": 2, "2": 6, "3": 12, "4": 18, "5": 25 },
  },
  {
    text: "How comfortable are you with implementing state management libraries like Redux or Zustand in React projects?",
    type: "rating",
    scale: { min: 1, max: 5, step: 1 },
    required: true,
    category: "tool",
    categoryName: "React",
    scoring: { "1": 1, "2": 5, "3": 10, "4": 15, "5": 20 },
  },
  {
    text: "How well do you understand and utilize React Hooks (e.g., useState, useEffect, useMemo)?",
    type: "rating",
    scale: { min: 1, max: 5, step: 1 },
    required: true,
    category: "tool",
    categoryName: "React",
    scoring: { "1": 2, "2": 6, "3": 10, "4": 14, "5": 18 },
  },

  // Node.js
  {
    text: "How proficient are you in building RESTful APIs with Node.js?",
    type: "rating",
    scale: { min: 1, max: 5, step: 1 },
    required: true,
    category: "tool",
    categoryName: "Node.js",
    scoring: { "1": 3, "2": 7, "3": 12, "4": 18, "5": 24 },
  },
  {
    text: "How comfortable are you with asynchronous programming and handling promises in Node.js?",
    type: "rating",
    scale: { min: 1, max: 5, step: 1 },
    required: true,
    category: "tool",
    categoryName: "Node.js",
    scoring: { "1": 2, "2": 5, "3": 9, "4": 14, "5": 20 },
  },

  // Laravel
  {
    text: "How comfortable are you with designing and managing Laravel migrations and Eloquent ORM?",
    type: "rating",
    scale: { min: 1, max: 5, step: 1 },
    required: true,
    category: "tool",
    categoryName: "Laravel",
    scoring: { "1": 3, "2": 7, "3": 11, "4": 16, "5": 22 },
  },
  {
    text: "How proficient are you in implementing Laravel features like middleware, queues, and event broadcasting?",
    type: "rating",
    scale: { min: 1, max: 5, step: 1 },
    required: true,
    category: "tool",
    categoryName: "Laravel",
    scoring: { "1": 4, "2": 8, "3": 12, "4": 18, "5": 25 },
  },

  // PHP
  {
    text: "How proficient are you in writing clean, maintainable, and object-oriented PHP code?",
    type: "rating",
    scale: { min: 1, max: 5, step: 1 },
    required: true,
    category: "tool",
    categoryName: "PHP",
    scoring: { "1": 2, "2": 6, "3": 10, "4": 15, "5": 20 },
  },
  {
    text: "How comfortable are you with debugging and troubleshooting PHP applications?",
    type: "rating",
    scale: { min: 1, max: 5, step: 1 },
    required: true,
    category: "tool",
    categoryName: "PHP",
    scoring: { "1": 3, "2": 7, "3": 12, "4": 17, "5": 23 },
  },

  // Web Development
  {
    text: "How proficient are you in building responsive and mobile-first web applications?",
    type: "rating",
    scale: { min: 1, max: 5, step: 1 },
    required: true,
    category: "tag",
    categoryName: "Web Development",
    scoring: { "1": 3, "2": 7, "3": 12, "4": 17, "5": 23 },
  },
  {
    text: "How comfortable are you with implementing SEO best practices in web development?",
    type: "rating",
    scale: { min: 1, max: 5, step: 1 },
    required: true,
    category: "tag",
    categoryName: "Web Development",
    scoring: { "1": 2, "2": 5, "3": 9, "4": 14, "5": 20 },
  },

  // Software Development and Applications
  {
    text: "How comfortable are you with the complete software development lifecycle, from planning to deployment?",
    type: "rating",
    scale: { min: 1, max: 5, step: 1 },
    required: true,
    category: "tag",
    categoryName: "Software Development and Applications",
    scoring: { "1": 4, "2": 8, "3": 13, "4": 19, "5": 25 },
  },
  {
    text: "How well do you understand and apply object-oriented programming principles in your projects?",
    type: "rating",
    scale: { min: 1, max: 5, step: 1 },
    required: true,
    category: "tag",
    categoryName: "Software Development and Applications",
    scoring: { "1": 3, "2": 7, "3": 11, "4": 16, "5": 22 },
  }, 
]; 

const insertQuestions = async () => {
  try {
    await mongoose.connect("mongodb+srv://ali123:ali123@cluster0.wfrb9.mongodb.net/tupath_users?retryWrites=true&w=majority", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("Connected to MongoDB");

    const result = await AssessmentQuestion.insertMany(Questions);
    console.log("Questions inserted:", result);

    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  } catch (error) {
    console.error("Error inserting questions:", error);
  }
};

insertQuestions();

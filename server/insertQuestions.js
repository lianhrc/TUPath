const mongoose = require("mongoose");
const { AssessmentQuestion } = require("./models/Tupath_users"); // Adjust the path to your models file



// Temporary questions for tools and tags
const tempQuestions = [
  {
    text: "How well does this project demonstrate the use of Machine Learning?",
    type: "rating",
    scale: { min: 1, max: 5, step: 1 },
    required: true,
    category: "tag",
    categoryName: "Machine Learning",
    scoring: { "1": 5, "2": 10, "3": 15, "4": 20, "5": 25 },
  },
  {
    text: "How effectively was React used in this project?",
    type: "rating",
    scale: { min: 1, max: 5, step: 1 },
    required: true,
    category: "tool",
    categoryName: "React",
    scoring: { "1": 3, "2": 6, "3": 9, "4": 12, "5": 15 },
  },
  {
    text: "How well does this project integrate cybersecurity best practices?",
    type: "rating",
    scale: { min: 1, max: 5, step: 1 },
    required: true,
    category: "tag",
    categoryName: "Cybersecurity",
    scoring: { "1": 4, "2": 8, "3": 12, "4": 16, "5": 20 },
  },
  {
    text: "How proficiently was MongoDB utilized in this project?",
    type: "rating",
    scale: { min: 1, max: 5, step: 1 },
    required: true,
    category: "tool",
    categoryName: "MongoDB",
    scoring: { "1": 2, "2": 4, "3": 6, "4": 8, "5": 10 },
  },
];

const insertTemporaryQuestions = async () => {
  try {
    await mongoose.connect("mongodb+srv://henry:admin@cluster0.wfrb9.mongodb.net/tupath_users?retryWrites=true&w=majority", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("Connected to MongoDB");

    // Insert temporary questions
    const result = await AssessmentQuestion.insertMany(tempQuestions);
    console.log("Temporary questions inserted:", result);

    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  } catch (error) {
    console.error("Error inserting temporary questions:", error);
    process.exit(1);
  }
};

insertTemporaryQuestions();

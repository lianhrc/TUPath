const mongoose = require("mongoose");
const { AssessmentQuestion } = require("./models/Tupath_users"); // Adjust the path to your models file

// Define questions with scoring
const questions = [
  // Web Development
  {
    text: "How well-structured is the code?",
    type: "rating",
    category: "Web Development",
    scoring: { "1": 3, "2": 5, "3": 10, "4": 15, "5": 20 },
  },
  {
    text: "How user-friendly is the interface?",
    type: "rating",
    category: "Web Development",
    scoring: { "1": 2, "2": 4, "3": 8, "4": 12, "5": 16 },
  },

  // AI
  {
    text: "How innovative is the solution?",
    type: "rating",
    category: "AI",
    scoring: { "1": 2, "2": 4, "3": 8, "4": 12, "5": 18 },
  },
  {
    text: "How accurate are the results?",
    type: "rating",
    category: "AI",
    scoring: { "1": 1, "2": 3, "3": 6, "4": 9, "5": 15 },
  },

  // Machine Learning
  {
    text: "How effective is the training process?",
    type: "rating",
    category: "Machine Learning",
    scoring: { "1": 5, "2": 10, "3": 15, "4": 20, "5": 25 },
  },
  {
    text: "How accurate is the prediction model?",
    type: "rating",
    category: "Machine Learning",
    scoring: { "1": 4, "2": 8, "3": 12, "4": 16, "5": 20 },
  },

  // Data Science
  {
    text: "How comprehensive is the analysis?",
    type: "rating",
    category: "Data Science",
    scoring: { "1": 3, "2": 6, "3": 9, "4": 12, "5": 15 },
  },
  {
    text: "How well is the data visualized?",
    type: "rating",
    category: "Data Science",
    scoring: { "1": 2, "2": 5, "3": 8, "4": 10, "5": 13 },
  },

  // Add more categories as needed
];

const insertQuestions = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect("mongodb+srv://henry:admin@cluster0.wfrb9.mongodb.net/tupath_users?retryWrites=true&w=majority", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB");

    // Insert questions into the database
    const result = await AssessmentQuestion.insertMany(questions);
    console.log("Questions Added:", result);

    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  } catch (error) {
    console.error("Error inserting questions:", error);
    await mongoose.disconnect();
  }
};

// Run the script
insertQuestions();

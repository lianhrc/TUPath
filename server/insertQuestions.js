const mongoose = require("mongoose");
const { AssessmentQuestion } = require("./models/Tupath_users"); // Update with your correct file path

const questions = [
    // Web Development
    { text: "How well-structured is the code?", type: "rating", category: "Web Development" },
    { text: "How user-friendly is the interface?", type: "rating", category: "Web Development" },
    { text: "Does it meet the functional requirements?", type: "rating", category: "Web Development" },
    { text: "How scalable is the project?", type: "rating", category: "Web Development" },
    { text: "How well are error cases handled?", type: "rating", category: "Web Development" },

    // AI
    { text: "How innovative is the solution?", type: "rating", category: "AI" },
    { text: "How well does it mimic human intelligence?", type: "rating", category: "AI" },
    { text: "How accurate are the results?", type: "rating", category: "AI" },
    { text: "How efficient is the processing time?", type: "rating", category: "AI" },
    { text: "Does it handle edge cases well?", type: "rating", category: "AI" },

    // Machine Learning
    { text: "How effective is the training process?", type: "rating", category: "Machine Learning" },
    { text: "How accurate is the prediction model?", type: "rating", category: "Machine Learning" },
    { text: "Does it overfit or underfit?", type: "rating", category: "Machine Learning" },
    { text: "How efficient is the model's performance?", type: "rating", category: "Machine Learning" },
    { text: "How well-documented is the dataset?", type: "rating", category: "Machine Learning" },

    // Data Science
    { text: "How comprehensive is the analysis?", type: "rating", category: "Data Science" },
    { text: "Are the insights actionable?", type: "rating", category: "Data Science" },
    { text: "How well is the data visualized?", type: "rating", category: "Data Science" },
    { text: "How accurate are the statistical models?", type: "rating", category: "Data Science" },
    { text: "Is the data cleaning process efficient?", type: "rating", category: "Data Science" },

    // Cybersecurity
    { text: "How secure is the system against attacks?", type: "rating", category: "Cybersecurity" },
    { text: "Are the authentication mechanisms robust?", type: "rating", category: "Cybersecurity" },
    { text: "Does the system adhere to security best practices?", type: "rating", category: "Cybersecurity" },
    { text: "Are vulnerabilities minimized effectively?", type: "rating", category: "Cybersecurity" },
    { text: "How well are data breaches mitigated?", type: "rating", category: "Cybersecurity" },

    // Mobile Development
    { text: "How intuitive is the app interface?", type: "rating", category: "Mobile Development" },
    { text: "How responsive is the application?", type: "rating", category: "Mobile Development" },
    { text: "Does it function well on different devices?", type: "rating", category: "Mobile Development" },
    { text: "How efficient is the app's performance?", type: "rating", category: "Mobile Development" },
    { text: "Are there any noticeable bugs?", type: "rating", category: "Mobile Development" },

    // UI/UX Design
    { text: "How visually appealing is the design?", type: "rating", category: "UI/UX Design" },
    { text: "Is the design user-centric?", type: "rating", category: "UI/UX Design" },
    { text: "How accessible is the interface?", type: "rating", category: "UI/UX Design" },
    { text: "Are design elements consistent?", type: "rating", category: "UI/UX Design" },
    { text: "Does it align with branding guidelines?", type: "rating", category: "UI/UX Design" },
];

const insertQuestions = async () => {
    try {
        await mongoose.connect("mongodb://127.0.0.1:27017/tupath_users", {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log("Connected to MongoDB");

        const result = await AssessmentQuestion.insertMany(questions);
        console.log("Questions Added:", result);

        await mongoose.disconnect();
        console.log("Disconnected from MongoDB");
    } catch (error) {
        console.error("Error inserting questions:", error);
        await mongoose.disconnect();
    }
};

insertQuestions();

const mongoose = require("mongoose");
const { AssessmentQuestion } = require("./models/Tupath_users"); // Update with your correct file path

const webDevQuestions = [
    { text: "How well-structured is the code?", type: "rating", category: "Web Development" },
    { text: "How user-friendly is the interface?", type: "rating", category: "Web Development" },
    { text: "Does it meet the functional requirements?", type: "rating", category: "Web Development" },
    { text: "How scalable is the project?", type: "rating", category: "Web Development" },
    { text: "How well are error cases handled?", type: "rating", category: "Web Development" },
];

const insertQuestions = async () => {
    try {
        await mongoose.connect("mongodb://127.0.0.1:27017/tupath_users", {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log("Connected to MongoDB");

        const result = await AssessmentQuestion.insertMany(webDevQuestions);
        console.log("Web Development Questions Added:", result);

        await mongoose.disconnect();
        console.log("Disconnected from MongoDB");
    } catch (error) {
        console.error("Error inserting questions:", error);
        await mongoose.disconnect();
    }
};

insertQuestions();

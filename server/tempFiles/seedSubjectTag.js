const mongoose = require("mongoose");
const { Tupath_usersModel, Employer_usersModel, Project, Admin, SubjectTagMapping} = require("../models/Tupath_users");

    mongoose
     .connect("mongodb://127.0.0.1:27017/tupath_users")
      .then(() => console.log("MongoDB connected successfully"))
     .catch((err) => console.error("MongoDB connection error:", err));

const subjectTagMappings = [
  { tag: "Web Development", subjectCode: "CC101", subjectName: "Computer Programming 1" },
  { tag: "Software Development and Applications", subjectCode: "CC102", subjectName: "Computer Programming 2" },
  { tag: "Data Science", subjectCode: "CC103", subjectName: "Data Structures" },
  { tag: "Database Systems", subjectCode: "CC104", subjectName: "Database Management" }
];

const insertMappings = async () => {
  try {
    await SubjectTagMapping.insertMany(subjectTagMappings);
    console.log("Subject-Tag mappings inserted successfully!");
    mongoose.connection.close();
  } catch (error) {
    console.error("Error inserting mappings:", error);
    mongoose.connection.close();
  }
};

insertMappings();

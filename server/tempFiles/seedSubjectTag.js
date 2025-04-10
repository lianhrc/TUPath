const mongoose = require("mongoose");
const { Tupath_usersModel, Employer_usersModel, Project, Admin, SubjectTagMapping } = require("../models/Tupath_users");

mongoose
  .connect(
    "mongodb+srv://tupath:tupath123@tupath.q84om.mongodb.net"
  )
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => console.error("MongoDB connection error:", err));

const subjectTagMappings = [
  {
    tag: "Web Development",
    subjects: [
      { subjectCode: "CC101", subjectName: "Computer Programming 1" },
      { subjectCode: "CC105", subjectName: "Web Technologies" }
    ]
  },
  {
    tag: "Software Development and Applications",
    subjects: [
      { subjectCode: "CC102", subjectName: "Computer Programming 2" },
      { subjectCode: "CC106", subjectName: "Software Engineering" }
    ]
  },
  {
    tag: "Data Science",
    subjects: [
      { subjectCode: "CC103", subjectName: "Data Structures" },
      { subjectCode: "CC107", subjectName: "Machine Learning" }
    ]
  },
  {
    tag: "Database Systems",
    subjects: [
      { subjectCode: "CC104", subjectName: "Database Management" },
      { subjectCode: "CC108", subjectName: "Advanced SQL" }
    ]
  }
];

const insertMappings = async () => {
  try {
    await SubjectTagMapping.deleteMany({}); // Clear existing data
    await SubjectTagMapping.insertMany(subjectTagMappings);
    console.log("Subject-Tag mappings inserted successfully!");
  } catch (error) {
    console.error("Error inserting mappings:", error);
  } finally {
    mongoose.connection.close();
  }
};

insertMappings();

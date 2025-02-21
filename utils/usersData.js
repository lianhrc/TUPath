const mongoose = require('mongoose');
const User = require('../server/models/userModel'); // Update this with the actual path to your schema file

const MONGO_URI = 'mongodb+srv://admin123:admin123@tupath.scxtl.mongodb.net/'; // Replace with your MongoDB connection string

mongoose.set('strictQuery', true);

mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    connectTimeoutMS: 60000, // 60 seconds
    socketTimeoutMS: 60000
})
    .then(() => {
        console.log('MongoDB connected successfully');
        createUsers(); // Ensure users are created after successful connection
    })
    .catch(err => console.error('MongoDB connection error:', err));

const users = [
    {
        "email": "student1@example.com",
        "password": "password123",
        "isNewUser": true,
        "googleSignup": false,
        "role": "Student",
        "profileDetails": {
            "firstName": "John",
            "lastName": "Doe",
            "middleName": "Michael",
            "department": "Computer Science",
            "yearLevel": "1st year",
            "dateOfBirth": "2005-03-15",
            "profileImg": "",
            "gender": "Male",
            "address": "1234 Elm Street, Cityville",
            "contactNumber": "123-456-7890",
            "techSkills": ["JavaScript", "React"],
            "softSkills": ["Teamwork", "Communication"]
        }
    },
    {
        "email": "student2@example.com",
        "password": "password123",
        "isNewUser": false,
        "googleSignup": true,
        "role": "Student",
        "profileDetails": {
            "firstName": "Jane",
            "lastName": "Smith",
            "middleName": "Anne",
            "department": "Information Technology",
            "yearLevel": "2nd year",
            "dateOfBirth": "2004-07-22",
            "profileImg": "",
            "gender": "Female",
            "address": "5678 Oak Street, Townsville",
            "contactNumber": "987-654-3210",
            "techSkills": ["Python", "Node.js"],
            "softSkills": ["Problem Solving", "Time Management"]
        }
    },
    {
        "email": "admin@example.com",
        "password": "adminpass",
        "isNewUser": false,
        "googleSignup": false,
        "role": "Admin",
        "profileDetails": {
            "firstName": "Alice",
            "lastName": "Johnson",
            "middleName": "Marie",
            "department": "Administration",
            "yearLevel": "4th year",
            "dateOfBirth": "1998-05-10",
            "profileImg": "",
            "gender": "Female",
            "address": "9012 Maple Ave, AdminCity",
            "contactNumber": "111-222-3333",
            "techSkills": ["AWS", "MongoDB"],
            "softSkills": ["Adaptability", "Communication"]
        }
    },
    {
        "email": "employer@example.com",
        "password": "employerpass",
        "isNewUser": true,
        "googleSignup": true,
        "role": "Employer",
        "profileDetails": {
            "firstName": "Bob",
            "lastName": "Williams",
            "middleName": "James",
            "department": "HR",
            "yearLevel": "3rd year",
            "dateOfBirth": "1985-11-30",
            "profileImg": "",
            "gender": "Male",
            "address": "7890 Pine Street, EmployerTown",
            "contactNumber": "444-555-6666",
            "techSkills": ["Java", "C++"],
            "softSkills": ["Time Management", "Problem Solving"]
        }
    },
    {
        "email": "student5@example.com",
        "password": "password123",
        "isNewUser": true,
        "googleSignup": false,
        "role": "Student",
        "profileDetails": {
            "firstName": "Daniel",
            "lastName": "Brown",
            "middleName": "Lee",
            "department": "Mechanical Engineering",
            "yearLevel": "4th year",
            "dateOfBirth": "2002-06-18",
            "profileImg": "",
            "gender": "Male",
            "address": "123 River Lane, TechCity",
            "contactNumber": "654-321-0987",
            "techSkills": ["Java", "Node.js"],
            "softSkills": ["Teamwork", "Problem Solving"]
        }
    },
    {
        "email": "student6@example.com",
        "password": "password123",
        "isNewUser": false,
        "googleSignup": true,
        "role": "Student",
        "profileDetails": {
            "firstName": "Sophia",
            "lastName": "Martinez",
            "middleName": "Isabella",
            "department": "Data Science",
            "yearLevel": "3rd year",
            "dateOfBirth": "2003-04-09",
            "profileImg": "",
            "gender": "Female",
            "address": "789 Innovation Blvd, AI City",
            "contactNumber": "567-890-1234",
            "techSkills": ["Python", "MongoDB"],
            "softSkills": ["Time Management", "Adaptability"]
        }
    },
    {
        "email": "student3@example.com",
        "password": "password123",
        "isNewUser": true,
        "googleSignup": false,
        "role": "Student",
        "profileDetails": {
            "firstName": "Chris",
            "lastName": "Evans",
            "middleName": "Paul",
            "department": "Software Engineering",
            "yearLevel": "3rd year",
            "dateOfBirth": "2003-09-12",
            "profileImg": "",
            "gender": "Male",
            "address": "4321 Cedar Lane, CodeTown",
            "contactNumber": "321-654-9870",
            "techSkills": ["JavaScript", "AWS"],
            "softSkills": ["Communication", "Adaptability"]
        }
    },
    {
        "email": "student4@example.com",
        "password": "password123",
        "isNewUser": false,
        "googleSignup": true,
        "role": "Student",
        "profileDetails": {
            "firstName": "Emily",
            "lastName": "Davis",
            "middleName": "Lynn",
            "department": "Cybersecurity",
            "yearLevel": "2nd year",
            "dateOfBirth": "2004-01-25",
            "profileImg": "",
            "gender": "Female",
            "address": "8765 Birch Road, SecureCity",
            "contactNumber": "789-123-4567",
            "techSkills": ["Python", "C++"],
            "softSkills": ["Problem Solving", "Teamwork"]
        }
    }
];

const createUsers = async () => {
    try {
        for (const userData of users) {
            const user = new User(userData);
            await user.save();
            console.log(`User ${user.email} created successfully`);
        }
    } catch (error) {
        console.error('Error creating users:', error);
    } finally {
        mongoose.connection.close();
    }
};

const mongoose = require('mongoose')

const Schema = mongoose.Schema

const tuPathSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true //prevent emails duplication
    },
    password: {
        type: String,
        required: true
    },
    isNewUser: {
        type: Boolean, //true if user is new
        required: false
    },
    googleSignup: {
        type: Boolean, //true if user signed up with google
        required: false
    },
    role: {
        type: String,
        enum: ['Student', 'Admin', 'Employer'],      //Only these roles are allowed
        required: false
    },
    profileDetails: {
        studentId: {
            type: String,
            required: false
        },
        firstName: {
            type: String,
            required: false
        },
        lastName: {
            type: String,
            required: false
        },
        middleName: {
            type: String,
            required: false,
        },
        department: {
            type: String,
            required: false
        },
        yearLevel: {
            type: String,
            enum: ['1st year', '2nd year', '3rd year', '4th year'],      //Only these roles are allowed
            required: false
        },
        dateOfBirth: {
            type: Date,
            required: false
        },
        profileImg: {
            type: String,
            required: false
        },
        gender: {
            type: String,
            enum: ['Male', 'Female', 'Other'],      //Only these roles are allowed
            required: false
        },
        address: {
            type: String,
            required: false
        },
        contactNumber: {
            type: String,
            required: false
        },
        techSkills: {
            type: [String],
            num: ['JavaScript', 'Python', 'Java', 'C++', 'React', 'Node.js', 'AWS', 'MongoDB'],
            required: false
        },
        softSkills: {
            type: [String],
            num: ['Teamwork', 'Problem Solving', 'Communication', 'Time Management', 'Adaptability'],
            required: false
        }
    }
}, { timestamps: true })

module.exports = mongoose.model('User', tuPathSchema)
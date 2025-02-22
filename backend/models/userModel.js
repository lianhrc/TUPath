const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const profileSchema = new Schema({
    student: {
        studentId: { 
            type: String, 
            required: false 
        },
        firstName: { 
            type: String, 
            required: true 
        },
        lastName: { 
            type: String, 
            required: true 
        },
        middleName: { 
            type: String, 
            required: false 
        },
        department: { 
            type: String, 
            required: true 
        },
        yearLevel: { 
            type: String, 
            enum: ['1st year', '2nd year', '3rd year', '4th year'], 
            required: true
        },
        dateOfBirth: { 
            type: Date, 
            required: true 
        },
        profileImg: { 
            type: String, 
            required: false 
        },
        gender: { 
            type: String, 
            enum: ['Male', 'Female'], 
            required: true 
        },
        address: { 
            type: String, 
            required: true 
        },
        contactNumber: { 
            type: String, 
            required: true 
        },
        techSkills: { 
            type: [String], 
            default: [], 
            required: false 
        },
        softSkills: { 
            type: [String], 
            default: [], 
            required: false 
        }
    },
    employer: {
        firstName: { 
            type: String, 
            required: true 
        },
        lastName: { 
            type: String, 
            required: true 
        },
        middleName: { 
            type: String, 
            required: false 
        },
        dob: { 
            type: Date, 
            required: true 
        },
        gender: { 
            type: String, 
            enum: ['Male', 'Female'], 
            required: true 
        },
        nationality: { 
            type: String, 
            required: true 
        },
        address: { 
            type: String, 
            required: true 
        },
        companyName: { 
            type: String, 
            required: true 
        },
        position: { 
            type: String, 
            required: true 
        },
        industry: { 
            type: String, 
            required: true 
        },
        location: { 
            type: String, 
            required: true 
        },
        aboutCompany: { 
            type: String, 
            required: false 
        },
        contactPersonName: { 
            type: String, 
            required: true 
        },
        phoneNumber: { 
            type: String, 
            required: true 
        },
        profileImg: { 
            type: String, 
            required: false 
        },
        preferredRoles: { 
            type: [String], 
            default: [], 
            required: false 
        },
        internshipOpportunities: { 
            type: Boolean, 
            default: false, 
            required: false },
        preferredSkills: { 
            type: [String], 
            default: [], 
            required: false }
    }
});

const UserSchema = new Schema({
    email: { 
        type: String, 
        required: true, 
        unique: true 
    },
    password: { 
        type: String, 
        required: true 
    },
    isNewUser: { 
        type: Boolean, 
        default: true 
    },
    googleSignup: { 
        type: Boolean, 
        default: false 
    },
    role: { 
        type: String, 
        enum: ['Student', 'Employer'], 
        required: true 
    },
    profileDetails: { 
        type: profileSchema, 
        required: true 
    }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);

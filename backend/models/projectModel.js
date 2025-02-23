const mongoose = require('mongoose')

const Schema = mongoose.Schema

// Define the assessment schema
const AssessmentSchema = new Schema({
    question: {
        text: { type: String, required: true },
        scoring: { type: Map, of: Number, required: true },
    },
    rating: {
        type: Number,
        required: true,
        min: 1, max: 5
    },
    weightedScore: {
        type: Number,
        default: 0
    },
}, { _id: false }) // Prevent automatic _id creation inside subdocument

// Define the project schema
const ProjectSchema = new Schema({
    projectName: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    selectedFiles: [{ // Array of file paths or URLs
        type: String
    }],
    tag: { // Updated to accept only one tag
        type: String,
        required: true
    },
    tools: [{
        type: String
    }],
    roles: [{
        type: String
    }],
    thumbnail: { // Thumbnail URL or path
        type: String
    },
    projectUrl:
        String, // Optional project link
    createdAt: {  // Automatically set creation date
        type: Date,
        default: Date.now
    },
    assessment:
        [AssessmentSchema], // Use the assessment schema
}, { timestamps: true })

module.exports = mongoose.model('Project', ProjectSchema)
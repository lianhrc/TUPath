const mongoose = require('mongoose')

const Schema = mongoose.Schema

const CertificateSchema = new Schema({
    certName: { // Name/title of the certificate
        type: String, 
        required: true 
    }, 
    certDescription: {  // Detailed description of the certificate
        type: String, 
        required: true 
    }, 
    certThumbnail: { // URL or path to the certificate thumbnail
        type: String, 
        default: "" 
    }, 
    attachments: [{ 
        type: String, 
        validate: {
            validator: function (v) {
                // Ensure each attachment has an allowed file extension
                return /\.(jpg|jpeg|png|pdf|docx|txt)$/i.test(v)
            },
            message: "Attachments must be valid file URLs with extensions jpg, jpeg, png, pdf, docx, or txt.",
        },
    }],
}, { _id: false }) // Prevent automatic _id creation inside subdocument

const StudentCertSchema = new Schema({
    studId: { // Unique identifier for the student 
        type: String, 
        required: true 
    },
    studName: { // Full name of the student
        type: String, 
        required: true 
    }, 
    timestamp: { // Record creation timestamp
        type: Date, 
        default: Date.now 
    }, 
    certificate: { 
        type: CertificateSchema, 
        required: true }
}, { timestamps: true })

module.exports = mongoose.model('StudentCert', StudentCertSchema)
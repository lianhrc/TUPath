const express = require('express');
const StudentCertificate = require('../models/certModel');

// Upload certificate
const uploadCertificate = async (req, res) => {
    try {
        const userId = req.user.id;
        const userName = req.user.name; // Ensure user name is extracted from the token
        const { CertName, CertDescription } = req.body;

        if (!CertName || !CertDescription) {
            return res.status(400).json({ success: false, message: "Certificate name and description are required." });
        }

        const thumbnail = req.files["thumbnail"] ? `/uploads/${req.files["thumbnail"][0].filename}` : "";
        const attachments = req.files["attachments"] ? req.files["attachments"].map(file => `/uploads/${file.filename}`) : [];

        const newCertificate = new StudentCertificate({
            studId: userId,
            studName: userName, // Use the extracted user name
            certificate: {
                certName: CertName,
                certDescription: CertDescription,
                certThumbnail: thumbnail,
                attachments: attachments,
            },
        });

        await newCertificate.save();

        res.status(201).json({ success: true, message: "Certificate uploaded successfully", certificate: newCertificate });
    } catch (error) {
        console.error("Error uploading certificate:", error);
        res.status(500).json({ success: false, message: "Internal server error", error: error.message });
    }
}

// Fetch certificates
const getCertificates = async (req, res) => {
    try {
        const userId = req.user.id;
        const certificates = await StudentCertificate.find({ studId: userId });
        res.status(200).json({ success: true, certificates });
    } catch (error) {
        console.error('Error fetching certificates:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
}

// Delete certificate
const deleteCertificate = async (req, res) => {
    try {
        const certificateId = req.params.id;
        const userId = req.user.id;

        const certificate = await StudentCertificate.findOneAndDelete({ _id: certificateId, studId: userId });

        if (!certificate) {
            return res.status(404).json({ success: false, message: "Certificate not found" });
        }

        res.status(200).json({ success: true, message: "Certificate deleted successfully" });
    } catch (error) {
        console.error('Error deleting certificate:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
}

module.exports = {
    uploadCertificate,
    getCertificates,
    deleteCertificate
}
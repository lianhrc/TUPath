import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import './CertUpModal.css';

import { toast } from "react-toastify"; // Import toastify
import "react-toastify/dist/ReactToastify.css"; // Don't forget to import the CSS for toastify

import axios from '../../services/axiosInstance';  // Make sure to import axios instance

const CertUpModal = ({ show, onClose }) => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [thumbnail, setThumbnail] = useState(null);
  const [certName, setCertName] = useState("");
  const [certDescription, setCertDescription] = useState("");
  const fileInputRef = useRef(null);
  const thumbnailInputRef = useRef(null);
  const [newCertificate, setNewCertificate] = useState(null);

  if (!show) return null;

  const handleFileChange = (e) => {
    setSelectedFiles([...e.target.files]);
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setThumbnail(file);
    }
  };
  const handleSubmit = async (e) => {
  e.preventDefault();
  
  try {
    if (!certName || !certDescription) {
      toast.error("Certificate name and description are required");
      return;
    }

    // Upload Thumbnail
    const thumbnailFormData = new FormData();
    thumbnailFormData.append("thumbnail", thumbnail);
    
    const thumbnailResponse = await axios.post("/api/uploadThumbnail", thumbnailFormData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    console.log("Thumbnail Upload Response:", thumbnailResponse.data); // 👈 Debugging

    if (!thumbnailResponse.data.success) {
      toast.error("Failed to upload thumbnail");
      return;
    }

    const thumbnailUrl = thumbnailResponse.data.thumbnailUrl;

    // Upload Attachments
    const attachmentFormData = new FormData();
    selectedFiles.forEach((file) => {
      attachmentFormData.append("attachments", file);
    });

    const attachmentResponse = await axios.post("/api/uploadAttachments", attachmentFormData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    console.log("Attachment Upload Response:", attachmentResponse.data); // 👈 Debugging

    if (!attachmentResponse.data.success) {
      toast.error("Failed to upload attachments");
      return;
    }

    const attachmentUrls = attachmentResponse.data.attachmentUrls;

    // Upload Certificate
    const certificateData = {
      CertName: certName,
      CertDescription: certDescription,
      thumbnailUrl,
      attachmentUrls,
    };

    const certificateResponse = await axios.post("/api/uploadCertificate", certificateData);
    
    console.log("Certificate Upload Response:", certificateResponse.data); // 👈 Debugging

    if (certificateResponse.data.success) {
      toast.success("Certificate uploaded successfully");
      onClose();
    } else {
      toast.error("Failed to upload certificate");
    }
    
  } catch (error) {
    console.error("Error during certificate upload:", error);
    toast.error(error.response?.data?.message || "An error occurred");
  }
};

  

  const modalVariants = {
    hidden: {
      opacity: 0,
      y: -30, // Start above the screen
    },
    visible: {
      opacity: 1,
      y: 0, // Position at its normal place
      transition: {
        duration: 0.2,
        ease: 'easeOut',
      },
    },
    exit: {
      opacity: 0,
      y: 20, // Exit below the screen
      transition: {
        duration: 0.2,
        ease: 'easeIn',
      },
    },
  };

  return (
    <div className="ProjectUploadModal-overlay" onClick={onClose}>
      <motion.div
        className="ProjectUploadModal-content"
        onClick={(e) => e.stopPropagation()}
        variants={modalVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        <div className="upheader">
          <h3>Upload Your Certificate</h3>
          <button className="projectup-close-btn" onClick={onClose}>x</button>
        </div>

        <form id="certup-form">
          <div className="leftprojup-container">
            <div className="top">
              <label>Title:</label>
              <input type="text" name="CertName" value={certName} onChange={(e) => setCertName(e.target.value)} required />
            </div>
            <div className="mid">
              <label>Description:</label>
              <textarea name="CertDescription" value={certDescription} onChange={(e) => setCertDescription(e.target.value)} required></textarea>
            </div>
          </div>

          <div className="rightprojup-container">
            <label>Thumbnail:</label>
            <div className="thumbnail-container">
              <input
                type="file"
                accept=".jpg,.jpeg,.png"
                ref={thumbnailInputRef}
                onChange={handleThumbnailChange}
              />
              {thumbnail && (
                <div className="thumbnail-preview">
                  <img
                    src={URL.createObjectURL(thumbnail)}
                    alt="Thumbnail Preview"
                    width={60}
                    height={60}
                  />
                </div>
              )}
            </div>
            <label>Attach Files:</label>
            <input
              type="file"
              multiple
              accept=".jpg,.jpeg,.png,.pdf,.docx,.txt"
              ref={fileInputRef}
              onChange={handleFileChange}
            />
          </div>

          </form>
            <div className="submit-btn-container">
              <button type="submit" onClick={handleSubmit}>Submit</button>
            </div>
      </motion.div>
    </div>
  );
};

export default CertUpModal;

import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import './CertUpModal.css';
import axiosInstance from '../../services/axiosInstance';  // Make sure to import axios instance

const CertUpModal = ({ show, onClose }) => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [thumbnail, setThumbnail] = useState(null);
  const [certName, setCertName] = useState("");
  const [certDescription, setCertDescription] = useState("");
  const fileInputRef = useRef(null);
  const thumbnailInputRef = useRef(null);

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
    const formData = new FormData();
    formData.append("CertName", certName);
    formData.append("CertDescription", certDescription);
    if (thumbnail) {
      formData.append("thumbnail", thumbnail);
    }
    selectedFiles.forEach((file) => {
      formData.append("attachments", file);
    });

    try {
      const response = await axiosInstance.post("/api/uploadCertificate", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      if (response.data.success) {
        alert("Certificate uploaded successfully");
        onClose();
      } else {
        alert("Failed to upload certificate");
      }
    } catch (error) {
      console.error("Error uploading certificate:", error);
      alert("An error occurred while uploading the certificate");
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

        <form id="projup-form" onSubmit={handleSubmit}>
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

          <div className="submit-btn-container">
            <button type="submit">Submit</button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default CertUpModal;

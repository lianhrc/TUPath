import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import './CertUpModal.css';
import { toast } from "react-toastify"; // Import toastify
import "react-toastify/dist/ReactToastify.css"; // Don't forget to import the CSS for toastify

import axiosInstance from '../../services/axiosInstance';  // Make sure to import axios instance

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
        toast.success("Certificate uploaded successfully", {
          position: "top-center",
          autoClose: 3000,
          hideProgressBar: false,
          theme: "light",
        });
        onClose();  // Close the modal and trigger parent state update
      } else {
        toast.error("Failed to upload certificate", {
          position: "top-center",
          autoClose: 3000,
          hideProgressBar: false,
          theme: "light",
        });
      }
    } catch (error) {
      console.error("Error uploading certificate:", error);
      toast.error(`${error.response?.data?.message || error.message}`, {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        theme: "light",
      });
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

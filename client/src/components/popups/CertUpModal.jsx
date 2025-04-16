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
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!show) return null;

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const allowed = ['.jpg', '.jpeg', '.png', '.pdf', '.docx', '.txt'];
    
    const validFiles = files.filter(file => {
      const ext = file.name.toLowerCase().split('.').pop();
      return allowed.includes(`.${ext}`);
    });
  
    if (validFiles.length !== files.length) {
      toast.error(`Some files were rejected. Allowed types: ${allowed.join(', ')}`);
    }
  
    setSelectedFiles(validFiles);
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setThumbnail(file);
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true); // Start submitting
    
    try {
      console.log("Starting certificate upload process...");
      
      // 1. Validate inputs
      if (!certName || !certDescription || !thumbnail || selectedFiles.length === 0) {
        throw new Error("All fields are required");
      }
  
      console.log("Input validation passed");
  
      // 2. Upload Thumbnail
      console.log("Preparing thumbnail upload...");
      const thumbnailFormData = new FormData();
      thumbnailFormData.append("thumbnail", thumbnail);
      
      console.log("Sending thumbnail to backend...");
      const thumbnailResponse = await axios.post("/api/uploadThumbnail", thumbnailFormData, {
        headers: { 
          "Content-Type": "multipart/form-data",
          "Authorization": `Bearer ${localStorage.getItem('token')}`
        }
      });
  
      console.log("Thumbnail upload response:", thumbnailResponse.data);
      
      if (!thumbnailResponse.data?.thumbnailUrl) {
        throw new Error("Thumbnail upload failed - no URL returned");
      }
  
      // 3. Upload Attachments
      console.log(`Uploading ${selectedFiles.length} attachments...`);
      const attachmentUrls = [];
      
      for (const [index, file] of selectedFiles.entries()) {
        console.log(`Uploading attachment ${index + 1}: ${file.name}`);
        
        const attachmentFormData = new FormData();
        attachmentFormData.append("attachment", file);
        
        const response = await axios.post("/api/uploadAttachments", attachmentFormData, {
          headers: { 
            "Content-Type": "multipart/form-data",
            "Authorization": `Bearer ${localStorage.getItem('token')}`
          }
        });
  
        console.log(`Attachment ${index + 1} response:`, response.data);
        
        if (!response.data?.url) {
          throw new Error(`Failed to upload ${file.name}`);
        }
        attachmentUrls.push(response.data.url);
      }
  
      // 4. Prepare final payload
      const payload = {
        CertName: certName,
        CertDescription: certDescription,
        CertThumbnail: thumbnailResponse.data.thumbnailUrl,
        Attachments: attachmentUrls
      };
  
      console.log("Final payload:", payload);
  
      // 5. Submit certificate
      console.log("Submitting certificate data...");
      const certificateResponse = await axios.post("/api/uploadCertificate", payload, {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem('token')}`
        }
      });
  
      console.log("Certificate response:", certificateResponse.data);
      
      if (certificateResponse.data.success) {
        toast.success("Certificate uploaded successfully!");
        onClose();
      }
      
    } catch (error) {
      console.error("Full error details:", {
        message: error.message,
        stack: error.stack,
        response: error.response?.data,
        request: error.config,
        status: error.response?.status,
        headers: error.response?.headers
      });
      
      let errorMessage = "Upload failed";
      if (error.response) {
        // Try to extract server error message
        if (error.response.data?.message) {
          errorMessage = error.response.data.message;
        } else if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        }
      } else {
        errorMessage = error.message || errorMessage;
      }
      
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false); // Stop submitting whether success or error
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
          <button type="submit" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit"}
          </button>
        </div>
        
      </motion.div>
    </div>
  );
};

export default CertUpModal;

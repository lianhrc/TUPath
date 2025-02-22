import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { toast } from "react-toastify";
import axiosInstance from '../../services/axiosInstance';  // Make sure to import axios instance

import "react-toastify/dist/ReactToastify.css";
import './CorUpModal.css';

const CorUpModal = ({ show, onClose }) => {
  const [selectedCOR, setSelectedCOR] = useState(null);
  const [selectedRatingSlip, setSelectedRatingSlip] = useState(null);
  const corInputRef = useRef(null);
  const ratingSlipInputRef = useRef(null);

  if (!show) return null;

  const handleFileChange = (e, setFile) => {
    const file = e.target.files[0];
    if (file) {
      setFile(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();

    if (selectedCOR) {
      formData.append("corDocument", selectedCOR);
    }
    if (selectedRatingSlip) {
      formData.append("ratingSlip", selectedRatingSlip);
    }

    try {
      const response = await axiosInstance.post("/api/uploadCOR", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data.success) {
        toast.success("Documents uploaded successfully!");
        onClose();
      } else {
        toast.error("Failed to upload documents.");
      }
    } catch (error) {
      toast.error(`Error: ${error.response?.data?.message || error.message}`);
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
          <h3>Upload COR and Rating Slip</h3>
          <button className="projectup-close-btn" onClick={onClose}>x</button>
        </div>

  
        <form id="corup-form">

        <div className="leftprojup-container">
          <div className="top">
                <label>Year & Semester:</label>
                <input type="text" name="CorName" />
            </div>
        
        </div>

         <div className="rightprojup-container">
         <div className="file-upload-container">
         <label>Upload Certificate of Registration (COR):</label>
         <input type="file" accept=".pdf,.jpg,.jpeg,.png" ref={corInputRef} onChange={(e) => handleFileChange(e, setSelectedCOR)} />
       </div>

       <div className="file-upload-container">
         <label>Upload Rating Slip:</label>
         <input type="file" accept=".pdf,.jpg,.jpeg,.png" ref={ratingSlipInputRef} onChange={(e) => handleFileChange(e, setSelectedRatingSlip)} />
       </div>
         </div>
        
          
        </form>
        <div className="submit-btn-container">
            <button type="submit" onClick={handleSubmit}>Submit</button>
          </div>
      </motion.div>
    </div>
  );
};

export default CorUpModal;

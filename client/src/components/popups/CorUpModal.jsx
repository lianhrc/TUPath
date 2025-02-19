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

  return (
    <div className="CORUploadModal-overlay" onClick={onClose}>
      <motion.div className="CORUploadModal-content" onClick={(e) => e.stopPropagation()} initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}>
        <div className="upheader">
          <h3>Upload COR and Rating Slip</h3>
          <button className="corup-close-btn" onClick={onClose}>x</button>
        </div>

        <form id="corup-form">
          <div className="file-upload-container">
            <label>Upload Certificate of Registration (COR):</label>
            <input type="file" accept=".pdf,.jpg,.jpeg,.png" ref={corInputRef} onChange={(e) => handleFileChange(e, setSelectedCOR)} />
          </div>

          <div className="file-upload-container">
            <label>Upload Rating Slip:</label>
            <input type="file" accept=".pdf,.jpg,.jpeg,.png" ref={ratingSlipInputRef} onChange={(e) => handleFileChange(e, setSelectedRatingSlip)} />
          </div>

          <div className="submit-btn-container">
            <button type="submit" onClick={handleSubmit}>Submit</button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default CorUpModal;

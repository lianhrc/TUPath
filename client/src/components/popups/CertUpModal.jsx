import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import './CertUpModal.css';
import axiosInstance from '../../services/axiosInstance';  // Make sure to import axios instance

const CertUpModal = ({ show, onClose }) => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [thumbnail, setThumbnail] = useState(null);
  const fileInputRef = useRef(null);
  const thumbnailInputRef = useRef(null);


  if (!show) return null;

  // Handle file selection
  const handleFileChange = async (e) => {

  };



  // Handle file removal
  const handleFileRemove = (fileToRemove) => {
    setSelectedFiles((prevFiles) =>
      prevFiles.filter((file) => file !== fileToRemove)
    );
  };

  // Open file dialog
  const handleChooseFileClick = () => {
    fileInputRef.current.click();
  };

  // Handle submit (open  modal)
  const handleSubmit = (e) => {
    e.preventDefault();
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setThumbnail(file);
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
    <>
      <div className="ProjectUploadModal-overlay" onClick={onClose}>
        <motion.div className="ProjectUploadModal-content" onClick={(e) => e.stopPropagation()}
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"

        >
          <div className="upheader">
            <h3>Upload Your Cetificate</h3>
            <button className="projectup-close-btn" onClick={onClose}>x</button>
          </div>

          <form id="projup-form">
            <div className="leftprojup-container">
              <div className="top">
                <label>Title:</label>
                <input type="text" name="projectName" />
              </div>
              <div className="mid">
                <label>Description:</label>
                <textarea name="description"></textarea>
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
              accept=".zip,.rar,.pdf,.docx,.jpg,.png"
            />

        
          </div>
          </form>

          <div className="submit-btn-container">
            <button type="submit" >Submit</button>
          </div>
        </motion.div>
      </div>

     
    </>
  );
};

export default CertUpModal;

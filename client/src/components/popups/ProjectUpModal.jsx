import React, { useState, useRef } from "react";
import { motion } from 'framer-motion';
import ProjectAssessmentModal from "./ProjectAssessmentModal"; // Import your modal component
import "../popups/ProjectUpModal.css"; // Import the corresponding CSS file

const predefinedTags = [
  "React",
  "Node.js",
  "MongoDB",
  "Machine Learning",
  "AI",
  "Data Science",
  "Web Development",
  "Mobile Development",
  "Cybersecurity",
  "UI/UX Design",
];

const ProjectUploadModal = ({ show, onClose }) => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [tags, setTags] = useState([]); // State for selected tags
  const [showAssessmentModal, setShowAssessmentModal] = useState(false);
  const fileInputRef = useRef(null);

  if (!show) return null;

  // File selection handler
  const handleFileChange = (e) => {
    setSelectedFiles([...selectedFiles, ...Array.from(e.target.files)]);
  };

  // File remove handler
  const handleFileRemove = (fileToRemove) => {
    setSelectedFiles(selectedFiles.filter((file) => file !== fileToRemove));
  };

  // Open file picker
  const handleChooseFileClick = () => {
    fileInputRef.current.click();
  };

  // Handle tag selection
  const handleTagSelect = (e) => {
    const selectedTag = e.target.value;
    if (selectedTag && !tags.includes(selectedTag)) {
      setTags([...tags, selectedTag]);
    }
  };

  // Handle tag removal
  const handleTagRemove = (tagToRemove) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Tags:", tags); // Log tags for debugging
    console.log("Selected Files:", selectedFiles); // Log selected files
    setShowAssessmentModal(true); // Open the assessment modal
  };

  // Handle final form submission from the assessment modal
  const handleFinalSubmit = () => {
    console.log("Final submission confirmed!");
    // Add submission logic here
    setShowAssessmentModal(false);
    onClose();
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
        <motion.div
          className="ProjectUploadModal-content"
          onClick={(e) => e.stopPropagation()}
          variants={modalVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          <div className="upheader">
            <h3>Upload Your Project</h3>
            <button className="projectup-close-btn" onClick={onClose}>
              x
            </button>
          </div>

          <form id="projup-form">
            <div className="leftprojup-container">
              <div className="top">
                <label>Project Name:</label>
                <input type="text" name="projectName" />
              </div>
              <div className="mid">
                <label>Description:</label>
                <textarea name="description"></textarea>
              </div>
              <div className="bottom">
                <label>Tags:</label>
                <div className="tags-input-container">
                  <select onChange={handleTagSelect}>
                    <option value="">Select a Tag</option>
                    {predefinedTags.map((tag, index) => (
                      <option key={index} value={tag}>
                        {tag}
                      </option>
                    ))}
                  </select>
                  <div className="tags-list">
                    {tags.map((tag, index) => (
                      <span key={index} className="tag">
                        {tag}
                        <button
                          type="button"
                          className="remove-tag-btn"
                          onClick={() => handleTagRemove(tag)}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="rightprojup-container">
              <div className="upload-area">
                {selectedFiles.length > 0 ? (
                  <div className="file-preview-container">
                    {selectedFiles.map((file, index) => (
                      <div key={index} className="file-preview">
                        {file.type.startsWith("image/") ? (
                          <img
                            src={URL.createObjectURL(file)}
                            alt={`Preview ${index + 1}`}
                            className="preview-image"
                          />
                        ) : (
                          <p>{file.name}</p>
                        )}
                        <button
                          type="button"
                          onClick={() => handleFileRemove(file)}
                          className="remove-file-btn"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="file-dropzone">
                    <p>Drag & drop your files here or</p>
                    <button
                      type="button"
                      onClick={handleChooseFileClick}
                      className="choose-file-btn"
                    >
                      Upload files
                    </button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      multiple
                      onChange={handleFileChange}
                      style={{ display: "none" }}
                    />
                  </div>
                )}
              </div>
            </div>
          </form>

          <div className="submit-btn-container">
            <button type="submit" onClick={handleSubmit}>
              Submit
            </button>
          </div>
        </motion.div>
      </div>

      {/* Project Assessment Modal */}
      <ProjectAssessmentModal
        show={showAssessmentModal}
        onClose={() => setShowAssessmentModal(false)}
        onFinalSubmit={handleFinalSubmit}
      />
    </>
  );
};

export default ProjectUploadModal;

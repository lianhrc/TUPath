import React, { useState, useRef } from 'react';
import './ProjectUpModal.css';
import ProjectAssessmentModal from './ProjectAssessmentModal';

const ProjectUploadModal = ({ show, onClose }) => {
  
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [showAssessmentModal, setShowAssessmentModal] = useState(false); // State for the assessment modal
  const fileInputRef = useRef(null);

  if (!show) return null;

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles((prevFiles) => [...prevFiles, ...files]);
  };

  const handleFileRemove = (fileToRemove) => {
    setSelectedFiles((prevFiles) =>
      prevFiles.filter((file) => file !== fileToRemove)
    );
  };

  const handleChooseFileClick = () => {
    fileInputRef.current.click();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setShowAssessmentModal(true); // Show assessment modal
  };

  const handleFinalSubmit = () => {
    // Handle final project submission here
    console.log("Project submitted successfully!");
    setShowAssessmentModal(false);
    onClose(); // Close both modals
  };

  return (
    <>
      <div className="ProjectUploadModal-overlay" onClick={onClose}>
        <div className="ProjectUploadModal-content" onClick={(e) => e.stopPropagation()}>
          <div className="upheader">
            <h3>Upload Your Project</h3>
            <button className="projectup-close-btn" onClick={onClose}>x</button>
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
                    <button type="button" onClick={handleChooseFileClick} className="choose-file-btn">Upload files</button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      className="file-input"
                      style={{ display: 'none' }}
                      multiple
                    />
                  </div>
                )}
              </div>
            </div>
          </form>

          <div className="submit-btn-container">
            <button type="submit" onClick={handleSubmit}>Submit</button>
          </div>
        </div>
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

import React, { useState, useRef } from "react";
import { motion } from 'framer-motion';
import ProjectAssessmentModal from "./ProjectAssessmentModal"; // Import your modal component
import "../popups/ProjectUpModal.css"; // Import the corresponding CSS file
import axiosInstance from '../../services/axiosInstance'; // Make sure the path is correct


const predefinedTags = [
  "Machine Learning",
  "AI",
  "Data Science",
  "Web Development",
  "Mobile Development",
  "Cybersecurity",
  "UI/UX Design",
];

const predefinedTools = [
  "React",
  "Node.js",
  "MongoDB",
  "VS Code",
  "Git",
  "Figma",
  "Postman",
  "Webpack",
  "Firebase",
  "PHP",

];



const ProjectUploadModal = ({ show, onClose }) => {
  const [projectName, setProjectName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [tags, setTags] = useState([]); // State for selected tags
  const [tools, setTools] = useState([]); // State for tools used
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

  // Tool selection handler
  const handleToolSelect = (e) => {
    const selectedTool = e.target.value;
    if (selectedTool && !tools.includes(selectedTool)) {
      setTools([...tools, selectedTool]);
    }
  };

  // Tool removal handler
  const handleToolRemove = (toolToRemove) => {
    setTools(tools.filter((tool) => tool !== toolToRemove));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
  
    const formData = new FormData();
    formData.append('projectName', projectName);  // Append project name
    formData.append('description', description);  // Append project description
    tags.forEach(tag => formData.append('tags', tag));  // Append each tag
    tools.forEach(tool => formData.append('tools', tool));  // Append each tool
    selectedFiles.forEach(file => formData.append('projectFiles', file));  // Append each file
  
    try {
      // Send the request to the server to upload the project
      const response = await axiosInstance.post('/api/uploadProject', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',  // Ensure correct content type
        },
      });
  
      console.log('Response Data:', response.data);  // Log the response
  
      // Check if the project upload was successful
      if (response.data.success) {
        console.log('Project uploaded successfully:', response.data.project);
        
        // Close the modal on successful upload
        onClose();  // This will close the modal
      } else {
        console.log('Project upload failed:', response.data.message);
      }
    } catch (error) {
      console.error('Error uploading project:', error);  // Handle any errors
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
                <input
                  type="text"
                  name="projectName"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)} // Update state on change
                />

              </div>
              <div className="mid">
                <label>Description:</label>
                <textarea
                  name="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)} // Update state on change
                ></textarea>

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

                  <div className="tools-input-container">
                  <label>Tools Used:</label>
                    <select onChange={handleToolSelect}>
                      <option value="">Select a Tool</option>
                      {predefinedTools.map((tool, index) => (
                        <option key={index} value={tool}>
                          {tool}
                        </option>
                      ))}
                    </select>
                    <div className="tools-list">
                      {tools.map((tool, index) => (
                        <span key={index} className="tool">
                          {tool}
                          <button
                            type="button"
                            className="remove-tool-btn"
                            onClick={() => handleToolRemove(tool)}
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                </div>
              </div>
            </div>

            <div className="rightprojup-container">
            <div className="attach-files-container">
            <label>Attach Files:</label>
            <input
              type="file"
              multiple
              accept=".zip,.rar,.pdf,.docx,.pptx,.xlsx,.jpg,.jpeg,.png"
              ref={fileInputRef}
              onChange={handleFileChange}
              style={{ display: "none" }} // Hide the default input field
            />
            <button
              type="button"
              onClick={handleChooseFileClick}
              className="choose-file-btn"
            >
              Add Files
            </button>
          
            {selectedFiles.length > 0 && (
              <div className="file-preview-list">
                <p>Attached Files:</p>
                <ul>
                  {selectedFiles.map((file, index) => (
                    <li key={index} className="file-preview-item">
                      {file.name}
                      <button
                        type="button"
                        onClick={() => handleFileRemove(file)}
                        className="remove-file-btn"
                      >
                        ×
                      </button>
                    </li>
                  ))}
                </ul>
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
      />
    </>
  );
};

export default ProjectUploadModal;

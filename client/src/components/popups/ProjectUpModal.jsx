import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import ProjectAssessmentModal from "./ProjectAssessmentModal";
import "../popups/ProjectUpModal.css";
import axiosInstance from "../../services/axiosInstance";

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

const ProjectUploadModal = ({ show, onClose, onProjectUpload }) => {
  const [projectName, setProjectName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [tags, setTags] = useState([]);
  const [tools, setTools] = useState([]);
  const [thumbnail, setThumbnail] = useState(null);
  const [projectUrl, setProjectUrl] = useState("");
  const [status] = useState("pending");
  const [showAssessmentModal, setShowAssessmentModal] = useState(false);
  const [assessmentQuestions, setAssessmentQuestions] = useState([]);
  const [assessmentRatings, setAssessmentRatings] = useState([]);
  const [readyToSubmit, setReadyToSubmit] = useState(false);

  const thumbnailInputRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (tags.length > 0) {
      fetchAssessmentQuestions(tags);
    }
  }, [tags]);

  const fetchAssessmentQuestions = async (categories) => {
    try {
      const response = await axiosInstance.get(
        `http://localhost:3001/api/assessment-questions?category=${categories.join(",")}`
      );
      if (response.data.success) {
        setAssessmentQuestions(response.data.questions);
        setAssessmentRatings(Array(response.data.questions.length).fill(0));
      } else {
        console.error("Failed to fetch assessment questions:", response.data.message);
      }
    } catch (error) {
      console.error("Error fetching assessment questions:", error);
    }
  };

  if (!show) return null;

  const handleFileChange = (e) => {
    setSelectedFiles([...selectedFiles, ...Array.from(e.target.files)]);
  };

  const handleFileRemove = (fileToRemove) => {
    setSelectedFiles(selectedFiles.filter((file) => file !== fileToRemove));
  };

  const handleChooseFileClick = () => {
    fileInputRef.current.click();
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setThumbnail(file);
    }
  };

  const handleTagSelect = (e) => {
    const selectedTag = e.target.value;
    if (selectedTag && !tags.includes(selectedTag)) {
      setTags([...tags, selectedTag]);
    }
  };

  const handleTagRemove = (tagToRemove) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleToolSelect = (e) => {
    const selectedTool = e.target.value;
    if (selectedTool && !tools.includes(selectedTool)) {
      setTools([...tools, selectedTool]);
    }
  };

  const handleToolRemove = (toolToRemove) => {
    setTools(tools.filter((tool) => tool !== toolToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!projectName.trim()) {
      alert("Project name is required.");
      return;
    }

    if (!description.trim()) {
      alert("Description is required.");
      return;
    }

    if (assessmentQuestions.length > 0 && !readyToSubmit) {
      setShowAssessmentModal(true);
      return;
    }

    const formData = new FormData();
    formData.append("projectName", projectName);
    formData.append("description", description);
    tags.forEach((tag) => formData.append("tags", tag));
    tools.forEach((tool) => formData.append("tools", tool));
    formData.append("projectUrl", projectUrl);
    formData.append("status", status);
    formData.append(
      "assessment",
      JSON.stringify(
        assessmentQuestions.map((question, index) => ({
          question,
          rating: assessmentRatings[index],
        }))
      )
    );
    selectedFiles.forEach((file) => formData.append("selectedFiles", file));
    if (thumbnail) {
      formData.append("thumbnail", thumbnail);
    }

    try {
      const response = await axiosInstance.post(
        "http://localhost:3001/api/uploadProject",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.success) {
        onProjectUpload(response.data.project);
        onClose();
      } else {
        console.error("Project upload failed:", response.data.message);
      }
    } catch (error) {
      console.error("Error uploading project:", error.response ? error.response.data : error);
    }
  };

  return (
    <>
      <div className="ProjectUploadModal-overlay" onClick={onClose}>
        <motion.div
          className="ProjectUploadModal-content"
          onClick={(e) => e.stopPropagation()}
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
        >
          <div className="upheader">
            <h3>Upload Your Project</h3>
            <button className="projectup-close-btn" onClick={onClose}>
              ×
            </button>
          </div>

          <form id="projup-form">
            <div className="leftprojup-container">
              <div className="top">
                <label>Project Name:</label>
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                />
              </div>
              <div className="mid">
                <label>Description:</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                ></textarea>
              </div>
              <div className="bottom">
                <label>Tags:</label>
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
                        onClick={() => handleTagRemove(tag)}
                      >
                        ×
                      </button>
                    </span>
                  ))}


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
                ref={fileInputRef}
                onChange={handleFileChange}
              />
              
              <label>Project URL:</label>
              <input
                type="url"
                value={projectUrl}
                onChange={(e) => setProjectUrl(e.target.value)}
              />
            </div>
          </form>
          <div className="submit-btn-container">
          <button type="submit" onClick={handleSubmit}>
            Submit
          </button>
          </div>
        </motion.div>
      </div>

      {showAssessmentModal && (
        <ProjectAssessmentModal
          show={showAssessmentModal}
          onClose={() => setShowAssessmentModal(false)}
          questions={assessmentQuestions}
          ratings={assessmentRatings}
          setRatings={setAssessmentRatings}
          onFinalSubmit={() => {
            setShowAssessmentModal(false);
            setReadyToSubmit(true);
            alert("Assessment completed successfully!");
          }}
        />
      )}
    </>
  );
};

export default ProjectUploadModal;

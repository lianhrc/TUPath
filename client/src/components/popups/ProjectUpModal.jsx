import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import ProjectAssessmentModal from "./ProjectAssessmentModal";
import "../popups/ProjectUpModal.css";
import axiosInstance from "../../services/axiosInstance";
import { toast } from "react-toastify"; // Import toastify
import "react-toastify/dist/ReactToastify.css"; // Don't forget to import the CSS for toastify


const predefinedTags = [
  "Web Development",
  "Software Development and Applications",
];

const predefinedTools = [
  "React",
  "Node.js",
  "Laravel",
  "PHP",
];

const predefinedRoles = [
  "Frontend Developer",
  "UI/UX Designer",
  "Angular Developer",
  "Backend Developer",
  "HTML/CSS Specialist",

];



const ProjectUploadModal = ({ show, onClose, onProjectUpload }) => {
  const [projectName, setProjectName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [tag, setTag] = useState("");
  const [tools, setTools] = useState([]);
  const [roles, setRoles] = useState([]); // Add this state variable

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
    if (tag) fetchAssessmentQuestions(tag, "tag");
  
    // Avoid fetching the same tool questions multiple times
    const uniqueTools = Array.from(new Set(tools));
    uniqueTools.forEach((tool) => fetchAssessmentQuestions(tool, "tool"));
  }, [tag, tools]);
  

  const fetchAssessmentQuestions = async (name, category) => {
    try {
      const response = await axiosInstance.get(
        `/api/assessment-questions?category=${category}&categoryName=${name}`
      );
  
      if (response.data.success) {
        const newQuestions = response.data.questions.map((q) => ({
          text: q.text,
          scoring: q.scoring,
          category,
          categoryName: name,
        }));
  
        // Avoid duplicates by filtering new questions
        setAssessmentQuestions((prev) => {
          const existingQuestions = new Set(prev.map((q) => q.text + q.category + q.categoryName));
          const uniqueQuestions = newQuestions.filter(
            (q) => !existingQuestions.has(q.text + q.category + q.categoryName)
          );
          return [...prev, ...uniqueQuestions];
        });
  
        setAssessmentRatings((prev) => {
          const updatedRatings = [...prev, ...Array(newQuestions.length).fill(0)];
          return updatedRatings.slice(0, assessmentQuestions.length + newQuestions.length);
        });
        
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

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setThumbnail(file);
    }
  };

  const handleTagSelect = (e) => {
    const selectedTag = e.target.value;
    setTag(selectedTag);
  };

  const handleToolSelect = (e) => {
    const selectedTool = e.target.value;
    if (selectedTool && !tools.includes(selectedTool)) {
      setTools([...tools, selectedTool]);
    }
  };

  const handleRoleSelect = (e) => {
    const selectedRole = e.target.value;
    if (selectedRole && !roles.includes(selectedRole)) {
      setRoles([...roles, selectedRole]);
    }
  };
  
  const handleRoleRemove = (roleToRemove) => {
    setRoles(roles.filter((role) => role !== roleToRemove));
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
  
    if (!tag) {
      alert("Please select a tag.");
      return;
    }
  
    if (assessmentQuestions.length > 0 && !readyToSubmit) {
      setShowAssessmentModal(true);
      return;
    }
  
    const formData = new FormData();
    formData.append("projectName", projectName);
    formData.append("description", description);
    formData.append("tag", tag);
    tools.forEach((tool) => formData.append("tools", tool));
    roles.forEach((role) => formData.append("roles", role));
    formData.append("projectUrl", projectUrl);
    formData.append(
      "assessment",
      JSON.stringify(
        assessmentQuestions.map((question, index) => ({
          question,
          rating: assessmentRatings[index],
          scoring: question.scoring,
          category: question.category,
          categoryName: question.categoryName,
        }))
      )
    );
    selectedFiles.forEach((file) => formData.append("selectedFiles", file));
    if (thumbnail) {
      formData.append("thumbnail", thumbnail);
    }
  
    try {
      const response = await axiosInstance.post("/api/uploadProject", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
  
      if (response.data.success) {
        // Show success toast notification
        toast.success('Project uploaded successfully!', {
          position: "top-center",
          autoClose: 3000, // Toast will disappear in 3 seconds
          hideProgressBar: false,
          theme: "light",
        });
        
        onProjectUpload(response.data.project);
        onClose();
      } else {
        console.error("Project upload failed:", response.data.message);
      }
    } catch (error) {
      console.error("Error uploading project:", error);
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
                <select value={tag} onChange={handleTagSelect}>
                  <option value="">Select a Tag</option>
                  {predefinedTags.map((tag, index) => (
                    <option key={index} value={tag}>
                      {tag}
                    </option>
                  ))}
                </select>


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
                  
                  <label>Role:</label>
                  <select onChange={handleRoleSelect}>
                    <option value="">Select a Role</option>
                    {predefinedRoles.map((role, index) => (
                      <option key={index} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>

             
                </div>

                <div className="divlistcat">
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

                      {roles.map((role, index) => (
                        <span key={index} className="role">
                          {role}
                          <button
                            type="button"
                            className="remove-tool-btn"
                            onClick={() => handleRoleRemove(role)}
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
                className="projecturlinput"
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
            toast.success('Assessment completed successfully!', {
              position: "top-center",
              autoClose: 3000,  // Toast will disappear in 3 seconds
              hideProgressBar: false,
              theme: "light",
            });
            
            
          }}
        />
      )}
    </>
  );
};

export default ProjectUploadModal;

//for push purposes
//my comment
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



const ProjectUploadModal = ({ show, onClose, updateGradesTable}) => {
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

  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [grade, setGrade] = useState("");
  const [year, setSelectedYear] = useState("");
  const [term, setSelectedTerm] = useState("");

  const thumbnailInputRef = useRef(null);
  const fileInputRef = useRef(null);

  const [availableSubjects, setAvailableSubjects] = useState([]);

 
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!projectName.trim() || !description.trim() || !tag) {
      alert("All fields are required.");
      return;
    }
    setShowAssessmentModal(true);
  };
  

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

  const handleTagSelect = async (e) => {
    const selectedTag = e.target.value;
    setTag(selectedTag);

};

useEffect(() => {
  if (tag) {
    fetchSubjectsForTag(tag);
  }
}, [tag]);

const fetchSubjectsForTag = async (selectedTag) => {
  try {
    const response = await axiosInstance.get(`/api/getSubjectByTag?tag=${selectedTag}`);
    console.log("Subjects Fetched:", response.data);
    if (response.data.success) {
      setAvailableSubjects(response.data.subjects);
      setSelectedSubject(response.data.subjects.length === 1 ? response.data.subjects[0].subjectCode : "");
    } else {
      setAvailableSubjects([]);
      setSelectedSubject("");
    }
  } catch (error) {
    console.error("Error fetching subjects:", error);
  }
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

  

  const handleAssessmentSubmit = async ({ subjectCode, grade, year, term }) => {
    try {
      const response = await axiosInstance.post("/api/saveAssessment", {
        subject: subjectCode,
        grade: grade,
        year: year,
        term: term,
      });
  
      if (response.data.success) {
        setSelectedSubject(subjectCode);
        setGrade(grade);
        setSelectedYear(year);
        setSelectedTerm(term);
        setShowAssessmentModal(false);
        toast.success("Subject and grade saved successfully!");
      } else {
        toast.error("Failed to save subject and grade.");
      }
    } catch (error) {
      console.error("Error saving assessment:", error);
      toast.error("An error occurred while saving the assessment.");
    }
  };

   
  const handleFinalSubmit = async () => {
    if (!selectedSubject || !grade) {
        alert("Please select a subject and enter a grade before final submission.");
        return;
    }

    setIsSubmitting(true);

    const formData = new FormData();
    formData.append("projectName", projectName);
    formData.append("description", description);
    formData.append("tag", tag);
    tools.forEach((tool) => formData.append("tools", tool));
    roles.forEach((role) => formData.append("roles", role));
    formData.append("projectUrl", projectUrl);
    formData.append("subject", selectedSubject);
    formData.append("grade", grade);

    
    selectedFiles.forEach((file, index) => {
        formData.append("selectedFiles", file);
    });

    if (thumbnail) {
        formData.append("thumbnail", thumbnail);
    }

    // Debugging: Log Form Data
    console.log("Submitting Project Data:");
    console.log("Project Name:", projectName);
    console.log("Description:", description);
    console.log("Tag:", tag);
    console.log("Tools:", tools);
    console.log("Roles:", roles);
    console.log("Project URL:", projectUrl);
    console.log("Selected Subject:", selectedSubject);
    console.log("Grade:", grade);
    console.log("Thumbnail:", thumbnail ? thumbnail.name : "No thumbnail");
    console.log("Selected Files:", selectedFiles.map(file => file.name));

    try {
      const response = await axiosInstance.post("/api/uploadProject", formData, {
          headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data.success) {
          toast.success("Project uploaded successfully!");
          
          // Now update GradesTable
          updateGradesTable({ 
              code: selectedSubject, 
              description: "Subject related to project", 
              grade 
          });

          onClose();
      } else {
          console.error("Upload failed:", response.data.message);
      }
  } catch (error) {
      console.error("Error uploading project:", error);
  }

  setIsSubmitting(false);
};
  if (!show) return null;



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
               
              <label>Category</label>
                <select value={tag} onChange={handleTagSelect}>
                  <option value="">Select a Category</option>
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
  {selectedSubject && grade ? (
    <button type="submit" onClick={handleFinalSubmit} disabled={isSubmitting}>
      {isSubmitting ? "Submitting..." : "Final Submit"}
    </button>
  ) : (
    <button type="submit" onClick={handleSubmit}>
      Submit
    </button>
  )}
</div>
        </motion.div>
      </div>

      {showAssessmentModal && (
        <ProjectAssessmentModal
        show={showAssessmentModal}
        onClose={() => setShowAssessmentModal(false)}
        onAssessmentSubmit={handleAssessmentSubmit}
        availableSubjects={availableSubjects} // ✅ Pass subjects
        />
      )}
    </>
  );
};

export default ProjectUploadModal;

//for push purposes
//my comment
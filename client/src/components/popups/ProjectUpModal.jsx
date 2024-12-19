import React, { useState, useRef } from "react";
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

const webDevelopmentQuestions = [
    "How well-structured is the code?",
    "How user-friendly is the interface?",
    "Does it meet the functional requirements?",
    "How scalable is the project?",
    "How well are error cases handled?",
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

        if (tags.includes("Web Development") && !readyToSubmit) {
            // Prepare assessment questions if "Web Development" is selected
            setAssessmentQuestions(webDevelopmentQuestions);
            setAssessmentRatings(Array(webDevelopmentQuestions.length).fill(0));
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
                console.log("Project uploaded successfully:", response.data.project);
                onProjectUpload(response.data.project);
                onClose();
            } else {
                console.log("Project upload failed:", response.data.message);
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
                        <button
                            className="projectup-close-btn"
                            onClick={onClose}
                        >
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
                                    onChange={(e) => setProjectName(e.target.value)}
                                />
                            </div>
                            <div className="mid">
                                <label>Description:</label>
                                <textarea
                                    name="description"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
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
                                </div>
                            </div>
                        </div>

                        <div className="rightprojup-container">
                            <label>Project Thumbnail:</label>
                            <div className="thumbnail-container">
                                {thumbnail && (
                                    <div className="thumbnail-preview">
                                        <img
                                            src={URL.createObjectURL(thumbnail)}
                                            alt="Thumbnail Preview"
                                            width={100}
                                            height={100}
                                        />
                                    </div>
                                )}
                                <input
                                    type="file"
                                    accept=".jpg,.jpeg,.png"
                                    ref={thumbnailInputRef}
                                    onChange={handleThumbnailChange}
                                />
                            </div>

                            <div className="attach-files-container">
                                <label>Attach Files:</label>
                                <input
                                    type="file"
                                    multiple
                                    accept=".zip,.rar,.pdf,.docx,.pptx,.xlsx,.jpg,.jpeg,.png"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    style={{ display: "none" }}
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
                                                <li
                                                    key={index}
                                                    className="file-preview-item"
                                                >
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

                            <div className="bottom">
                                <label>Project Url:</label>
                                <input
                                    className="projurlinput"
                                    type="url"
                                    name="projectUrl"
                                    value={projectUrl}
                                    onChange={(e) => setProjectUrl(e.target.value)}
                                />
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

import React, { useState, useEffect } from "react";
import axiosInstance from "../../services/axiosInstance";
import "./ProjectAssessmentModal.css";

const ProjectAssessmentModal = ({ show, onClose, onAssessmentSubmit, preselectedTag, availableSubjects }) => {

  const [selectedSubject, setSelectedSubject] = useState("");
  const [grade, setGrade] = useState("");
  const [ratingSlip, setRatingSlip] = useState(null);

  useEffect(() => {
    if (preselectedTag) {
      fetchSubjects(preselectedTag);
    }
  }, [preselectedTag]);

  const fetchSubjects = async (tag) => {
    try {
        const response = await axiosInstance.get(`/api/getSubjectByTag?tag=${tag}`);
        console.log("Subjects Fetched:", response.data); // Debugging
        if (response.data.success) {
            setAvailableSubjects(response.data.subjects);
        } else {
            setAvailableSubjects([]);
        }
    } catch (error) {
        console.error("Error fetching subjects:", error);
    }
};

  if (!show) return null;

  const handleSubmit = async () => {
    if (!selectedSubject) {
      alert("Please select a subject.");
      return;
    }

    if (!grade.trim()) {
      alert("Please enter a grade.");
      return;
    }

    const formData = new FormData();
    formData.append("subject", selectedSubject);
    formData.append("grade", grade);
    if (ratingSlip) {
      formData.append("ratingSlip", ratingSlip);
    }

    try {
      const response = await axiosInstance.post("/api/saveAssessment", {
        subject: selectedSubject,
        grade: grade,
        ratingSlip: ratingSlip ? ratingSlip.name : null,
      });

      if (response.data.success) {
        onAssessmentSubmit({ subjectCode: selectedSubject, grade, ratingSlip });
        onClose();
      } else {
        alert("Failed to save assessment. Please try again.");
      }
    } catch (error) {
      console.error("Error saving assessment:", error);
      alert("An error occurred while saving the assessment.");
    }
  };

  return (
    <div className="assessment-modal-overlay" onClick={onClose}>
      <div className="assessment-modal-content" onClick={(e) => e.stopPropagation()}>
        <h3>Project Subject Categorization</h3>
        <p>Please select a subject and input your grade:</p>

        <label>Subject:</label>
          {availableSubjects.length > 0 ? (
            <select 
                value={selectedSubject} 
                onChange={(e) => setSelectedSubject(e.target.value)} 
                required
            >
                <option value="">Select Subject</option>
                {availableSubjects.map((subject) => (
                    <option key={subject.subjectCode} value={subject.subjectCode}>
                        {subject.subjectCode} - {subject.subjectName}
                    </option>
                ))}
            </select>
          ) : (
            <p>No subjects available for the selected tag.</p>
          )}


        <label>Final Grade:</label>
        <input
          type="text"
          placeholder="Enter grade"
          value={grade}
          onChange={(e) => setGrade(e.target.value)}
        />

        <label>Attach Rating Slip (if available):</label>
        <input
          type="file"
          accept=".zip,.rar,.pdf,.docx,.jpg,.png"
          onChange={(e) => setRatingSlip(e.target.files[0])}
        />

        <div className="assessment-buttons">
          <button onClick={handleSubmit} className="assessment-submit-btn">
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectAssessmentModal;
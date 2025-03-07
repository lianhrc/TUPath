import React, { useState } from "react";
import axiosInstance from "../../services/axiosInstance";
import "./ProjectAssessmentModal.css";

const subjects = [
  { code: "CC101", name: "Computer Programming 1" },
  { code: "CC102", name: "Computer Programming 2" },
  { code: "CC103", name: "Data Structures" },
  { code: "CC104", name: "Database Management" },
];

const ProjectAssessmentModal = ({ show, onClose, onAssessmentSubmit }) => {
  const [selectedSubject, setSelectedSubject] = useState("");
  const [grade, setGrade] = useState("");
  const [ratingSlip, setRatingSlip] = useState(null);

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
      formData.append("ratingSlip", ratingSlip); // <-- Append ratingSlip instead of corFile
    }

    try {
      const response = await axiosInstance.post("/api/saveAssessment", {
        subject: selectedSubject,
        grade: grade,
        ratingSlip: ratingSlip ? ratingSlip.name : null, // Only send filename if provided
      });
      

      if (response.data.success) {
        onAssessmentSubmit({ subjectCode: selectedSubject, grade, ratingSlip });
        onClose(); // Redirect back to ProjectUpModal
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
        <select value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)} required>
          <option value="">Select Subject</option>
          {subjects.map((subject) => (
            <option key={subject.code} value={subject.code}>
              {subject.code} - {subject.name}
            </option>
          ))}
        </select>

        <label>Final Grade:</label>
        <input
          type="text"
          placeholder="Enter grade"
          value={grade}
          onChange={(e) => setGrade(e.target.value)}
        />

        <label>Attach COR if available:</label>
        <input
          type="file"
          accept=".zip,.rar,.pdf,.docx,.jpg,.png"
          onChange={(e) => setCorFile(e.target.files[0])}
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
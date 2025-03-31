import React, { useState, useEffect } from "react";
import axiosInstance from "../../services/axiosInstance";
import "./ProjectAssessmentModal.css";

const ProjectAssessmentModal = ({ show, onClose, onAssessmentSubmit, preselectedTag, availableSubjects }) => {

  const [selectedSubject, setSelectedSubject] = useState("");
  const [grade, setGrade] = useState("");
  const [ratingSlip, setRatingSlip] = useState(null);
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedTerm, setSelectedTerm] = useState("");


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
    if (!selectedSubject || !grade.trim() || !selectedYear || !selectedTerm) {
      alert("Please select a subject, grade, year level, and term.");
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
        year: selectedYear,
        term: selectedTerm,
        ratingSlip: ratingSlip ? ratingSlip.name : null,
      });

      if (response.data.success) {
        onAssessmentSubmit({ subjectCode: selectedSubject, grade, year: selectedYear, term: selectedTerm, ratingSlip});
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


            <label>Year Level:</label>
            <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)}>
              <option value="">Select Year Level</option>
              <option value="1st Year">1st Year</option>
              <option value="2nd Year">2nd Year</option>
              <option value="3rd Year">3rd Year</option>
              <option value="4th Year">4th Year</option>
            </select>

            <label>Term:</label>
            <select value={selectedTerm} onChange={(e) => setSelectedTerm(e.target.value)}>
              <option value="">Select Term</option>
              <option value="1st Semester Midterm">1st Semester Midterm</option>
              <option value="1st Semester Finals">1st Semester Finals</option>
              <option value="2nd Semester Midterm">2nd Semester Midterm</option>
              <option value="2nd Semester Finals">2nd Semester Finals</option>
            </select>


        <label htmlFor="finalGrade">Final Grade:</label>
        <select
          id="finalGrade"
          value={grade}
          onChange={(e) => setGrade(e.target.value)}
        >
          <option value="">Select Grade</option>
          <option value="1.0">1.0</option>
          <option value="1.25">1.25</option>
          <option value="1.5">1.5</option>
          <option value="1.75">1.75</option>
          <option value="2.0">2.0</option>
          <option value="2.25">2.25</option>
          <option value="2.5">2.5</option>
          <option value="2.75">2.75</option>
          <option value="3.0">3.0</option>
          <option value="4.0">4.0 (Conditional Failure)</option>
          <option value="5.0">5.0 (Failure)</option>
          <option value="INC">INC (Incomplete)</option>
          <option value="DRP">DRP (Dropped)</option>
        </select>
        

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
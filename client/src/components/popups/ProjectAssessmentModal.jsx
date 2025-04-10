import React, { useState, useEffect } from "react";
import axiosInstance from "../../services/axiosInstance";
import "./ProjectAssessmentModal.css";


const ProjectAssessmentModal = ({ show, onClose, onAssessmentSubmit, availableSubjects }) => {
  const [selectedSubject, setSelectedSubject] = useState("");
  const [grade, setGrade] = useState("");
  const [ratingSlip, setRatingSlip] = useState(null);
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedTerm, setSelectedTerm] = useState("");
  const [existingGrade, setExistingGrade] = useState(null);
  const [isGradeDisabled, setIsGradeDisabled] = useState(false);

  const fetchExistingGrade = async (subjectCode, year, term) => {
    try {
      const response = await axiosInstance.get(
        `/api/checkExistingGrade?subject=${subjectCode}&year=${year}&term=${term}`
      );
      
      if (response.data.success && response.data.grade) {
        setExistingGrade(response.data.grade);
        setGrade(response.data.grade);
        setIsGradeDisabled(true);
      } else {
        setExistingGrade(null);
        setGrade("");
        setIsGradeDisabled(false);
      }
    } catch (error) {
      console.error("Error fetching existing grade:", error);
      setExistingGrade(null);
      setGrade("");
      setIsGradeDisabled(false);
    }
  };

  const handleTermChange = async (e) => {
    const term = e.target.value;
    setSelectedTerm(term);
    
    if (selectedSubject && selectedYear && term) {
      await fetchExistingGrade(selectedSubject, selectedYear, term);
    }
  };

  const handleYearChange = async (e) => {
    const year = e.target.value;
    setSelectedYear(year);
    
    if (selectedSubject && year && selectedTerm) {
      await fetchExistingGrade(selectedSubject, year, selectedTerm);
    }
  };

  const handleSubjectChange = async (e) => {
    const subject = e.target.value;
    setSelectedSubject(subject);
    
    if (subject && selectedYear && selectedTerm) {
      await fetchExistingGrade(subject, selectedYear, selectedTerm);
    }
  };

  const handleSubmit = async () => {
    if (!selectedSubject || !grade.trim() || !selectedYear || !selectedTerm) {
      alert("Please select a subject, grade, year level, and term.");
      return;
    }

    onAssessmentSubmit({ 
      subjectCode: selectedSubject, 
      grade, 
      year: selectedYear, 
      term: selectedTerm,
      ratingSlip
    });
    onClose();
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
            onChange={handleSubjectChange}
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
        <select 
          value={selectedYear} 
          onChange={handleYearChange}
        >
          <option value="">Select Year Level</option>
          <option value="1st Year">1st Year</option>
          <option value="2nd Year">2nd Year</option>
          <option value="3rd Year">3rd Year</option>
          <option value="4th Year">4th Year</option>
        </select>

        <label>Term:</label>
        <select 
          value={selectedTerm} 
          onChange={handleTermChange}
        >
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
          disabled={isGradeDisabled}
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

        {isGradeDisabled && (
          <p className="grade-info-message">
            Grade is already recorded for this subject, year, and term.
          </p>
        )}

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
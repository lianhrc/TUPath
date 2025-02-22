import React, { useState } from "react";
import "./ProjectAssessmentModal.css";


const ProjectAssessmentModal = ({
  show,
  onClose,
  questions, // List of questions to display
  ratings, // Ratings for each question
  setRatings, // Function to update ratings
  onFinalSubmit, // Callback when all questions are answered
}) => {
  const [currentPage, setCurrentPage] = useState(0);
  const questionsPerPage = 5; // Number of questions per page
  const totalPages = Math.ceil(questions.length / questionsPerPage);

  if (!show) return null;

  // Handle rating updates
  const handleRatingChange = (index, rating) => {
    const updatedRatings = [...ratings];
    updatedRatings[index] = rating;
    setRatings(updatedRatings);
  };

  // Navigation between pages
  const handleNextPage = () => {
    if (currentPage < totalPages - 1) setCurrentPage(currentPage + 1);
  };

  const handlePreviousPage = () => {
    if (currentPage > 0) setCurrentPage(currentPage - 1);
  };

  // Submit assessment
  const handleSubmit = () => {
    if (ratings.some((rating) => rating === 0)) {
      alert("Please provide grade for that subject before submitting.");
      return;
    }
    onFinalSubmit();
    onClose();
  };

  // Calculate questions for the current page
  const startIndex = currentPage * questionsPerPage;
  const currentQuestions = questions.slice(
    startIndex,
    startIndex + questionsPerPage
  );

  return (
    <div className="assessment-modal-overlay" onClick={onClose}>
      <div
        className="assessment-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <h3>Project Subject Categorization</h3>
        <p>Please input your grade/s:</p>

        <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Subject Code</th>
            <th>Description</th>
            <th>Final Grade</th>
           
          </tr>
        </thead>
        <tbody>
            <tr >
              <td>1</td>
              <td>CS101</td>
              <td>Introduction to Programming</td>
              <td>
              <input
              type="text"
              placeholder="Enter grade"
            />
              </td>
              
            
            </tr>
        </tbody>
      </table>
       <label>Attach COR if available:</label>
          <input
            type="file"
            multiple
            accept=".zip,.rar,.pdf,.docx,.jpg,.png"
          />
        
        
        <div className="assessment-buttons">
          {currentPage > 0 && (
            <button
              onClick={handlePreviousPage}
              className="assessment-nav-btn"
            >
              Previous
            </button>
          )}
          {currentPage < totalPages - 1 ? (
            <button
              onClick={handleNextPage}
              className="assessment-nav-btn"
            >
              Next
            </button>
          ) : (
            <button onClick={handleSubmit} className="assessment-submit-btn">
              Submit
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectAssessmentModal;

import React, { useState } from "react";
import "./ProjectAssessmentModal.css";

const ProjectAssessmentModal = ({ 
  show, 
  onClose, 
  questions, 
  ratings, 
  setRatings, 
  onFinalSubmit 
}) => {
  const [currentPage, setCurrentPage] = useState(0); // Track current page
  const questionsPerPage = 5; // Number of questions per page
  const totalPages = Math.ceil(questions.length / questionsPerPage); // Total pages

  if (!show) return null;

  // Handle star rating click
  const handleRatingClick = (index, rating) => {
    const updatedRatings = [...ratings];
    updatedRatings[index] = rating;
    setRatings(updatedRatings);
  };

  // Navigate to the next page
  const handleNextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Navigate to the previous page
  const handlePreviousPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Submit the assessment
  const handleSubmit = () => {
    if (ratings.some((rating) => rating === 0)) {
      alert("Please provide ratings for all questions before submitting.");
      return;
    }
    onFinalSubmit(); // Trigger the final submit action
    onClose(); // Close the modal
  };

  // Calculate the current set of questions to display
  const startIndex = currentPage * questionsPerPage;
  const currentQuestions = questions.slice(startIndex, startIndex + questionsPerPage);

  return (
    <div className="assessment-modal-overlay" onClick={onClose}>
      <div
        className="assessment-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <h3>Project Assessment</h3>
        <p>Please rate the following questions before final submission:</p>

        <div className="assessment-questions">
          {currentQuestions.map((question, index) => (
            <div key={startIndex + index} className="assessment-question">
              <p>{question}</p>
              <div className="star-rating">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    className={`star ${
                      star <= ratings[startIndex + index] ? "selected" : ""
                    }`}
                    onClick={() => handleRatingClick(startIndex + index, star)}
                  >
                    ★
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="assessment-buttons">
          {currentPage > 0 && (
            <button onClick={handlePreviousPage} className="assessment-nav-btn">
              Previous
            </button>
          )}
          {currentPage < totalPages - 1 ? (
            <button onClick={handleNextPage} className="assessment-nav-btn">
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

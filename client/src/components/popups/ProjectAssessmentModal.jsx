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
      alert("Please provide ratings for all questions before submitting.");
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
        <h3>Project Assessment</h3>
        <p>Please rate the following questions:</p>
        <div className="assessment-questions">
          {currentQuestions.map((question, index) => (
            <div
              key={startIndex + index}
              className="assessment-question"
            >
              <p>
                <strong>{question.categoryName}:</strong> {question.text}
              </p>
              <div className="star-rating">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    className={`star ${
                      star <= ratings[startIndex + index] ? "selected" : ""
                    }`}
                    onClick={() =>
                      handleRatingChange(startIndex + index, star)
                    }
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

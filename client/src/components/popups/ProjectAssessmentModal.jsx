import React, { useState } from 'react';
import './ProjectAssessmentModal.css';

const questions = [
  "How long did this project take to complete?",
  "How satisfied are you with the overall quality of the project?",
  "How well does the project meet the specified requirements?",
  "Is the project code clean and well-organized?",
  "Does the project achieve the desired functionality?",
  "How efficient is the project in terms of performance?",
  "How user-friendly is the project's design?",
  "Do you feel the project has potential for further development or scaling?",
  "How effective is the project documentation?",
  "Rate the level of innovation or creativity in this project.",
  "How well does the project handle error cases and exceptions?",
  "How secure is the project, particularly regarding user data and access control?",
  "How well does the project perform across different devices and platforms?",
  "How clear and consistent is the code's naming and commenting?",
  "How well does the project meet the needs of its intended users or audience?",
  // Add more questions as needed
];

const ProjectAssessmentModal = ({ show, onClose, onFinalSubmit }) => {
  const [ratings, setRatings] = useState(Array(questions.length).fill(0)); // Initialize ratings
  const [currentPage, setCurrentPage] = useState(0); // Track the current page
  
  const questionsPerPage = 5;
  const totalPages = Math.ceil(questions.length / questionsPerPage);

  if (!show) return null;

  // Handle rating click
  const handleRatingClick = (questionIndex, rating) => {
    const updatedRatings = [...ratings];
    updatedRatings[questionIndex] = rating;
    setRatings(updatedRatings);
  };

  // Navigate to the next page
  const handleNextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Determine the current set of questions to display
  const startIndex = currentPage * questionsPerPage;
  const currentQuestions = questions.slice(startIndex, startIndex + questionsPerPage);

  return (
    <div className="assessment-modal-overlay" onClick={onClose}>
      <div className="assessment-modal-content" onClick={(e) => e.stopPropagation()}>
        <h3>Assessment for the Project</h3>
        <p className="header-p">Please answer these questions before final submission.</p>

        <div className="assessment-questions">
          {currentQuestions.map((question, index) => (
            <div key={startIndex + index} className="assessment-question">
              <p><strong>{question}</strong></p>
              <div className="star-rating">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    className={`star ${star <= ratings[startIndex + index] ? "selected" : ""}`}
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
          <button onClick={onClose} className="assessment-cancel-btn">Edit</button>
          {currentPage < totalPages - 1 ? (
            <button onClick={handleNextPage} className="assessment-next-btn">Next</button>
          ) : (
            <button onClick={onFinalSubmit} className="assessment-submit-btn">Submit Project</button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectAssessmentModal;

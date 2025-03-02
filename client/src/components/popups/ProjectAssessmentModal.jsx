import React, { useState } from "react";
import "./ProjectAssessmentModal.css";

const subjects = [
  { code: "CC101", name: "Computer Programming 1" },
  { code: "CC102", name: "Computer Programming 2" },
  { code: "CC103", name: "Data Structures" },
  { code: "CC104", name: "Database Management" },
];

const ProjectAssessmentModal = ({ show, onClose, onFinalSubmit }) => {
  const [selectedSubjects, setSelectedSubjects] = useState([""]);
  const [ratings, setRatings] = useState([""]);

  if (!show) return null;

  const handleRatingChange = (index, rating) => {
    const updatedRatings = [...ratings];
    updatedRatings[index] = rating;
    setRatings(updatedRatings);
  };

  const handleSubjectChange = (index, subjectCode) => {
    const updatedSubjects = [...selectedSubjects];
    updatedSubjects[index] = subjectCode;
    setSelectedSubjects(updatedSubjects);
  };

  const handleSubmit = () => {
    if (ratings.some((rating) => rating === "")) {
      alert("Please provide a grade before submitting.");
      return;
    }

    if (selectedSubjects.some((subject) => subject === "")) {
      alert("Please select a subject before submitting.");
      return;
    }

    const assessmentData = selectedSubjects.map((subject, index) => ({
      subjectCode: subject,
      grade: ratings[index],
    }));

    onFinalSubmit(assessmentData);
    onClose();
  };

  return (
    <div className="assessment-modal-overlay" onClick={onClose}>
      <div className="assessment-modal-content" onClick={(e) => e.stopPropagation()}>
        <h3>Project Subject Categorization</h3>
        <p>Please input your grade:</p>

        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Subject</th>
              <th>Final Grade</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>1</td>
              <td>
                <select onChange={(e) => handleSubjectChange(0, e.target.value)} required>
                  <option value="">Select Subject</option>
                  {subjects.map((subject) => (
                    <option key={subject.code} value={subject.code}>
                      {subject.code} - {subject.name}
                    </option>
                  ))}
                </select>
              </td>
              <td>
                <input
                  type="text"
                  placeholder="Enter grade"
                  value={ratings[0] || ""}
                  onChange={(e) => handleRatingChange(0, e.target.value)}
                />
              </td>
            </tr>
          </tbody>
        </table>

        <label>Attach COR if available:</label>
        <input type="file" multiple accept=".zip,.rar,.pdf,.docx,.jpg,.png" />

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

import React from 'react';
import './StudentListModal.css';

const StudentListModal = ({ tag, students, onClose, loading }) => {
    // Sort students by their scores in descending order
    const sortedStudents = [...students].sort((a, b) => 
        (b.bestTagScores[tag] || 0) - (a.bestTagScores[tag] || 0)
    );

    return (
        <div className="modal">
            <div className="modal-content">
                <h3>Students Excelling in {tag}</h3>
                {loading ? (
                    <p>Loading students...</p>
                ) : (
                    sortedStudents.length > 0 ? (
                        <ul>
                            {sortedStudents.map((student) => (
                                <li key={student._id}>
                                    {student.profileDetails.firstName} {student.profileDetails.lastName} - 
                                    Score: {student.bestTagScores[tag] || 'N/A'}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p>No students found for this tag.</p>
                    )
                )}
                <button onClick={onClose}>Close</button>
            </div>
        </div>
    );
};

export default StudentListModal;

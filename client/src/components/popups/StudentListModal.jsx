import React from 'react';
import './StudentListModal.css';

const StudentListModal = ({ tag, students, onClose, loading }) => {
    // Sort students by their scores in descending order
    const sortedStudents = [...students].sort((a, b) => 
        (b.bestTagScores[tag] || 0) - (a.bestTagScores[tag] || 0)
    );

    return (
        <div className="studentslistmodal">
            <div className="studentslistmodal-content">
                <h6>Students Excelling in {tag}</h6>
                {loading ? (
                    <p>Loading students...</p>
                ) : (
                    sortedStudents.length > 0 ? (
                        <table>
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Score</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sortedStudents.map((student) => (
                                    <tr key={student._id}>
                                        <td>{student.profileDetails.firstName} {student.profileDetails.lastName}</td>
                                        <td>{student.profileDetails.email}</td>
                                        <td>{student.bestTagScores[tag] || 'N/A'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
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

import React, { useState } from "react";
import "./Gradestable.css";

const GradesTable = () => {
  const [grades, setGrades] = useState([
    { id: 1, code: "CC131L-M", description: "Computer Programming 1, Lab", grade: "1.50", submitted: true, corFile: "sample.pdf" },
    { id: 2, code: "CC132L-M", description: "Computer Programming 2, Lab", grade: "1.75", submitted: true, corFile: null }
  ]);
  
  

  // Function to add a new row
  const addRow = () => {
    const newId = grades.length + 1;
    setGrades([...grades, { id: newId, code: "", description: "", grade: "", submitted: false }]);
  };

  // Function to handle input change
  const handleInputChange = (index, field, value) => {
    const updatedGrades = [...grades];
    updatedGrades[index][field] = value;
    setGrades(updatedGrades);
  };

  // Function to submit the row and make it non-editable
  const submitRow = (index) => {
    const updatedGrades = [...grades];
    updatedGrades[index].submitted = true;
    setGrades(updatedGrades);
  };

  // Function to delete a row
  const deleteRow = (id) => {
    setGrades(grades.filter((row) => row.id !== id));
  };

  return (
    <div className="gradesubcontainer">
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Subject Code</th>
            <th>Description</th>
            <th>Final Grade</th>
            <th>COR</th>
           
          </tr>
        </thead>
        <tbody>
          {grades.map((row, index) => (
            <tr key={row.id}>
              <td>{index + 1}</td>
              <td>
                {row.submitted ? row.code : (
                  <input
                    type="text"
                    value={row.code}
                    onChange={(e) => handleInputChange(index, "code", e.target.value)}
                  />
                )}
              </td>
              <td>
                {row.submitted ? row.description : (
                  <input
                    type="text"
                    value={row.description}
                    onChange={(e) => handleInputChange(index, "description", e.target.value)}
                  />
                )}
              </td>
              <td>
                {row.submitted ? row.grade : (
                  <input
                    type="text"
                    value={row.grade}
                    onChange={(e) => handleInputChange(index, "grade", e.target.value)}
                  />
                )}
              </td>

              <td>
              {/* PDF Icon Display Logic */}
              {row.corFile ? (
                <a href={`/uploads/${row.corFile}`} target="_blank" rel="noopener noreferrer">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/8/87/PDF_file_icon.svg" width="30" alt="PDF Icon" />
                </a>
              ) : (
                <span>No file</span>
              )}
            </td>

            
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default GradesTable;

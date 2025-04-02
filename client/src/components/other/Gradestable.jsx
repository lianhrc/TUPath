import React, { useState } from "react";
import "./Gradestable.css";


const GradesTable = ({ grades }) => {
  return (
    <div className="gradesubcontainer">
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Subject Code</th>
            <th>Description</th>
            <th>Final Grade</th>
            <th>Year</th>
            <th>Term</th>
            <th>COR</th>
          </tr>
        </thead>
        <tbody>
          {grades.length > 0 ? (
            grades.map((row, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>{row.code}</td>
                <td>{row.description}</td>
                <td>{row.grade}</td>
                <td>{row.year || 'N/A'}</td>
                <td>{row.term || 'N/A'}</td>
                <td>
                  {row.corFile ? (
                    <a href={`/uploads/${row.corFile}`} target="_blank" rel="noopener noreferrer">
                      <img src="https://upload.wikimedia.org/wikipedia/commons/8/87/PDF_file_icon.svg" width="30" alt="PDF Icon" />
                    </a>
                  ) : (
                    <span>No file</span>
                  )}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7">No grades available</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};
export default GradesTable;

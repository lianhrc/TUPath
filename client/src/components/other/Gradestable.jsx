import React, { useState } from "react";
import "./Gradestable.css";

import fileIcon from '../../assets/fileicon.png'

const GradesTable = ({ grades = [] }) => {
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
            <th>Rating Slip</th>
          </tr>
        </thead>
        <tbody>
          {grades && grades.length > 0 ? (
            grades.map((row, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>{row.code}</td>
                <td>{row.description}</td>
                <td>{row.grade}</td>
                <td>{row.year || 'N/A'}</td>
                <td>{row.term || 'N/A'}</td>
                <td>
                {row.ratingSlip ? (
                    <a 
                      href={row.ratingSlip} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="file-link"
                    >
                      <img 
                        src={fileIcon} 
                        width="24" 
                        alt="Rating Slip" 
                        className="file-icon"
                      />
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

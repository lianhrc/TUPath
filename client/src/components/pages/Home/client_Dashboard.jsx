import React, { useState } from "react";
import { Link } from "react-router-dom";
import _debounce from "lodash.debounce";
import axiosInstance from "../../../services/axiosInstance";
import profileicon from "../../../assets/profileicon.png";
import HeaderHomepage from "../../../components/common/headerhomepage"
import AddSubjectModal from "../../popups/AddSubjectModal";
import '../../../components/common/headerhomepage.css';
import "./client_Dashboard.css";

const Client_Dashboard = () => {
  const [selectedSubject, setSelectedSubject] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const studentsData = {
    "Computer Programming I": [
      { name: "Alejandro O. Horca", grade: "1.00" },
      { name: "Yujin Dela Fuente", grade: "1.25" },
      { name: "John Henry Woo", grade: "1.25" },
      { name: "Mario Lealiga", grade: "1.50" },
      { name: "Katrina Mendoza", grade: "1.75" },
    ],
  };

  const subjects = [
    "Introduction to Computing",
    "Computer Programming 1",
    "Computer Programming 2",
    "Science, Technology, and Society",
    "Human-Computer Interaction",
    "Data Structures and Algorithms",
    "Ethics",
    "Object-Oriented Programming",
    "Computer Architecture and Organization",
    "Platform Technologies",
    "Information Management",
    "Applications Development and Emerging Technologies",
    "Programming Language (Design and Implementation)",
    "Computer Networking 1",
    "Multimedia Authoring & Production",
    "IT Professional Elective",
    "Web Development",
    "Computer Networking 2",
    "Advanced Database Systems",
    "Information Assurance and Security 1",
    "Information Assurance and Security 2",
    "Systems Integration and Architecture 1",
    "Systems Integration and Architecture 2",
    "Methods of Research in Computing",
    "Living in the IT Era",
    "Business Intelligence",
    "Systems Administration and Maintenance",
    "The Entrepreneurial Mind",
    "IT Capstone & Research 1",
    "IT Capstone & Research 2",
    "Social and Professional Issues",
    "Combinatorics and Graph Theory",
    "Operating Systems",
    "Design and Analysis of Algorithms",
    "Networks and Communications",
    "Data Analytics",
    "Software Engineering 1",
    "Software Engineering 2",
    "Parallel and Distributed Computing",
    "Automata Theory and Formal Language",
    "Artificial Intelligence",
    "Modeling and Simulation",
    "IS Project Management",
    "IS Strategy, Management, and Acquisition",
    "Enterprise Architecture",
    "Professional Issues in Information Systems",
  ];

  return (
    <div className="cd_dashboard-container">
      <HeaderHomepage />
      <aside className="cd_sidebar">
        <div className="cd_subjects-container">
          <div>
            {subjects.map((subject, index) => (
              <div key={index}>
                <input
                  type="radio"
                  id={`subject-${index}`}
                  name="subject"
                  value={subject}
                  checked={selectedSubject === subject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                />
                <label htmlFor={`subject-${index}`}>{subject}</label>
              </div>
            ))}
          </div>
        </div>
      </aside>

      <main className="cd_main-content">
        <section className="cd_dashboard-content">
          <div className="cd_coursesoverview-container">
            <h3>Courses</h3>
          </div>

          <div className="section3boxes">
            <div className="div1box">
              <div className="boxheadercd">BSIT</div>5
            </div>
            <div className="div2box">
              <div className="boxheadercd">BSCS</div>7
            </div>
            <div className="div3box">
              <div className="boxheadercd">BSIS</div>
              10
            </div>
          </div>

          <div className="cd_grades-container">
            <div className="tableheadercd">
              <h3>{selectedSubject || "Select a Subject to View Grades"}</h3>
              <button onClick={() => setIsModalOpen(true)}>Add Subject</button>
              <AddSubjectModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
            </div>
            {selectedSubject ? (
              <table className="cd_grades-container">
  <thead>
    <tr>
      <th>Name</th>
      <th>Grade</th>
    </tr>
  </thead>
  <tbody>
    {[
      { name: "Alejandro O. Horca", grade: "1.00" },
      { name: "Yujin Dela Fuente", grade: "1.25" },
      { name: "John Henry Woo", grade: "1.25" },
      { name: "Mario Lealiga", grade: "1.50" },
      { name: "Katrina Mendoza", grade: "1.75" }
    ].map((student, index) => (
      <tr key={index}>
        <td>{student.name}</td>
        <td>{student.grade}</td>
      </tr>
    ))}
  </tbody>
</table>

            ) : (
              <p>Please select a subject to view the grades.</p>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Client_Dashboard;
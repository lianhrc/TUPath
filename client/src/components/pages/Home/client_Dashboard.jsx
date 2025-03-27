import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axiosInstance from "../../../services/axiosInstance";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts";
import HeaderHomepage from "../../../components/common/headerhomepage";
import AddSubjectModal from "../../popups/AddSubjectModal";
import '../../../components/common/headerhomepage.css';
import "./client_Dashboard.css";

const TAGS = [
  "Web Development",
  "Software Development and Applications",
  "Data Science",
  "Database Systems"
];

const Client_Dashboard = () => {
  const [selectedSubject, setSelectedSubject] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [subjects, setSubjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [tag, setTag] = useState(TAGS[0]);

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const response = await axiosInstance.get("/api/getSubjectByTag", { params: { tag } });
        setSubjects(response.data.success ? response.data.subjects : []);
      } catch (error) {
        console.error("Error fetching subjects:", error);
        setSubjects([]);
      }
    };
    fetchSubjects();
  }, [tag]);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await axiosInstance.get("/api/students-by-tag", { params: { tag } });
        setStudents(response.data.success ? response.data.students : []);
      } catch (error) {
        console.error("Error fetching students:", error);
        setStudents([]);
      }
    };
    fetchStudents();
  }, [tag]);

  const sortedStudents = [...students]
    .map(student => ({
      ...student,
      grade: parseFloat(student.bestTagScores?.[tag]) || 0
    }))
    .sort((a, b) => a.grade - b.grade);

  const gradeColors = {
    "1.00": "#4CAF50", "1.25": "#8BC34A", "1.50": "#CDDC39", "1.75": "#FFC107",
    "2.00": "#FF9800", "2.25": "#FF5722", "2.50": "#F44336", "2.75": "#E91E63",
    "3.00": "#9C27B0", "5.00": "#607D8B"
  };

  return (
    <div className="cd_dashboard-container">
      <HeaderHomepage />
      <aside className="cd_sidebar">
        <h3>Tags</h3>
        {TAGS.map((t) => (
          <button key={t} onClick={() => setTag(t)} className={tag === t ? "active" : ""}>{t}</button>
        ))}
        <h3 className="sidebarsubjects">Subjects</h3>
        {subjects.length > 0 ? (
          <div className="cd_subjects-container">
            {subjects.map((subject, index) => (
              <div key={index}>
                <input
                  type="radio"
                  id={`subject-${index}`}
                  name="subject"
                  value={subject.subjectName}
                  checked={selectedSubject === subject.subjectName}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                />
                <label htmlFor={`subject-${index}`}>{subject.subjectName}</label>
              </div>
            ))}
          </div>
        ) : (
          <p>No subjects found for this tag.</p>
        )}
      </aside>

      <main className="cd_main-content">
        <section className="cd_dashboard-content">
          <div className="cd_coursesoverview-container">
            <h3>Courses</h3>
          </div>

          <div className="section3boxes">
            <div className="div1box"><div className="boxheadercd">BSIT</div>5</div>
            <div className="div2box"><div className="boxheadercd">BSCS</div>7</div>
            <div className="div3box"><div className="boxheadercd">BSIS</div>10</div>
          </div>

          <div className="cd_grades-container">
            <div className="tableheadercd">
              <h3>{selectedSubject || "Select a Subject to View Grades"}</h3>
              <button onClick={() => setIsModalOpen(true)}>Add Subject</button>
              <AddSubjectModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
            </div>
            {selectedSubject ? (
              <>
                <table className="cd_grades-container">
                  <thead>
                    <tr>
                      <th>Rank</th>
                      <th>Name</th>
                      <th>Grade</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedStudents.map((student, index) => (
                      <tr key={index}>
                        <td>{index + 1}</td>
                        <td>{`${student.profileDetails?.firstName} ${student.profileDetails?.lastName}`}</td>
                        <td>{student.grade || "N/A"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="cd_chart-container">
                  <h3>Grade Analytics</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={sortedStudents} layout="vertical">
                      <XAxis type="number" domain={[0, 5]} allowDecimals={false} ticks={[0, 1, 2, 3, 4, 5]} />
                      <YAxis dataKey="profileDetails.firstName" type="category" width={150} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="grade">
                        {sortedStudents.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={gradeColors[entry.grade.toFixed(2)] || "#8884d8"} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </>
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

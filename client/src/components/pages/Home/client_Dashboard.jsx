import React, { useState } from "react";
import { Link } from "react-router-dom";
import _debounce from "lodash.debounce";
import axiosInstance from "../../../services/axiosInstance";
import profileicon from "../../../assets/profileicon.png";
// import "/searchbar.css";
import '../../../components/common/headerhomepage.css';
import "./client_Dashboard.css";

const Client_Dashboard = () => {
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [recentSearches, setRecentSearches] = useState(
    JSON.parse(localStorage.getItem("recentSearches")) || []
  );
  const [isSearchFieldClicked, setIsSearchFieldClicked] = useState(false);

  // Debounced search function to reduce API calls
  const debouncedSearch = _debounce(async (query) => {
    setIsSearching(true);
    try {
      const response = await axiosInstance.get("/api/search", {
        params: { query },
      });
      if (response.data.success) {
        setSearchResults(response.data.results);
      }
    } catch (error) {
      console.error("Error during search:", error);
    } finally {
      setIsSearching(false);
    }
  }, 500);

  const handleSearch = (event) => {
    const query = event.target.value;
    setSearchQuery(query);
    setIsSearchFieldClicked(false);
    if (query.length > 0) {
      debouncedSearch(query);
    } else {
      setSearchResults([]);
    }
  };

  const handleClearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem("recentSearches");
  };

  const courses = [
    "Bachelor of Science in Information Technology",
    "Bachelor of Science in Computer Science",
    "Bachelor of Science in Information Systems",
  ];
  const years = ["1st Year", "2nd Year", "3rd Year", "4th Year"];

  const courseSections = {
    "Bachelor of Science in Information Technology": {
      "1st Year": {
        sections: ["Stem", "Non-Stem"],
        subjects: [
          "Computer Programming I",
          "Mathematics for IT",
          "Networking Basics",
        ],
      },
      "2nd Year": {
        sections: ["Stem", "Non-Stem"],
        subjects: ["Data Structures", "Operating Systems", "Web Development"],
      },
    },
  };

  const studentsData = {
    "Computer Programming I": [
      { name: "Alejandro O. Horca", grade: "1.00" },
      { name: "Yujin Dela Fuente", grade: "1.25" },
      { name: "John Henry Woo", grade: "1.25" },
      { name: "Mario Lealiga", grade: "1.50" },
      { name: "Katrina Mendoza", grade: "1.75" },
    ],
    "Mathematics for IT": [
      { name: "Sophia Garcia", grade: "1.00" },
      { name: "Carlo Dominguez", grade: "1.50" },
      { name: "Andrea Torres", grade: "1.75" },
    ],
    "Networking Basics": [
      { name: "Nathan Reyes", grade: "1.25" },
      { name: "Maria Santos", grade: "1.50" },
      { name: "James Villanueva", grade: "1.75" },
      { name: "Angelica Lopez", grade: "2.00" },
    ],
  };

  return (
    <div className="cd_dashboard-container">
      <aside className="cd_sidebar">
        <div className="search-container">
          <input
            type="text"
            className="search-input"
            placeholder="Search"
            value={searchQuery}
            onChange={handleSearch}
          />
          {isSearching ? (
            <p>Searching...</p>
          ) : searchResults.length > 0 ? (
            <div className="search-results">
              {searchResults.map((result, index) => (
                <Link
                  to={`/profile/${result._id}`}
                  key={index}
                  className="search-result-item"
                >
                  <img
                    src={result.profileDetails?.profileImg || profileicon}
                    alt="Profile"
                  />
                  <p>
                    <strong>
                      {result.profileDetails.firstName}{" "}
                      {result.profileDetails.lastName}
                    </strong>
                  </p>
                </Link>
              ))}
            </div>
          ) : (
            isSearchFieldClicked && <p>No results found for "{searchQuery}".</p>
          )}
          {recentSearches.length > 0 && (
            <button
              className="clear-recent-btn"
              onClick={handleClearRecentSearches}
            >
              Clear
            </button>
          )}
        </div>
        <h6>Categories</h6>
        <div className="cd_filters">
          <select
            onChange={(e) => {
              setSelectedCourse(e.target.value);
              setSelectedYear("");
              setSelectedSection("");
              setSelectedSubject("");
            }}
            value={selectedCourse}
          >
            <option value="" hidden>
              Select a Course
            </option>
            {courses.map((course, index) => (
              <option key={index} value={course}>
                {course}
              </option>
            ))}
          </select>

          {selectedCourse && (
            <select
              onChange={(e) => {
                setSelectedYear(e.target.value);
                setSelectedSection("");
                setSelectedSubject("");
              }}
              value={selectedYear}
            >
              <option value="" hidden>
                Select Year Level
              </option>
              {years.map((year, index) => (
                <option key={index}>{year}</option>
              ))}
            </select>
          )}

          {selectedCourse &&
            selectedYear &&
            courseSections[selectedCourse]?.[selectedYear] && (
              <select
                onChange={(e) => {
                  setSelectedSection(e.target.value);
                  setSelectedSubject("");
                }}
                value={selectedSection}
              >
                <option value="" hidden>
                  Select Section
                </option>
                {courseSections[selectedCourse][selectedYear].sections.map(
                  (section, index) => (
                    <option key={index}>{section}</option>
                  )
                )}
              </select>
            )}
        </div>

        <div className="cd_subjects-container">
          {selectedCourse && selectedYear && selectedSection && (
            <div className="cd_subjects-list">
              <h6>Select a Subject:</h6>
              {courseSections[selectedCourse][selectedYear].subjects.map(
                (subject, index) => (
                  <label key={index} className="cd_subject-label">
                    <input
                      type="radio"
                      name="subject"
                      value={subject}
                      checked={selectedSubject === subject}
                      onChange={(e) => setSelectedSubject(e.target.value)}
                    />
                    {subject}
                  </label>
                )
              )}
            </div>
          )}
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
            </div>
            {selectedSubject ? (
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Grade</th>
                  </tr>
                </thead>
                <tbody>
                  {studentsData[selectedSubject] ? (
                    studentsData[selectedSubject].map((student, index) => (
                      <tr key={index}>
                        <td>{student.name}</td>
                        <td>{student.grade}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="2">No students found for this subject.</td>
                    </tr>
                  )}
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

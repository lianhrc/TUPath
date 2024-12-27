import React, { useState } from 'react';
import './AdminDashboard.css';
import { FaUsers, FaChartBar, FaSignOutAlt } from 'react-icons/fa'; // Importing icons

const AdminDashboard = () => {
  const [activeSection, setActiveSection] = useState('Users'); // State to track the active section

  return (
    <div className="admin-dashboard-container">
      {/* Sidebar */}
      <div className="adminsidebar">
        <nav>
          <ul>
            <li onClick={() => setActiveSection('Users')} className={activeSection === 'Users' ? 'active' : ''}>
              <FaUsers className="icon" />
              <span className="text">Users</span>
            </li>
            <li onClick={() => setActiveSection('Reports')} className={activeSection === 'Reports' ? 'active' : ''}>
              <FaChartBar className="icon" />
              <span className="text">Reports</span>
            </li>
            <li >
              <FaSignOutAlt className="icon" />
              <span className="text">Log Out</span>
            </li>
          </ul>
        </nav>
      </div>

      {/* Main Content */}
      <div className="admindashboard-content">
        {activeSection === 'Users' && <UsersSection />}
        {activeSection === 'Reports' && <ReportsSection />}
        {activeSection === 'LogOut' && <LogOutSection />}
      </div>
    </div>
  );
};

// Users Section Component
const UsersSection = () => {
    const [selectedType, setSelectedType] = useState('Students'); // State to track the selected user type
    
    const handleDropdownChange = (event) => {
      setSelectedType(event.target.value); // Update the selected type based on dropdown choice
    };
  
    // Sample data for Students and Employers
    const studentsData = [
      { name: 'John Doe', email: 'john.doe@example.com' },
      { name: 'Jane Smith', email: 'jane.smith@example.com' },
    ];
  
    const employersData = [
      { companyName: 'TechCorp', email: 'contact@techcorp.com', contact: '123-456-7890' },
      { companyName: 'DevSolutions', email: 'info@devsolutions.com', contact: '987-654-3210' },
    ];
  
    // Function to render the Students table
    const renderStudentsTable = () => {
      return (
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th></th> {/* Column header for action (Delete button) */}
            </tr>
          </thead>
          <tbody className=''>
            {studentsData.map((student, index) => (
              <tr key={index}>
                <td>{student.name}</td>
                <td>{student.email}</td>
                <td>
                  {/* Delete Button */}
                  <button
                    className="delete-btn"
                    onClick={() => handleDelete('student', index)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    };
  
    // Function to render the Employers table
    const renderEmployersTable = () => {
      return (
        <table>
          <thead>
            <tr>
              <th>Company Name</th>
              <th>Email</th>
              <th>Contact</th>
              <th></th> {/* Column header for action (Delete button) */}
            </tr>
          </thead>
          <tbody>
            {employersData.map((employer, index) => (
              <tr key={index}>
                <td>{employer.companyName}</td>
                <td>{employer.email}</td>
                <td>{employer.contact}</td>
                <td>
                  {/* Delete Button */}
                  <button
                    className="delete-btn"
                    onClick={() => handleDelete('employer', index)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    };
  
    // Handle the delete action
    const handleDelete = (type, index) => {
      if (type === 'student') {
        // Handle student deletion logic
        alert(`Deleted student at index ${index}`);
      } else if (type === 'employer') {
        // Handle employer deletion logic
        alert(`Deleted employer at index ${index}`);
      }
    };
  
    return (
      <div className="usersadminsection">
        <h2>Users</h2>
        <p>Manage and view all users here.</p>
  
        {/* Dropdown for selecting user type */}
        <div className="dropdown-container">
          <label htmlFor="user-type-dropdown" className="dropdown-label">
            Select User Type:
          </label>
          <select
            id="user-type-dropdown"
            className="user-type-dropdown"
            value={selectedType}
            onChange={handleDropdownChange}
          >
            <option value="Students">Students</option>
            <option value="Employers">Employers</option>
          </select>
        </div>
  
        {/* Users List Container */}
        <div className="userslistcontainer">
          <h3>{selectedType} List</h3>
          {selectedType === 'Students' ? renderStudentsTable() : renderEmployersTable()}
        </div>
      </div>
    );
  };
  

  

// Reports Section Component
const ReportsSection = () => {
  return (
    <div className='reportsadminsection'>
      <h2>Reports</h2>
      <p>View reports here.</p>
    </div>
  );
};


export default AdminDashboard;

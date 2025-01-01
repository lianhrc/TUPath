import React, { useState } from 'react';
import './AdminDashboard.css';
import { FaUsers, FaChartBar, FaSignOutAlt } from 'react-icons/fa'; // Importing icons
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement } from 'chart.js';


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
          {selectedType === 'Students' ? renderStudentsTable() : renderEmployersTable()}
        </div>
      </div>
    );
  };
  

  
// Register necessary components for Pie Chart
ChartJS.register(ArcElement, Title, Tooltip, Legend);

// Reports Section Component
const ReportsSection = () => {
    const [userType, setUserType] = useState('Students'); // Track selected user type (students/employers)
  
    // Sample data for demonstration
    const data = {
      Students: {
        totalUsers: 200,   // Total users
        newUsers: 50,      // New users
      },
      Employers: {
        totalUsers: 100,   // Total employers
        newUsers: 30,      // New employers
      },
    };
  
    // Pie chart data based on the selected user type
    const chartData = {
      labels: [`Total ${userType}`, `New ${userType}`],
      datasets: [
        {
          data: [data[userType].totalUsers, data[userType].newUsers],
          backgroundColor: ['rgba(75,192,192,0.6)', 'rgba(255,99,132,0.6)'],
          hoverBackgroundColor: ['rgba(75,192,192,0.8)', 'rgba(255,99,132,0.8)'],
        },
      ],
    };
  
    return (
      <div className='reportsadminsection'>
        <div className="reportsleftsection">
            <h2>Reports</h2>
            <p>View reports here.</p>
    
            {/* Radio buttons for selecting user type */}
            <div className="radio-buttons">
            <label>
                <input
                type="radio"
                name="userType"
                value="Students"
                checked={userType === 'Students'}
                onChange={() => setUserType('Students')}
                />
                Students
            </label>
            <label>
                <input
                type="radio"
                name="userType"
                value="Employers"
                checked={userType === 'Employers'}
                onChange={() => setUserType('Employers')}
                />
                Employers
            </label>
            </div>
            {/* Pie chart to display the data */}
            <div className="chart-container">
            <Pie data={chartData} options={{ responsive: true, plugins: { title: { display: true, text: `User Stats for ${userType}` } } }} />
            </div>
        </div>

        <div className="reports-section__right">
            <div className="reports-section__search">
                <label htmlFor="">Search</label>    
                <input type="search" />
            </div>
            <div className="reports-section__table-wrapper">
                <div className="reports-section__table-container">
                <table>
                    <thead>
                    <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Scores</th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr>
                        <td>John Doe</td>
                        <td>john.doe@example.com</td>
                        <td>10</td>
                    </tr>
                    <tr>
                        <td>Jane Smith</td>
                        <td>jane.smith@example.com</td>
                        <td>10</td>

                    </tr>
                    <tr>
                        <td>Jane Smith</td>
                        <td>jane.smith@example.com</td>
                        <td>10</td>

                    </tr>

                    <tr>
                        <td>Jane Smith</td>
                        <td>jane.smith@example.com</td>
                        <td>9</td>
                    </tr>

                    <tr>
                        <td>Jane Smith</td>
                        <td>jane.smith@example.com</td>
                        <td>9</td>
                    </tr>

                    <tr>
                        <td>Jane Smith</td>
                        <td>jane.smith@example.com</td>
                        <td>8</td>
                    </tr>

                     <tr>
                        <td>Jane Smith</td>
                        <td>jane.smith@example.com</td>
                        <td>8</td>
                    </tr>
                    <tr>
                        <td>Jane Smith</td>
                        <td>jane.smith@example.com</td>
                        <td>7</td>
                    </tr>

                     <tr>
                        <td>Jane Smith</td>
                        <td>jane.smith@example.com</td>
                        <td>7</td>
                    </tr>
                   
                    </tbody>
                </table>
                </div>
            </div>
            </div>


      </div>
    );
  };


export default AdminDashboard;

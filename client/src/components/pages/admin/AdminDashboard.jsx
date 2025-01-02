import React, { useState } from 'react';
import './AdminDashboard.css';
import { FaUsers, FaChartBar, FaSignOutAlt } from 'react-icons/fa'; // Importing icons
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import axiosInstance from '../../../services/axiosInstance';

const AdminDashboard = () => {
  const [activeSection, setActiveSection] = useState('Users'); // Track active section

  return (
    <div className="admin-dashboard-container">
      {/* Sidebar */}
      <div className="adminsidebar">
        <nav>
          <ul>
            <li
              onClick={() => setActiveSection('Users')}
              className={activeSection === 'Users' ? 'active' : ''}
            >
              <FaUsers className="icon" />
              <span className="text">Users</span>
            </li>
            <li
              onClick={() => setActiveSection('Reports')}
              className={activeSection === 'Reports' ? 'active' : ''}
            >
              <FaChartBar className="icon" />
              <span className="text">Reports</span>
            </li>
            <li>
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
      </div>
    </div>
  );
};

// Users Section Component
const UsersSection = () => {
  const [selectedType, setSelectedType] = useState('Students'); // Track user type
  const [usersData, setUsersData] = useState([]); // Store fetched users
  const [loading, setLoading] = useState(false); // Loading state

  const handleDropdownChange = (event) => {
    setSelectedType(event.target.value);
  };

  // Fetch users whenever the selected type changes
  React.useEffect(() => {
    setLoading(true);
    axiosInstance
      .get(`/api/users?type=${selectedType}`)
      .then((response) => {
        if (response.data.success) {
          setUsersData(response.data.users);
        }
      })
      .catch((error) => {
        console.error('Error fetching users:', error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [selectedType]);

  // Render table dynamically based on selected type
  const renderTable = () => {
    if (loading) {
      return <p>Loading...</p>;
    }

    if (selectedType === 'Students') {
      return (
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
            </tr>
          </thead>
          <tbody>
            {usersData.map((user, index) => (
              <tr key={index}>
                <td>{`${user.profileDetails.firstName} ${user.profileDetails.lastName}`}</td>
                <td>{user.email}</td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    }

    return (
      <table>
        <thead>
          <tr>
            <th>Company Name</th>
            <th>Email</th>
            <th>Contact</th>
          </tr>
        </thead>
        <tbody>
          {usersData.map((user, index) => (
            <tr key={index}>
              <td>{user.profileDetails.companyName}</td>
              <td>{user.email}</td>
              <td>{user.profileDetails.contact}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  return (
    <div className="usersadminsection">
      <h2>Users</h2>
      <label>Select User Type:</label>
      <select value={selectedType} onChange={handleDropdownChange}>
        <option value="Students">Students</option>
        <option value="Employers">Employers</option>
      </select>
      <div className="userslistcontainer">{renderTable()}</div>
    </div>
  );
};

// Reports Section Component
const ReportsSection = () => {
  const [userType, setUserType] = useState('Students');

  // Sample data for demonstration
  const data = {
    Students: { totalUsers: 200, newUsers: 50 },
    Employers: { totalUsers: 100, newUsers: 30 },
  };

  const chartData = {
    labels: [`Total ${userType}`, `New ${userType}`],
    datasets: [
      {
        data: [data[userType].totalUsers, data[userType].newUsers],
        backgroundColor: ['rgba(75,192,192,0.6)', 'rgba(255,99,132,0.6)'],
      },
    ],
  };

  return (
    <div className="reportsadminsection">
      <div className="reportsleftsection">
        <h2>Reports</h2>
        <div>
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
        <div className="chart-container">
          <Pie data={chartData} options={{ responsive: true, plugins: { title: { display: true, text: `User Stats for ${userType}` } } }} />
        </div>
      </div>
    </div>
  );
};

// Register Pie chart components
ChartJS.register(ArcElement, Title, Tooltip, Legend);

export default AdminDashboard;

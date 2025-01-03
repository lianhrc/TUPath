import React, { useState, useEffect } from 'react';
import './AdminDashboard.css';
import { FaUsers, FaChartBar, FaSignOutAlt, FaTags } from 'react-icons/fa'; // Importing icons
import { Pie, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
} from 'chart.js';
import axiosInstance from '../../../services/axiosInstance';

ChartJS.register(CategoryScale, LinearScale, Title, Tooltip, Legend, ArcElement, BarElement);

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
            <li
              onClick={() => setActiveSection('Tags')}
              className={activeSection === 'Tags' ? 'active' : ''}
            >
              <FaTags className="icon" />
              <span className="text">Tags</span>
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
        {activeSection === 'Tags' && <TagChart />}
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
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const response = await axiosInstance.get(`/api/users?type=${selectedType}`);
        if (response.data.success) {
          setUsersData(response.data.users);
        }
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [selectedType]);

  // Render table dynamically based on selected type
  const renderTable = () => {
    if (loading) return <p>Loading...</p>;

    if (usersData.length === 0) return <p>No users found.</p>;

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
            {usersData.map((user, index) => {
              const firstName = user?.profileDetails?.firstName || 'N/A';
              const lastName = user?.profileDetails?.lastName || 'N/A';
              return (
                <tr key={index}>
                  <td>{`${firstName} ${lastName}`}</td>
                  <td>{user?.email || 'N/A'}</td>
                </tr>
              );
            })}
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
          {usersData.map((user, index) => {
            const companyName = user?.profileDetails?.companyName || 'N/A';
            const contact = user?.profileDetails?.contact || 'N/A';
            return (
              <tr key={index}>
                <td>{companyName}</td>
                <td>{user?.email || 'N/A'}</td>
                <td>{contact}</td>
              </tr>
            );
          })}
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
  const [userStats, setUserStats] = useState({ studentCount: 0, employerCount: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserStats = async () => {
      try {
        const response = await axiosInstance.get('/api/user-stats');
        if (response.data.success) {
          setUserStats({
            studentCount: response.data.studentCount,
            employerCount: response.data.employerCount,
          });
        }
      } catch (error) {
        console.error('Error fetching user stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserStats();
  }, []);

  const chartData = {
    labels: ['Students', 'Employers'],
    datasets: [
      {
        data: [userStats.studentCount, userStats.employerCount],
        backgroundColor: ['#36A2EB', '#FF6384'],
      },
    ],
  };

  return (
    <div className="reportsadminsection">
      <h2>Reports</h2>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="chart-container">
          <Pie data={chartData} options={{ responsive: true, plugins: { legend: { display: true } } }} />
        </div>
      )}
    </div>
  );
};

// Tags Section Component
const TagChart = () => {
  const [tagData, setTagData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTagData = async () => {
      try {
        const response = await axiosInstance.get('/api/student-tags');
        if (response.data.success) {
          setTagData(response.data.tags);
        }
      } catch (error) {
        console.error('Error fetching tag data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTagData();
  }, []);

  const chartData = {
    labels: tagData.map((tag) => tag._id), // Tag names
    datasets: [
      {
        label: 'Number of Students Excelling',
        data: tagData.map((tag) => tag.count), // Number of students
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 2,
      },
    ],
  };

  return (
    <div>
      <h2>Students Excelling in Different Tags</h2>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <Bar
          data={chartData}
          options={{
            responsive: true,
            plugins: {
              legend: { display: false },
              title: { display: true, text: 'Students Excelling by Tag' },
            },
            scales: {
              x: { title: { display: true, text: 'Tags' } },
              y: { title: { display: true, text: 'Number of Students' } },
            },
          }}
        />
      )}
    </div>
  );
};

export default AdminDashboard;

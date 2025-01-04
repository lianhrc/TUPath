import React, { useState, useEffect } from 'react';
import './AdminDashboard.css';
import { FaUsers, FaChartBar, FaSignOutAlt } from 'react-icons/fa'; // Importing icons
import { Pie, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement, CategoryScale, LinearScale, BarElement} from 'chart.js';
import axiosInstance from '../../../services/axiosInstance';
import { FaTags } from 'react-icons/fa';
ChartJS.register(CategoryScale, LinearScale, Title, Tooltip, Legend, ArcElement, BarElement);
import StudentListModal from '../../popups/StudentListModal';



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
        {activeSection === 'Tags' && (console.log('Rendering TagChart'), <TagChart />)}
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
const TagChart = () => {
  const [tagData, setTagData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTag, setSelectedTag] = useState(null);
  const [students, setStudents] = useState([]);
  const [studentsLoading, setStudentsLoading] = useState(false);

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

  const handleBarClick = async (event, elements) => {
      console.log('Bar clicked', elements); // Debugging

      if (elements.length > 0) {
          const index = elements[0].index; // Index of the clicked bar
          const tag = tagData[index]._id; // Get tag from clicked bar
          console.log('Selected tag:', tag); // Debugging
          setSelectedTag(tag);

          setStudentsLoading(true);
          try {
              const response = await axiosInstance.get('/api/students-by-tag', { params: { tag } });
              if (response.data.success) {
                  console.log('API response for students:', response.data); // Debugging
                  setStudents(response.data.students);
              }
          } catch (error) {
              console.error('Error fetching students:', error);
          } finally {
              setStudentsLoading(false);
          }
      }
  };

  const chartData = {
      labels: tagData.map((tag) => tag._id),
      datasets: [{
          label: 'Number of Students Excelling',
          data: tagData.map((tag) => tag.count),
          backgroundColor: 'rgba(75, 192, 192, 0.6)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 2,
          barThickness: 80,
          maxBarThickness: 100,
      }],
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
                      onClick: handleBarClick,
                  }}
              />
          )}

    {selectedTag && (
        <StudentListModal
            tag={selectedTag}
            students={students}
            onClose={() => setSelectedTag(null)}
            loading={studentsLoading}
        />
    )}
      </div>
  );
};

// Register Pie chart components
ChartJS.register(ArcElement, Title, Tooltip, Legend);

export default AdminDashboard;

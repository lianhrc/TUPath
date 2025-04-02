import React, { useState, useEffect, useMemo} from 'react';
import './AdminDashboard.css';
import { FaUsers, FaChartBar, FaSignOutAlt, FaTags } from 'react-icons/fa'; // Importing 
import WordCloud from "react-d3-cloud";
import { Pie, Bar } from 'react-chartjs-2';
import tupicon from '../../../assets/logo.png';
import irjpicon from '../../../assets/irjplogo.png';
import StudentListModal from '../../popups/StudentListModal';
import AuthContext from '../../AuthProvider';
import axiosInstance from '../../../services/axiosInstance';
import { useNavigate } from 'react-router-dom';

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

ChartJS.register(CategoryScale, LinearScale, Title, Tooltip, Legend, ArcElement, BarElement);

const AdminDashboard = () => {
  const [activeSection, setActiveSection] = useState('Users'); // Track active section
  const [authChecked, setAuthChecked] = useState(false); // Track if authentication check is done
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await axiosInstance.get('/check-auth');
        if (response.data.success) {
          setAuthChecked(true);
        } else {
          navigate('/adminlogin');
        }
      } catch (error) {
        if (error.response?.status === 401) {
          console.error('User not authenticated:', error.response.data.message);
          navigate('/adminlogin');
        } else {
          console.error('Unexpected error during authentication:', error);
        }
      }
    };
  
    checkAuth();
  }, [navigate]);
  

  const handleLogout = async () => {
    try {
      // Clear any stored admin auth data first
      localStorage.removeItem('adminToken'); // If you're using token-based auth
      
      const response = await axiosInstance.post('/api/admin/logout');
      if (response.data.success) {
        // Force navigation to login and prevent back navigation
        window.location.replace('/adminlogin');
      } else {
        alert('Failed to log out.');
      }
    } catch (error) {
      console.error('Error during logout:', error);
      alert('An error occurred while logging out.');
    }
  };

  if (!authChecked) {
    return <div>Loading...</div>; // Show loading screen until authentication is checked
  }

  return (
    <div className="admin-dashboard-container">
      {/* Sidebar */}
      <div className="adminsidebar">
        <nav>
          <ul>
            <li className="iconli">
              <div className="imgcontaineradmin">
                <img className="irjp" src={irjpicon} alt="IRJP Logo" />
                <img className="tup" src={tupicon} alt="TUP Logo" />
              </div>
            </li>
            <li
              onClick={() => setActiveSection('Users')}
              className={activeSection === 'Users' ? 'active' : ''}
            >
              <FaUsers className="icon" />
              <span className="text">Users</span>
            </li>

            <li
              onClick={() => setActiveSection('Tags')}
              className={activeSection === 'Tags' ? 'active' : ''}
            >
              <FaTags className="icon" />
              <span className="text">Best</span>
            </li>

            <li
            onClick={() => setActiveSection('ActiveTagSection')}
            className={activeSection === 'ActiveTagSection' ? 'active' : ''}
          >
            <FaTags className="icon" />
            <span className="text"> Popular</span>
          </li>

            <li onClick={handleLogout}>
              <FaSignOutAlt className="icon" />
              <span className="text">Log Out</span>
            </li>

           
          </ul>
        </nav>
      </div>

      {/* Main Content */}
      <div className="admindashboard-content">
        {activeSection === 'Users' && <UsersSection />}
        {activeSection === 'Tags' && <TagChart />}
        {activeSection === 'ActiveTagSection' && <ActiveTags />}
      </div>
    </div>
  );
};

// Users Section Component
const UsersSection = () => {
  const [selectedType, setSelectedType] = useState('Students');
  const [usersData, setUsersData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userStats, setUserStats] = useState({ studentCount: 0, employerCount: 0 });

  const handleDropdownChange = (event) => {
    setSelectedType(event.target.value);
  };

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
      }
    };

    fetchUsers();
    fetchUserStats();
  }, [selectedType]);

  const handleDelete = async (userId) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this user?');
    if (!confirmDelete) return;

    try {
      const response = await axiosInstance.delete(`/api/manage-users/${userId}?type=${selectedType}`);
      if (response.data.success) {
        alert('User deleted successfully!');
        setUsersData((prevUsers) => prevUsers.filter((user) => user._id !== userId));
      } else {
        alert('Failed to delete the user.');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('An error occurred while deleting the user.');
    }
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    try {
      // Determine the user type based on the selected dropdown value
      const userType = selectedType === 'Students' ? 'student' : 'employer';
      
      const response = await axiosInstance.put(`/api/admin/toggle-status/${userType}/${userId}`);
      
      if (response.data.success) {
        // Update the local state to reflect the change
        setUsersData(prevUsers => 
          prevUsers.map(user => 
            user._id === userId ? { ...user, status: !currentStatus } : user
          )
        );
      } else {
        alert('Failed to update user status.');
      }
    } catch (error) {
      console.error('Error toggling user status:', error);
      alert('An error occurred while updating the user status.');
    }
  };

  const chartData = {
    labels: ['Students', 'Employers'],
    datasets: [
      {
        data: [userStats.studentCount, userStats.employerCount],
        backgroundColor: ['rgba(54, 162, 235, 0.6)', 'rgba(255, 99, 132, 0.6)'],
        hoverBackgroundColor: ['rgba(54, 162, 235, 0.9)', 'rgba(255, 99, 132, 0.9)'],
      },
    ],
  };

  const renderTable = () => {
    if (loading) return <p>Loading...</p>;

    if (usersData.length === 0) return <p>No users found.</p>;

    return (
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Contact</th>
            <th></th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {usersData.map((user, index) => (
            <tr key={index}>
              <td>{`${user?.profileDetails?.firstName || 'N/A'} ${user?.profileDetails?.lastName || 'N/A'}`}</td>
              <td>{user?.email || 'N/A'}</td>
              <td>{user?.profileDetails?.contact || 'N/A'}</td>
              <td>
                <button className="delete-btn" onClick={() => handleDelete(user._id)}>
                  Delete
                </button>
              </td>
              <td>
                <button 
                  className={`status-btn ${user.status ? 'active' : 'inactive'}`}
                  onClick={() => handleToggleStatus(user._id, user.status)}
                >
                  {user.status ? 'Deactivate' : 'Activate'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  return (
    <div className="usersadminsection">
      <div className="leftusersadminsection">
        <h2>Users</h2>
        <div className="dropdownad-container">
          <label className="dropdownad-label">Select User Type:</label>
          <select className="user-type-dropdown" value={selectedType} onChange={handleDropdownChange}>
            <option value="Students">Students</option>
            <option value="Employers">Employers</option>
          </select>
        </div>
        <div className="userslistcontainer">{renderTable()}</div>
      </div>

      <div className="rightusersadminsection">
        <div className="chart-container">
          <Pie data={chartData} options={{ responsive: true, plugins: { legend: { display: true } } }} />
        </div>
      </div>
    </div>
  );
};


// Tags Section Component
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
    if (elements.length > 0) {
      const index = elements[0].index;
      const tag = tagData[index]._id;
      setSelectedTag(tag);

      setStudentsLoading(true);
      try {
        const response = await axiosInstance.get('/api/students-by-tag', { params: { tag } });
        if (response.data.success) {
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
    datasets: [
      {
        label: 'Number of Students Excelling',
        data: tagData.map((tag) => tag.count),
        backgroundColor: '#e0b8b8',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 0,
      },
    ],
  };

  return (
    <div className="userbestsadminsection">
      <h2>Top Performing Students in Various Categories</h2>
      <div className="userbestsadmincontianer">
        {loading ? (
          <p>Loading...</p>
        ) : (
          <Bar
            data={chartData}
            options={{
              responsive: true,
              plugins: { legend: { display: false } },
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
    </div>
  );
};



// Popular Tags Section Component
const ActiveTags = () => {
  const [hoveredWord, setHoveredWord] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  const words = [
    { text: "React", value: 30 },
    { text: "Node.js", value: 5 },
    { text: "AI", value: 5 },
    { text: "Machine Learning", value: 5 },
    { text: "Cybersecurity", value: 5 },
    { text: "Python", value: 5 },
    { text: "JavaScript", value: 5 },
    { text: "Data Science", value: 5 },
    { text: "Web Development", value: 30 },
  ];

  // Font size mapping
  const fontSizeMapper = (word) => Math.log2(word.value) * 10;

  // Fixed colors for consistency
  const colors = ["#FF5733", "#33FF57", "#3357FF", "#F39C12", "#8E44AD", "#E91E63", "#03A9F4"];
  const colorMap = useMemo(() => {
    return words.reduce((acc, word, index) => {
      acc[word.text] = colors[index % colors.length]; // Assign fixed colors
      return acc;
    }, {});
  }, []);

  // Memoized word positions (para hindi gumalaw sa hover)
  const fixedWords = useMemo(() => words, []);

  return (
    <div style={{ textAlign: "center", padding: "20px", position: "relative" }}>
      <h2 style={{ color: "white", fontSize: 20 }}>Popular Project Tags & Categories</h2>
      <span style={{ color: "#B0B0B0" }}>Trending subjects & tech stacks used</span>

      {/* Word Cloud */}
      <div style={{ width: "100%", height: "300px", overflow: "hidden", marginTop: 50 }}>
        <WordCloud
          data={fixedWords}
          fontSize={fontSizeMapper}
          padding={5}
          fill={(word) => colorMap[word.text]} // Fixed color per word
          width={800}
          height={300}
          rotate={0}
          spiral="archimedean" // Stable layout
          onWordMouseOver={(event, d) => {
            setHoveredWord(null);

          }}
          onWordMouseMove={(event) => {
            setHoveredWord(null);

          }}
          onWordMouseOut={() => {
            setHoveredWord(null);
          }}
        />
      </div>

      {/* Tooltip */}
      {hoveredWord && (
        <div
          style={{
            position: "absolute",
            backgroundColor: "black",
            color: "white",
            padding: "5px 10px",
            borderRadius: "5px",
            fontSize: "14px",
            top: tooltipPosition.y + 10,
            left: tooltipPosition.x + 10,
            pointerEvents: "none",
            whiteSpace: "nowrap",
          }}
        >
          {hoveredWord.text}: {hoveredWord.value}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;

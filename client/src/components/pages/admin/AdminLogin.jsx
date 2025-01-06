import React, { useState, useEffect } from 'react';
import './AdminLogin.css';
import { motion } from 'framer-motion';
import adminheadericon from '../../../assets/logoicon2.png';
import adminloginicon from '../../../assets/user-gear.png';
import axiosInstancev2 from '../../../services/axiosInstancev2';
import { useNavigate } from 'react-router-dom';

const AdminLogin = () => {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const navigate = useNavigate();

  // Check authentication status on component mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await axiosInstancev2.get('/check-auth');
        if (response.data.success) {
          // If already authenticated, redirect to admin dashboard
          navigate('/admindashboard');
        }
      } catch (error) {
        // If not authenticated, allow staying on login page
        console.log('Not authenticated, staying on login page');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSignupRedirect = () => {
    navigate('/adminsignup');
  }

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await axiosInstancev2.post('/api/admin/login', formData);
      if (response.data.success) {
        navigate('/admindashboard');
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Login failed');
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="admin-login-container">
      <header className="admin-header">
        <img src={adminheadericon} alt="Admin Header Icon" />
      </header>
      <motion.div
        className=""
        initial={{ opacity: 0, translateY: 30 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{
          duration: 0.6,
          ease: [0.25, 0.1, 0.25, 1],
        }}
        viewport={{ once: true, amount: 0.1 }}
      >
        <div className="loginboxadmin">
          <img src={adminloginicon} alt="Admin Login Icon" />
          <h5>Admin</h5>
        </div>
        <div className="login-box">
          {error && <p className="error-message">{error}</p>}
          <form onSubmit={handleLogin}>
            <input
              type="text"
              name="username"
              placeholder="Username"
              value={formData.username}
              onChange={handleChange}
              required
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
            />
            <div className="adminloginbtn">
              <button type="submit">Login</button>
              <button type="submit" onClick={handleSignupRedirect}>Register</button>
            </div>

          </form>
          <p className="footer-note">Only authorized personnel are allowed to access this panel.</p>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminLogin;

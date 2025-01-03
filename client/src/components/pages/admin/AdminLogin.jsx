import React from 'react';
import './AdminLogin.css';
import { motion } from 'framer-motion';
import adminheadericon from '../../../assets/logoicon2.png';
import adminloginicon from '../../../assets/user-gear.png';
import { useState } from 'react';
import axiosInstance from '../../../services/axiosInstance';
import { useNavigate } from 'react-router-dom';

const AdminLogin = () => {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const navigate = useNavigate();

  const handleSignupRedirect = () => {
    navigate('/adminsignup');
  }

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');

    axiosInstance
      .post('/api/admin/login', formData)
      .then((response) => {
        if (response.data.success) {
          // Save token or session data
          localStorage.setItem('adminToken', response.data.token);

          // Redirect to admin dashboard
          window.location.href = '/admindashboard';
        } else {
          setError(response.data.message || 'Invalid login credentials.');
        }
      })
      .catch((error) => {
        console.error('Error during login:', error);
        setError(error.response?.data?.message || 'An error occurred. Please try again.');
      });
  };

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

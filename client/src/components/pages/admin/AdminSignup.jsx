import React, { useState } from 'react';
import './AdminSignup.css';
import axiosInstance from '../../../services/axiosInstance';
import adminheadericon from '../../../assets/logoicon2.png';
import adminloginicon from '../../../assets/user-gear.png';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const AdminSignup = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };
  const navigate = useNavigate();

  const handleLoginRedirect = () =>{
    navigate('/adminlogin');
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Basic validation
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    // Send data to backend
    axiosInstance
      .post('/api/admin/signup', {
        username: formData.username,
        email: formData.email,
        password: formData.password,
      })
      .then((response) => {
        if (response.data.success) {
          setSuccess("Admin account created successfully!");
          setFormData({ username: '', email: '', password: '', confirmPassword: '' });
        } else {
          setError(response.data.message || "Failed to create admin account.");
        }
      })
      .catch((error) => {
        console.error("Error creating admin account:", error);
        setError(error.response?.data?.message || "Something went wrong.");
      });
  };

  return (
    <div className="admin-signup-container">
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
        <div className="signupboxadmin">
          <img src={adminloginicon} alt="Admin Login Icon" />
          <h5>Admin Signup</h5>
        </div>
        <div className="adminsignup-box">
        <form onSubmit={handleSubmit} className="admin-signup-form">
          {error && <p className="error-message">{error}</p>}
          {success && <p className="success-message">{success}</p>}

          <input
          type="text"
          placeholder="Username"
          id="username"
          name="username"
          value={formData.username}
          onChange={handleChange}
          required
        />

           <input
              type="email"
              placeholder="Email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
            <input
              type="password"
              placeholder="Password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
            <input
              type="password"
              placeholder="Confirm Password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />


        <div className="adminsignupbtn">
        <button type="submit" className="signup-button">Sign Up</button>
        <button className='btnadminsignup' type="submit" onClick={handleLoginRedirect}>Login</button>
        </div>
    </form>
  </div>
</motion.div>
</div>
  );
};

export default AdminSignup;

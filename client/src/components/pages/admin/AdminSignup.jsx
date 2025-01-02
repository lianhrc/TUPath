import React, { useState } from 'react';
import axiosInstance from '../../../services/axiosInstance';


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
      <h2>Admin Signup</h2>
      <form onSubmit={handleSubmit} className="admin-signup-form">
        {error && <p className="error-message">{error}</p>}
        {success && <p className="success-message">{success}</p>}

        <div className="form-group">
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="confirmPassword">Confirm Password</label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />
        </div>

        <button type="submit" className="signup-button">Sign Up</button>
      </form>
    </div>
  );
};

export default AdminSignup;

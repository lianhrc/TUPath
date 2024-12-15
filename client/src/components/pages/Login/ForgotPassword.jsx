import React, { useState } from 'react';
import axiosInstance from '../../../services/axiosInstance.js';
import "./ForgotPassword.css"
import Header from '../../../components/common/headerlogsign';


function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await axiosInstance.post('/api/forgot-password', { email });
      setMessage(response.data.message);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
      setMessage('');
    }
  };

  return (
    <div className="ForgotPassword">
    <Header />
     <div className="forgotcontainermain">
      <div className="Forgot_container">
      <h2>Forgot Password</h2>
          <form onSubmit={handleSubmit}>
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your registered email"
              required
            />
            <button className='forgotbutton' type="submit">Send Reset Link</button>
          </form>
          {message && <p className="success-message">{message}</p>}
          {error && <p className="error-message">{error}</p>}
          </div>
     </div>
    </div>
  );
}

export default ForgotPassword;

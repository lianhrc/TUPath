import React from 'react'
import logo from '../assets/logoicon.png'; // Adjust the path as necessary
import '../components/header.css'; // Import CSS if needed

const header = () => {
  return (
    <header className="navbar">
      <img src={logo} alt="Tupath Logo" className="logo" />
      <div className="auth-buttons">
        <nav className="nav-links">
          <a href="/">For Students</a>
          <a href="/">For Employers</a>
        </nav>
        <button className="login-btn">Login</button>
        <button className="signup-btn">Sign Up</button>
      </div>
    </header>
  )
}

export default header

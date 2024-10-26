import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/logoicon.png'; // Adjust the path as necessary
import '../components/header.css'; // Import CSS if needed



const Header = () => {
  return (
    <header className="navbar">
      <a className='lefticon' href="/">
        <img src={logo} alt="Tupath Logo" className="logo" />
      </a>
      <div className="auth-buttons">
        <nav className="nav-links">
          <a href="/Studentlandpage">For Students</a>
          <a href="/Employerlandpage">For Employers</a>
        </nav>
        <a href="/login" className="login-btn">Login</a>
        <a href="/LoginRoles" className="signup-btn">Sign Up</a>
      </div>
    </header>
  );
};

export default Header;
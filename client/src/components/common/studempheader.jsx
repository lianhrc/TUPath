import React from 'react';
import logo from '../../assets/logoicon.png'; // Adjust the path as necessary
import './studempheader.css'; // Import CSS if needed



const Header = () => {
  return (
    <header className="navbar">
      <a className='lefticon' href="/">
        <img src={logo} alt="Tupath Logo" className="logo" />
      </a>
      <div className="studempheader-buttons">
        <nav className="studempheader-links">
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
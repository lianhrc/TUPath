import React from 'react';
import logo from '../../assets/logoicon2.png'; // Adjust the path as necessary
import './header.css'; // Import CSS if needed



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
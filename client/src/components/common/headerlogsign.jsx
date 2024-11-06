import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../../assets/logoicon.png'; // Adjust the path as necessary
import './headerlogsign.css'; // Import CSS if needed



const Header = () => {
  return (
    <header className="navbarlogsign">
      <a className='lefticon' href="/">
        <img src={logo} alt="Tupath Logo" className="logo" />
      </a>
      <div className="navbarlogsignauth-buttons">
        <nav className="navbarlogsign-links">
          <a href="/Studentlandpage">For Students</a>
          <a href="/Employerlandpage">For Employers</a>
        </nav>
        <a href="/login" className="login-btn">Login</a>
        <a href="/LoginRoles" className="navbarsign-btn">Sign Up</a>
      </div>
    </header>
  );
};

export default Header;
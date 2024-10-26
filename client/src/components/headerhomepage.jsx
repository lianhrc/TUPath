import React from 'react';
import logo from '../assets/logoicon.png'; // Adjust the path as necessary
import homeicon from '../assets/home.png'; // Replace with actual icon path
import messageicon from '../assets/email.png'; // Replace with actual icon path
import notificon from '../assets/notif.png'; // Replace with actual icon path
import profileicon from '../assets/profileicon.png'; // Replace with actual icon path
import '../components/headerhomepage.css'; // Import CSS if needed

function HeaderHomepage() {
  return (
    <header className="homepagenavbar">
      <a className="lefticon" href="/">
        <img src={logo} alt="Tupath Logo" className="homepagelogo" />
      </a>
      <div className="search-container">
        <input type="text" className="search-input" placeholder="Search..." />
      </div>
      <div className="icon-buttons">
        <nav className="homepagenav-links">
          <a href="/StudentHomepage"><img src={homeicon} alt="Home" className="nav-icon" /></a>
          <a href="/"><img src={messageicon} alt="Messages" className="nav-icon" /></a>
          <a href="/"><img src={notificon} alt="Notifications" className="nav-icon" /></a>
          <a href="/StudentProfile" className='profileiconbutton'><img src={profileicon} alt="Profile" className="nav-icon" /></a>
        </nav>
      </div>
    </header>
  );
}

export default HeaderHomepage;

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; // Import Link
import logo from '../../assets/logoicon.png';
import homeicon from '../../assets/home.png';
import messageicon from '../../assets/email.png';
import notificon from '../../assets/notif.png';
import profileicon from '../../assets/profileicon.png';
import './headerhomepage.css';

function HeaderHomepage() {
  const [isNotifOpen, setNotifOpen] = useState(false);
  const [isProfileOpen, setProfileOpen] = useState(false);

  // Sample dynamic notifications data
  const notifications = [
    { id: 1, name: "Student one", message: "Sample notification text" },
    { id: 2, name: "Student two", message: "Sample notification text" },
    { id: 3, name: "Student three", message: "Sample notification text" },
  ];

  const toggleNotifDropdown = () => {
    setNotifOpen(!isNotifOpen);
    setProfileOpen(false);
  };

  const toggleProfileDropdown = () => {
    setProfileOpen(!isProfileOpen);
    setNotifOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.dropdown')) {
        setNotifOpen(false);
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="homepagenavbar">
      <a className="lefticon" href="/StudentHomepage">
        <img src={logo} alt="Tupath Logo" className="homepagelogo" />
      </a>
      <div className="search-container">
        <input type="text" className="search-input" placeholder="Search..." />
      </div>
      <div className="icon-buttons">
        <nav className="homepagenav-links">
          <a href="/StudentHomepage"><img src={homeicon} alt="Home" className="nav-icon" /></a>
          <a href="/Inboxpage"><img src={messageicon} alt="Messages" className="nav-icon" /></a>

          <div className="dropdown" onClick={toggleNotifDropdown}>
            <img src={notificon} alt="Notifications" className="nav-icon" />
            {isNotifOpen && (
              <div className="dropdown-menu notifications-menu">
                <h3>Notifications</h3>
                {notifications.map((notif) => (
                  <Link to="/Inboxpage" key={notif.id} className="notification-item">
                    <img src={profileicon} alt="Profile" className="notification-icon" />
                    <div>
                      <p><strong>{notif.name}</strong></p>
                      <p>{notif.message}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="dropdown" onClick={toggleProfileDropdown}>
            <img src={profileicon} alt="Profile" className="nav-icon" />
            {isProfileOpen && (
              <div className="dropdown-menu profile-menu">
                <a href="/StudentProfile">Profile</a>
                <a href="/Settings">Settings</a>
                <a href="/">Log Out</a>
              </div>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}

export default HeaderHomepage;

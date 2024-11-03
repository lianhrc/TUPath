import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import logo from '../../assets/logoicon.png';
import homeicon from '../../assets/home.png';
import messageicon from '../../assets/email.png';
import notificon from '../../assets/notif.png';
import profileicon from '../../assets/profileicon.png';
import './headerhomepage.css';

function HeaderHomepage() {
  const [isNotifOpen, setNotifOpen] = useState(false);
  const [isProfileOpen, setProfileOpen] = useState(false);

  const handleLogout = () => {
    // Clear localStorage to remove JWT token and any user data
    localStorage.clear();

    // Redirect to the login page without allowing back navigation
    window.location.replace('/login');
  };

  // Prevent browser caching to avoid accessing previous pages after logout
  useEffect(() => {
    const handlePopState = () => {
      window.history.pushState(null, '', window.location.href);
    };

    // Push the state on load
    window.history.pushState(null, '', window.location.href);

    // Listen for popstate event
    window.onpopstate = handlePopState;

    // Cleanup listener on unmount
    return () => {
      window.onpopstate = null;
    };
  }, []);

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
      <Link className="lefticon" to="/StudentHomepage">
        <img src={logo} alt="Tupath Logo" className="homepagelogo" />
      </Link>
      <div className="search-container">
        <input type="text" className="search-input" placeholder="Search..." />
      </div>
      <div className="icon-buttons">
        <nav className="homepagenav-links">
          <Link to="/StudentHomepage">
            <img src={homeicon} alt="Home" className="nav-icon" />
          </Link>
          <Link to="/Inboxpage">
            <img src={messageicon} alt="Messages" className="nav-icon" />
          </Link>

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
                <Link to="/StudentProfile">Profile</Link>
                <Link to="/Settings">Settings</Link>
                <Link  onClick={handleLogout}>Logout</Link>
              </div>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}

export default HeaderHomepage;

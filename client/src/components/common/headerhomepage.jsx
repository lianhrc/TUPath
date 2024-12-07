import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../../services/axiosInstance';
import logo from '../../assets/logoicon.png';
import homeicon from '../../assets/home.png';
import messageicon from '../../assets/email.png';
import { motion } from 'framer-motion';
import notificon from '../../assets/notif.png';
import profileicon from '../../assets/profileicon.png';
import Loader from '../common/Loader';
import './headerhomepage.css';

function HeaderHomepage() {
  const [isNotifOpen, setNotifOpen] = useState(false);
  const [isProfileOpen, setProfileOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [profileData, setProfileData] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleLogout = () => {
    setIsLoading(true);
    setTimeout(() => {
      localStorage.clear();
      window.location.replace('/login');
    }, 3000);
  };

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const response = await axiosInstance.get('/api/profile');
        if (response.data.success) {
          setProfileData(response.data.profile.profileDetails || {});
        }
      } catch (error) {
        console.error('Error fetching profile data:', error);
      }
    };

    fetchProfileData();
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      window.history.pushState(null, '', window.location.href);
    };

    window.history.pushState(null, '', window.location.href);
    window.onpopstate = handlePopState;

    return () => {
      window.onpopstate = null;
    };
  }, []);

  const handleSearch = async (event) => {
    const query = event.target.value;
    setSearchQuery(query);
    if (query.length > 2) {
      setIsSearching(true);
      try {
        const response = await axiosInstance.get(`/api/search`, { params: { query } });
        if (response.data.success) {
          setSearchResults(response.data.results);
        }
      } catch (error) {
        console.error('Error during search:', error);
      } finally {
        setIsSearching(false);
      }
    } else {
      setSearchResults([]);
    }
  };

  const toggleNotifDropdown = () => {
    setNotifOpen(!isNotifOpen);
    setProfileOpen(false);
  };

  const toggleProfileDropdown = () => {
    setProfileOpen(!isProfileOpen);
    setNotifOpen(false);
  };

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

  const profileImageUrl = profileData.profileImg?.startsWith('/')
    ? `http://localhost:3001${profileData.profileImg}`
    : profileData.profileImg || profileicon;

    const dropdownVariants = {
      hidden: {
        opacity: 0,
        scale: 0.9,
        y: -10,
      },
      visible: {
        opacity: 1,
        scale: 1,
        y: 0,
        transition: {
          duration: 0.3,
          ease: 'easeInOut',
        },
      },
      exit: {
        opacity: 0,
        scale: 0.9,
        y: -10,
        transition: {
          duration: 0.2,
        },
      },
    };
    

  return (
    <>
      {isLoading ? (
        <Loader />
      ) : (
        <header className="homepagenavbar">
          <Link className="lefticon" to="/Homepage">
            <img src={logo} alt="Tupath Logo" className="homepagelogo" />
          </Link>
          <div className="search-container">
            <input
              type="text"
              className="search-input"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={handleSearch}
            />
            {isSearching && <p>Searching...</p>}
            {searchResults.length > 0 && (
              <div className="search-results">
              {searchResults.map((result, index) => (
                <Link
                  to={`/profile/${result._id}`} // Assuming `_id` is the unique identifier
                  key={index}
                  className="search-result-item"
                >
                  <img
                    src={result.profileDetails?.profileImg || profileicon}
                    alt={result.name}
                    className="search-result-image"
                  />
                  <div>
                    <p><strong>{result.name}</strong></p>
                    <p>{result.email}</p>
                  </div>
                </Link>
              ))}
            </div>
            )}
          </div>
          <div className="icon-buttons">
            <nav className="homepagenav-links">
              <Link to="/Homepage">
                <img src={homeicon} alt="Home" className="nav-icon" />
              </Link>
              <Link to="/Inboxpage">
                <img src={messageicon} alt="Messages" className="nav-icon" />
              </Link>
              <div className="dropdown" onClick={toggleNotifDropdown}>
                <img src={notificon} alt="Notifications" className="nav-icon" />
                {isNotifOpen && (
                  <motion.div className="dropdown-menu notifications-menu"
                  variants={dropdownVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  >
                    <h3>Notifications</h3>
                    {/* Replace with dynamic notifications */}
                  </motion.div>
                )}
              </div>
              <div className="dropdown" onClick={toggleProfileDropdown}>
                <img src={profileImageUrl} alt="Profile" className="nav-icon" />
                {isProfileOpen && (
                  <motion.div className="dropdown-menu profile-menu"
                    variants={dropdownVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                  >
                    <Link to="/Profile">Profile</Link>
                    <Link onClick={handleLogout}>Logout</Link>
                  </motion.div>
                )}
              </div>
            </nav>
          </div>
        </header>
      )}
    </>
  );
}

export default HeaderHomepage;

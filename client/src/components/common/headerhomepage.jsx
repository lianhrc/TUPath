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
import _debounce from 'lodash.debounce';
import './headerhomepage.css';

function HeaderHomepage() {
  const [isNotifOpen, setNotifOpen] = useState(false);
  const [isProfileOpen, setProfileOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [profileData, setProfileData] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [recentSearches, setRecentSearches] = useState(
    JSON.parse(localStorage.getItem('recentSearches')) || []
  );
  const [isSearchFieldClicked, setIsSearchFieldClicked] = useState(false);
  const [filter, setFilter] = useState('students'); // Default filter state

  const debouncedSearch = _debounce(async (query, filter) => {
    setIsSearching(true);
    try {
      const response = await axiosInstance.get(`/api/search`, { params: { query, filter } });
      if (response.data.success) {
        setSearchResults(response.data.results);
      }
    } catch (error) {
      console.error('Error during search:', error);
    } finally {
      setIsSearching(false);
    }
  }, 500); // 500ms delay before firing the search request


  const handleLogout = () => {
    setIsLoading(true);
    setTimeout(() => {
        localStorage.clear();
        window.location.replace('/login');
    }, 300); // 30 minutes in milliseconds
  }

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

  const handleSearch = (event) => {
    const query = event.target.value;
    setSearchQuery(query);
    setIsSearchFieldClicked(false); // Close the "Recent Searches" section
    if (query.length > 0) {
      debouncedSearch(query, filter); // Call debounced search function
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

  const handleSearchFieldClick = () => {
    setIsSearchFieldClicked(true);
  };

  const handleClearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('recentSearches');
  };

  const handleAddToRecentSearches = (profile) => {
    if (!recentSearches.some((search) => search._id === profile._id)) {
      const updatedSearches = [profile, ...recentSearches];
      if (updatedSearches.length > 5) updatedSearches.pop(); // Keep only last 5 searches
      setRecentSearches(updatedSearches);
      localStorage.setItem('recentSearches', JSON.stringify(updatedSearches));
    }
  };

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
              placeholder="Search"
              value={searchQuery}
              onChange={handleSearch}
              onClick={handleSearchFieldClick}
            />
            <select
              className="search-filter"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="students">Students</option>
              <option value="employers">Employers</option>
            </select>
            {isSearching}
            {searchResults.length > 0 && (
              <div className="search-results">
                <h3>Search Results</h3>
                {searchResults.map((result, index) => (
                  <Link
                    to={`/profile/${result._id}`}
                    key={index}
                    className="search-result-item"
                    onClick={() => handleAddToRecentSearches(result)}
                  >
                    <img
                      src={result.profileDetails?.profileImg || profileicon}
                      alt={`${result.profileDetails.firstName} ${result.profileDetails.lastName}`}
                      className="search-result-image"
                    />
                    <div>
                      <p>
                        <strong>{`${result.profileDetails.firstName} ${
                          result.profileDetails.middleName || ''
                        } ${result.profileDetails.lastName}`.trim()}</strong>
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {!isSearching && isSearchFieldClicked && recentSearches.length > 0 && (
              <div className="recent-searches">
                <h3>Recent Searches</h3>
                {recentSearches.map((profile, index) => (
                  <Link
                    to={`/profile/${profile._id}`}
                    key={index}
                    className="recent-search-item"
                    onClick={() => handleAddToRecentSearches(profile)}
                  >
                    <img
                      src={profile.profileDetails?.profileImg || profileicon}
                      alt={`${profile.profileDetails.firstName} ${profile.profileDetails.lastName}`}
                      className="recent-search-image"
                    />
                    <div>
                      <p>
                        <strong>{`${profile.profileDetails.firstName} ${
                          profile.profileDetails.middleName || ''
                        } ${profile.profileDetails.lastName}`.trim()}</strong>
                      </p>
                    </div>
                  </Link>
                ))}

                <button className="clear-recent-btn" onClick={handleClearRecentSearches}>
                  Clear
                </button>
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
                  <motion.div
                    className="dropdown-menu notifications-menu"
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
                  <motion.div
                    className="dropdown-menu profile-menu"
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

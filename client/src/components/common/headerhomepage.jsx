import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../../services/axiosInstance';
import logo from '../../assets/logoicon.png';
import homeicon from '../../assets/home.png';
import messageicon from '../../assets/email.png';
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
    const [unreadMessages, setUnreadMessages] = useState([]);

    // Debounced search function
    const debouncedSearch = _debounce(async (query) => {
      setIsSearching(true);
      try {
          const response = await axiosInstance.get('/api/search', { params: { query } });
          if (response.data.success) {
              const sortedResults = response.data.results.sort((a, b) => {
                  const scoreA = parseFloat(a.bestTagScores?.[query]) || 0;
                  const scoreB = parseFloat(b.bestTagScores?.[query]) || 0;
                  
                  if (scoreA === scoreB) {
                      const nameA = `${a.profileDetails?.firstName || ''} ${a.profileDetails?.lastName || ''}`.toLowerCase();
                      const nameB = `${b.profileDetails?.firstName || ''} ${b.profileDetails?.lastName || ''}`.toLowerCase();
                      return nameA.localeCompare(nameB);
                  }
                  
                  return scoreB - scoreA;
              });
              console.log("Sorted Results:", sortedResults); // Log final sorted results
              setSearchResults(sortedResults);
          }
      } catch (error) {
          console.error('Error during search:', error);
      } finally {
          setIsSearching(false);
      }
  }, 500);
  

    const handleLogout = () => {
        setIsLoading(true);
        setTimeout(() => {
            localStorage.clear();
            window.location.replace('/login');
        }, 300);
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
        const fetchUnreadMessages = async () => {
            try {
                const response = await axiosInstance.get('/api/unread-messages');
                if (response.data) {
                    setUnreadMessages(response.data);
                }
            } catch (error) {
                console.error('Error fetching unread messages:', error);
            }
        };
        fetchUnreadMessages();
    }, []);

    const handleSearch = (event) => {
        const query = event.target.value;
        setSearchQuery(query);
        setIsSearchFieldClicked(false);
        if (query.length > 0) {
            debouncedSearch(query);
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
            if (updatedSearches.length > 5) updatedSearches.pop();
            setRecentSearches(updatedSearches);
            localStorage.setItem('recentSearches', JSON.stringify(updatedSearches));
        }
    };

    const handleNotificationClick = async (message) => {
        try {
            await axiosInstance.put(`/api/messages/${message._id}/read`, {}, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            setUnreadMessages((prevMessages) => prevMessages.filter((msg) => msg._id !== message._id));
        } catch (error) {
            console.error('Error marking message as read:', error);
        }
        window.location.href = `/Inboxpage?messageId=${message._id}`;
    };

    const profileImageUrl = profileData.profileImg?.startsWith('/')
        ? `http://localhost:3001${profileData.profileImg}`
        : profileData.profileImg || profileicon;

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
                        {isSearching ? (
                            <p>Searching...</p>
                        ) : searchResults.length > 0 ? (
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
                                          <strong>
                                              {`${result.profileDetails.firstName} ${result.profileDetails.middleName || ''} ${result.profileDetails.lastName}`.trim()}
                                          </strong>
                                      </p>
                                      {result.bestTag && (
                                          <p className="best-tag">
                                              <span>{`${index + 1}.`}</span> 
                                              <i className="fa fa-star" style={{ color: 'gold', marginLeft: '5px' }}></i>
                                              Best Tag: <span>{result.bestTag}</span>
                                          </p>
                                      )}
                                  </div>
                              </Link>
                          ))}
                      </div>
                                              ) : (
                            isSearchFieldClicked && <p className="no-results">No results found for "{searchQuery}".</p>
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
                                            {profile.bestTag && (
                                                <p className="best-tag">
                                                    Best Tag: <span>{profile.bestTag}</span>
                                                </p>
                                            )}
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
                                {unreadMessages.length > 0 && (
                                    <span className="notification-badge">{unreadMessages.length}</span>
                                )}
                                {isNotifOpen && (
                                    <div className="dropdown-menu notifications-menu">
                                        <div className="notifdropdownheader">
                                            <h3>Notifications</h3>
                                        </div>
                                        {unreadMessages.map((message, index) => (
                                            <div
                                                key={index}
                                                className="notification-item"
                                                onClick={() => handleNotificationClick(message)}
                                            >
                                                <div className="notifitemleft">
                                                    <img
                                                        src={message.sender.profileImg || profileicon}
                                                        alt={`${message.sender.name}'s profile`}
                                                    />
                                                </div>
                                                <div className="notifitemright">
                                                    <p>
                                                        <strong>{message.sender.name}</strong>
                                                    </p>
                                                    <p>{message.messageContent.text}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div className="dropdown" onClick={toggleProfileDropdown}>
                                <img src={profileImageUrl} alt="Profile" className="nav-icon" />
                                {isProfileOpen && (
                                    <div className="dropdown-menu profile-menu">
                                        <Link to="/Profile">Profile</Link>
                                        <Link onClick={handleLogout}>Logout</Link>
                                    </div>
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

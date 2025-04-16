import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axiosInstance from "../../services/axiosInstance";
import logo from "../../assets/logoicon.png";
import homeicon from "../../assets/home.png";
import messageicon from "../../assets/email.png";
import { motion } from "framer-motion";
import notificon from "../../assets/notif.png";
import profileicon from "../../assets/profileicon.png";
import clientdash from "../../assets/clientdashboard.png";
import Loader from "../common/Loader";
import _debounce from "lodash.debounce";
import { io } from "socket.io-client";
import "./headerhomepage.css";

const socket = io("http://localhost:3001");

function HeaderHomepage() {
  const [isNotifOpen, setNotifOpen] = useState(false);
  const [isProfileOpen, setProfileOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [profileData, setProfileData] = useState({});
  const [userRole, setUserRole] = useState(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [recentSearches, setRecentSearches] = useState(
    JSON.parse(localStorage.getItem("recentSearches")) || []
  );
  const [isSearchFieldClicked, setIsSearchFieldClicked] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState([]);

  // Debounced search function to delay API calls
  const debouncedSearch = _debounce(async (query) => {
    setIsSearching(true);
    try {
      const response = await axiosInstance.get("/api/search", {
        params: { query },
      });
      if (response.data.success) {
        setSearchResults(response.data.results);
      }
    } catch (error) {
      console.error("Error during search:", error);
    } finally {
      setIsSearching(false);
    }
  }, 500);

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      // Call the server logout endpoint
      const response = await axiosInstance.post("/api/logout");

      if (response.data.success) {
        // Clear client-side storage
        localStorage.clear();
        window.location.replace("/login");
      } else {
        console.error("Logout failed:", response.data.message);
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Logout error:", error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const response = await axiosInstance.get("/api/profile");
        if (response.data.success) {
          setProfileData(response.data.profile.profileDetails || {});
          setUserRole(response.data.profile.role); // ← Set the user role
        }
      } catch (error) {
        console.error("Error fetching profile data:", error);
      }
    };

    fetchProfileData();
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      window.history.pushState(null, "", window.location.href);
    };

    window.history.pushState(null, "", window.location.href);
    window.onpopstate = handlePopState;

    return () => {
      window.onpopstate = null;
    };
  }, []);

  useEffect(() => {
    const fetchUnreadMessages = async () => {
      try {
        // Get all conversations to check for unread messages
        const response = await axiosInstance.get('/api/messaging/conversations');
        if (response.data.success) {
          // Find conversations with unread messages
          const conversationsWithUnread = response.data.conversations.filter(
            conv => conv.unreadCount > 0
          );
          
          // Collect unread messages from each conversation
          const unreadMsgs = [];
          for (const conv of conversationsWithUnread) {
            // Only if there are unread messages in this conversation
            if (conv.unreadCount > 0 && conv.lastMessage) {
              // Extract profile image from conversation data
              const profileImg = conv.otherParticipant?.profileDetails?.profileImg || null;
              
              // Format the notification
              unreadMsgs.push({
                _id: conv.lastMessage._id,
                conversationId: conv._id,
                sender: {
                  name: conv.displayName,
                  profileImg: profileImg // Include the profile image
                },
                messageContent: {
                  text: conv.lastMessage.content
                },
                timestamp: conv.lastMessage.createdAt
              });
            }
          }
          
          setUnreadMessages(unreadMsgs);
        }
      } catch (error) {
        console.error('Error fetching unread messages:', error);
      }
    };

    fetchUnreadMessages();
  }, []);

  useEffect(() => {
    socket.on("receive_message", (data) => {
      setUnreadMessages(prevMessages => [
        {
          _id: data.message._id,
          conversationId: data.conversationId,
          sender: {
            name: data.message.sender.username,
            profileImg: data.senderProfileImg || null // Include profile image if available
          },
          messageContent: {
            text: data.message.content
          },
          timestamp: data.message.createdAt
        },
        ...prevMessages
      ]);
    });

    socket.on("new_message", (data) => {
      // Only add to notifications if the message is from someone else
      if (data.message.sender._id !== localStorage.getItem('userId')) {
        setUnreadMessages(prevMessages => [
          {
            _id: data.message._id,
            conversationId: data.conversationId,
            sender: {
              name: data.message.sender.username,
              profileImg: data.senderProfileImg || null // Include profile image if available
            },
            messageContent: {
              text: data.message.content
            },
            timestamp: data.message.createdAt
          },
          ...prevMessages
        ]);
      }
    });

    socket.on("message_read", ({ messageId }) => {
      setUnreadMessages((prevMessages) =>
        prevMessages.filter((msg) => msg._id !== messageId)
      );
    });

    return () => {
      socket.off("receive_message");
      socket.off("new_message");
      socket.off("message_read");
    };
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
    localStorage.removeItem("recentSearches");
  };

  const handleAddToRecentSearches = (profile) => {
    if (!recentSearches.some((search) => search._id === profile._id)) {
      const updatedSearches = [profile, ...recentSearches];
      if (updatedSearches.length > 5) updatedSearches.pop();
      setRecentSearches(updatedSearches);
      localStorage.setItem("recentSearches", JSON.stringify(updatedSearches));
    }
  };

  const handleNotificationClick = async (message) => {
    // Mark the message as read
    try {
      await axiosInstance.put(
        `/api/messaging/messages/${message._id}/read`
      );
      setUnreadMessages((prevMessages) =>
        prevMessages.filter((msg) => msg._id !== message._id)
      );
    } catch (error) {
      console.error("Error marking message as read:", error);
    }

    // Navigate to the inbox and select the message
    window.location.href = `/Inboxpage?conversationId=${message.conversationId}`;
  };

  const profileImageUrl = profileData.profileImg?.startsWith("/")
    ? `http://localhost:3001${profileData.profileImg}`
    : profileData.profileImg || profileicon;

  const dropdownVariants = {
    hidden: {
      opacity: 0,
      y: -20,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 15,
      },
    },
    exit: {
      opacity: 0,
      y: -20,
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
          {userRole === "employer" && (
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
                            {`${result.profileDetails.firstName} ${
                              result.profileDetails.middleName || ""
                            } ${result.profileDetails.lastName}`.trim()}
                          </strong>
                          {result.bestTag && (
                            <p className="best-tag">
                              <span>{`${index + 1}.`}</span>
                              <i
                                className="fa fa-star"
                                style={{ color: "gold", marginLeft: "5px" }}
                              ></i>
                              Best Tag: <span>{result.bestTag}</span>
                            </p>
                          )}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                isSearchFieldClicked && (
                  <p className="no-results">
                    No results found for "{searchQuery}".
                  </p>
                )
              )}

              {!isSearching &&
                isSearchFieldClicked &&
                recentSearches.length > 0 && (
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
                          src={
                            profile.profileDetails?.profileImg || profileicon
                          }
                          alt={`${profile.profileDetails.firstName} ${profile.profileDetails.lastName}`}
                          className="recent-search-image"
                        />
                        <div>
                          <p>
                            <strong>
                              {`${profile.profileDetails.firstName} ${
                                profile.profileDetails.middleName || ""
                              } ${profile.profileDetails.lastName}`.trim()}
                            </strong>
                          </p>
                        </div>
                      </Link>
                    ))}

                    <button
                      className="clear-recent-btn"
                      onClick={handleClearRecentSearches}
                    >
                      Clear
                    </button>
                  </div>
                )}
            </div>
          )}

          <div className="icon-buttons">
            <nav className="homepagenav-links">
              {userRole === "employer" && (
                <Link to="/client_Dashboard">
                  <img className="nav-icon2" src={clientdash} alt="" />
                </Link>
              )}

              {[
                { path: "/Homepage", icon: homeicon, alt: "Home" },
                { path: "/Inboxpage", icon: messageicon, alt: "Messages" },
              ].map((item, index) => (
                <Link key={index} to={item.path}>
                  <img src={item.icon} alt={item.alt} className="nav-icon" />
                </Link>
              ))}

              {/* Notifications Dropdown */}
              <div className="dropdown" onClick={toggleNotifDropdown}>
                <img src={notificon} alt="Notifications" className="nav-icon" />
                {unreadMessages.length > 0 && (
                  <span className="notification-badge">
                    {unreadMessages.length}
                  </span>
                )}
                {isNotifOpen && (
                  <motion.div
                    className="dropdown-menu notifications-menu"
                    variants={dropdownVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                  >
                    <div className="notifdropdownheader">
                      <h3>Notifications</h3>
                    </div>
                    {unreadMessages.length > 0 ? (
                      unreadMessages
                        .sort(
                          (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
                        )
                        .map((message, index) => (
                          <div
                            key={index}
                            className="notification-item"
                            onClick={() => handleNotificationClick(message)}
                          >
                            <div className="notifitemleft">
                              {message.sender.profileImg ? (
                                <img
                                  src={message.sender.profileImg}
                                  alt={`${message.sender.name}'s profile`}
                                  className="notification-profile-img"
                                />
                              ) : (
                                <div className="notification-initial">
                                  {message.sender.name.charAt(0).toUpperCase()}
                                </div>
                              )}
                            </div>
                            <div className="notifitemright">
                              <p>
                                <strong>{message.sender.name}</strong>
                              </p>
                              <p>{message.messageContent.text}</p>
                            </div>
                          </div>
                        ))
                    ) : (
                      <div className="empty-notifications">
                        <p>No new notifications</p>
                      </div>
                    )}
                  </motion.div>
                )}
              </div>

              {/* Profile Dropdown */}
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

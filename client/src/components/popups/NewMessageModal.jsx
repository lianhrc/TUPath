import React, { useState, useEffect, useRef } from 'react';
import './NewMessageModal.css';
import axiosInstance from '../../services/axiosInstance';
import profileicon from '../../assets/profileicon.png';
import { io } from 'socket.io-client';

const socket = io("http://localhost:3001");

const NewMessageModal = ({ isOpen, onClose, onConversationCreated }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [message, setMessage] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const dropdownRef = useRef(null);

  // Handle search input changes with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.length > 0) {
        handleSearch(searchQuery);
      } else {
        setSearchResults([]);
        setShowDropdown(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Search for users using the messaging API
  const handleSearch = async (query) => {
    if (query.length > 0) {
      setIsSearching(true);
      setShowDropdown(true);
      
      try {
        const response = await axiosInstance.get(
          `/api/messaging/search?query=${query}`
        );
        if (response.data.success) {
          setSearchResults(response.data.results);
        } else {
          setSearchResults([]);
        }
      } catch (error) {
        console.error("Search error:", error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }
  };

  const handleUserSelect = (user) => {
    setSelectedUser(user);
    
    const firstName = user.profileDetails.firstName || "";
    const lastName = user.profileDetails.lastName || "";
    const companyName = user.profileDetails.companyName || "";

    let displayName;
    if (user.role === "employer" && companyName) {
      displayName = `${firstName} ${lastName} (${companyName})`;
    } else {
      displayName = `${firstName} ${lastName}`;
    }
    
    setSearchQuery(displayName);
    setShowDropdown(false);
  };

  const handleSend = async () => {
    if (!selectedUser || !message.trim()) return;

    try {
      // First create/get the conversation
      const response = await axiosInstance.post(
        "/api/messaging/conversations",
        {
          participantId: selectedUser._id,
        }
      );

      if (response.data.success) {
        const conversation = response.data.conversation;
        
        // Now send the message to this conversation
        const msgResponse = await axiosInstance.post("/api/messaging/messages", {
          conversationId: conversation._id,
          content: message,
        });

        if (msgResponse.data.success) {
          const sentMessage = msgResponse.data.message;
          
          // Emit socket event
          socket.emit("send_message", {
            conversationId: conversation._id,
            message: sentMessage
          });
          
          // Join the socket room
          socket.emit("join_conversation", conversation._id);
          
          // Notify parent component
          if (onConversationCreated) {
            onConversationCreated(conversation);
          }
          
          // Clear fields and close modal
          setSearchQuery('');
          setMessage('');
          setSelectedUser(null);
          onClose();
        }
      }
    } catch (error) {
      console.error("Error creating conversation or sending message:", error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="new-message-modal-overlay">
      <div className="new-message-modal">
        <div className="close-button-container">
          <button className='newbtnclose' onClick={onClose}>close</button>
        </div>
        <div className="new-message-head">
          <h6>New Message</h6>  
        </div>
        <div className='newmessagesearchfilter' ref={dropdownRef}>
          <label>To:</label>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for a person or company"
          />
          {showDropdown && (
            <div className="dropdown">
              {isSearching ? (
                <div className="searching">Searching...</div>
              ) : searchResults.length > 0 ? (
                <ul>
                  {searchResults.map((user) => (
                    <li
                      key={user._id}
                      onClick={() => handleUserSelect(user)}
                    >
                      <div className="search-result-item">
                        {user.profileDetails.profileImg ? (
                          <img
                            src={user.profileDetails.profileImg}
                            alt="Profile"
                            className="search-profile-img"
                          />
                        ) : (
                          <img 
                            src={profileicon} 
                            alt="Default Profile" 
                            className="search-profile-img" 
                          />
                        )}
                        <div className="search-user-details">
                          <span className="search-user-name">
                            {user.profileDetails.firstName}{" "}
                            {user.profileDetails.lastName}
                          </span>
                          {user.role === "student" && user.bestTag && (
                            <span className="user-tag">
                              {user.bestTag}
                            </span>
                          )}
                          {user.role === "employer" &&
                            user.profileDetails.companyName && (
                              <span className="company-name">
                                {user.profileDetails.companyName}
                              </span>
                            )}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="no-results">No users found</div>
              )}
            </div>
          )}
        </div>
        <div>
          <label>Message:</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message here"
            disabled={!selectedUser}
          />
        </div>
        <button 
          className='newsendbtn' 
          onClick={handleSend}
          disabled={!selectedUser || !message.trim()}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default NewMessageModal;

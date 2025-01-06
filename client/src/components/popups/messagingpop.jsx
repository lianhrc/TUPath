import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import './messagingpop.css';
import writemessage from '../../assets/writemessage.png'; // Replace with actual icon path
import profileicon from '../../assets/profileicon.png'; // Replace with actual icon path
import NewMessageModal from './NewMessageModal'; // Import the new modal component
import axiosInstance from '../../services/axiosInstance'; // Import axios instance for API calls

const socket = io('http://localhost:3001');

const MessagingPop = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isNewMessageOpen, setIsNewMessageOpen] = useState(false); // State for new message modal
  const [profileData, setProfileData] = useState({
    profileImg: profileicon, // Default profile icon
  });
  const [unreadMessages, setUnreadMessages] = useState([]); // State for unread messages
  const [messages, setMessages] = useState([]); // State for all messages

  // Fetch profile data
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

  // Fetch unread messages
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

  // Fetch all messages
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await axiosInstance.get('/api/messages');
        if (response.data) {
          setMessages(response.data);
        }
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };

    fetchMessages();
  }, []);

  useEffect(() => {
    socket.on('receive_message', (message) => {
      setMessages((prevMessages) => 
        [message, ...prevMessages].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      );
      setUnreadMessages((prevMessages) => 
        [message, ...prevMessages].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      );
    });

    socket.on('new_message', (message) => {
      setMessages((prevMessages) => 
        [message, ...prevMessages].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      );
      setUnreadMessages((prevMessages) => 
        [message, ...prevMessages].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      );
    });

    socket.on('message_read', ({ messageId }) => {
      setMessages((prevMessages) =>
        prevMessages.map((msg) => (msg._id === messageId ? { ...msg, status: { ...msg.status, read: true } } : msg))
      );
      setUnreadMessages((prevMessages) =>
        prevMessages.filter((msg) => msg._id !== messageId)
      );
    });

    return () => {
      socket.off('receive_message');
      socket.off('new_message');
      socket.off('message_read');
    };
  }, []);

  const togglePopup = () => {
    setIsOpen(!isOpen);
  };

  const toggleNewMessageModal = () => {
    setIsNewMessageOpen(!isNewMessageOpen);
  };

  const profileImageUrl = profileData.profileImg?.startsWith('/')
    ? `http://localhost:3001${profileData.profileImg}`
    : profileData.profileImg || profileicon;

  const handleNotificationClick = async (message) => {
    // Mark the message as read
    try {
      await axiosInstance.put(`/api/messages/${message._id}/read`, {}, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setUnreadMessages((prevMessages) =>
        prevMessages.filter((msg) => msg._id !== message._id)
      );
    } catch (error) {
      console.error('Error marking message as read:', error);
    }

    // Navigate to the inbox and select the message
    window.location.href = `/Inboxpage?messageId=${message._id}`;
  };

  return (
    <div className={`message-popup ${isOpen ? 'popup-open' : 'popup-close'}`}>
      <button className="message-toggle" onClick={togglePopup}>
        <div>
          <img src={profileImageUrl} alt="Profile" />
          Messaging
        </div>
        <img
          className="writeicon"
          src={writemessage}
          alt="Write Message"
          onClick={toggleNewMessageModal}
        />
      </button>

      {isOpen && (
        <div className="popup-content">
          {unreadMessages.length > 0 ? (
            unreadMessages
              .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)) // Sort by timestamp descending
              .map((message, index) => (
                <div
                  key={index}
                  className="messagenotifitem"
                  onClick={() => handleNotificationClick(message)}
                >
                  <div className="notifitemleft">
                    <img
                      src={message.sender.profileImg || profileicon}
                      alt={`${message.sender.name}'s profile`}
                    />
                  </div>
                  <div className="messnotifitemright">
                    <p>
                      <strong>{message.sender.name}</strong>
                    </p>
                    <p>{message.messageContent.text}</p>
                  </div>
                </div>
              ))
          ) : (
            <p>No new Email.</p>
          )}

            <div className="allmessage">
              <h4>All Messages</h4>
              {messages.length > 0 ? (
                messages
                  .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)) // Sort by timestamp descending
                  .map((message, index) => (
                    <div
                      key={index}
                      className="messagenotifitem"
                      onClick={() => handleNotificationClick(message)}
                    >
                      <div className="notifitemleft">
                        <img
                          src={message.sender.profileImg || profileicon}
                          alt={`${message.sender.name}'s profile`}
                        />
                      </div>
                      <div className="messnotifitemright">
                        <p>
                          <strong>{message.sender.name}</strong>
                        </p>
                        <p>{message.messageContent.text}</p>
                      </div>
                    </div>
                  ))
              ) : (
                <p>No Email available.</p>
              )}
            </div>
        </div>
      )}

      {/* New Message Modal */}
      <NewMessageModal isOpen={isNewMessageOpen} onClose={toggleNewMessageModal} />
    </div>
  );
};

export default MessagingPop;

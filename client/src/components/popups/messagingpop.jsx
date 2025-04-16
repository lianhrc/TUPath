import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import './messagingpop.css';
import writemessage from '../../assets/writemessage.png';
import profileicon from '../../assets/profileicon.png';
import NewMessageModal from './NewMessageModal';
import axiosInstance from '../../services/axiosInstance';

// Create a socket connection
const socket = io('http://localhost:3001');

const MessagingPop = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isNewMessageOpen, setIsNewMessageOpen] = useState(false);
  const [profileData, setProfileData] = useState({
    profileImg: profileicon,
  });
  const [conversations, setConversations] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(
    localStorage.getItem("userId") || ""
  );

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

  // Fetch conversations using the new API endpoint
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const response = await axiosInstance.get('/api/messaging/conversations');
        if (response.data.success) {
          setConversations(response.data.conversations);
        }
      } catch (error) {
        console.error('Error fetching conversations:', error);
      }
    };

    fetchConversations();

    // Socket.io event listeners
    socket.on('connect', () => {
      console.log('Connected to socket server');
    });

    // Listen for new messages
    socket.on('new_message', ({ conversationId, message }) => {
      // Update conversations with new message
      setConversations(prevConversations => 
        prevConversations.map(convo => {
          if (convo._id === conversationId) {
            // Increment unread count only if message is from other user
            const isFromOther = message.sender !== currentUserId && 
                               (message.sender._id ? message.sender._id !== currentUserId : true);
            
            return {
              ...convo,
              lastMessage: message,
              unreadCount: isFromOther ? (convo.unreadCount || 0) + 1 : convo.unreadCount || 0
            };
          }
          return convo;
        })
      );
    });

    // Clean up event listeners on unmount
    return () => {
      socket.off('connect');
      socket.off('new_message');
    };
  }, [currentUserId]);

  const togglePopup = () => {
    setIsOpen(!isOpen);
  };

  const toggleNewMessageModal = (e) => {
    if (e) e.stopPropagation(); // Prevent triggering parent onClick
    setIsNewMessageOpen(!isNewMessageOpen);
  };

  const handleConversationClick = (conversationId) => {
    // Navigate to the conversation in the inbox
    navigate(`/Inboxpage?conversationId=${conversationId}`);
    setIsOpen(false); // Close the popup
  };

  // Format date for messages
  const formatMessageDate = (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()];
    } else {
      return date.toLocaleDateString();
    }
  };

  // Get conversation preview text
  const getMessagePreview = (conversation) => {
    if (!conversation.lastMessage) return 'No messages yet';
    
    // Check if the current user is the sender
    const sender = conversation.lastMessage.sender;
    const isSender = (typeof sender === 'string') 
      ? sender === currentUserId 
      : (sender && sender._id === currentUserId);
    
    let prefix = isSender ? 'You: ' : '';
    let content = conversation.lastMessage.content || '';
    
    // Truncate long messages
    if (content.length > 30) {
      content = content.substring(0, 27) + '...';
    }
    
    return prefix + content;
  };

  // Get total unread count for badge
  const totalUnreadCount = conversations.reduce(
    (sum, convo) => sum + (convo.unreadCount || 0), 
    0
  );

  const profileImageUrl = profileData.profileImg?.startsWith('/')
    ? `http://localhost:3001${profileData.profileImg}`
    : profileData.profileImg || profileicon;

  return (
    <div className={`message-popup ${isOpen ? 'popup-open' : 'popup-close'}`}>
      <button className="message-toggle" onClick={togglePopup}>
        <div>
          <img src={profileImageUrl} alt="Profile" />
          Messaging
          {totalUnreadCount > 0 && <span className="unread-badge">{totalUnreadCount}</span>}
        </div>
        <img
          className="writeicon"
          src={writemessage}
          alt="Write Message"
          onClick={toggleNewMessageModal}
        />
      </button>

      {isOpen && (
        <div className={`popup-content ${conversations.length > 3 ? 'scrollable' : ''}`}>
          {conversations.length > 0 ? (
            conversations
              .sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0))
              .map(conversation => (
                <div
                  key={conversation._id}
                  className={`messagenotifitem ${conversation.unreadCount > 0 ? 'unread' : ''}`}
                  onClick={() => handleConversationClick(conversation._id)}
                >
                  <div className="notifitemleft">
                    {conversation.otherParticipant && conversation.otherParticipant.profileDetails && conversation.otherParticipant.profileDetails.profileImg ? (
                      <img 
                        src={conversation.otherParticipant.profileDetails.profileImg} 
                        alt="Profile" 
                        className="conversation-profile-img" 
                      />
                    ) : (
                      <div className="avatar-circle">
                        {conversation.displayName ? conversation.displayName.charAt(0).toUpperCase() : '?'}
                      </div>
                    )}
                  </div>
                  <div className="messnotifitemright">
                    <div className="message-header">
                      <p className="sender-name">

                        <strong>{conversation.displayName || 'Unknown'}</strong>
                        <p className="message-preview">{getMessagePreview(conversation)}</p> </p>
                        
                    </div>
                    <p className="message-time">{formatMessageDate(conversation.updatedAt)}</p>


                    {conversation.unreadCount > 0 && (
                      <span className="message-badge">{conversation.unreadCount}</span>
                    )}
                  </div>
                </div>
              ))
          ) : (
            <p className="no-messages">No messages available.</p>
          )}
          
          <div className="view-all">
            <button onClick={() => navigate('/Inboxpage')}>View All Messages</button>
          </div>
        </div>
      )}

      {/* New Message Modal */}
      {isNewMessageOpen && (
        <NewMessageModal isOpen={isNewMessageOpen} onClose={toggleNewMessageModal} />
      )}
    </div>
  );
};

export default MessagingPop;

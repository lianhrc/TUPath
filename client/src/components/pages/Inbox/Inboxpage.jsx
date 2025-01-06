import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { io } from 'socket.io-client';
import HeaderHomepage from '../../common/headerhomepage';
import addnewwrite from '../../../assets/writemessage.png';
import dotsicon from '../../../assets/dots.png';
import profileicon from '../../../assets/profile2.png';
import './Inboxpage.css';

const socket = io("http://localhost:3001");

const formatTimeAgo = (timestamp) => {
  const now = new Date();
  const postDate = new Date(timestamp);
  const diffInMs = now - postDate;
  const diffInMinutes = Math.floor(diffInMs / 60000);

  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays <= 2) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;

  return postDate.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

function Inboxpage() {
  const { Inboxpage } = useParams();
  const location = useLocation();
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [newMessageRecipient, setNewMessageRecipient] = useState('');
  const [newMessageContent, setNewMessageContent] = useState('');
  const [showNewMessageSection, setShowNewMessageSection] = useState(false);
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isFetching, setIsFetching] = useState(false);

  useEffect(() => {
    const countUnread = messages.filter(msg => !msg.status.read).length;
    setUnreadCount(countUnread);
  }, [messages]);

  const fetchMessages = async () => {
    setIsFetching(true);
    try {
      const response = await fetch('http://localhost:3001/api/messages', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch messages');
      }

      const messages = await response.json();
      const sortedMessages = messages.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      setMessages(sortedMessages);

      const queryParams = new URLSearchParams(location.search);
      const messageId = queryParams.get('messageId');
      if (messageId) {
        const message = messages.find(msg => msg._id === messageId);
        if (message) {
          setSelectedMessage(message);
          if (!message.status.read) {
            handleMarkAsRead(message);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    fetchMessages();

    socket.on('receive_message', handleNewMessage);
    socket.on('message_read', handleMessageRead);
    socket.on('message_deleted', handleMessageDeleted);

    const refreshInterval = setInterval(fetchMessages, 10000);

    return () => {
      socket.off('receive_message');
      socket.off('message_read');
      socket.off('message_deleted');
      clearInterval(refreshInterval);
    };
  }, [location.search]);

  useEffect(() => {
    fetch('http://localhost:3001/api/userss', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          setUsers(data.users);
        }
      })
      .catch(error => console.error("Error fetching users:", error));
  }, []);

  const handleNewMessage = (message) => {
    setMessages((prevMessages) => {
      const updatedMessages = [message, ...prevMessages];
      return updatedMessages.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    });
  };

  const handleMessageRead = ({ messageId }) => {
    setMessages((prevMessages) =>
      prevMessages.map((msg) => 
        msg._id === messageId 
          ? { ...msg, status: { ...msg.status, read: true } }
          : msg
      )
    );
  };

  const handleMessageDeleted = ({ messageId }) => {
    setMessages((prevMessages) => 
      prevMessages.filter((msg) => msg._id !== messageId)
    );
    if (selectedMessage?._id === messageId) {
      setSelectedMessage(null);
    }
  };

  useEffect(() => {
    socket.on('receive_message', (message) => {
      setMessages((prevMessages) => 
        [message, ...prevMessages].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      );
    });

    socket.on('new_message', (message) => {
      setMessages((prevMessages) => 
        [message, ...prevMessages].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      );
    });

    socket.on('message_read', ({ messageId }) => {
      setMessages((prevMessages) =>
        prevMessages.map((msg) => (msg._id === messageId ? { ...msg, status: { ...msg.status, read: true } } : msg))
      );
    });

    return () => {
      socket.off('receive_message');
      socket.off('new_message');
      socket.off('message_read');
    };
  }, []);

  const handleSelectMessage = async (message) => {
    setSelectedMessage(message);
    setShowNewMessageSection(false);
  
    if (!message.status.read) {
      try {
        await fetch(`http://localhost:3001/api/messages/${message._id}/read`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        });
        message.status.read = true;
        setMessages((prevMessages) =>
          prevMessages.map((msg) => (msg._id === message._id ? { ...msg, status: { ...msg.status, read: true } } : msg))
        );
      } catch (error) {
        console.error("Error marking message as read:", error);
      }
    }
  };

  const handleSendNewMessage = () => {
    if (newMessageRecipient && newMessageContent) {
      const recipientUser = users.find(user => 
        `${user.profileDetails.firstName} ${user.profileDetails.lastName}`.toLowerCase() === newMessageRecipient.toLowerCase()
      );

      if (!recipientUser) {
        console.error("Recipient not found");
        return;
      }

      const userId = localStorage.getItem('userId');
      const username = localStorage.getItem('username');
      const token = localStorage.getItem('token');

      console.log("Sender ID:", userId);
      console.log("Sender Username:", username);

      const newMessage = {
        sender: {
          senderId: userId,
          name: username,
          profileImg: localStorage.getItem('profileImg')
        },
        receiverId: recipientUser._id,
        receiverName: newMessageRecipient,
        receiverProfileImg: recipientUser.profileDetails.profileImg,
        messageContent: {
          text: newMessageContent,
          attachments: []
        },
        status: {
          read: false,
          delivered: true
        },
        timestamp: new Date().toISOString(),
        token: token
      };

      socket.emit('send_message', newMessage);

      setNewMessageRecipient('');
      setNewMessageContent('');
      setShowNewMessageSection(false);
    }
  };

  const toggleNewMessageSection = () => {
    setShowNewMessageSection(true);
    setSelectedMessage(null);
  };

  const handleRecipientChange = (e) => {
    const value = e.target.value.toLowerCase();
    setNewMessageRecipient(value);
    if (value) {
      const filtered = users.filter(user =>
        user.profileDetails &&
        user.profileDetails.firstName &&
        user.profileDetails.lastName &&
        (`${user.profileDetails.firstName} ${user.profileDetails.lastName}`.toLowerCase().includes(value) ||
         user.profileDetails.firstName.toLowerCase().includes(value) ||
         user.profileDetails.lastName.toLowerCase().includes(value))
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers([]);
    }
  };

  const handleUserSelect = (user) => {
    setNewMessageRecipient(`${user.profileDetails.firstName} ${user.profileDetails.lastName}`);
    setFilteredUsers([]);
  };

  const handleMarkAsRead = async (message) => {
    if (!message.status.read) {
      try {
        const response = await fetch(`http://localhost:3001/api/messages/${message._id}/read`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Failed to mark message as read');
        }

        socket.emit('mark_as_read', { messageId: message._id });
        
        setMessages((prevMessages) =>
          prevMessages.map((msg) => 
            msg._id === message._id 
              ? { ...msg, status: { ...msg.status, read: true } }
              : msg
          )
        );
      } catch (error) {
        console.error("Error marking message as read:", error);
      }
    }
  };

  const renderMessageList = () => (
    <div className="inboxlists">
      {isFetching ? (
        <div className="loading-indicator">Loading messages...</div>
      ) : messages.length === 0 ? (
        <div className="no-messages">No messages found</div>
      ) : (
        messages.map((message, index) => {
          const isSentMessage = message.direction === 'sent';
          const displayName = isSentMessage ? message.receiver.name : message.sender.name;
          const profileImg = isSentMessage ? message.receiver.profileImg : message.sender.profileImg;
          const text = message.messageContent?.text || '';
          const isUnread = !message.status.read && !isSentMessage;

          return (
            <div
              key={message._id || index}
              className={`inboxlist-container ${message.direction} ${isUnread ? 'unread' : 'read'}`}
              onClick={() => handleSelectMessage(message)}
            >
              <div className="inboxprofilecontainerleft">
                <img src={profileImg || profileicon} alt={`${displayName}'s profile`} />
                {isUnread && <span className="unread-indicator" />}
              </div>
              <div className="inboxdetailscontainerright">
                <div className="topdetailscontainer">
                  <h5>{message.direction === 'sent' ? 'To:' : 'From:'} {displayName}</h5>
                  <p>{formatTimeAgo(message.timestamp)}</p>
                </div>
                <div className="bottomdetailscontainer">
                  <p className="text-content">{text}</p>
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );

  return (
    <div className='Inboxpage'>
      <HeaderHomepage />
      <div className="inbox-container">
        <div className="inboxhead">
          <div className="headtitle">
            <p>Email {unreadCount > 0 && <span className="unread-count">({unreadCount})</span>}</p>
          </div>
          <div className="headicons">
            <button>
              <img src={dotsicon} alt="More options" />
            </button>
            <button onClick={toggleNewMessageSection}>
              <img src={addnewwrite} alt="Add new message" />
            </button>
          </div>
        </div>
        <div className="inboxmain">
          <div className="inboxmain-left">
            {renderMessageList()}
          </div>
          <div className="inboxmain-right">
            {showNewMessageSection ? (
              <div className="new-message-section">
                <h6>New Email</h6>
                <label>To:</label>
                <input
                  className='recieptinput'
                  type="text"
                  value={newMessageRecipient}
                  onChange={handleRecipientChange}
                  placeholder="Recipient's name"
                />
                {filteredUsers.length > 0 && (
                  <ul className="dropdown">
                    {filteredUsers.map((user, index) => (
                      <li key={index} onClick={() => handleUserSelect(user)}>
                        <img src={user.profileDetails.profileImg || profileicon} alt={`${user.profileDetails.firstName} ${user.profileDetails.lastName}`} />
                        {user.profileDetails.firstName} {user.profileDetails.lastName}
                      </li>
                    ))}
                  </ul>
                )}
                <label>Message:</label>
                <textarea
                  className='Messageinputbox'
                  value={newMessageContent}
                  onChange={(e) => setNewMessageContent(e.target.value)}
                  placeholder="Type your message here"
                />
                <div className="newmessageinboxbtn">
                  <button onClick={handleSendNewMessage}>Send</button>
                </div>
              </div>
            ) : selectedMessage ? (
              <div className="message-details">
                <div className="message-profile">
                  <img src={selectedMessage.receiver.profileImg || profileicon} alt={`${selectedMessage.receiver.name}'s profile`} className="profile-image" />
                </div>
                <div className="namedatecontainer">
                  <h4>{selectedMessage.receiver.name}</h4>
                  <p className="message-date">{formatTimeAgo(selectedMessage.timestamp)}</p>
                </div>
                <p className="message-content">{selectedMessage.messageContent?.text || ''}</p>
              </div>
            ) : (
              <p>Select a Email to view its content</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Inboxpage;
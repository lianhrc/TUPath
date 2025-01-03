import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import HeaderHomepage from '../../common/headerhomepage';
import addnewwrite from '../../../assets/writemessage.png';
import dotsicon from '../../../assets/dots.png';
import profileicon from '../../../assets/profile2.png';
import profileicon2 from '../../../assets/profileicon.png';
import './Inboxpage.css';

const socket = io("http://localhost:3001");

function Inboxpage() {
  const { Inboxpage } = useParams();
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [newMessageRecipient, setNewMessageRecipient] = useState('');
  const [newMessageContent, setNewMessageContent] = useState('');
  const [showNewMessageSection, setShowNewMessageSection] = useState(false);
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const [receivedResponse, sentResponse] = await Promise.all([
          fetch('http://localhost:3001/api/messages', {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          }),
          fetch('http://localhost:3001/api/sent-messages', {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          })
        ]);

        const receivedMessages = await receivedResponse.json();
        const sentMessages = await sentResponse.json();

        const allMessages = [...receivedMessages, ...sentMessages].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        setMessages(allMessages);
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    fetchMessages();
  }, []);

  useEffect(() => {
    fetch('http://localhost:3001/api/users', {
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

  useEffect(() => {
    socket.on('receive_message', (message) => {
      setMessages((prevMessages) => 
        [message, ...prevMessages].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      );
    });

    return () => {
      socket.off('receive_message');
    };
  }, []);

  const handleSelectMessage = async (message) => {
    setSelectedMessage(message);
    setShowNewMessageSection(false);
  
    // Mark the message as read
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

      const userId = localStorage.getItem('userId'); // Assuming userId is stored in localStorage
      const username = localStorage.getItem('username'); // Assuming username is stored in localStorage
      const token = localStorage.getItem('token'); // Assuming token is stored in localStorage

      console.log("Sender ID:", userId); // Log the senderId for debugging
      console.log("Sender Username:", username); // Log the sender username for debugging

      const newMessage = {
        sender: {
          senderId: userId,
          name: username,
          profileImg: localStorage.getItem('profileImg') // Assuming profileImg is stored in localStorage
        },
        receiverId: recipientUser._id, // Use receiverId instead of receiver
        receiverName: newMessageRecipient, // Use receiverName instead of receiver
        receiverProfileImg: recipientUser.profileDetails.profileImg,
        messageContent: {
          text: newMessageContent, // Ensure text is included in messageContent
          attachments: [] // Add attachments if any
        },
        status: {
          read: false,
          delivered: true
        },
        timestamp: new Date().toISOString(),
        token: token
      };

      // Send message to the server via socket without adding it to the messages state
      socket.emit('send_message', newMessage);

      // Clear inputs and hide the new message section
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

  return (
    <div className='Inboxpage'>
      <HeaderHomepage />
      <div className="inbox-container">
        <div className="inboxhead">
          <div className="headtitle">
            <p>Email</p>
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
            <div className="inboxlists">
              {messages.map((message, index) => {
                const isSender = message.sender.senderId === localStorage.getItem('userId');
                const profileImg = isSender ? message.receiver.profileImg : message.sender.profileImg;
                const name = isSender ? message.receiver.name : message.sender.name;
                const text = message.messageContent?.text || ''; // Ensure messageContent is defined

                return (
                  <div
                    key={index}
                    className="inboxlist-container"
                    onClick={() => handleSelectMessage(message)}
                  >
                    <div className="inboxprofilecontainerleft">
                      <img src={profileImg || profileicon} alt={`${name}'s profile`} />
                    </div>
                    <div className="inboxdetailscontainerright">
                      <div className="topdetailscontainer">
                        <h5>{name}</h5> {/* Display the name */}
                        <p>{new Date(message.timestamp).toLocaleDateString()}</p>
                      </div>
                      <div className="bottomdetailscontainer">
                         <p className="text-content">{text}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
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
                  <h4>{selectedMessage.receiver.name}</h4> {/* Display the receiver's name */}
                  <p className="message-date">{new Date(selectedMessage.timestamp).toLocaleDateString()}</p>
                </div>
                <p className="message-content">{selectedMessage.messageContent?.text || ''}</p> {/* Ensure messageContent is defined */}
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
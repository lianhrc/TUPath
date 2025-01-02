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
    fetch('http://localhost:3001/api/messages', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
      .then(response => response.json())
      .then(data => {
        const sortedMessages = data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        setMessages(sortedMessages);
      })
      .catch(error => console.error("Error fetching messages:", error));
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

  const handleSelectMessage = (message) => {
    setSelectedMessage(message);
    setShowNewMessageSection(false);
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

      const newMessage = {
        senderId: localStorage.getItem('userId'), // Assuming userId is stored in localStorage
        receiverId: recipientUser._id,
        sender: localStorage.getItem('username'), // Assuming username is stored in localStorage
        receiver: newMessageRecipient,
        text: newMessageContent,
        timestamp: new Date().toISOString(),
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
              {messages.map((message, index) => (
                <div
                  key={index}
                  className="inboxlist-container"
                  onClick={() => handleSelectMessage(message)}
                >
                  <div className="inboxprofilecontainerleft">
                    <img src={message.profileImage || profileicon} alt={`${message.receiver}'s profile`} />
                  </div>
                  <div className="inboxdetailscontainerright">
                    <div className="topdetailscontainer">
                      <h5>{message.receiver}</h5>
                      <p>{new Date(message.timestamp).toLocaleDateString()}</p>
                    </div>
                    <div className="bottomdetailscontainer">
                      <p>{message.text}</p>
                    </div>
                  </div>
                </div>
              ))}
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
                <label>Email:</label>
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
                  <img src={selectedMessage.profileImage || profileicon} alt={`${selectedMessage.receiverreceiver}'s profile`} className="profile-image" />
                </div>
                <div className="namedatecontainer">
                  <h4>{selectedMessage.receiver}</h4>
                  <p className="message-date">{new Date(selectedMessage.timestamp).toLocaleDateString()}</p>
                </div>
                <p className="message-content">{selectedMessage.text}</p>
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
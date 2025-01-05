import React, { useState, useEffect } from 'react';
import './NewMessageModal.css'; // Create this CSS file for modal styling
import axiosInstance from '../../services/axiosInstance'; // Import axios instance for API calls
import profileicon from '../../assets/profileicon.png'; // Replace with actual icon path
import { io } from 'socket.io-client';

const socket = io("http://localhost:3001");

const NewMessageModal = ({ isOpen, onClose }) => {
  const [recipient, setRecipient] = useState('');
  const [message, setMessage] = useState('');
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axiosInstance.get('/api/userss', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        if (response.data.success) {
          setUsers(response.data.users);
        }
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchUsers();
  }, []);

  const handleRecipientChange = (e) => {
    const value = e.target.value.toLowerCase();
    setRecipient(value);
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
    setRecipient(`${user.profileDetails.firstName} ${user.profileDetails.lastName}`);
    setFilteredUsers([]);
  };

  const handleSend = () => {
    if (recipient && message) {
      const recipientUser = users.find(user => 
        `${user.profileDetails.firstName} ${user.profileDetails.lastName}`.toLowerCase() === recipient.toLowerCase()
      );

      if (!recipientUser) {
        console.error("Recipient not found");
        return;
      }

      const userId = localStorage.getItem('userId'); // Assuming userId is stored in localStorage
      const username = localStorage.getItem('username'); // Assuming username is stored in localStorage
      const token = localStorage.getItem('token'); // Assuming token is stored in localStorage

      const newMessage = {
        sender: {
          senderId: userId,
          name: username,
          profileImg: localStorage.getItem('profileImg') // Assuming profileImg is stored in localStorage
        },
        receiverId: recipientUser._id, // Use receiverId instead of receiver
        receiverName: recipient, // Use receiverName instead of receiver
        receiverProfileImg: recipientUser.profileDetails.profileImg,
        messageContent: {
          text: message, // Ensure text is included in messageContent
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

      // Clear fields after sending
      setRecipient('');
      setMessage('');
      onClose(); // Close the modal after sending
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
        <div className='newmessagesearchfilter'>
          <label>To:</label>
          <input
            type="text"
            value={recipient}
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
        </div>
        <div>
          <label>Message:</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message here"
          />
        </div>
        <button className='newsendbtn' onClick={handleSend}>Send</button>
      </div>
    </div>
  );
};

export default NewMessageModal;

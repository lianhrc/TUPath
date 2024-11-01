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
  const [messages, setMessages] = useState([
    { id: 1, name: '', date: '', text: '', profileImage: profileicon },
    { id: 2, name: '', date: '', text: '', profileImage: profileicon2 },
    { id: 3, name: '', date: '', text: '', profileImage: profileicon },
  ]);

  useEffect(() => {
    fetch('http://localhost:3001/api/messages')
      .then(response => response.json())
      .then(data => {
        const sortedMessages = data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        setMessages(sortedMessages);
      })
      .catch(error => console.error("Error fetching messages:", error));
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
      const newMessage = {
        sender: newMessageRecipient,
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

  return (
    <div className='Inboxpage'>
      <HeaderHomepage />
      <div className="inbox-container">
        <div className="inboxhead">
          <div className="headtitle">
            <p>Messaging</p>
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
                    <img src={message.profileImage || profileicon} alt={`${message.sender}'s profile`} />
                  </div>
                  <div className="inboxdetailscontainerright">
                    <div className="topdetailscontainer">
                      <h5>{message.sender}</h5>
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
                <h6>New Message</h6>
                <label>To:</label>
                <input
                  className='recieptinput'
                  type="text"
                  value={newMessageRecipient}
                  onChange={(e) => setNewMessageRecipient(e.target.value)}
                  placeholder="Recipient's name"
                />
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
                  <img src={selectedMessage.profileImage || profileicon} alt={`${selectedMessage.sender}'s profile`} className="profile-image" />
                </div>
                <div className="namedatecontainer">
                  <h4>{selectedMessage.sender}</h4>
                  <p className="message-date">{new Date(selectedMessage.timestamp).toLocaleDateString()}</p>
                </div>
                <p className="message-content">{selectedMessage.text}</p>
              </div>
            ) : (
              <p>Select a message to view its content</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Inboxpage;

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import HeaderHomepage from '../../common/headerhomepage';
import addnewwrite from '../../../assets/writemessage.png';
import dotsicon from '../../../assets/dots.png';
import profileicon from '../../../assets/profile2.png';
import profileicon2 from '../../../assets/profileicon.png';
import './Inboxpage.css';

function Inboxpage() {
  const { Inboxpage } = useParams(); // Get the notification ID from the URL
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [newMessageRecipient, setNewMessageRecipient] = useState('');
  const [newMessageContent, setNewMessageContent] = useState('');
  const [showNewMessageSection, setShowNewMessageSection] = useState(false);

  // Define messages with profile images
  const [messages, setMessages] = useState([
    { id: 1, name: 'Ernesto Kapitagan', date: '10/24/2024', text: 'Are you in or out?', profileImage: profileicon },
    { id: 2, name: 'Pedro Mabola', date: '10/25/2024', text: 'Contrary to popular belief, Lorem Ipsum is not simply random text...', profileImage: profileicon2 },
    { id: 3, name: 'Lauro Pilantik', date: '10/26/2024', text: 'When do you free?', profileImage: profileicon },
  ]);

  // Select message if ID is provided in URL
  useEffect(() => {
    if (Inboxpage) {
      const messageToSelect = messages.find((message) => message.id === parseInt(id));
      if (messageToSelect) {
        setSelectedMessage(messageToSelect);
      }
    }
  }, [Inboxpage, messages]);

  // Function to handle message selection
  const handleSelectMessage = (message) => {
    setSelectedMessage(message);
    setShowNewMessageSection(false); // Hide the new message section when selecting a message
  };

  // Function to handle sending a new message
  const handleSendNewMessage = () => {
    if (newMessageRecipient && newMessageContent) {
      const newMessage = {
        id: messages.length + 1, // Generate a new ID
        name: newMessageRecipient,
        date: new Date().toLocaleDateString(), // Use the current date
        text: newMessageContent,
        profileImage: profileicon, // Set a default profile image or change it as needed
      };

      // Prepend the new message to the messages list to show it at the top
      setMessages([newMessage, ...messages]); // Add new message at the beginning

      // Clear the input fields
      setNewMessageRecipient('');
      setNewMessageContent('');
      setShowNewMessageSection(false); // Hide the new message section after sending
    }
  };

  // Function to toggle the visibility of the new message section
  const toggleNewMessageSection = () => {
    setShowNewMessageSection(true); // Always show new message section
    setSelectedMessage(null); // Clear selected message when writing a new message
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
              {messages.map((message) => (
                <div
                  key={message.id}
                  className="inboxlist-container"
                  onClick={() => handleSelectMessage(message)}
                >
                  <div className="inboxprofilecontainerleft">
                    <img src={message.profileImage} alt={`${message.name}'s profile`} />
                  </div>
                  <div className="inboxdetailscontainerright">
                    <div className="topdetailscontainer">
                      <h5>{message.name}</h5>
                      <p>{message.date}</p>
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
            {/* If writing a new message, show new message section */}
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
                  <img src={selectedMessage.profileImage} alt={`${selectedMessage.name}'s profile`} className="profile-image" />
                </div>
                <div className="namedatecontainer">
                  <h4>{selectedMessage.name}</h4>
                  <p className="message-date">{selectedMessage.date}</p>
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

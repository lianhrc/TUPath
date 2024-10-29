import React, { useState } from 'react';
import './messagingpop.css';
import writemessage from '../../assets/writemessage.png'; // Replace with actual icon path
import profileicon from '../../assets/profileicon.png'; // Replace with actual icon path
import NewMessageModal from './NewMessageModal'; // Import the new modal component

const MessagingPop = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isNewMessageOpen, setIsNewMessageOpen] = useState(false); // State for new message modal

  const togglePopup = () => {
    setIsOpen(!isOpen);
  };

  const toggleNewMessageModal = () => {
    setIsNewMessageOpen(!isNewMessageOpen);
  };

  return (
    <div className={`message-popup ${isOpen ? 'popup-open' : 'popup-close'}`}>
      <button className="message-toggle" onClick={togglePopup}>
        <div>
          <img src={profileicon} alt="Profile" />
          Messaging
        </div>
        <img className='writeicon' src={writemessage} alt="Write Message" onClick={toggleNewMessageModal} />
      </button>

      {isOpen && (
        <div className="popup-content">
          <div className="messages">
            <div className="message">
              <span className="sender">User:</span>
              <span className="message-text">Hello Daddy! 👋</span>
              <span className="timestamp">10 mins ago</span>
            </div>

            <div className="message">
              <span className="sender">User:</span>
              <span className="message-text">Lemme come! 👋</span>
              <span className="timestamp">20 mins ago</span>
           </div>

           <div className="message">
            <span className="sender">User:</span>
            <span className="message-text">Can we meet again? 👋</span>
            <span className="timestamp">30 mins ago</span>
          </div>

          </div>
        </div>
      )}

      {/* New Message Modal */}
      <NewMessageModal isOpen={isNewMessageOpen} onClose={toggleNewMessageModal} />
    </div>
  );
};

export default MessagingPop;

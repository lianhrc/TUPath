import React, { useState } from 'react';
import '../components/messagingpop.css';
import writemessage from '../assets/writemessage.png'; // Replace with actual icon path
import profileicon from '../assets/profileicon.png'; // Replace with actual icon path


const MessagingPop = () => {
  const [isOpen, setIsOpen] = useState(false);

  const togglePopup = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className={`message-popup ${isOpen ? 'popup-open' : 'popup-close'}`}>
      <button className="message-toggle" onClick={togglePopup}>
        <div>
            <img src={profileicon}></img>
            Messaging
        </div>
        <img className='writeicon' src={writemessage}></img>
        
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
              <span className="sender">Maykel Jisun:</span>
              <span className="message-text">Do you have What'z up??</span>
              <span className="timestamp">5 mins ago</span>
            </div>
            <div className="message">
              <span className="sender">Maykel Jisun:</span>
              <span className="message-text">I cant help you with that!</span>
              <span className="timestamp">5 mins ago</span>
            </div>
            <div className="message">
              <span className="sender">Maykel Jisun:</span>
              <span className="message-text">do you want me??</span>
              <span className="timestamp">5 mins ago</span>
            </div>
            {/* Add more messages as needed */}
          </div>
        </div>
      )}
    </div>
  );
};

export default MessagingPop;

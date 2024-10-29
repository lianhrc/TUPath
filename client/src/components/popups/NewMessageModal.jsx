// NewMessageModal.js
import React, { useState } from 'react';
import './NewMessageModal.css'; // Create this CSS file for modal styling

const NewMessageModal = ({ isOpen, onClose }) => {
  const [recipient, setRecipient] = useState('');
  const [message, setMessage] = useState('');

  const handleSend = () => {
    // Handle sending the message logic here
    console.log(`Sending to: ${recipient}`);
    console.log(`Message: ${message}`);

    // Clear fields after sending
    setRecipient('');
    setMessage('');
    onClose(); // Close the modal after sending
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
        <div>
          <label>To:</label>
          <input
            type="text"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            placeholder="Recipient's name"
          />
        </div>
        <div>
          <label>Message:</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message here"
          />
        </div>
        <div className="sendbtncontainer">
        <button className='newsendbtn' onClick={handleSend}>Send</button>
        </div>
      </div>
    </div>
  );
};

export default NewMessageModal;

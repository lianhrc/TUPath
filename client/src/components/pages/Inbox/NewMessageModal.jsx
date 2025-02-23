import React from 'react';
import './NewMessageModal.css';

const NewMessageModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="modal">
      <div className="modal-content">
        <span className="close" onClick={onClose}>&times;</span>
        <h2>New Message</h2>
        {/* Add form for new message */}
      </div>
    </div>
  );
};

export default NewMessageModal;

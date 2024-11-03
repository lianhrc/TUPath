import React, { useState } from 'react';
import './GenericModal.css'; // Import your CSS styles

const GenericModal = ({ show, onClose, title, onSave }) => {
  const [inputValue, setInputValue] = useState('');

  const handleSave = () => {
    if (inputValue.trim()) {
      onSave(inputValue);
      setInputValue(''); // Clear the input after saving
      onClose(); // Close the modal
    }
  };

  if (!show) return null;

  return (
    <div className="GMmodal-overlay">
      <div className="GMmodal-content">
        <div className="GMmodal-header">
          <h6><strong>{title}</strong></h6>
          <button className="GM-close-btn" onClick={onClose}>X</button>
        </div>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)} // Update input value
          placeholder="Enter skill"
          className="GM-input"
        />
        
        <div className="modal-actions">
          <button className='GM-save-btn' onClick={handleSave}>Save</button>
        </div>
      </div>
    </div>
  );
};

export default GenericModal;

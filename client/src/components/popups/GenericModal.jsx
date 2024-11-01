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
        <h2>{title}</h2>
        <button onClick={onClose}>X</button>
        <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)} // Update input value
        placeholder="Enter skill"
        />
        
        <div className="modal-actions">
        <button onClick={handleSave}>Save</button>
        </div>
      </div>
      
    </div>
    
  );
  
};

export default GenericModal;

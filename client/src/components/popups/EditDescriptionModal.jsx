import React, { useState } from 'react';
import './EditDescriptionModal.css';

const EditDescriptionModal = ({ show, onClose, currentDescription, onSave }) => {
  const [description, setDescription] = useState(currentDescription);

  const handleSave = () => {
    onSave(description);
    onClose();
  };

  if (!show) return null; // Don't render anything if the modal isn't shown

  return (
    <div className="editdes-modal-overlay">
      <div className="editdes-modal-content">
        <div className="topeditdes-container">
          <h6>Edit Description</h6>
          <button className='editdesclose-btn' onClick={onClose}>X</button>
        </div>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows="5"
          placeholder="Enter your description..."
          className="description-textarea"
        />
        <div className="editdes-modal-buttons">
          <button className="save-button" onClick={handleSave}>Save</button>
        </div>
      </div>
    </div>
  );
};

export default EditDescriptionModal;

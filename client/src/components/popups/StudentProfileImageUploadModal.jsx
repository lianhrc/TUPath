// StudentProfileImageUploadModal.js
import React from 'react';
import './StudentProfileImageUploadModal.css';

function StudentProfileImageUploadModal({ isOpen, onClose, onUpload }) {
  if (!isOpen) return null;

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      onUpload(file);
      onClose();
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>Upload Profile Image</h3>
        <input type="file" onChange={handleFileChange} />
        <button onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
}

export default StudentProfileImageUploadModal;

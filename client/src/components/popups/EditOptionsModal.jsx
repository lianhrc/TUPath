import React, { useState, useEffect } from "react";
import "./EditOptionsModal.css";

const EditOptionsModal = ({ isOpen, onClose, postContent, onEdit, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newText, setNewText] = useState(postContent);

  useEffect(() => {
    if (isOpen) {
      setNewText(postContent); // Reset text when modal is opened
    }
  }, [isOpen, postContent]);

  if (!isOpen) return null;

  return (
    <div className="edit-options-overlay" onClick={onClose}>
      <div className="edit-options-modal" onClick={(e) => e.stopPropagation()}>
        {isEditing ? (
          <div>
            <textarea
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
            />
            <button onClick={() => { onEdit(newText); setIsEditing(false); }}>Save</button>
            <button onClick={() => setIsEditing(false)}>Cancel</button>
          </div>
        ) : (
          <div>
            <h6 onClick={() => setIsEditing(true)}>Edit</h6>
            <h6 onClick={onDelete}>Delete</h6>
          </div>
        )}
      </div>
    </div>
  );
};

export default EditOptionsModal;

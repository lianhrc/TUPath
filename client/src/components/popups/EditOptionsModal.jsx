import React from "react";
import "./EditOptionsModal.css";

const EditOptionsModal = ({ isOpen, onClose, onEditMode, onDelete }) => {
  if (!isOpen) return null;

  return (
    <div className="edit-options-overlay" onClick={onClose}>
      <div className="edit-options-modal" onClick={(e) => e.stopPropagation()}>
        <div>
          <button onClick={onEditMode}>Edit</button>
          <button onClick={onDelete} className="delete-button">
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditOptionsModal;

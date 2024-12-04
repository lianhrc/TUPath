// ProjectPreviewModal.js
import React from 'react';
import './ProjectPreviewModal.css';

function ProjectPreviewModal({ show, onClose, project, onDelete }) {
  if (!show || !project) return null;

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      onDelete(project._id); // Call onDelete function passed from the parent
      onClose(); // Close the modal after deletion
    }
  };

  

  return (
    <div className="projprev-overlay">
      <div className="projprev-content">
        <div className="projprevheader">
            <h6><strong>{project.projectName}</strong></h6>
        </div>
        
        <p><strong></strong> {project.description}</p>
        <p><strong></strong> {project.tags}</p>
        <p><strong></strong> {project.tools}</p>
        <p><strong></strong> {project.files}</p>
        <div className="div">
        <button className="delete-btn" onClick={handleDelete}>Delete</button>
          <button className="close-btn" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

export default ProjectPreviewModal;

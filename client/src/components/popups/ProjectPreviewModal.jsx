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

   // Extract the first image from the project files array
   const projectImage = project.files && project.files.length > 0
   ? `http://localhost:3001${project.files[0]}` // Use the first file as the image
   : "https://via.placeholder.com/150"; // Fallback placeholder image

  return (
    <div className="projprev-overlay">
      <div className="projprev-content">
        <div className="projprevheader">
            <h6><strong>{project.projectName}</strong></h6>
        </div>
        <img
        src={projectImage}
        alt={`${project.projectName || "Project"} Thumbnail`}
        className="project-image"
      />
        <p><strong></strong> {project.description}</p>
        <p><strong></strong> {project.tags}</p>
        <p><strong></strong> {project.tools}</p>
        <div className="div">
        <button className="delete-btn" onClick={handleDelete}>Delete</button>
          <button className="close-btn" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

export default ProjectPreviewModal;

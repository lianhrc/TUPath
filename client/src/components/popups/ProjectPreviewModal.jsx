// ProjectPreviewModal.js
import React from 'react';
import './ProjectPreviewModal.css';

function ProjectPreviewModal({ show, onClose, project }) {
  if (!show || !project) return null;

  return (
    <div className="projprev-overlay">
      <div className="projprev-content">
        <div className="projprevheader">
            <h6><strong>{project.name}</strong></h6>
        </div>
        <img src={project.image} alt={`${project.name} Thumbnail`} className="project-image" />
        <p><strong>Description:</strong> {project.description}</p>
        <p><strong>Duration:</strong> {project.duration}</p>
        <p><strong>Technologies:</strong> {project.technologies}</p>
        <div className="div"><button className="close-btn" onClick={onClose}>close</button></div>
        </div>
    </div>
  );
}

export default ProjectPreviewModal;

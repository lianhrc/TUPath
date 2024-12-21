import React, { useState } from 'react';
import './ProjectPreviewModal.css';
import ProjectAssessmentModal from '../popups/ProjectAssessmentModal';

function ProjectPreviewModal({ show, onClose, project, onDelete }) {
  const [showAssessmentModal, setShowAssessmentModal] = useState(false);

  if (!show || !project) return null;

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      await onDelete(project._id); // Wait for deletion to complete
      onClose(); // Close the modal only after successful deletion
    }
  };
  

  // Extract file name from the full path
  const getFileName = (filePath) => {
    if (typeof filePath === 'string') {
      return filePath.split('\\').pop().split('/').pop();
    }
    if (Array.isArray(filePath)) {
      return filePath.map(file => getFileName(file)).join(', ');
    }
    return 'No file available';
  };

  const handleStatusClick = () => {
    setShowAssessmentModal(true); // Show the ProjectAssessmentModal when the status is clicked
  };

  return (
    <div className="projprev-overlay">
      <div className="projprev-content">
        <div className="projprevheader">
        {project.thumbnail ? (
            <img 
              src={project.thumbnail.startsWith('/') ? `http://localhost:3001${project.thumbnail}` : project.thumbnail} 
              alt="Thumbnail" 
              className="project-thumbnail"
            />
          ) : (
            <div className="placeholder-thumbnail">No Thumbnail</div>
          )}
        </div>

        <div className="projprevcontentmain">
          <div className="projprev-left">
            <h2><strong>{project.projectName}</strong></h2>
            <p className='projdesccontainer'><strong>{project.description}</strong></p>

            {project.projectUrl && (
              <p>
                <strong>Project URL: </strong>
                <a 
                  href={project.projectUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  {project.projectUrl}
                </a>
              </p>
            )}

            {/* Clickable Status */}
            <p className="projprev-status" onClick={handleStatusClick}>
              <strong>{project.status || 'Click for project assessment'}</strong>
            </p>
          </div>

          <div className="projprev-right">
            <div className="projprevtags">
              {project.tags.map(tag => (
                <div key={tag} className="tag-item">{tag}</div>
              ))}
            </div>
            <div className="projprevtools">
              {project.tools.map(tool => (
                <div key={tool} className="tool-item">{tool}</div>
              ))}
            </div>
            <div className="projpreviewfiles">
              <p><strong>{getFileName(project.files)}</strong></p>
            </div>
          </div>
        </div>

        <div className="div">
          <button className="delete-btn" onClick={handleDelete}>Delete</button>
          <button className="close-btn" onClick={onClose}>Close</button>
        </div>
      </div>

      {/* Conditional rendering of ProjectAssessmentModal */}
      {showAssessmentModal && <ProjectAssessmentModal show={showAssessmentModal} onClose={() => setShowAssessmentModal(false)} />}
    </div>
  );
}

export default ProjectPreviewModal;

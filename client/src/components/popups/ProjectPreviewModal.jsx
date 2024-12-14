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

  // Extract file name from the full path
  const getFileName = (filePath) => {
    // Check if filePath is a string
    if (typeof filePath === 'string') {
      return filePath.split('\\').pop().split('/').pop(); // Handles both Windows and Unix-based paths
    }
    // If it's an array (multiple files), map through and extract file names
    if (Array.isArray(filePath)) {
      return filePath.map(file => getFileName(file)).join(', ');
    }
    return 'No file available'; // Default message when no file path or file array is found
  };

  return (
    <div className="projprev-overlay">
      <div className="projprev-content">
        <div className="projprevheader">
            <img 
            src={typeof project.thumbnail === 'string' && project.thumbnail.startsWith('/') 
            ? `http://localhost:3001${project.thumbnail}` 
            : project.thumbnail || avatar}
          />
        </div>

        <div className="projprevcontentmain">
          <div className="projprev-left">
            <h2><strong>{project.projectName}</strong></h2>
            <p><strong>{project.description}</strong></p>


              {/* Add Project URL Preview */}
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

          </div>
          <div className="projprev-right">
          <div className="projprevtags">
          <p><strong>{project.tags}</strong></p>
          
          </div>
            <div className="projprevtools">
              <p><strong>{project.tools}</strong></p>
            </div>
            <div className="projpreviewfiles">
              {/* Displaying file names */}
              <p><strong>{getFileName(project.files)}</strong></p>
            </div>
          </div>
        </div>



        <div className="div">
          <button className="delete-btn" onClick={handleDelete}>Delete</button>
          <button className="close-btn" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
} //for pushing purposes, please delete this comment later

export default ProjectPreviewModal;

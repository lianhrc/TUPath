import React, { useState } from 'react';
import './ProjectPreviewModal.css';
import ProjectAssessmentModal from '../popups/ProjectAssessmentModal';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function ProjectPreviewModal({ show, onClose, project, onDelete }) {
  const [showAssessmentModal, setShowAssessmentModal] = useState(false);

  if (!show || !project) return null;

  const handleDelete = () => {
    // Display a confirmation toast
    const toastId = toast.loading('Are you sure you want to delete this project?', {
      position: 'top-center',
      autoClose: 5000, // Keeps the toast open
      closeButton: false,
      draggable: false,
      theme: 'light',
    });
  
    // Show confirmation buttons inside the toast
    toast.update(toastId, {
      render: (
        <div>
          <p>Click to confirm or cancel deletion.</p>
          <div style={{ display: 'flex', justifyContent: 'space-around' }}>
            <button 
              onClick={() => { 
                onDelete(project._id); // Delete the project
                toast.success('Project deleted successfully!', {
                  position: 'top-center',
                   autoClose: 3000,  // Toast will disappear in 1 seconds
                  closeButton: false,
                  draggable: false,
                  theme: 'light',
                });
                toast.dismiss(toastId); // Close the toast after confirming
                onClose(); // Close the modal after confirmation
              }}
              style={{ padding: '5px 10px', backgroundColor: '#9D0E0F', color: 'white' , border: 'none',borderRadius: '5px'}}
            >
              Confirm
            </button>
            <button 
              onClick={() => { 
                toast.info('Project deletion canceled.', {
                  position: 'top-center',
                  autoClose: 3000, // Keeps the toast open
                  closeButton: false,
                  draggable: false,
                  theme: 'light',
                });
                toast.dismiss(toastId,{
                  position: 'top-center',
                  autoClose: 3000, // Keeps the toast open
                  closeButton: false,
                  draggable: false,
                  theme: 'light',
                }); // Close the toast after canceling
              }}
              style={{  padding: '5px 10px', backgroundColor: '#9D0E0F', color: 'white' , border: 'none',borderRadius: '5px'}}
            >
              Cancel
            </button>
          </div>
        </div>
      ),
      autoClose: 3000, // Prevent auto-close
      closeButton: false,
      draggable: false,
      theme: 'light',
    });
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

          </div>

          <div className="projprev-right">
            <div className="projprevtags">
              {project.tag ? (
                <div className="tag-item">{project.tag}</div>
              ) : (
                <p>No tag available</p>
              )}
              {project.tools && project.tools.length > 0 ? (
                project.tools.map((tool, index) => (
                  <div key={index} className="tool-item">{tool}</div>
                ))
              ) : (
                <p>No tools available</p>  
              )}

              {project.roles && project.roles.length > 0 ? (
                project.roles.map((role, index) => (
                  <div key={index} className="role-item">{role}</div>
                ))
              ) : (
                <p>No roles specified.</p>
              )}
            </div>

            <h6>Attachments:</h6>
            <div className="projpreviewfiles">
              {(project.selectedFiles?.length > 0 || project.files?.length > 0) ? (
                <>
                  {project.selectedFiles?.map((file, index) => (
                    <a 
                      key={`selected-${index}`}
                      href={`http://localhost:3001${file}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      {getFileName(file)}
                    </a>
                  ))}
                  {project.files?.map((file, index) => (
                    <a 
                      key={`file-${index}`}
                      href={`http://localhost:3001${file}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      {getFileName(file)}
                    </a>
                  ))}
                </>
              ) : (
                <p>No attachments available</p>
              )}
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

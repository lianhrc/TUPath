import React, { useState } from 'react';
import './CertPreviewModal2.css';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function CertPreviewModal2({ show, onClose, project,  }) {

  if (!show || !project) return null;

  const handleDelete = () => {
    // Display a confirmation toast
    const toastId = toast.loading('Are you sure you want to delete this Certificate?', {
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
                onDelete(project._id); // Delete the certificate
                toast.success('Certificate deleted successfully!', {
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
                toast.info('certificate deletion canceled.', {
                  position: 'top-center',
                  autoClose: 3000, // Keeps the toast open
                  closeButton: false,
                  draggable: false,
                  theme: 'light',
                });
                toast.dismiss(toastId, {
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


  return (
    <div className="projprev-overlay">
      <div className="projprev-content">

      <div className="projprevheader">
          {project.Certificate.CertThumbnail && (
            <img
              src={`http://localhost:3001${project.Certificate.CertThumbnail}`}
              alt="Certificate Thumbnail"
              className="certificate-thumbnail"
            />
          )}
    </div>

        <div className="projprevcontentmain">

        <div className="projprev-left">
             <h3>{project.Certificate.CertName}</h3>
             <p className='projdesccontainer'><strong>{project.Certificate.CertDescription}</strong></p>

          </div>

          <div className="projprev-right">
          <h6>Attachments:</h6>
           
          <div className="projpreviewfiles">
          {project.Certificate.Attachments.length > 0 ? (
            project.Certificate.Attachments.map((attachment, index) => (
              <a key={index} href={`http://localhost:3001${attachment}`} target="_blank" rel="noopener noreferrer">
                {getFileName(attachment)}
              </a>
            ))
          ) : (
            <p>No attachments available</p>
          )}

        </div>
         
           
          </div>
        </div>

        <div className="div">
          <button className="close-btn" onClick={onClose}>Close</button>
        </div>
      </div>

    </div>
  );
}

export default CertPreviewModal2;

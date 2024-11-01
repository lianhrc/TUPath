import React, { useState } from 'react';
import HeaderHomepage from '../../common/headerhomepage';
import MessagePop from '../../popups/messagingpop';
import './Profilepage.css';
import avatar from '../../../assets/profileicon.png';
import location from '../../../assets/location.png';
import since from '../../../assets/since.png';
import projectThumbnail from '../../../assets/joinTUP.jpg';
import ProjectUploadModal from '../../popups/ProjectUpModal';
function Profilepage() {
  const [showUploadModal, setShowUploadModal] = useState(false);

  const handleAddProjectClick = () => setShowUploadModal(true);
  const handleCloseModal = () => setShowUploadModal(false);

  return (
    <div className='Profilepage-container'>
      <HeaderHomepage />
      <MessagePop />
      <div className='main-content'>
        <div className="profile-card">
          <div className="profile-header">
            <img src={avatar} alt="Avatar" className="avatar" />
            <h2>Maykel Jison</h2>
            <p> TUPM - 21 - 0217</p>
            <hr />
            <div className='subheader'>
              <div className='profile-header-left'>
                <p><img src={location} alt="Location" />From</p>
                <p><img src={since} alt="Since" />Member since</p>
              </div>
              <div className='profile-header-right'>
                <p>Manila Tondo</p>
                <p>May 2023</p>
              </div>
            </div>
          </div>

          <div className='profile-main'>
            <div className="profile-section">
              <div className='profilesectiontop'>
                <h3>Description</h3>
                <a href="#">Edit Description</a>
              </div>
              <p>Hello! I am passionate in doing great project like video editing, designs for brochures, YouTube thumbnails and cartoon portraits. In past 3 years I do several works that depends on the clients on what they want.</p>
            </div>
            <div className="profile-section">
              <div className='profilesectiontop'>
                <h3>Skills</h3>
                <a href="#">Add New</a>
              </div>
              <p>Front-end Developer</p>
            </div>
            <div className="profile-section">
              <div className='profilesectiontop'>
                <h3>Certificates / Achievements</h3>
                <a href="#">Add New</a>
              </div>
              <p>N/A</p>
            </div>
          </div>
        </div>

        <div className="projects-section">
          <h3>My Projects</h3>
          <hr />
          <div className="projects-grid">
            <div className="project-card add-project" onClick={handleAddProjectClick}>
              <p>+</p>
              <p>Add a Project</p>
            </div>
            <div className="project-card">
              <img src={projectThumbnail} alt="Project Thumbnail" />
            </div>
            <div className="project-card">
              <img src={projectThumbnail} alt="Project Thumbnail" />
            </div>
            <div className="project-card">
              <img src={projectThumbnail} alt="Project Thumbnail" />
            </div>
            <div className="project-card">
              <img src={projectThumbnail} alt="Project Thumbnail" />
            </div>
          </div>
        </div>
      </div>

      {/* Render the ProjectUploadModal */}
      <ProjectUploadModal show={showUploadModal} onClose={handleCloseModal} />
    </div>
  );
}

export default Profilepage;

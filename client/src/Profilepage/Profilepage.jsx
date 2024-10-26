import React from 'react';
import HeaderHomepage from '../components/headerhomepage';
import MessagePop from '../components/messagingpop';
import './Profilepage.css';
import avatar from '../assets/profile.png';
import location from '../assets/location.png';
import since from '../assets/since.png';
import projectThumbnail from '../assets/joinTUP.jpg';

function Profilepage() {
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
            <hr></hr>
            <div className='subheader'>
              <div className='profile-header-left'>
              <p><img src={location}></img>From</p>
              <p><img src={since}></img>Member since</p>
              </div>
              <div className='profile-header-right'>
                <p>Manila Tondo</p>
                <p>May 2023</p>
              </div>
            </div>
            
          </div>
         
          <div className="profile-section">
            <h3>Description</h3>
            <p>Hello! I am passionate in doing great project like video editing, designs for brochures, YouTube thumbnails and cartoon portraits. In past 3 years I do several works that depends on the clients on what they want.</p>
            <a href="#">Edit Description</a>
          </div>
          <div className="profile-section">
            <h3>Skills</h3>
            <p>Front-end Developer</p>
            <a href="#">Add New</a>
          </div>
          <div className="profile-section">
            <h3>Certificates / Achievements</h3>
            <p>N/A</p>
            <a href="#">Add New</a>
          </div>
        </div>

        <div className="projects-section">
          <h3>My Projects</h3>
          <div className="projects-grid">
            <div className="project-card add-project">
              <p>Add a Project</p>
            </div>
            <div className="project-card">
              <img src={projectThumbnail} alt="Project Thumbnail" />
            </div>
            {/* Add more project cards as needed */}
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
    </div>
  );
}

export default Profilepage;

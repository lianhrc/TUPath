// Profilepage.js
import React, { useState } from 'react';
import HeaderHomepage from '../../common/headerhomepage';
import MessagePop from '../../popups/messagingpop';
import EditDescriptionModal from '../../popups/EditDescriptionModal';
import ProjectUploadModal from '../../popups/ProjectUpModal';
import ProjectPreviewModal from '../../popups/ProjectPreviewModal'; // Import ProjectPreviewModal
import './Profilepage.css';
import avatar from '../../../assets/profileicon.png';
import location from '../../../assets/location.png';
import since from '../../../assets/since.png';
import projectThumbnail from '../../../assets/project1.png';
import GenericModal from '../../popups/GenericModal';

function Profilepage() {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showEditDescriptionModal, setShowEditDescriptionModal] = useState(false);
  const [description, setDescription] = useState('Hello! I am passionate in doing great projects like video editing, designs for brochures, YouTube thumbnails, and cartoon portraits. In the past 3 years, I have done several works that depend on the clients on what they want.');
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [skillsModalOpen, setSkillsModalOpen] = useState(false); // State for skills modal
  const [skills, setSkills] = useState([]); // State to manage skills
  const [certificatesModalOpen, setCertificatesModalOpen] = useState(false); // State for certificates modal
  const [certificates, setCertificates] = useState([]); // State to manage certificates

  const projects = [
    { 
      id: 1, 
      name: 'Project 1', 
      description: 'Description of project 1', 
      duration: '2 months', 
      technologies: 'React, Node.js', 
      image: projectThumbnail 
    },
    { 
      id: 2, 
      name: 'Project 2', 
      description: 'Description of project 2', 
      duration: '1 month', 
      technologies: 'Python, Django', 
      image: projectThumbnail 
    },
    // Add more projects here...
  ];

  const handleAddProjectClick = () => setShowUploadModal(true);
  const handleCloseModal = () => setShowUploadModal(false);
  const handleCloseEditDescriptionModal = () => setShowEditDescriptionModal(false);
  const handleEditDescriptionClick = () => setShowEditDescriptionModal(true);
  const handleSaveDescription = (newDescription) => setDescription(newDescription);
  
  const handleProjectClick = (project) => {
    setSelectedProject(project);
    setShowPreviewModal(true);
  };

  const handleClosePreviewModal = () => {
    setShowPreviewModal(false);
    setSelectedProject(null);
  };

  const handleAddSkillClick = (event) => {
    event.preventDefault(); // Prevent default anchor click behavior
    setSkillsModalOpen(true); // Open skills modal
  };
  
  const handleCloseSkillsModal = () => setSkillsModalOpen(false); // Close skills modal
  const addSkill = (newSkill) => {
    setSkills([newSkill]); // Replace existing skills with the new one
  };

  const handleAddCertificateClick = (event) => {
    event.preventDefault(); // Prevent default anchor click behavior
    setCertificatesModalOpen(true); // Open certificates modal
  };
  
  const handleCloseCertificatesModal = () => setCertificatesModalOpen(false); // Close certificates modal
  const addCertificate = (newCertificate) => {
    setCertificates([newCertificate]); // Replace existing certificates with the new one
  };

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
                <a href="#" onClick={handleEditDescriptionClick}>Edit Description</a>
              </div>
              <p>{description}</p>
            </div>
            <div className="profile-section">
              <div className='profilesectiontop'>
                <h3>Skills</h3>
                <a href="#" onClick={handleAddSkillClick}>Add New</a> {/* Open skills modal */}
              </div>
              <p>{skills.length > 0 ? skills.join(', ') : 'N/A'}</p> {/* Display the most recent skill or 'N/A' */}
            </div>
            <div className="profile-section">
              <div className='profilesectiontop'>
                <h3>Certificates / Achievements</h3>
                <a href="#" onClick={handleAddCertificateClick}>Add New</a> {/* Open certificates modal */}
              </div>
              <p>{certificates.length > 0 ? certificates.join(', ') : 'N/A'}</p> {/* Display the most recent certificate or 'N/A' */}
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
            {projects.map((project) => (
              <div 
                key={project.id} 
                className="project-card" 
                onClick={() => handleProjectClick(project)}
              >
                <img src={project.image} alt="Project Thumbnail" />
              </div>
            ))}
          </div>
        </div>
      </div>

      <ProjectUploadModal show={showUploadModal} onClose={handleCloseModal} />
      <EditDescriptionModal 
        show={showEditDescriptionModal} 
        onClose={handleCloseEditDescriptionModal} 
        currentDescription={description} 
        onSave={handleSaveDescription} 
      />
      <ProjectPreviewModal 
        show={showPreviewModal} 
        onClose={handleClosePreviewModal} 
        project={selectedProject} 
      />

      <GenericModal 
        show={skillsModalOpen} 
        onClose={handleCloseSkillsModal} 
        title="Add New Skill" 
        onSave={addSkill} 
      />

      <GenericModal 
        show={certificatesModalOpen} 
        onClose={handleCloseCertificatesModal} 
        title="Add New Certificate" 
        onSave={addCertificate} 
      />
    </div>
  );
}

export default Profilepage;

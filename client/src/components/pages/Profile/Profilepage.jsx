import React, { useState, useEffect } from 'react';
import axiosInstance from '../../../services/axiosInstance';
import HeaderHomepage from '../../common/headerhomepage';
import './Profilepage.css';
import avatar from '../../../assets/profileicon.png'; // Fallback avatar image
import location from '../../../assets/location.png';
import since from '../../../assets/since.png';
import MessagePop from '../../popups/messagingpop';
import EditDescriptionModal from '../../popups/EditDescriptionModal';
import ProjectUploadModal from '../../popups/ProjectUpModal';
import ProjectPreviewModal from '../../popups/ProjectPreviewModal'; // Import ProjectPreviewModal
import GenericModal from '../../popups/GenericModal';
import CertUpModal from '../../popups/CertUpModal';
import Loader from '../../common/Loader'; // Import your Loader component


function Profilepage() {
    const [profileData, setProfileData] = useState({});
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState(''); // For feedback messages

    const [showUploadModal, setShowUploadModal] = useState(false);
    const [showEditDescriptionModal, setShowEditDescriptionModal] = useState(false);
    const [showPreviewModal, setShowPreviewModal] = useState(false);
    const [selectedProject, setSelectedProject] = useState(null);
    const [skillsModalOpen, setSkillsModalOpen] = useState(false); // State for skills modal
    const [skills, setSkills] = useState([]); // State to manage skills
    const [certificatesModalOpen, setCertificatesModalOpen] = useState(false); // State for certificates modal
  

    const handleAddProjectClick = () => setShowUploadModal(true);
    const handleCloseModal = () => setShowUploadModal(false);
    const handleCloseEditDescriptionModal = () => setShowEditDescriptionModal(false);
    const handleEditDescriptionClick = () => setShowEditDescriptionModal(true);
    const handleSaveDescription = (newDescription) => setDescription(newDescription);
  
   /*const handleProjectClick = (project) => {
        setSelectedProject(project);
        setShowPreviewModal(true);
      };*/
    
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
    

    useEffect(() => {
        const fetchProfileData = async () => {
            try {
                const response = await axiosInstance.get('/api/profile');
                if (response.data.success) {
                    setProfileData(response.data.profile);
                    setDescription(response.data.profile.profileDetails?.bio || '');
                }
            } catch (error) {
                console.error('Error fetching profile data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchProfileData();
    }, []);

    if (loading) {
        return <Loader />; // Show Loader while the data is being fetched
    }

    const profileImageUrl = profileData.profileDetails?.profileImg
        ? `http://localhost:3001${profileData.profileDetails.profileImg}`
        : avatar; // Use fallback avatar if no image is provided

   

    return (
        <div className='Profilepage-container'>
            <HeaderHomepage />
            <div className='main-content'>
                <div className="profile-card">
                    <div className="profile-header">
                        <img
                            src={profileImageUrl} // Dynamically set profile image URL
                            alt="User Profile"
                            className="avatar"
                        />
                        <h2>{profileData.profileDetails?.fullName || 'Name Not Available'}</h2>
                        <p>{profileData.profileDetails?.studentId || 'Student ID Not Available'}</p>
                        <hr />
                        <div className='subheader'>
                            <div className='profile-header-left'>
                                <p><img src={location} alt="Location" />From</p>
                                <p><img src={since} alt="Since" />Member since</p>
                            </div>
                            <div className='profile-header-right'>
                                <p>{profileData.profileDetails?.city || 'City Not Available'}</p>
                                <p>{profileData.createdAt ? new Date(profileData.createdAt).toLocaleDateString() : 'Date Not Available'}</p>
                            </div>
                        </div>
                    </div>

                    <div className='profile-main'>

                        <div className="profile-section">
                            <div className='profilesectiontop'>
                                    <h3>Description</h3>
                                    <a href="#" onClick={handleEditDescriptionClick}>Edit</a>
                            </div>
                                    
                                <p>{description || 'No description available'}</p>
                        </div>

                            <div className="profile-section">
                                <div className='profilesectiontop'>
                                    <h3>Department</h3>
                                    <a href="#" onClick={handleAddSkillClick}>Edit</a> {/* Open skills modal */}

                                    </div>
                                <p>{profileData.profileDetails?.department || 'Department Not Available'}</p>
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
                                    <h3>Year Level</h3>
                                    <a href="#" onClick={handleEditDescriptionClick}>Edit</a>

                                </div>
                                    <p>{profileData.profileDetails?.yearLevel || 'Year Level Not Available'}</p>
                            </div>

                            <div className="profile-section">
                                <div className='profilesectiontop'>
                                    <h3>Contact</h3>
                                    <a href="#" onClick={handleEditDescriptionClick}>Edit</a>

                                </div>
                                    <p>{profileData.profileDetails?.contact || 'Contact Not Available'}</p>
                            </div>
                            {message && <p className="feedback-message">{message}</p>}
                            </div>

                            
                        </div>
                        
                        <div className="project-section">

                            <div className="projectscontainer">
                                <h3>My Projects</h3>
                                <hr />
                                <div className="projects-grid">
                                    <div className="project-card add-project" onClick={handleAddProjectClick}>

                                    
                                        <p>+</p>
                                        <p>Add a Project</p>
                                    </div>
                                </div>
                            </div>
                           
                           <div className="achievementscontainer">
                                <h3>My Certificates </h3>
                                <hr />
                                <div className="projects-grid">
                                    <div className="project-card add-project" onClick={handleAddCertificateClick}>

                                    
                                        {/*<input type="file" multiple onChange={handleCertificateUpload} />*/}
                                        <p>+</p>
                                        <p>Add a Certificates</p>
                                    </div>
                                </div>
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
    
        
          <CertUpModal 
            show={certificatesModalOpen} 
            onClose={handleCloseCertificatesModal} 
            />
    
          <MessagePop />
      
        </div>
    
        
    );
}

export default Profilepage;

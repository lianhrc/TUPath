import React, { useState, useEffect } from 'react';
import axiosInstance from '../../../services/axiosInstance';
import HeaderHomepage from '../../common/headerhomepage';
import './Profilepage.css';
import avatar from '../../../assets/profileicon.png';
import location from '../../../assets/location.png';
import since from '../../../assets/since.png';
import MessagePop from '../../popups/messagingpop';
import EditDescriptionModal from '../../popups/EditDescriptionModal';
import ProjectUploadModal from '../../popups/ProjectUpModal';
import ProjectPreviewModal from '../../popups/ProjectPreviewModal';
import GenericModal from '../../popups/GenericModal';
import CertUpModal from '../../popups/CertUpModal';
import edit from '../../../assets/writemessage.png';
import Loader from '../../common/Loader';

function ProfilePage() {
  const [profileData, setProfileData] = useState({});
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState('');

  // Modals
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showEditDescriptionModal, setShowEditDescriptionModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [skillsModalOpen, setSkillsModalOpen] = useState(false);
  const [certificatesModalOpen, setCertificatesModalOpen] = useState(false);
  
  

  // Fetch profile data
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const response = await axiosInstance.get('/api/profile');
        if (response.data.success) {
          const { profileDetails, role, createdAt } = response.data.profile;
          setProfileData({ ...profileDetails, createdAt }); // Include createdAt
          setUserRole(role);
          setDescription(profileDetails?.bio || profileDetails?.aboutCompany || '');
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
    return <Loader />;
  }

  const profileImageUrl = profileData.profileImg?.startsWith('/')
  ? `http://localhost:3001${profileData.profileImg}`
  : profileData.profileImg || avatar;


  return (
    <div className='Profilepage-container'>
      <HeaderHomepage />
      <div className='main-content'>
        <div className='profile-card'>
          <div className='profile-header'>
            <img src={profileImageUrl} alt='User Profile' className='avatar' />
            <h2>{`${profileData.firstName || ''} ${profileData.middleName || ''} ${profileData.lastName || ''}`.trim()}</h2>
            <p>{userRole === 'student' ? profileData.studentId || 'Student ID Not Available' : profileData.companyName || 'Company Name Not Available'}</p>
            <hr />
            <div className='subheader'>
              <div className='profile-header-left'>
                <p><img src={location} alt='Location' />From</p>
                <p><img src={since} alt='Since' />Member since</p>
              </div>
              <div className='profile-header-right'>
                <p>{profileData.address || profileData.location || 'Location Not Available'}</p>
                <p>
  {profileData.createdAt
    ? (() => {
        const date = new Date(profileData.createdAt);
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-indexed
        const day = String(date.getDate()).padStart(2, '0');
        const year = date.getFullYear();
        return `${month}-${day}-${year}`;
      })()
    : 'Date Not Available'}
</p>



              </div>
            </div>
          </div>

          {/* Profile Main Section */}
          <div className='profile-main'>
            <div className="profile-section">
              <div className="div">
                  <a href="#" onClick={() => setShowEditDescriptionModal(true)}> <img src={edit} alt="" /> </a>
              </div>        
            
          </div>
            

            {/* Student Profile Details */}
            {userRole === 'student' && (
              <>
                <div className='profile-section'><h3>Student ID</h3><p>{profileData.studentId || 'Not Available'}</p></div>
                <div className='profile-section'><h3>Department</h3><p>{profileData.department || 'Not Available'}</p></div>
                <div className='profile-section'><h3>Year Level</h3><p>{profileData.yearLevel || 'Not Available'}</p></div>
                <div className='profile-section'><h3>Date of Birth</h3><p>{profileData.dob ? new Date(profileData.dob).toLocaleDateString() : 'Not Available'}</p></div>
                <div className='profile-section'><h3>Technical Skills</h3><p>{profileData.techSkills?.join(', ') || 'Not Available'}</p></div>
                <div className='profile-section'><h3>Soft Skills</h3><p>{profileData.softSkills?.join(', ') || 'Not Available'}</p></div>
              
              </>
            )}

            {/* Employer Profile Details */}
            {userRole === 'employer' && (
              <>
                <div className='profile-section'><h3>Company Name</h3><p>{profileData.companyName || 'Not Available'}</p></div>
                <div className='profile-section'><h3>Industry</h3><p>{profileData.industry || 'Not Available'}</p></div>
                <div className='profile-section'><h3>About Company</h3><p>{profileData.aboutCompany || 'Not Available'}</p></div>
                <div className='profile-section'><h3>Contact Person</h3><p>{profileData.contactPersonName || 'Not Available'}</p></div>
                <div className='profile-section'><h3>Position</h3><p>{profileData.position || 'Not Available'}</p></div>
                <div className='profile-section'><h3>Date of Birth</h3><p>{profileData.dob ? new Date(profileData.dob).toLocaleDateString() : 'Not Available'}</p></div>
                <div className='profile-section'><h3>Phone Number</h3><p>{profileData.phoneNumber || 'Not Available'}</p></div>
                <div className='profile-section'><h3>Preferred Roles</h3><p>{profileData.preferredRoles?.join(', ') || 'Not Available'}</p></div>
                <div className='profile-section'><h3>Internship Opportunities</h3><p>{profileData.internshipOpportunities ? 'Yes' : 'No'}</p></div>
                <div className='profile-section'>
                <h3>Preferred Skills</h3>
                <p>{Array.isArray(profileData.preferredSkills) ? profileData.preferredSkills.join(', ') : 'Not Available'}</p>
              </div>
              </>
              
            )}
            

            {/* Common Profile Details */}
            <div className='profile-section'><h3>Gender</h3><p>{profileData.gender || 'Not Available'}</p></div>
            <div className='profile-section'><h3>Contact</h3><p>{profileData.contact || profileData.phoneNumber || 'Not Available'}</p></div>
            <div className='profile-section'><h3>Email</h3><p>{profileData.email || 'Not Available'}</p></div>
          </div>
        </div>

            {/* Project and Certificate Sections */}
              {userRole === 'student' && (
                <div className="project-section">
                  <div className="projectscontainer">
                    <h3>My Projects</h3>
                    <hr />
                    <div className="projects-grid">
                      <div className="project-card add-project" onClick={() => setShowUploadModal(true)}>
                        <p>+</p>
                        <p>Add a Project</p>
                      </div>
                    </div>
                  </div>

                  <div className="achievementscontainer">
                    <h3>My Certificates</h3>
                    <hr />
                    <div className="projects-grid">
                      <div className="project-card add-project" onClick={() => setCertificatesModalOpen(true)}>
                        <p>+</p>
                        <p>Add a Certificate</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}


              {/* Project and Certificate Sections */}
              {userRole === 'employer' && (
                <div className="project-section">
                  <div className="projectscontainer">
                    <h3>Company Projects</h3>
                    <hr />
                    <div className="projects-grid">
                      <div className="project-card add-project" onClick={() => setShowUploadModal(true)}>
                        <p>+</p>
                        <p>Add a Project</p>
                      </div>
                    </div>
                  </div>

                  <div className="achievementscontainer">
                    <h3>My Certificates</h3>
                    <hr />
                    <div className="projects-grid">
                      <div className="project-card add-project" onClick={() => setCertificatesModalOpen(true)}>
                        <p>+</p>
                        <p>Add a Certificate</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}



        {/* Modals */}
        <ProjectUploadModal show={showUploadModal} onClose={() => setShowUploadModal(false)} />
        <EditDescriptionModal 
                    show={showEditDescriptionModal} 
                    onClose={() => setShowEditDescriptionModal(false)} 
                    profileData={profileData} 
                    onSave={(updatedData) => setProfileData(updatedData)} 
                />
        
        <ProjectPreviewModal show={showPreviewModal} onClose={() => setShowPreviewModal(false)} project={selectedProject} />
        <GenericModal show={skillsModalOpen} onClose={() => setSkillsModalOpen(false)} title='Add New Skill' onSave={(newSkill) => setProfileData((prev) => ({ ...prev, techSkills: [...(prev.techSkills || []), newSkill] }))} />
        <CertUpModal show={certificatesModalOpen} onClose={() => setCertificatesModalOpen(false)} />
        <MessagePop />
      </div>
    </div>
  );
}

export default ProfilePage;

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
import Loader from '../../common/Loader';

function ProfilePage() {
  const [profileData, setProfileData] = useState({
    studentId: '',
    firstName: '',
    lastName: '',
    middleName: '',
    department: 'Information Technology',
    yearLevel: '',
    dob: '',
    gender: '',
    address: '',
    techSkills: [],
    softSkills: [],
    contact: '',
    email: '',
  });
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);

  // Modals
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showEditDescriptionModal, setShowEditDescriptionModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [skillsModalOpen, setSkillsModalOpen] = useState(false);
  const [certificatesModalOpen, setCertificatesModalOpen] = useState(false);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const response = await axiosInstance.get('/api/profile');
        console.log(response.data); // Debug log
        if (response.data.success) {
          const profile = response.data.profile.profileDetails || {};
          setProfileData({
            studentId: profile.studentId || '',
            firstName: profile.firstName || '',
            lastName: profile.lastName || '',
            middleName: profile.middleName || '',
            department: profile.department || 'Information Technology',
            yearLevel: profile.yearLevel || '',
            dob: profile.dob || '',
            gender: profile.gender || '',
            address: profile.address || '',
            techSkills: profile.techSkills || [],
            softSkills: profile.softSkills || [],
            contact: profile.contact || '',
            email: profile.email || '',
          });
          setDescription(profile.bio || '');
        } else {
          console.error('Profile data not found');
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

  const profileImageUrl = profileData.profileImg
    ? `http://localhost:3001${profileData.profileImg}`
    : avatar;

  return (
    <div className='Profilepage-container'>
      <HeaderHomepage />
      <div className='main-content'>
        <div className='profile-card'>
          <div className='profile-header'>
            <img src={profileImageUrl} alt='User Profile' className='avatar' />
            <h2>
              {`${profileData.firstName} ${profileData.middleName || ''} ${profileData.lastName}`.trim() ||
                'Name Not Available'}
            </h2>
            <p>{profileData.studentId || 'Student ID Not Available'}</p>
            <hr />
            <div className='subheader'>
              <div className='profile-header-left'>
                <p><img src={location} alt='Location' />From</p>
                <p><img src={since} alt='Since' />Member since</p>
              </div>
              <div className='profile-header-right'>
                <p>{profileData.address || 'Address Not Available'}</p>
                <p>
                  {profileData.createdAt
                    ? new Date(profileData.createdAt).toLocaleDateString()
                    : 'Date Not Available'}
                </p>
              </div>
            </div>
          </div>

          {/* Profile Details */}
          <div className='profile-main'>
            <div className='profile-section'>
              <h3>Description</h3>
              <p>{description || 'No description available'}</p>
              <a href='#' onClick={() => setShowEditDescriptionModal(true)}>Edit</a>
            </div>

            {[
              { label: 'Student ID', value: profileData.studentId },
              { label: 'Name', value: `${profileData.firstName} ${profileData.middleName || ''} ${profileData.lastName}`.trim() },
              { label: 'Date of Birth', value: profileData.dob },
              { label: 'Gender', value: profileData.gender },
              { label: 'Department', value: profileData.department },
              { label: 'Year Level', value: profileData.yearLevel },
              { label: 'Address', value: profileData.address },
              { label: 'Technical Skills', value: profileData.techSkills.join(', ') },
              { label: 'Soft Skills', value: profileData.softSkills.join(', ') },
              { label: 'Contact', value: profileData.contact },
              { label: 'Email', value: profileData.email },
            ].map((item, index) => (
              <div className='profile-section' key={index}>
                <h3>{item.label}</h3>
                <p>{item.value || 'Not Available'}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Modals */}
        <ProjectUploadModal show={showUploadModal} onClose={() => setShowUploadModal(false)} />
        <EditDescriptionModal
          show={showEditDescriptionModal}
          onClose={() => setShowEditDescriptionModal(false)}
          currentDescription={description}
          onSave={setDescription}
        />
        <ProjectPreviewModal
          show={showPreviewModal}
          onClose={() => setShowPreviewModal(false)}
          project={selectedProject}
        />
        <GenericModal
          show={skillsModalOpen}
          onClose={() => setSkillsModalOpen(false)}
          title='Add New Skill'
          onSave={(newSkill) => setProfileData((prev) => ({
            ...prev,
            techSkills: [...prev.techSkills, newSkill],
          }))}
        />
        <CertUpModal show={certificatesModalOpen} onClose={() => setCertificatesModalOpen(false)} />
        <MessagePop />
      </div>
    </div>
  );
}

export default ProfilePage;

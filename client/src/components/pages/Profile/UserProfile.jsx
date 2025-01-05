import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axiosInstance from '../../../services/axiosInstance';
import HeaderHomepage from '../../common/headerhomepage';
import ProjectPreviewModal2 from '../../popups/ProjectPreviewModal2';
import CertPreviewModal2 from '../../popups/CertPreviewModal2';
import './UserProfile.css';
import avatar from '../../../assets/profileicon.png';
import location from '../../../assets/location.png';
import since from '../../../assets/since.png';
import Loader from '../../common/Loader';

function UserProfile() {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [projects, setProjects] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedCertificate, setSelectedCertificate] = useState(null);
  const [showProjectPreviewModal, setShowProjectPreviewModal] = useState(false);
  const [showCertPreviewModal, setShowCertPreviewModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch profile, projects, and certificates
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axiosInstance.get(`/api/profile/${id}`);
        if (response.data.success) {
          setProfile(response.data.profile);
          setProjects(response.data.profile.profileDetails?.projects || []);
          setCertificates(response.data.profile.profileDetails?.certificates || []);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [id]);

  if (isLoading) {
    return <Loader />;
  }

  if (!profile) {
    return <p>Profile not found.</p>;
  }

  const profileImageUrl = profile.profileDetails?.profileImg?.startsWith('/')
    ? `http://localhost:3001${profile.profileDetails.profileImg}`
    : profile.profileDetails?.profileImg || avatar;

  const formattedDate = (date) => {
    if (!date) return 'Not Available';
    const parsedDate = new Date(date);
    return `${String(parsedDate.getMonth() + 1).padStart(2, '0')}-${String(parsedDate.getDate()).padStart(2, '0')}-${parsedDate.getFullYear()}`;
  };

  return (
    <div className="Profilepage-container">
      <HeaderHomepage />
      <div className="main-content">
        <div className="profile-card">
          <div className="profile-header">
            <img src={profileImageUrl} alt="User Profile" className="avatar" />
            <h3>{`${profile.profileDetails.firstName || ''} ${profile.profileDetails.middleName || ''} ${profile.profileDetails.lastName || ''}`.trim()}</h3>
            <p>
              {profile.role === 'student'
                ? profile.profileDetails?.studentId || 'Student ID Not Available'
                : profile.profileDetails?.companyName || 'Company Name Not Available'}
            </p>
            <hr />
            <div className="subheader">
              <div className="profile-header-left">
                <p>
                  <img src={location} alt="Location" />
                  From
                </p>
                <p>
                  <img src={since} alt="Since" />
                  Member since
                </p>
              </div>
              <div className="profile-header-right">
                <p>{profile.profileDetails?.address || profile.profileDetails?.location || 'Location Not Available'}</p>
                <p>{formattedDate(profile.createdAt)}</p>
              </div>
            </div>
          </div>

          {/* Profile Main Section */}
          <div className="profile-main">
            {/* Student Profile Details */}
            {profile.role === 'student' && (
              <>
                <div className="profile-section">
                  <h3>Student ID</h3>
                  <p>{profile.profileDetails?.studentId || 'Not Available'}</p>
                </div>
                <div className="profile-section">
                  <h3>Department</h3>
                  <p>{profile.profileDetails?.department || 'Not Available'}</p>
                </div>
                <div className="profile-section">
                  <h3>Year Level</h3>
                  <p>{profile.profileDetails?.yearLevel || 'Not Available'}</p>
                </div>
                <div className="profile-section">
                  <h3>Date of Birth</h3>
                  <p>{profile.profileDetails?.dob ? new Date(profile.profileDetails.dob).toLocaleDateString() : 'Not Available'}</p>
                </div>
                <div className="profile-section">
                  <h3>Technical Skills</h3>
                  <p>{profile.profileDetails?.techSkills?.join(', ') || 'Not Available'}</p>
                </div>
                <div className="profile-section">
                  <h3>Soft Skills</h3>
                  <p>{profile.profileDetails?.softSkills?.join(', ') || 'Not Available'}</p>
                </div>
              </>
            )}

            {/* Employer Profile Details */}
            {profile.role === 'employer' && (
              <>
                <div className="profile-section">
                  <h3>Company Name</h3>
                  <p>{profile.profileDetails?.companyName || 'Not Available'}</p>
                </div>
                <div className="profile-section">
                  <h3>Industry</h3>
                  <p>{profile.profileDetails?.industry || 'Not Available'}</p>
                </div>
                <div className="profile-section">
                  <h3>Contact Person</h3>
                  <p>{profile.profileDetails?.contactPersonName || 'Not Available'}</p>
                </div>
                <div className="profile-section">
                  <h3>Position</h3>
                  <p>{profile.profileDetails?.position || 'Not Available'}</p>
                </div>
                <div className="profile-section">
                  <h3>Date of Birth</h3>
                  <p>{profile.profileDetails?.dob ? new Date(profile.profileDetails.dob).toLocaleDateString() : 'Not Available'}</p>
                </div>
                <div className="profile-section">
                  <h3>Phone Number</h3>
                  <p>{profile.profileDetails?.phoneNumber || 'Not Available'}</p>
                </div>
                <div className="profile-section">
                  <h3>Preferred Roles</h3>
                  <p>{profile.profileDetails?.preferredRoles?.join(', ') || 'Not Available'}</p>
                </div>
                <div className="profile-section">
                  <h3>Internship Opportunities</h3>
                  <p>{profile.profileDetails?.internshipOpportunities ? 'Yes' : 'No'}</p>
                </div>
          
               
              </>
            )}

            {/* Common Profile Details */}
            <div className="profile-section">
              <h3>Gender</h3>
              <p>{profile.profileDetails?.gender || 'Not Available'}</p>
            </div>
            <div className="profile-section">
              <h3>Contact</h3>
              <p>{profile.profileDetails?.contact || profile.profileDetails?.phoneNumber || 'Not Available'}</p>
            </div>
            <div className="profile-section">
              <h3>Email</h3>
              <p>{profile.email || 'Not Available'}</p>
            </div>
            
            </div>  
            
                
          </div>

          {profile.role === 'employer' && (
            <div className="userproject-section2">
              <h3 className="section-title">About Company</h3>
              <div className="project-grid2">
                <p className="about-text">{profile.profileDetails?.aboutCompany || 'Not Available'}</p>
              </div>
            </div>
          )}
          
          
          

        {/* Project Section (for students only) */}
        {profile.role === 'student' && (
          <div className="userproject-section">
            <h3>Projects</h3>
            <div className="projects-grid">
              {projects.length > 0 ? (
                projects.map((project) => (
                  <div
                    key={project._id}
                    className="project-card"
                    onClick={() => {
                      setSelectedProject(project);
                      setShowProjectPreviewModal(true); // Open the modal for projects
                    }}
                  >
                    <img
                      src={project.thumbnail?.startsWith('/') ? `http://localhost:3001${project.thumbnail}` : project.thumbnail || avatar}
                      alt={project.projectName}
                    />
                    <p>{project.projectName}</p>
                  </div>
                ))
              ) : (
                <p>No projects available</p>
              )}
            </div>

              <h3>Certificates</h3>
              <div className="projects-grid">
              {certificates.length > 0 ? (
                certificates.map((certificate) => (
                  <div
                    key={certificate._id}
                    className="project-card"
                    onClick={() => {
                      setSelectedCertificate(certificate || {});
                      setShowCertPreviewModal(true);
                    }}
                  >
                    {certificate.Certificate?.CertThumbnail && (
                      <img
                        src={`http://localhost:3001${certificate.Certificate.CertThumbnail}`}
                        alt="Certificate Thumbnail"
                        className="certificate-thumbnail"
                      />
                    )}
                    <p>{certificate.Certificate?.CertName || 'No Name Available'}</p>
                  </div>
                ))
              ) : (
                <p>No certificates available</p>
              )}
              
              </div>
          </div>
        )}

        {/* Modals */}
        <ProjectPreviewModal2 show={showProjectPreviewModal} onClose={() => setShowProjectPreviewModal(false)} project={selectedProject} />
        <CertPreviewModal2 show={showCertPreviewModal} onClose={() => setShowCertPreviewModal(false)} project={selectedCertificate} /> {/* Update to use the correct state */}

      </div>
    </div>
  );
}

export default UserProfile;

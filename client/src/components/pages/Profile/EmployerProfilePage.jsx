import React, { useState, useEffect } from 'react';
import axiosInstance from '../../../services/axiosInstance';
import HeaderHomepage from '../../common/headerhomepage';
import './EmployerProfilePage.css';
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

function EmployerProfilePage() {
    const [profileData, setProfileData] = useState({
        firstName: '',
        lastName: '',
        middleName: '',
        dob: '',
        gender: '',
        nationality: '',
        address: '',
        companyName: '',
        industry: '',
        location: '',
        aboutCompany: '',
        contactPersonName: '',
        position: '',
        email: '',
        phoneNumber: '',
        preferredRoles: '',
        internshipOpportunities: false,
        preferredSkills: '',
        profileImg: '',
        createdAt: '',
    });
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(true);

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
                if (response.data.success) {
                    setProfileData(response.data.profile.profileDetails || {});
                    setDescription(response.data.profile.profileDetails?.aboutCompany || '');
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

    const profileImageUrl = profileData.profileImg ? `http://localhost:3001${profileData.profileImg}` : avatar;

    return (
        <div className='Profilepage-container'>
            <HeaderHomepage />
            <div className='main-content'>
                <div className="profile-card">
                    <div className="profile-header">
                        <img src={profileImageUrl} alt="User Profile" className="avatar" />
                        <h2>{`${profileData.firstName} ${profileData.middleName || ''} ${profileData.lastName}`.trim() || 'Name Not Available'}</h2>
                        <p>{profileData.companyName || 'Company Name Not Available'}</p>
                        <hr />
                        <div className='subheader'>
                            <div className='profile-header-left'>
                                <p><img src={location} alt="Location" />From</p>
                                <p><img src={since} alt="Since" />Member since</p>
                            </div>
                            <div className='profile-header-right'>
                                <p>{profileData.location || 'Location Not Available'}</p>
                                <p>{profileData.createdAt ? new Date(profileData.createdAt).toLocaleDateString() : 'Date Not Available'}</p>
                            </div>
                        </div>
                    </div>

                    <div className='profile-main'>
                        <div className="profile-section">
                            <div className='profilesectiontop'>
                                <h3>Description</h3>
                                <a href="#" onClick={() => setShowEditDescriptionModal(true)}>Edit</a>
                            </div>
                            <p>{description || 'No description available'}</p>
                        </div>

                        {/* Profile Fields */}
                        <div className="profile-section">
                            <div className='profilesectiontop'>
                                <h3>Company Name</h3>
                            </div>
                            <p>{profileData.companyName || 'Not Available'}</p>
                        </div>

                        <div className="profile-section">
                            <div className='profilesectiontop'>
                                <h3>Industry</h3>
                            </div>
                            <p>{profileData.industry || 'Not Available'}</p>
                        </div>

                        <div className="profile-section">
                            <div className='profilesectiontop'>
                                <h3>Location</h3>
                            </div>
                            <p>{profileData.location || 'Not Available'}</p>
                        </div>

                        <div className="profile-section">
                            <div className='profilesectiontop'>
                                <h3>About Company</h3>
                            </div>
                            <p>{profileData.aboutCompany || 'Not Available'}</p>
                        </div>

                        <div className="profile-section">
                            <div className='profilesectiontop'>
                                <h3>Contact Person</h3>
                            </div>
                            <p>{profileData.contactPersonName || 'Not Available'}</p>
                        </div>

                        <div className="profile-section">
                            <div className='profilesectiontop'>
                                <h3>Position</h3>
                            </div>
                            <p>{profileData.position || 'Not Available'}</p>
                        </div>

                        <div className="profile-section">
                            <div className='profilesectiontop'>
                                <h3>Email</h3>
                            </div>
                            <p>{profileData.email || 'Not Available'}</p>
                        </div>

                        <div className="profile-section">
                            <div className='profilesectiontop'>
                                <h3>Phone Number</h3>
                            </div>
                            <p>{profileData.phoneNumber || 'Not Available'}</p>
                        </div>

                        <div className="profile-section">
                            <div className='profilesectiontop'>
                                <h3>Preferred Roles</h3>
                            </div>
                            <p>{profileData.preferredRoles || 'Not Available'}</p>
                        </div>

                        <div className="profile-section">
                            <div className='profilesectiontop'>
                                <h3>Internship Opportunities</h3>
                            </div>
                            <p>{profileData.internshipOpportunities ? 'Yes' : 'No'}</p>
                        </div>

                        <div className="profile-section">
                            <div className='profilesectiontop'>
                                <h3>Preferred Skills</h3>
                            </div>
                            <p>{profileData.preferredSkills || 'Not Available'}</p>
                        </div>
                    </div>

                    {/* Project and Certificate Sections */}
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
                    title="Add New Skill" 
                    onSave={(newSkill) => setProfileData((prev) => ({ ...prev, preferredSkills: [...prev.preferredSkills, newSkill] }))} 
                />
                <CertUpModal 
                    show={certificatesModalOpen} 
                    onClose={() => setCertificatesModalOpen(false)} 
                />
                <MessagePop />
            </div>
        </div>
    );
}

export default EmployerProfilePage;

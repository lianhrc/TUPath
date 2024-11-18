import React, { useState, useEffect } from 'react';
import axiosInstance from '../../../services/axiosInstance';
import HeaderHomepage from '../../common/headerhomepage';
import './Profilepage.css';
import avatar from '../../../assets/profileicon.png';
import location from '../../../assets/location.png';
import edit from '../../../assets/writemessage.png'
import since from '../../../assets/since.png';
import MessagePop from '../../popups/messagingpop';
import EditDescriptionModal from '../../popups/EditDescriptionModal';
import ProjectUploadModal from '../../popups/ProjectUpModal';
import ProjectPreviewModal from '../../popups/ProjectPreviewModal';
import GenericModal from '../../popups/GenericModal';
import CertUpModal from '../../popups/CertUpModal';
import Loader from '../../common/Loader';

function Profilepage() {
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
                        <p>{profileData.studentId || 'Student ID Not Available'}</p>
                        <hr />
                        <div className='subheader'>
                            <div className='profile-header-left'>
                                <p><img src={location} alt="Location" />From</p>
                                <p><img src={since} alt="Since" />Member since</p>
                            </div>
                            <div className='profile-header-right'>
                                <p>{profileData.address || 'Address Not Available'}</p>
                                <p>{profileData.createdAt ? new Date(profileData.createdAt).toLocaleDateString() : 'Date Not Available'}</p>
                            </div>
                        </div>
                    </div>

                    <div className='profile-main'>
                      <div className="profile-section">
                         <div className="div">
                             <a href="#" onClick={() => setShowEditDescriptionModal(true)}> <img src={edit} alt="" /> </a>

                         </div>                           

                        {/* Added Profile Fields */}
                        <div className="profile-section">
                            <div className='profilesectiontop'>
                                <h3>Date of Birth</h3>
                            </div>
                            <p>{profileData.dob || 'Not Available'}</p>
                        </div>

                        <div className="profile-section">
                            <div className='profilesectiontop'>
                                <h3>Gender</h3>
                            </div>
                            <p>{profileData.gender || 'Not Available'}</p>
                        </div>

                        <div className="profile-section">
                            <div className='profilesectiontop'>
                                <h3>Department</h3>
                            </div>
                            <p>{profileData.department}</p>
                        </div>

                        <div className="profile-section">
                            <div className='profilesectiontop'>
                                <h3>Year Level</h3>
                            </div>
                            <p>{profileData.yearLevel || 'Not Available'}</p>
                        </div>

                        <div className="profile-section">
                            <div className='profilesectiontop'>
                                <h3>Address</h3>
                            </div>
                            <p>{profileData.address || 'Not Available'}</p>
                        </div>

                        <div className="profile-section">
                            <div className='profilesectiontop'>
                                <h3>Technical Skills</h3>
                            </div>
                            <p>{profileData.techSkills.length > 0 ? profileData.techSkills.join(', ') : 'N/A'}</p>
                        </div>

                        <div className="profile-section">
                            <div className='profilesectiontop'>
                                <h3>Soft Skills</h3>
                            </div>
                            <p>{profileData.softSkills.length > 0 ? profileData.softSkills.join(', ') : 'N/A'}</p>
                        </div>

                        <div className="profile-section">
                            <div className='profilesectiontop'>
                                <h3>Contact</h3>
                            </div>
                            <p>{profileData.contact || 'Not Available'}</p>
                        </div>

                        <div className="profile-section">
                            <div className='profilesectiontop'>
                                <h3>Email</h3>
                            </div>
                            <p>{profileData.email || 'Not Available'}</p>
                        </div>
                        </div>

                    </div>

                    {/* Project and Certificate Sections */}
                    </div>
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

                {/* Modals */}
                <ProjectUploadModal show={showUploadModal} onClose={() => setShowUploadModal(false)} />
                
                
                <EditDescriptionModal 
                show={showEditDescriptionModal} 
                onClose={() => setShowEditDescriptionModal(false)} 
                profileData={profileData} 
                onSave={(updatedData) => setProfileData(updatedData)} 
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
                    onSave={(newSkill) => setProfileData((prev) => ({ ...prev, techSkills: [...prev.techSkills, newSkill] }))} 
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

export default Profilepage;
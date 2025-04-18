import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
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
import CertPreviewModal from '../../popups/CertPreviewModal';
import GenericModal from '../../popups/GenericModal';
import CertUpModal from '../../popups/CertUpModal';
import edit from '../../../assets/writemessage.png';
import Loader from '../../common/Loader';
import { ToastContainer, toast } from 'react-toastify';  // Import toastify components
import 'react-toastify/dist/ReactToastify.css';  // Import the CSS file for toast notificationszz
import GradesTable from "../../other/Gradestable"; // Adjust the path if needed
import { useParams } from 'react-router-dom';

const socket = io('http://localhost:3001');

function ProfilePage() {
  const [profileData, setProfileData] = useState({});
  const [projects, setProjects] = useState([]); // State for projects
  const [certificates, setCertificates] = useState([]); // State for certificates
  const [description, setDescription] = useState(''); 
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState('');
  const [loggedInUserEmail, setLoggedInUserEmail] = useState('');
  const [grades, setGrades] = useState([]);

  const updateGradesTable = (newGrade) => {
    setGrades((prevGrades) => {
        // Check if subject already exists in the table
        const existingIndex = prevGrades.findIndex((grade) => grade.code === newGrade.code);

        if (existingIndex !== -1) {
            // Replace the existing subject with the new one
            const updatedGrades = [...prevGrades];
            updatedGrades[existingIndex] = newGrade;
            return updatedGrades;
        } else {
            // Add new subject if it does not exist
            return [...prevGrades, newGrade];
        }
    });
};

  const addProjectToState = (newProject) => {
    setProjects((prevProjects) => [...prevProjects, newProject]);
  };

  const addCertificateToState = (newCertificate) => {
    setCertificates((prevCertificates) => [...prevCertificates, newCertificate]);
  };

  // Modals
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showEditDescriptionModal, setShowEditDescriptionModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showcertPreviewModal, setshowcertPreviewModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedCert, setselectedCert] = useState(null);
  const [skillsModalOpen, setSkillsModalOpen] = useState(false);
  const [certificatesModalOpen, setCertificatesModalOpen] = useState(false);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const profileResponse = await axiosInstance.get('/api/profile');
        if (profileResponse.data.success) {
          const { profileDetails, role, createdAt, email } = profileResponse.data.profile;
          setProjects(profileDetails.projects || []); // Ensure projects contain subjects and grades
          // Ensure projects and certificates are correctly extracted
          const { projects, certificates, ...profileWithoutProjectsAndCertificates } = profileDetails;
  
          setProfileData({
            ...profileWithoutProjectsAndCertificates,
            createdAt,
            email,
            softSkills: Array.isArray(profileDetails.softSkills) ? profileDetails.softSkills : [],
            techSkills: Array.isArray(profileDetails.techSkills) ? profileDetails.techSkills : [],
          });
  
          setUserRole(role);
          setLoggedInUserEmail(email.toLowerCase()); // Ensure case consistency
          setDescription(profileDetails?.bio || profileDetails?.aboutCompany || '');
  
          // Ensure projects and certificates are assigned correctly
          setProjects(profileDetails?.projects || []);
          setCertificates(certificates || []);
        }
      } catch (error) {
        console.error('Error fetching profile data:', error);
      } finally {
        setLoading(false);
      }
    };
  
    fetchProfileData();
  }, []); // Removed [userRole] dependency to avoid unnecessary re-fetches
  
  useEffect(()=>{
    const fetchGrades = async() => {
      try{
        const response = await axiosInstance.get('api/grades');
        if(response.data.success){
          setGrades(response.data.grades);
        
        }
        }catch (error) {
          console.error('Error fetching grades:', error);
        }
      };
    fetchGrades();}, []);

  useEffect(() => {
    socket.on('new_certificate', (certificate) => {
      setCertificates((prevCertificates) => [...prevCertificates, certificate]);
    });

    socket.on('delete_certificate', ({ certificateId }) => {
      setCertificates((prevCertificates) => prevCertificates.filter((cert) => cert._id !== certificateId));
    });

    return () => {
      socket.off('new_certificate');
      socket.off('delete_certificate');
    };
  }, []);

  if (loading) {
    return <Loader />;
  }

  const profileImageUrl = profileData.profileImg?.startsWith('/')
    ? `http://localhost:3001${profileData.profileImg}`
    : profileData.profileImg || avatar;

  // delete function to handle project removal
  const deleteProject = async (projectId) => {
    try {
      const response = await axiosInstance.delete(`/api/projects/${projectId}`);
      if (response.data.success) {
        // Update the UI state to reflect the deletion
        setProjects((prevProjects) => prevProjects.filter((project) => project._id !== projectId));
        console.log('Project deleted successfully.');
      } else {
        console.error('Failed to delete project:', response.data.message);
      }
    } catch (error) {
      console.error('Error occurred while deleting the project:', error);
    }
  };

  // delete function to handle certificate removal
  const deleteCertificate = async (certificateId) => {
    try {
      const response = await axiosInstance.delete(`/api/certificates/${certificateId}`);
      if (response.data.success) {
        // Update the UI state to reflect the deletion
        setCertificates((prevCertificates) => prevCertificates.filter((cert) => cert._id !== certificateId));
        console.log('Certificate deleted successfully.');
      } else {
        console.error('Failed to delete certificate:', response.data.message);
      }
    } catch (error) {
      console.error('Error occurred while deleting the certificate:', error);
    }
  };

  return (
    <div className='Profilepage-container'>
      <HeaderHomepage />
      <div className='main-content'>
        <div className='profile-card'>
          <div className='profile-header'>
            <img src={profileImageUrl} alt='User Profile' className='avatar' />
            <h3>{`${profileData.firstName || ''} ${profileData.middleName || ''} ${profileData.lastName || ''}`.trim()}</h3>
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
                <a href="#" onClick={() => {
                  console.log('Opening edit modal');
                  setShowEditDescriptionModal(true);
                }} > <img src={edit} alt="" /> </a>
              </div>
            </div>

            {/* Student Profile Details */}
            {userRole === 'student' && (
              <>
                <div className="profile-section"><h3>Email</h3><p>{profileData.email || 'Not Available'}</p></div>
                <div className='profile-section'><h3>Department</h3><p>{profileData.department || 'Not Available'}</p></div>
                <div className='profile-section'><h3>Year Level</h3><p>{profileData.yearLevel || 'Not Available'}</p></div>
                <div className='profile-section'><h3>Date of Birth</h3><p>{profileData.dob ? new Date(profileData.dob).toLocaleDateString() : 'Not Available'}</p></div>
                <div className='profile-section'>
                  <h3>Technical Skills</h3>
                  <p>
                    {Array.isArray(profileData.techSkills)
                      ? profileData.techSkills.join(', ')
                      : 'No tech skills added yet.'}
                  </p>
                </div>
                <div className='profile-section'>
                  <h3>Soft Skills</h3>
                  <p>
                    {Array.isArray(profileData.softSkills)
                      ? profileData.softSkills.join(', ')
                      : 'No soft skills added yet.'}
                  </p>
                </div>
              </>
            )}

            {/* Employer Profile Details */}
            {userRole === 'employer' && (
              <>
                <div className="profile-section"><h3>Email</h3><p>{profileData.email || 'Not Available'}</p></div>
                <div className='profile-section'><h3>Company Name</h3><p>{profileData.companyName || 'Not Available'}</p></div>
                <div className='profile-section'><h3>Position</h3><p>{profileData.position || 'Not Available'}</p></div>
                <div className='profile-section'><h3>Industry</h3><p>{profileData.industry || 'Not Available'}</p></div>
                <div className='profile-section'><h3>Contact Person</h3><p>{profileData.contactPersonName || 'Not Available'}</p></div>
                <div className='profile-section'><h3>Date of Birth</h3><p>{profileData.dob ? new Date(profileData.dob).toLocaleDateString() : 'Not Available'}</p></div>
                <div className='profile-section'><h3>Phone Number</h3><p>{profileData.phoneNumber || 'Not Available'}</p></div>
                <div className='profile-section'>
                  <h3>Preferred Roles</h3>
                  <p>
                    {Array.isArray(profileData.preferredRoles)
                      ? profileData.preferredRoles.join(', ')
                      : 'Not Available'}
                  </p>
                </div>
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
          </div>
        </div>

        {/* Project Section */}
        {(userRole === 'student' && profileData.email === loggedInUserEmail) && (
         
          <div className="project-section">
          <div className="grademaincontainer">
            <h3> Grades</h3>
            <GradesTable grades = {grades} 
            onRatingSlipClick = {(fileUrl) => window.open(fileUrl, '_blank')}/>  

          
          </div>
            <div className="projectscontainer">
              <h3>Projects</h3>
              <hr />
              <div className="projects-grid">
              {userRole === 'student' && profileData.email?.toLowerCase() === loggedInUserEmail?.toLowerCase() && (
                <div className="project-card add-project" onClick={() => setShowUploadModal(true)}>
                  <p>+</p>
                  <p>Add a Project</p>
                </div>
              )}

                {/* Display Projects */}
                
                {userRole === 'student' && profileData.email?.toLowerCase() === loggedInUserEmail?.toLowerCase() ? (
                  projects.length > 0 ? (
                    projects.map((project) => (
                      <div key={project._id} className="project-card" onClick={() => { setSelectedProject(project); setShowPreviewModal(true); }}>
                        {project.thumbnail && <img src={project.thumbnail} alt="Project Thumbnail" />}
                      </div>
                    ))
                  ) : (
                    <p>No projects available</p>
                  )
                ) : (
                  <p>Projects are hidden for other students.</p>
                )}
                

              </div>
            </div>

            <div className="achievementscontainer">
              <h3> Certificates</h3>
              <hr />
              <div className="projects-grid">
                <div className="project-card add-project" onClick={() => setCertificatesModalOpen(true)}>
                  <p>+</p>
                  <p>Add a Certificate</p>
                </div>

          

                {/* Display Certificates */}
                {certificates.length > 0 ? (
                  certificates.map((cert) => (
                    <div key={cert._id} className="project-card" onClick={() => { setselectedCert(cert); setshowcertPreviewModal(true); }}>
                          {cert.Certificate?.CertThumbnail && ( // Ensure CertThumbnail exists
                          <img 
                            src={cert.Certificate.CertThumbnail} 
                            alt={`${cert.Certificate.CertName} Thumbnail`} 
                          />
                        )}
                    </div>
                  ))
                ) : (
                  <p>No certificates available</p>
                )}
                
              </div>
            </div>
          </div>
        )}

        {/* Project and Certificate Sections */}
        {userRole === 'employer' && (
          <div className="project-section">
            <div className="projectscontainer">
              <h3>About Company</h3>
              <hr />
              <div className='profile-section'><p>{profileData.aboutCompany || 'Not Available'}</p></div>
            </div>
          </div>
        )}

        {/* Modals */}
        <ProjectUploadModal
          key={showUploadModal ? 'project-open' : 'project-closed'} // Change key to force re-render
          show={showUploadModal}
          onClose={() => setShowUploadModal(false)}
          onProjectUpload={addProjectToState}
          updateGradesTable={updateGradesTable} 
        />

        <CertUpModal
          key={certificatesModalOpen ? 'open' : 'closed'} // Change key to force re-render
          show={certificatesModalOpen}
          onClose={() => setCertificatesModalOpen(false)}
          onCertificateUpload={(addCertificateToState)}
        />


        <EditDescriptionModal
          show={showEditDescriptionModal}
          onClose={() => setShowEditDescriptionModal(false)}
          profileData={profileData}
          onSave={(updatedData) => {
            console.log('Profile data updated:', updatedData); // For debugging
            // Ensure skills arrays are properly formatted
            const formattedUpdatedData = {
              ...updatedData,
              techSkills: Array.isArray(updatedData.techSkills) ? updatedData.techSkills : [],
              softSkills: Array.isArray(updatedData.softSkills) ? updatedData.softSkills : []
            };
            setProfileData(formattedUpdatedData);
          }}
        />

        <ProjectPreviewModal show={showPreviewModal} onClose={() => setShowPreviewModal(false)} project={selectedProject} onDelete={deleteProject} />
        <CertPreviewModal show={showcertPreviewModal} onClose={() => setshowcertPreviewModal(false)} project={selectedCert} onDelete={deleteCertificate} />
        <GenericModal
          show={skillsModalOpen}
          onClose={() => setSkillsModalOpen(false)}
          title="Add New Skill"
          onSave={(newSkill) => {
            setProfileData((prev) => {
              const updatedSoftSkills = Array.isArray(prev.softSkills)
                ? [...prev.softSkills, newSkill]
                : [newSkill]; // Ensure it's always an array

              // Save updated soft skills to the backend
              axiosInstance.put(`/api/profile/update-skills`, { softSkills: updatedSoftSkills })
                .then((response) => {
                  if (response.data.success) {
                    console.log('Soft skills updated successfully');
                  }
                })
                .catch((error) => {
                  console.error('Error updating soft skills:', error);
                });

              return { ...prev, softSkills: updatedSoftSkills };
            });
          }}
        />

        <MessagePop />
      </div>
    </div>
  );
}

export default ProfilePage;

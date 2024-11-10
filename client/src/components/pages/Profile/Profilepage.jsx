import React, { useState, useEffect } from 'react';
import axiosInstance from '../../../services/axiosInstance';
import HeaderHomepage from '../../common/headerhomepage';
import './Profilepage.css';
import avatar from '../../../assets/profileicon.png'; // Fallback avatar image
import location from '../../../assets/location.png';
import since from '../../../assets/since.png';

function Profilepage() {
    const [profileData, setProfileData] = useState({});
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState(''); // For feedback messages

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
        return <div>Loading profile...</div>;
    }

    const profileImageUrl = profileData.profileDetails?.profileImg
        ? `http://localhost:3001${profileData.profileDetails.profileImg}`
        : avatar; // Use fallback avatar if no image is provided

    const handleProjectUpload = async (e) => {
        const formData = new FormData();
        Array.from(e.target.files).forEach(file => formData.append("projectFiles", file));
        try {
            const response = await axiosInstance.post('/api/uploadProject', formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            if (response.data.success) {
                setMessage("Project files uploaded successfully");
            }
        } catch (error) {
            setMessage("Failed to upload project files");
        }
    };

    const handleCertificateUpload = async (e) => {
        const formData = new FormData();
        Array.from(e.target.files).forEach(file => formData.append("certificatePhotos", file));
        try {
            const response = await axiosInstance.post('/api/uploadCertificate', formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            if (response.data.success) {
                setMessage("Certificate photos uploaded successfully");
            }
        } catch (error) {
            setMessage("Failed to upload certificate photos");
        }
    };

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
                                <p>{description || 'No description available'}</p>
                            </div>
                        </div>
                        <div className="profile-section">
                            <div className='profilesectiontop'>
                                <h3>Department</h3>
                                <p>{profileData.profileDetails?.department || 'Department Not Available'}</p>
                            </div>
                        </div>
                        <div className="profile-section">
                            <div className='profilesectiontop'>
                                <h3>Year Level</h3>
                                <p>{profileData.profileDetails?.yearLevel || 'Year Level Not Available'}</p>
                            </div>
                        </div>
                        <div className="profile-section">
                            <div className='profilesectiontop'>
                                <h3>Contact</h3>
                                <p>{profileData.profileDetails?.contact || 'Contact Not Available'}</p>
                            </div>
                        </div>
                        <div className="profile-section">
                            <h3>Upload Your Projects</h3>
                            <input type="file" multiple onChange={handleProjectUpload} />
                            <h3>Upload Your Certificates</h3>
                            <input type="file" multiple onChange={handleCertificateUpload} />
                        </div>
                        {message && <p className="feedback-message">{message}</p>}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Profilepage;

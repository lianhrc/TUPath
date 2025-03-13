import React, { useState } from 'react';
import './EmployerProfileCreation.css';
import axiosInstance from '../../../services/axiosInstance.js';
import { useNavigate } from 'react-router-dom';
import Loader from '../../common/Loader.jsx';
import EmployerProfileImageUploadModal from '../../popups/EmployerProfileImageUpload.jsx';

function EmployerProfileCreation() {
    const [activeSection, setActiveSection] = useState('Personal Information');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [uploadedImage, setUploadedImage] = useState('');
    const [formData, setFormData] = useState({
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
        // email: '',
        phoneNumber: '',
        preferredRoles: '',
        internshipOpportunities: false,
        preferredSkills: '',
    });

    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const sections = [
        'Personal Information',
        'Company Information',
        'Contact Information',
        'Job Preferences',
    ];
    

    const handleImageUpload = async (file) => {
        console.log("Selected file:", file); // Debugging log
        if (!file) {
            setMessage("No file selected. Please try again.");
            return;
        }
    
        const imageData = new FormData();
        imageData.append("profileImg", file);
    
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                setMessage("Authentication token not found. Please log in again.");
                return;
            }
    
            const response = await axiosInstance.post("/api/uploadProfileImage", imageData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: `Bearer ${token}`,
                },
            });
    
            console.log("Upload response:", response.data); // Debugging log
    
            if (response.data.success) {
                const imageUrl = `http://localhost:3001${response.data.profileImg}`;
                setUploadedImage(imageUrl);
                setMessage("Image uploaded successfully!");
            } else {
                setMessage("Image upload failed. Please try again.");
            }
        } catch (error) {
            console.error("Image upload error:", error);
            setMessage("Error uploading image. Please try again.");
        }
    };
    

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);

        try {
            const token = localStorage.getItem("token");
            if (!token) {
                setMessage("Authentication token not found. Please log in again.");
                setLoading(false);
                return;
            }

            const response = await axiosInstance.post('/api/updateEmployerProfile', {
                ...formData,
                profileImg: uploadedImage,
            }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            console.log('Profile update response:', response.data);
            if (response.data.success) {
                navigate('/Profile', { replace: true });
            } else {
                setMessage('Failed to update profile. Please try again.');
            }
        } catch (error) {
            console.error('Profile update error:', error);
            setMessage('An error occurred while updating the profile. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const renderFormFields = () => {
        switch (activeSection) {
            case 'Personal Information':
                return (
                    <div className="personal-information-container">
                            <div 
                            className="profile-img-container" 
                            onClick={() => document.getElementById('profileImageInput').click()}
                                >
                            {/* Display uploaded image or default placeholder */}
                            {uploadedImage ? (
                                <img
                                    src={uploadedImage}
                                    alt="Profile"
                                    className="uploaded-profile-img"
                                />
                            ) : (
                                <div className="default-avatar">Upload Image</div>
                            )}
                        
                            {/* Hidden file input */}
                            <input
                                type="file"
                                id="profileImageInput"
                                style={{ display: 'none' }}
                                onChange={(e) => handleImageUpload(e.target.files[0])}
                            />
                            </div>
                       
                            {message && <p className="error-msg">{message}</p>}
                            
                
                        <input type="text" name="firstName" placeholder="First Name" value={formData.firstName} onChange={handleInputChange} required />
                        <input type="text" name="lastName" placeholder="Last Name" value={formData.lastName} onChange={handleInputChange} required />
                        <input type="text" name="middleName" placeholder="Middle Name" value={formData.middleName} onChange={handleInputChange} />
                        <input type="date" name="dob" placeholder="Date of Birth" value={formData.dob} onChange={handleInputChange} />
                        <select name="gender" value={formData.gender} onChange={handleInputChange}>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                        </select>
                        <input type="text" name="nationality" placeholder="Nationality" value={formData.nationality} onChange={handleInputChange} />
                        <textarea name="address" placeholder="Address" value={formData.address} onChange={handleInputChange}></textarea>
                        <div className="divnxtbtn">
                                <button type="button" className="next-btn" onClick={() => setActiveSection('Company Information')}>Next</button>
                                
                        </div>
                    </div>
                );
            case 'Company Information':
                return (
                    <>
                        <input type="text" name="companyName" placeholder="Company Name" value={formData.companyName} onChange={handleInputChange} required />
                        <input type="text" name="position" placeholder="Position/Title" value={formData.position} onChange={handleInputChange} />
                        <input type="text" name="industry" placeholder="Industry" value={formData.industry} onChange={handleInputChange} />
                        <input type="text" name="location" placeholder="Location" value={formData.location} onChange={handleInputChange} />
                        <textarea name="aboutCompany" placeholder="About Company" value={formData.aboutCompany} onChange={handleInputChange}></textarea>
                        <button type="button" className="next-btn" onClick={() => setActiveSection('Contact Information')}>Next</button>
                    </>
                );
            case 'Contact Information':
                return (
                    <>
                        <input type="text" name="contactPersonName" placeholder="Contact Person Name" value={formData.contactPersonName} onChange={handleInputChange} />
                        {/* <input type="email" name="email" placeholder="Email Address" value={formData.email} onChange={handleInputChange} required /> 
                        */}
                        <input type="text" name="phoneNumber" placeholder="Phone Number" value={formData.phoneNumber} onChange={handleInputChange} />
                        <button type="button" className="next-btn" onClick={() => setActiveSection('Job Preferences')}>Next</button>
                    </>
                );
            case 'Job Preferences':
                return (
                    <>
                        <textarea name="preferredRoles" placeholder="Preferred Roles" value={formData.preferredRoles} onChange={handleInputChange}></textarea>
                        <textarea name="preferredSkills" placeholder="Preferred Skills" value={formData.preferredSkills} onChange={handleInputChange}></textarea>
                         
                        <div className="checkbox_intern">
                                    <input
                                    type="checkbox"
                                    name="internshipOpportunities"
                                    checked={formData.internshipOpportunities}
                                    onChange={(e) => setFormData({ ...formData, internshipOpportunities: e.target.checked })}
                                    />
                                    <p>Internship Opportunities</p>
                           </div>
                            <div className="divnxtbtn">
                                <button type="submit" className="submit-btn">Submit</button>
                             </div>
                    </>
                );
            default:
                return null;
        }
    };

    return (
        <div className="employer-profile-container">
            <div className="title-section">
                <h6>Employer Profile Creation</h6>
            </div>
            {loading ? (
                <Loader />
            ) : (
                <div className="employer-profile-content">
                    <div className="employer-sidebar">
                        {sections.map((section) => (
                            <button
                                key={section}
                                onClick={() => setActiveSection(section)}
                                className={section === activeSection ? 'active' : ''}
                            >
                                {section}
                            </button>
                        ))}
                    </div>
                    <div className="form-container">
                        <form className="employer-profile-form" onSubmit={handleSubmit}>
                            {renderFormFields()}
                        </form>
                    </div>
                </div>
            )}
            <EmployerProfileImageUploadModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onUpload={handleImageUpload}
            />
        </div>
    );
    
}

export default EmployerProfileCreation;

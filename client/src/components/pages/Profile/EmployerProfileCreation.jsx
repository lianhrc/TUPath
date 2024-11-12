import React, { useState } from 'react';
import './EmployerProfileCreation.css';
import axiosInstance from '../../../services/axiosInstance.js';
import { useNavigate } from 'react-router-dom';
import Loader from '../../common/Loader.jsx';
import EmployeeProfileImageUploadModal from '../../popups/EmployerProfileImageUpload.jsx';

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
        email: '',
        phoneNumber: '',
        preferredRoles: '',
        internshipOpportunities: false,
        preferredSkills: '',
    });
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleImageUpload = async (file) => {
        const formData = new FormData();
        formData.append("profileImage", file);

        try {
            const response = await axiosInstance.post("/api/uploadEmployeeProfileImage", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            if (response.data.success) {
                setUploadedImage(response.data.profileImage);
            } else {
                setMessage("Image upload failed. Please try again.");
            }
        } catch (error) {
            setMessage("Error uploading image. Please try again.");
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);

        try {
            const response = await axiosInstance.post('/api/updateEmployeeProfile', {
                ...formData,
                profileImage: uploadedImage,
            });

            if (response.data.success) {
                navigate('/EmployeeProfile', { replace: true });
            } else {
                setMessage('Failed to update profile. Please try again.');
            }
            setLoading(false);
        } catch (error) {
            setMessage('An error occurred while updating profile. Please try again.');
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
                    <>
                        <div className="personal-information-container">
                        <div className="profile-img-container" onClick={() => setIsModalOpen(true)}>
                            {uploadedImage ? (
                                <img src={uploadedImage} alt="Profile" />
                            ) : (
                                <div>+</div>
                            )}
                            <input type="file" onChange={(e) => handleImageUpload(e.target.files[0])} />
                        </div>
                            <input type="text" name="firstName" placeholder="First Name" value={formData.firstName} onChange={handleInputChange} required />
                            <input type="text" name="lastName" placeholder="Last Name" value={formData.lastName} onChange={handleInputChange} required />
                            <input type="text" name="middleName" placeholder="Middle Name" value={formData.middleName} onChange={handleInputChange} />
                            <input type="date" name="dob" placeholder="Date of Birth" value={formData.dob} onChange={handleInputChange} />
                            <select name="gender" value={formData.gender} onChange={handleInputChange}>
                                <option value="">Gender</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Prefer not to say">Prefer not to say</option>
                            </select>
                            <input type="text" name="nationality" placeholder="Nationality" value={formData.nationality} onChange={handleInputChange} />
                            <textarea name="address" placeholder="Address" value={formData.address} onChange={handleInputChange}></textarea>
                        </div>
                        
                    </>
                );
            case 'Company Information':
                return (
                    <>
                        <input type="text" name="companyName" placeholder="Company Name" value={formData.companyName} onChange={handleInputChange} required />
                        <input type="text" name="industry" placeholder="Industry" value={formData.industry} onChange={handleInputChange} />
                        <input type="text" name="location" placeholder="Location" value={formData.location} onChange={handleInputChange} />
                        <textarea name="aboutCompany" placeholder="About Company" value={formData.aboutCompany} onChange={handleInputChange}></textarea>
                    </>
                );
            case 'Contact Information':
                return (
                    <>
                        <input type="text" name="contactPersonName" placeholder="Contact Person Name" value={formData.contactPersonName} onChange={handleInputChange} />
                        <input type="text" name="position" placeholder="Position/Title" value={formData.position} onChange={handleInputChange} />
                        <input type="email" name="email" placeholder="Email Address" value={formData.email} onChange={handleInputChange} required />
                        <input type="text" name="phoneNumber" placeholder="Phone Number" value={formData.phoneNumber} onChange={handleInputChange} />
                    </>
                );
            case 'Job Preferences':
                return (
                    <>
                        <textarea name="preferredRoles" placeholder="Preferred Roles" value={formData.preferredRoles} onChange={handleInputChange}></textarea>
                        <label>
                            Internship Opportunities
                            <input type="checkbox" name="internshipOpportunities" checked={formData.internshipOpportunities} onChange={(e) => setFormData({ ...formData, internshipOpportunities: e.target.checked })} />
                        </label>
                        <textarea name="preferredSkills" placeholder="Preferred Skills" value={formData.preferredSkills} onChange={handleInputChange}></textarea>
                        <button type="submit" className="submit-btn">Submit</button>
                    </>
                );
            default:
                return null;
        }
    };

    return (
        <div className="employee-profile-container">
            <div className="title-section">
                <h6>Employer Profile Creation</h6>
            </div>
            {loading ? (
                <Loader />
            ) : (
                <div className="employee-profile-content">
                    <div className="employee-sidebar">
                        <button onClick={() => setActiveSection('Personal Information')}>Personal Information</button>
                        <button onClick={() => setActiveSection('Company Information')}>Company Information</button>
                        <button onClick={() => setActiveSection('Contact Information')}>Contact Information</button>
                        <button onClick={() => setActiveSection('Job Preferences')}>Job Preferences</button>
                    </div>
                    <div className="form-container">
                        <form className="employee-profile-form" onSubmit={handleSubmit}>
                            {renderFormFields()}
                        </form>
                        {message && <p className="error-msg">{message}</p>}
                    </div>
                </div>
            )}
            <EmployeeProfileImageUploadModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onUpload={handleImageUpload}
            />
        </div>
    );
}

export default EmployerProfileCreation;

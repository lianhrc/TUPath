import React, { useState } from 'react';
import './StudentProfileCreation.css';
import axiosInstance from '../../../services/axiosInstance.js';
import { useNavigate } from 'react-router-dom';
import Loader from '../../common/Loader.jsx';
import { format } from 'date-fns';
import StudentProfileImageUploadModal from '../../popups/StudentProfileImageUploadModal';

function StudentProfileCreation() {
    const [activeSection, setActiveSection] = useState('Personal Information');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [uploadedImage, setUploadedImage] = useState('');
    const [formData, setFormData] = useState({
        studentId: '',
        firstName: '',
        lastName: '',
        middleName: '',
        department: 'Information Technology',
        yearLevel: '1st Year',
        dob: '',
        gender: 'Male',
        address: '',
        techSkills: '',
        softSkills: '',
        contact: '',
        // email: '',
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const sections = ['Personal Information', 'Skills', 'Contact'];

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
                setIsModalOpen(false); // Close modal after successful upload
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

        const currentDate = new Date().toISOString();

        try {
            const response = await axiosInstance.post('/api/updateStudentProfile', {
                ...formData,
                createdAt: formData.createdAt || currentDate,
                dob: formData.dob ? new Date(formData.dob).toISOString() : null,
                profileImg: uploadedImage,
            });

            if (response.data.success) {
                navigate('/Profile', { replace: true });
            } else {
                setMessage('Failed to update profile. Please try again.');
            }
            setLoading(false);
        } catch (error) {
            console.error('Profile update error:', error);
            setMessage('An error occurred while updating profile. Please try again.');
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const renderFormFields = () => {
        const formattedDob = formData.dob
            ? format(new Date(formData.dob), 'yyyy-MM-dd')
            : '';

        switch (activeSection) {
            case 'Personal Information':
                return (
                    <div className="pi-container">
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


                        <input
                            type="text"
                            name="studentId"
                            placeholder="Student ID"
                            value={formData.studentId}
                            onChange={handleInputChange}
                            required
                        />
                        <select name="yearLevel" value={formData.yearLevel} onChange={handleInputChange}>
                            <option value="1st Year">1st Year</option>
                            <option value="2nd Year">2nd Year</option>
                            <option value="3rd Year">3rd Year</option>
                            <option value="4th Year">4th Year</option>
                        </select>
                        <select name="department" value={formData.department} onChange={handleInputChange}>
                            <option value="Information Technology">Information Technology</option>
                            <option value="Computer Science">Computer Science</option>
                            <option value="Information System">Information System</option>
                        </select>
                        <input
                            type="text"
                            name="firstName"
                            placeholder="First Name"
                            value={formData.firstName}
                            onChange={handleInputChange}
                            required
                        />
                        <input
                            type="text"
                            name="lastName"
                            placeholder="Last Name"
                            value={formData.lastName}
                            onChange={handleInputChange}
                            required
                        />
                        <input
                            type="text"
                            name="middleName"
                            placeholder="Middle Name"
                            value={formData.middleName}
                            onChange={handleInputChange}
                        />
                        <input
                            type="date"
                            name="dob"
                            placeholder="Date of Birth"
                            value={formattedDob}
                            onChange={handleInputChange}
                        />
                        <select name="gender" value={formData.gender} onChange={handleInputChange}>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                        </select>
                        <textarea
                            name="address"
                            placeholder="Address"
                            value={formData.address}
                            onChange={handleInputChange}
                        ></textarea>
                        <div className="next-button-container">
                            <button type="button" className="next-button" onClick={() => setActiveSection('Skills')}>
                                Next
                            </button>
                        </div>
                    </div>
                );
            case 'Skills':
                return (
                    <>
                        <input
                            type="text"
                            name="techSkills"
                            placeholder="Technical Skills (e.g., HTML, CSS)"
                            value={formData.techSkills}
                            onChange={handleInputChange}
                        />
                        <input
                            type="text"
                            name="softSkills"
                            placeholder="Soft Skills (e.g., Leadership)"
                            value={formData.softSkills}
                            onChange={handleInputChange}
                        />
                        <div className="next-button-container">
                            <button type="button" className="next-button" onClick={() => setActiveSection('Contact')}>
                                Next
                            </button>
                        </div>
                    </>
                );
            case 'Contact':
                return (
                    <>
                        <input
                            type="text"
                            name="contact"
                            placeholder="Contact Number"
                            value={formData.contact}
                            onChange={handleInputChange}
                            required
                        />
                        {/* <input
                            type="email"
                            name="email"
                            placeholder="Email Address"
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                        />*/}
                        <button type="submit" className="submit-button">
                            Submit
                        </button>
                    </>
                );
            default:
                return null;
        }
    };

    return (
        <div className="profile-container">
            <div className="divh6">
                <h6>Student Profile Creation</h6>
            </div>
            {loading ? (
                <Loader />
            ) : (
                <div className="profile-content">
                    <div className="sidebar2">
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
                    <div className="form-section">
                        <form className="profile-form" onSubmit={handleSubmit}>            
                        {renderFormFields()}
                        </form>
                    </div>
            </div>
            )}
            <StudentProfileImageUploadModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onUpload={handleImageUpload}
            />
        </div>
    );
}

export default StudentProfileCreation;

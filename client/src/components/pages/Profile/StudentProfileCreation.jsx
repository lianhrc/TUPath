import React, { useState } from 'react';
import './StudentProfileCreation.css';
import axiosInstance from '../../../services/axiosInstance.js';
import { useNavigate } from 'react-router-dom';
import Loader from '../../common/Loader.jsx';
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
        yearLevel: '',
        dob: '',
        gender: '',
        address: '',
        techSkills: [],
        softSkills: [],
        contact: '',
        email: '',
    });
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleImageUpload = async (file) => {
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

            if (response.data.success) {
                setUploadedImage(response.data.profileImg);
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
            const response = await axiosInstance.post('/api/updateStudentProfile', {
                ...formData,
                profileImg: uploadedImage,
            });

            if (response.data.success) {
                navigate('/Profile', { replace: true });
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

    // JavaScript to toggle 'active' and 'inactive' classes on button click
        const buttons = document.querySelectorAll('.sidebar2 button');

        buttons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove 'active' class from all buttons
            buttons.forEach(btn => {
            btn.classList.remove('active');
            btn.classList.add('inactive');  // Add 'inactive' to all buttons initially
            });

            // Add 'active' class to the clicked button and remove 'inactive'
            button.classList.add('active');
            button.classList.remove('inactive');
        });
        });


    const renderFormFields = () => {
        switch (activeSection) {
            case 'Personal Information':
                return (
                    <>
                        <div className="pi-container">
                            <input type="text" name="studentId" placeholder="Student ID" value={formData.studentId} onChange={handleInputChange} required />      
                            <select name="yearLevel" value={formData.yearLevel} onChange={handleInputChange}>
                                <option value="">Year Level</option>
                                <option value="1st Year">1st Year</option>
                                <option value="2nd Year">2nd Year</option>
                                <option value="3rd Year">3rd Year</option>
                                <option value="4th Year">4th Year</option>
                             </select>
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
                            <textarea name="address" placeholder="Address" value={formData.address} onChange={handleInputChange}></textarea>
                           
                        </div>
                    </>
                );
            case 'Skills':
                return (
                    <>
                        <input type="text" name="techSkills" placeholder="Technical Skills (e.g., HTML, CSS)" value={formData.techSkills} onChange={handleInputChange} />
                        <input type="text" name="softSkills" placeholder="Soft Skills (e.g., Leadership)" value={formData.softSkills} onChange={handleInputChange} />
                    </>
                );
            case 'Contact':
                return (
                    <>
                        <input type="text" name="contact" placeholder="Contact Number" value={formData.contact} onChange={handleInputChange} required />
                        <input type="email" name="email" placeholder="Email Address" value={formData.email} onChange={handleInputChange} required />
                        <button type="submit" className="submit-button">Submit</button>
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
                        <button onClick={() => setActiveSection('Personal Information')}>Personal Information</button>
                        <button onClick={() => setActiveSection('Skills')}>Skills</button>
                        <button onClick={() => setActiveSection('Contact')}>Contact</button>
                    </div>
                    <div className="form-section">
                        {activeSection === 'Personal Information' && (
                            <div className="profile-picture" onClick={() => setIsModalOpen(true)}>
                                {uploadedImage ? (
                                    <img src={uploadedImage} alt="Profile" />
                                ) : (
                                    <div>+</div>
                                )}
                                <input type="file" onChange={(e) => handleImageUpload(e.target.files[0])} />
                            </div>
                        )}
                        <form className="profile-form" onSubmit={handleSubmit}>
                            {renderFormFields()}
                        </form>
                        {message && <p className="error-message">{message}</p>}
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

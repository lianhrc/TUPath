import React, { useState } from 'react';
import './StudentProfileCreation.css';
import logo from '../../../assets/logoicon.png';
import axiosInstance from '../../../services/axiosInstance.js';
import { useNavigate } from 'react-router-dom';
import Loader from '../../common/Loader.jsx';
import StudentProfileImageUploadModal from '../../popups/StudentProfileImageUploadModal';

function StudentProfileCreation() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [uploadedImage, setUploadedImage] = useState('');
    const [fullName, setFullName] = useState('');
    const [studentId, setStudentId] = useState('');
    const [department, setDepartment] = useState('Information Technology');
    const [yearLevel, setYearLevel] = useState('');
    const [bio, setBio] = useState('');
    const [city, setCity] = useState('');
    const [contact, setContact] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleImageUpload = async (file) => {
        const formData = new FormData();
        formData.append("profileImg", file);

        try {
            const response = await axiosInstance.post("/api/uploadProfileImage", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            if (response.data.success) {
                setUploadedImage(response.data.profileImg);
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
            const response = await axiosInstance.post('/api/updateProfile', {
                fullName,
                studentId,
                department,
                yearLevel,
                bio,
                city,
                contact,
                profileImg: uploadedImage,
            });

            setTimeout(() => {
                if (response.data.success) {
                    navigate('/StudentProfile', { replace: true });
                } else {
                    setMessage('Failed to update profile. Please try again.');
                }
                setLoading(false);
            }, 3000);
        } catch (error) {
            setMessage('An error occurred while updating profile. Please try again.');
            setLoading(false);
        }
    };

    return (
        <div className="profile-container">
            {loading ? (
                <Loader />
            ) : (
                <div>
                   
                    <div className="profile-content">
                        <div className="profile-picture">
                            <input type="file" onChange={(e) => handleImageUpload(e.target.files[0])} />
                        </div>
                        <form className="profile-form" onSubmit={handleSubmit}>
                            <input
                                type="text"
                                placeholder="Full Name"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                required
                            />
                            <input
                                type="text"
                                placeholder="Student ID"
                                value={studentId}
                                onChange={(e) => setStudentId(e.target.value)}
                                required
                            />
                            <select
                                value={department}
                                onChange={(e) => setDepartment(e.target.value)}
                                required
                            >
                                <option value="Information Technology">Information Technology</option>
                                <option value="Computer Science">Computer Science</option>
                                <option value="Information System">Information System</option>
                            </select>
                            <input
                                type="text"
                                placeholder="Year Level"
                                value={yearLevel}
                                onChange={(e) => setYearLevel(e.target.value)}
                                required
                            />
                            <textarea
                                placeholder="Bio / About me"
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                            ></textarea>
                            <input
                                type="text"
                                placeholder="City"
                                value={city}
                                onChange={(e) => setCity(e.target.value)}
                                required
                            />
                            <input
                                type="text"
                                placeholder="Contact"
                                value={contact}
                                onChange={(e) => setContact(e.target.value)}
                                required
                            />
                            <button type="submit" className="submit-button">Submit</button>
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

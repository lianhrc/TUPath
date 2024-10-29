import React, { useState } from 'react';
import './StudentProfileCreation.css';
import logo from '../../../assets/logoicon.png';
import StudentProfileImageUploadModal from '../../popups/StudentProfileImageUploadModal';

function StudentProfileCreation() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploadedImage, setUploadedImage] = useState(null); // State to store uploaded image

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const handleImageUpload = (file) => {
    // Create a URL for the uploaded image and store it in state
    const imageUrl = URL.createObjectURL(file);
    setUploadedImage(imageUrl);
    closeModal();
  };

  return (
    <div className="profile-container">
      <div className="profile-header">
        <img src={logo} alt="Logo" />
      </div>
      <div className="profile-content">
        <div className="profile-picture">
          <button onClick={openModal}>
            {uploadedImage ? (
              <img src={uploadedImage} alt="Uploaded Profile" className="uploaded-image" />
            ) : (
              <div className="picture-placeholder">+</div>
            )}
          </button>
        </div>
        <form className="profile-form">
          <input type="text" placeholder="Full Name" />
          <input type="text" placeholder="Student ID" />
          <select>
            <option>Information Technology</option>
            <option>Computer Science</option>
            <option>Information System</option>
          </select>
          <input type="text" placeholder="Year Level" />
          <textarea placeholder="Bio / About me"></textarea>
          <input type="text" placeholder="City" />
          <input type="text" placeholder="Contact" />
        </form>
      </div>
      <div className="profilecreation-btn">
        <button type="submit" className="submit-button">Submit</button>
      </div>
      
      {/* Profile image upload modal */}
      <StudentProfileImageUploadModal 
        isOpen={isModalOpen} 
        onClose={closeModal} 
        onUpload={handleImageUpload} 
      />
    </div>
  );
}

export default StudentProfileCreation;

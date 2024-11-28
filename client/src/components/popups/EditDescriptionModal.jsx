import React, { useState } from "react";
import { format } from "date-fns";
import "./EditDescriptionModal.css";
import axiosInstance from "../../services/axiosInstance";

function EditDescriptionModal({ show, onClose, profileData, onSave }) {
  const [formData, setFormData] = useState(profileData);
  const [editMode, setEditMode] = useState({});
  const [imagePreview, setImagePreview] = useState(""); // For live preview of new image

  const handleEditToggle = (field) => {
    setEditMode((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Create a preview URL for the selected file
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result); // Set live preview
      };
      reader.readAsDataURL(file);
      setFormData((prev) => ({
        ...prev,
        profileImg: file, // Update the profileImg with the uploaded file
      }));
    }
  };

  const handleSave = async () => {
    // Retrieve token from storage
    const token = localStorage.getItem('token'); // Or sessionStorage, or your authentication context

    if (!token) {
        console.error('Token not found. Please log in again.');
        return;
    }

    const formDataToSend = new FormData();

    // Append form data
    Object.keys(formData).forEach((key) => {
        formDataToSend.append(key, formData[key]);
    });

    // Append profile image if it's a file
    if (formData.profileImg && typeof formData.profileImg !== 'string') {
        formDataToSend.append('profileImg', formData.profileImg);
    }

    try {
        const response = await axiosInstance.put('/api/updateProfile', formDataToSend, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'multipart/form-data',
            },
        });

        if (response.data.success) {
            onSave(formData);
            onClose();
        } else {
            console.error('Failed to save profile data');
        }
    } catch (error) {
        console.error('Error updating profile:', error);
    }
};



  const excludedFields = [
    "createdAt",
    "myProjects",
    "myCertificates",
    "projectFiles",
    "certificatePhotos",
  ];

  if (!show) return null;

  return (
    <div className="modal-overlay">
      <div className="EditDescriptionModal-content">
        <h6>Edit Profile Details</h6>

        {/* Profile Image Display */}
        <div className="profile-field">
          <label>Profile Image</label>
          <div className="profile-img-container">
            <img
                src={
                    imagePreview || 
                    (formData.profileImg?.startsWith('/') 
                        ? `http://localhost:3001${formData.profileImg}` 
                        : formData.profileImg) || 
                    avatar
            }
              alt="Profile"
              className="profile-img-preview"
            />
          </div>

          {editMode.profileImg ? (
            <>
              <input
                type="file"
                name="profileImg"
                accept="image/*"
                onChange={handleFileChange}
              />
              <button
                className="edit-button"
                onClick={() => handleEditToggle("profileImg")}
              >
                Save
              </button>
            </>
          ) : (
            <>
              <p className="profimgshown">Current image shown.</p>
              <button
                className="edit-button"
                onClick={() => handleEditToggle("profileImg")}
              >
                Edit
              </button>
            </>
          )}
        </div>

        {/* Render the rest of the fields */}
        <div className="profile-fields">
          {Object.keys(profileData).map((key) => {
            if (excludedFields.includes(key) || key === "profileImg") {
              return null;
            }

            return (
              <div key={key} className="profile-field">
                <label>{key.replace(/([A-Z])/g, " $1")}</label>
                {key === "dob" ? (
                  editMode[key] ? (
                    <input
                      type="date"
                      name={key}
                      value={formData[key] || ""}
                      onChange={handleChange}
                    />
                  ) : (
                    <p>
                      {formData[key]
                        ? format(new Date(formData[key]), "MMMM dd, yyyy")
                        : "Not Available"}
                    </p>
                  )
                ) : (
                  editMode[key] ? (
                    <input
                      type="text"
                      name={key}
                      value={formData[key] || ""}
                      onChange={handleChange}
                    />
                  ) : (
                    <p>{formData[key] || "Not Available"}</p>
                  )
                )}
                <button
                  className="edit-button"
                  onClick={() => handleEditToggle(key)}
                >
                  {editMode[key] ? "Save" : "Edit"}
                </button>
              </div>
            );
          })}
        </div>

        <div className="modal-actions">
          <button onClick={handleSave}>Save All</button>
          <button onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

export default EditDescriptionModal;

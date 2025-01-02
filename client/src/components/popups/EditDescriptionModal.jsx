import React, { useState } from "react";
import { format } from "date-fns";
import "./EditDescriptionModal.css";
import axiosInstance from "../../services/axiosInstance";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function EditDescriptionModal({ show, onClose, profileData, onSave }) {
  const [formData, setFormData] = useState(profileData);
  const [editMode, setEditMode] = useState({});
  const [imagePreview, setImagePreview] = useState(""); // For live preview of new image

  const token = localStorage.getItem("token");

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


  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("Please upload a valid image file.");
        return;
      }
      if (file.size > 20 * 1024 * 1024) { // 20 MB limit
        toast.error("Image size should not exceed 20MB.", {
          position: "top-center",
          autoClose: 3000,  // Toast will disappear in 3 seconds
          hideProgressBar: false,
          theme: "light",
        });
        return;
      }
  
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
  
      const formDataToSend = new FormData();
      formDataToSend.append("profileImg", file);
  
      try {
        const response = await axiosInstance.post("/api/uploadProfileImage", formDataToSend, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });
  
        if (response.data.success) {
          toast.success("Profile image uploaded successfully!", {
            position: "top-center",
            autoClose: 3000,  // Toast will disappear in 3 seconds
            hideProgressBar: false,
            theme: "light",
          });
          setFormData((prev) => ({
            ...prev,
            profileImg: response.data.profileImg,
          }));
        } else {
          toast.error("Failed to upload profile image.", {
            position: "top-center",
            autoClose: 3000,  // Toast will disappear in 3 seconds
            hideProgressBar: false,
            theme: "light",
          });
        }
      } catch (error) {
        toast.error("Error uploading profile image.", {
          position: "top-center",
          autoClose: 3000,  // Toast will disappear in 3 seconds
          hideProgressBar: false,
          theme: "light",
        });
      }
    }
  };


  
const handleSave = async () => {
  const updatedData = { ...formData };
  const projects = profileData.projects || [];
  updatedData.projects = projects;

  try {
    const response = await axiosInstance.put("/api/updateProfile", updatedData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.data.success) {
      toast.success("Profile updated successfully!",{
        position: "top-center",
        autoClose: 3000,  // Toast will disappear in 3 seconds
        hideProgressBar: false,
        theme: "light",
      });
      onSave(updatedData);
      onClose();
    } else {
      toast.error("Failed to save profile data.", {
        position: "top-center",
        autoClose: 3000,  // Toast will disappear in 3 seconds
        hideProgressBar: false,
        theme: "light",
      });
    }
  } catch (error) {
    toast.error("Error updating profile.", {
      position: "top-center",
      autoClose: 3000,  // Toast will disappear in 3 seconds
      hideProgressBar: false,
      theme: "light",
    });
  }
};
  
  
  
  

  
  

  const excludedFields = ["createdAt", "projectFiles", "certificatePhotos"];

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
                (formData.profileImg?.startsWith("/")
                  ? `http://localhost:3001${formData.profileImg}`
                  : formData.profileImg) ||
                "avatar.png"
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

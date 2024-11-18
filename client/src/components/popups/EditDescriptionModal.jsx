import React, { useState } from "react";
import "./EditDescriptionModal.css";

function EditDescriptionModal({ show, onClose, profileData, onSave }) {
  const [formData, setFormData] = useState(profileData);
  const [editMode, setEditMode] = useState({}); // Tracks which fields are in edit mode

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

  const handleSave = async () => {
    const endpoint = userRole === "student" ? "/api/updateStudentProfile" : "/api/updateEmployerProfile";
    try {
      const response = await axiosInstance.put(endpoint, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.success) {
        onSave(formData);
        onClose();
      } else {
        console.error("Failed to save profile data");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  // Fields to exclude
  const excludedFields = ["createdAt", "profileImg", "myProjects", "myCertificates", "exampleFieldToRemove"];

  if (!show) return null;

  return (
    <div className="modal-overlay">
      <div className="EditDescriptionModal-content">
        <h6>Edit Profile Details</h6>
        <div className="profile-fields">
          {Object.keys(profileData).map((key) => {
            // Exclude fields defined in the excludedFields array
            if (excludedFields.includes(key)) {
              return null;
            }

            return (
              <div key={key} className="profile-field">
                <label>{key.replace(/([A-Z])/g, " $1")}</label>
                {editMode[key] ? (
                  <input
                    type="text"
                    name={key}
                    value={formData[key] || ""}
                    onChange={handleChange}
                  />
                ) : (
                  <p>{formData[key] || "Not Available"}</p>
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

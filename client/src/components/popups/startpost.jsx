import React from 'react'
import './startpost.css'

function startpost() {
    const [isPopupVisible, setPopupVisible] = useState(false);

        // Function to toggle popup visibility
    const togglePopup = () => {
        setPopupVisible(!isPopupVisible);
    };
  return (
    <div className="startpost-box">
      {/* Start a post section */}
      <div className="startpost-input-section">
        <img
          src="your-profile-image-url.png"
          alt="Profile"
          className="profile-image"
        />
        <input
          type="text"
          placeholder="Start a post"
          className="startpost-input"
          onClick={togglePopup} // Toggle popup when input is clicked
        />
      </div>
      <button onClick={togglePopup} className="media-upload-button">
        <img src="media-icon-url.png" alt="Media" />
        <span>Media</span>
      </button>

      {/* Post popup */}
      {isPopupVisible && (
        <div className="startpost-popup">
          <div className="startpost-content">
            <h3>Create a Post</h3>
            <textarea
              placeholder="What's on your mind?"
              rows="4"
              className="startpost-textarea"
            ></textarea>
            <input type="file" className="file-input" />
            <button className="startpost-submit-button">Post</button>
            <button onClick={togglePopup} className="close-popup-button">
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default startpost
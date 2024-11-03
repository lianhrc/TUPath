// AddPostModal.jsx
import React from 'react';
import './AddPostModal.css'

const AddPostModal = ({ newPostContent, handleInputChange, newPostImage, handleImageChange, handleClosePopup, handleAddPost }) => {
  return (
    <div className="AddPostModalmodal-overlay">
      <div className="AddPostModalmodal-content">
        <h6>+ Create a post</h6>
        <textarea
          placeholder="What's on your mind?"
          value={newPostContent}
          onChange={handleInputChange}
        ></textarea>
        <input className='postimageupload' type="file" accept="image/*" onChange={handleImageChange} />
        {newPostImage && (
          <div className="image-preview">
            <img src={newPostImage} alt="Preview" />
          </div>
        )}
        <div className="postbuttons">
          <button onClick={handleClosePopup}>Cancel</button>
          <button className='postbtn' onClick={handleAddPost}>Post</button>
        </div>
      </div>
    </div>
  );
};

export default AddPostModal;

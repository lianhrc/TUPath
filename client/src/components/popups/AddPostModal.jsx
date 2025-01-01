// AddPostModal.jsx
import React from 'react';
import './AddPostModal.css'
import mediaupload from '../../assets/mediaupload.png';

const AddPostModal = ({ newPostContent, handleInputChange, newPostImage, handleImageChange, handleClosePopup, handleAddPost }) => {
  return (
    <div className="AddPostModalmodal-overlay">
      <div className="AddPostModalmodal-content">
        <h6>+ Create a post</h6>
        <div className="addpostmodalsubcontent">
        <textarea
        placeholder="What's on your mind?"
        value={newPostContent}
        onChange={handleInputChange}
      ></textarea>
     
     
     
    {newPostImage && (
      <div className="image-preview">
        <img src={newPostImage} alt="Preview" />
      </div>
    )}
    <input
      id="file-input"
      className="postimageupload"
      type="file"
      accept="image/*"
      onChange={handleImageChange}
      style={{ display: 'none' }}  
    />
   
    
        </div>
        <div className="postbuttons">
    <label htmlFor="file-input" className="upload-icon-label">
    <img src={mediaupload} alt="Upload" className="upload-icon" />
    </label>
    <div className="postbuttonadd">
    <button onClick={handleClosePopup}>Cancel</button>
    <button className='postbtn' onClick={handleAddPost}>Post</button>
    </div>
  
    </div>


       
      </div>
    </div>
  );
};

export default AddPostModal;

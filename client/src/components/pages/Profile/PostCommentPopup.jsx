import React from 'react';
import './PostCommentPopup.css';

const PostCommentPopup = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="popup">
      <div className="popup-content">
        <span className="close" onClick={onClose}>&times;</span>
        <h2>Post a Comment</h2>
        {/* Add form for posting a comment */}
      </div>
    </div>
  );
};

export default PostCommentPopup;

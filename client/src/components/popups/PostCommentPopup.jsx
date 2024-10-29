// PostCommentPopup.jsx
import React from 'react';
import profileicon from '../../assets/profileicon.png';
import './PostCommentPopup.css'

const PostCommentPopup = ({ post, handleCommentSubmit, toggleComments }) => {
  return (
    <div className="comments-section">
      <div className="comment-input">
        <img src={profileicon} alt="Profile Icon" className="comment-profile" />
        <input
          type="text"
          placeholder="Type your comment..."
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleCommentSubmit(post.id, e.target.value);
              e.target.value = ''; // Clear input after submission
            }
          }}
        />
      </div>
      <div className="comments-list">
        {post.comments.map((comment, index) => (
          <div className="comment" key={index}>
            <img src={profileicon} alt="Comment Profile" className="comment-profile" />
            <p>{comment}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PostCommentPopup;

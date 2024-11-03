import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client'; // Import Socket.IO client
import profileicon from '../../assets/profileicon.png';
import './PostCommentPopup.css';

// Initialize socket connection
const socket = io("http://localhost:3001"); // Adjust the port if needed

const PostCommentPopup = ({ post, handleCommentSubmit, toggleComments }) => {
  const [comments, setComments] = useState(post.comments);

  useEffect(() => {
    // Listen for new comments from the server
    socket.on('receive_comment', (commentData) => {
      if (commentData.postId === post.id) {
        setComments((prevComments) => [...prevComments, commentData.comment]);
      }
    });

    return () => {
      socket.off('receive_comment'); // Clean up listener on unmount
    };
  }, [post.id]);

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      const commentText = e.target.value;
      if (commentText.trim()) {
        const newComment = {
          postId: post.id,
          comment: commentText,
        };

        // Emit comment to the server
        socket.emit('send_comment', newComment);

        // Optionally update the comments locally
        setComments((prevComments) => [...prevComments, commentText]);

        // Clear input after submission
        e.target.value = '';
      }
    }
  };

  return (
    <div className="comments-section">
      <div className="comment-input">
        <img src={profileicon} alt="Profile Icon" className="comment-profile" />
        <input
          type="text"
          placeholder="Type your comment..."
          onKeyPress={handleKeyPress}
        />
      </div>
      <div className="comments-list">
        {comments.map((comment, index) => (
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

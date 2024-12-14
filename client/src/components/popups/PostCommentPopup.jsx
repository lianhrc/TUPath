import React, { useState, useEffect } from 'react';
import axios from 'axios'; // For making API requests
import { io } from 'socket.io-client'; // Import Socket.IO client
import profileicon from '../../assets/profileicon.png';
import './PostCommentPopup.css';

// Initialize socket connection
const socket = io("http://localhost:3001"); // Adjust the port if needed

const PostCommentPopup = ({ post, toggleComments }) => {
  const [comments, setComments] = useState(post.comments);
  const [commentText, setCommentText] = useState("");

  useEffect(() => {
    // Listen for new comments from the server
    socket.on('receive_comment', (commentData) => {
      if (commentData.postId === post._id) {
        setComments((prevComments) => [...prevComments, commentData]);
      }
    });

    return () => {
      socket.off('receive_comment'); // Clean up listener on unmount
    };
  }, [post._id]);

  const handleCommentSubmit = async () => {
    if (commentText.trim() === "") return; // Prevent empty comments

    const newComment = {
      comment: commentText,
    };

    try {
      // Send the comment to the server via API
      const response = await axios.post(
        `http://localhost:3001/api/posts/${post._id}/comment`,
        newComment,
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );

      // Update comments locally with the API response
      const addedComment = response.data.post.comments.slice(-1)[0];
      setComments((prevComments) => [...prevComments, addedComment]);

      // Emit the new comment via socket
      socket.emit('send_comment', { ...addedComment, postId: post._id });

      setCommentText(""); // Clear the input field
    } catch (error) {
      console.error("Error submitting comment:", error);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleCommentSubmit();
    }
  };

  return (
    <div className="comments-section">
      <div className="comment-input">
        <img src={profileicon} alt="Profile Icon" className="comment-profile" />
        <input
          type="text"
          placeholder="Type your comment..."
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          onKeyPress={handleKeyPress}
        />
      </div>
      <div className="comments-list">
        {comments.map((comment, index) => (
          <div className="comment" key={index}>
            <img src={profileicon} alt="Comment Profile" className="comment-profile" />
            <div>
              <p className="comment-user">{comment.username}</p> {/* Display the username */}
              <p>{comment.comment}</p> {/* Display the comment text */}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PostCommentPopup;

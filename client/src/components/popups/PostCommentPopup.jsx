import React, { useState, useEffect } from "react";
import axios from "axios"; // For making API requests
import { io } from "socket.io-client"; // Import Socket.IO client
import profileicon from "../../assets/profileicon.png";
import "./PostCommentPopup.css";

// Initialize socket connection
const socket = io("http://localhost:3001"); // Adjust the port if needed

const PostCommentPopup = ({ post, toggleComments }) => {
  const [comments, setComments] = useState(post.comments);
  const [commentText, setCommentText] = useState("");
  const [profileData, setProfileData] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    profileImg: profileicon,
  });

  useEffect(() => {
    // Fetch profile data
    const fetchProfileData = async () => {
      try {
        const response = await axios.get("http://localhost:3001/api/profile", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        if (response.data.success) {
          setProfileData(response.data.profile.profileDetails || {});
        }
      } catch (error) {
        console.error("Error fetching profile data:", error);
      }
    };

    fetchProfileData();
  }, []);

  useEffect(() => {
    // Listen for new comments from the server
    socket.on("new_comment", ({ postId, comment }) => {
      if (postId === post._id) {
        setComments((prevComments) => {
          // Check if the comment already exists to avoid duplication
          if (prevComments.some((c) => c._id === comment._id)) {
            return prevComments;
          }
          return [...prevComments, comment];
        });
      }
    });

    return () => {
      socket.off("new_comment"); // Clean up listener on unmount
    };
  }, [post._id]);

  const handleCommentSubmit = async () => {
    if (commentText.trim() === "") return; // Prevent empty comments

    const newComment = {
      profileImg: profileData.profileImg || profileicon,
      name: `${profileData.firstName} ${
        profileData.middleName ? profileData.middleName.charAt(0) + "." : ""
      } ${profileData.lastName}`.trim() || "Student",
      comment: commentText,
    };

    try {
      // Send the comment to the server via API
      const response = await axios.post(
        `http://localhost:3001/api/posts/${post._id}/comment`,
        newComment,
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );

      const addedComment = response.data.comment;

      // Update the comments locally; skip emitting socket event here
      setComments((prevComments) => {
        if (prevComments.some((c) => c._id === addedComment._id)) {
          return prevComments;
        }
        return [...prevComments, addedComment];
      });

      setCommentText(""); // Clear the input field
    } catch (error) {
      console.error("Error submitting comment:", error);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleCommentSubmit();
    }
  };

  return (
    <div className="comments-section">
      <div className="comment-input">
        <img
          src={profileData.profileImg || profileicon}
          alt="Profile Icon"
          className="comment-profile"
        />
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
          <div className="comment" key={comment._id || index}>
            <img
              src={comment.profileImg || profileicon}
              alt={comment.username}
              className="comment-profile"
            />
            <div>
              <p className="comment-user">{comment.username}</p>
              <p>{comment.comment}</p>
              <p className="comment-timestamp">
                {new Date(comment.createdAt).toLocaleString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PostCommentPopup;

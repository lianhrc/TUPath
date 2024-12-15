import React, { useState, useEffect, useRef } from "react";
import axios from "axios"; // For making API requests
import { io } from "socket.io-client"; // Import Socket.IO client
import "./PostCommentPopup.css";

// Initialize socket connection
const socket = io("http://localhost:3001"); // Adjust the port if needed

// Function to format timestamps
const formatTimeAgo = (timestamp) => {
  const now = new Date();
  const postDate = new Date(timestamp);
  const diffInMs = now - postDate;
  const diffInMinutes = Math.floor(diffInMs / 60000);

  if (diffInMinutes < 1) return "Just now";
  if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes > 1 ? "s" : ""} ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays <= 2) return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`;

  // Format the date for posts older than 2 days
  return postDate.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const PostCommentPopup = ({ post, toggleComments }) => {
  const [comments, setComments] = useState(post.comments || []);
  const [commentText, setCommentText] = useState("");
  const [profileData, setProfileData] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    profileImg: "",
  });
  const handledComments = useRef(new Set()); // Track added comment IDs

  useEffect(() => {
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
    socket.on("new_comment", ({ postId, comment }) => {
      if (postId === post._id && !handledComments.current.has(comment._id)) {
        setComments((prevComments) => [...prevComments, comment]);
        handledComments.current.add(comment._id);
      }
    });

    return () => {
      socket.off("new_comment");
    };
  }, [post._id]);

  const handleCommentSubmit = async () => {
    if (commentText.trim() === "") return;

    const newComment = {
      profileImg: profileData.profileImg,
      name: `${profileData.firstName} ${
        profileData.middleName ? profileData.middleName.charAt(0) + "." : ""
      } ${profileData.lastName}`.trim() || "Student",
      comment: commentText,
    };

    try {
      const response = await axios.post(
        `http://localhost:3001/api/posts/${post._id}/comment`,
        newComment,
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );

      const addedComment = response.data.comment;

      if (!handledComments.current.has(addedComment._id)) {
        setComments((prevComments) => [...prevComments, addedComment]);
        handledComments.current.add(addedComment._id);
      }

      setCommentText("");
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
          src={profileData.profileImg}
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
              src={comment.profileImg}
              alt={comment.username}
              className="comment-profile"
            />
            <div>
              <p className="comment-user">{comment.username || "Unknown User"}</p>
              <p>{comment.comment}</p>
              <p className="comment-timestamp">{formatTimeAgo(comment.createdAt)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PostCommentPopup;

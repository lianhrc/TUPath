import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./PostCommentPopup.css";
import dot from "../../assets/dots.png";

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

  return postDate.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const PostCommentPopup = ({ post, toggleComments }) => {
  const [comments, setComments] = useState(
    (post.comments || []).map((comment, index) => ({
      ...comment,
      _id: comment._id || `temp-${index}`, // Ensure unique key fallback
    }))
  );
  const [commentText, setCommentText] = useState("");
  const [profileData, setProfileData] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    profileImg: "",
  });
  const handledComments = useRef(new Set());
  const [isEditing, setIsEditing] = useState(null);
  const [editedText, setEditedText] = useState("");
  const [showActions, setShowActions] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const response = await axios.get("http://localhost:3001/api/profile", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        if (response.data.success) {
          const profileDetails = response.data.profile.profileDetails || {};
          // Store the user ID from the profile to use for permission checks
          profileDetails._id = response.data.profile._id;
          setProfileData(profileDetails);
        }
      } catch (error) {
        console.error("Error fetching profile data:", error);
      }
    };

    fetchProfileData();
  }, []);

  const handleCommentSubmit = async () => {
    if (commentText.trim() === "") return;

    const fullName = `${profileData.firstName} ${profileData.middleName ? profileData.middleName.charAt(0) + "." : ""} ${profileData.lastName}`.trim() || "Student";
    
    const newComment = {
      profileImg: profileData.profileImg,
      name: fullName,
      comment: commentText,
    };

    try {
      const response = await axios.post(
        `http://localhost:3001/api/posts/${post._id}/comment`,
        newComment,
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );

      const addedComment = response.data.comment;
      
      // Create a properly formatted comment object with all required properties for UI operations
      const formattedComment = {
        ...addedComment,
        username: fullName,
        userId: profileData._id, // Include the user's ID for permission checks
      };
      
      // Add our comment to the local state
      setComments((prevComments) => [...prevComments, formattedComment]);
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

  const handleEditClick = (comment) => {
    setIsEditing(comment._id);
    setEditedText(comment.comment);
  };

  const handleSaveClick = async (commentId) => {
    if (editedText.trim() === "") return;

    try {
      const response = await axios.put(
        `http://localhost:3001/api/posts/${post._id}/comment/${commentId}`,
        { comment: editedText },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );

      setComments((prevComments) =>
        prevComments.map((comment) =>
          comment._id === commentId ? response.data.comment : comment
        )
      );
      setIsEditing(null);
      setEditedText("");
    } catch (error) {
      console.error("Error saving comment:", error);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(null);
    setEditedText("");
  };

  const handleDeleteClick = async (commentId) => {
    try {
      const response = await axios.delete(
        `http://localhost:3001/api/posts/${post._id}/comment/${commentId}`,
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      
      if (response.data.success) {
        // Immediately update UI to remove the deleted comment
        setComments((prevComments) => prevComments.filter((comment) => comment._id !== commentId));
        // Close any action menus that might be open
        setShowActions(null);
      } else {
        console.error("Failed to delete comment:", response.data.message);
      }
    } catch (error) {
      console.error("Error deleting comment:", error);
      alert("Failed to delete comment. Please try again.");
    }
  };

  const handleDotClick = (commentId) => {
    setShowActions((prev) => (prev === commentId ? null : commentId));
  };

  const handleProfileClick = (userId) => {
    navigate(`/profile/${userId}`);
  };

  return (
    <div className="comments-section">
      <div className="comment-input">
        <img
          src={profileData.profileImg}
          alt="Profile Icon"
          className="comment-profile"
        />
        <textarea
        placeholder="Type your comment..."
        value={commentText}
        onChange={(e) => {
          setCommentText(e.target.value);
          e.target.style.height = "auto"; // Reset height to recalculate
          e.target.style.height = `${e.target.scrollHeight}px`; // Adjust height based on content
        }}
        onKeyPress={handleKeyPress}
        style={{
          overflow: "hidden", // Hide scrollbar
          resize: "none", // Disable manual resizing
        }}
      />
      
      </div>
      <div className="comments-list">
        {comments.map((comment, index) => (
          <div className="comment" key={comment._id || `temp-${index}`}>
            <div className="commentprofilediv">
              <img
                src={comment.profileImg}
                alt={comment.username}
                className="comment-profile"
                onClick={() => handleProfileClick(comment.userId)}
                style={{ cursor: "pointer" }}
              />
            </div>

            <div>
              <div className="commentsubs">
                <div className="usernametopcontainer">
                  <p
                    className="comment-user"
                    onClick={() => handleProfileClick(comment.userId)}
                    style={{ cursor: "pointer" }}
                  >
                    {comment.username || "Unknown User"}
                  </p>
                  <img
                    src={dot}
                    alt="dots"
                    onClick={() => handleDotClick(comment._id)}
                  />
                </div>

                {isEditing === comment._id ? (
                  <div className="saveedit-comment">
                    <textarea
                      value={editedText}
                      onChange={(e) => setEditedText(e.target.value)}
                    />
                    <div className="div">
                      <button onClick={() => handleSaveClick(comment._id)}>Save</button>
                      <button onClick={handleCancelEdit}>Cancel</button>
                    </div>
                  </div>
                ) : (
                  <p className="comment-textcontent">{comment.comment}</p>
                )}

                {showActions === comment._id && !isEditing && 
                (comment.username === `${profileData.firstName} ${profileData.middleName ? profileData.middleName.charAt(0) + "." : ""} ${profileData.lastName}`.trim() || 
                 (comment.userId && comment.userId === profileData._id)) ? (
                  <div className="comment-actions">
                    <div className="div">
                      <button onClick={() => handleEditClick(comment)}>Edit</button>
                      <button onClick={() => handleDeleteClick(comment._id)}>Delete</button>
                    </div>
                  </div>
                ) : null}

              </div>
              <p className="comment-timestamp">{formatTimeAgo(comment.createdAt)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PostCommentPopup;

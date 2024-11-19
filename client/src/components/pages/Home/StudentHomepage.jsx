import React, { useState, useEffect } from 'react';
import './StudentHomepage.css';
import Headerhomepage from '../../common/headerhomepage';
import profileicon from '../../../assets/profileicon.png';
//import profileicon2 from '../../../assets/profile2.png';
import mediaupload from '../../../assets/mediaupload.png';
//import postimage from '../../../assets/joinTUP.jpg';
import upvoteicon from '../../../assets/upvote.png';
import commenticon from '../../../assets/comment.png';
import Messagepop from '../../popups/messagingpop';
import PostCommentPopup from '../../popups/PostCommentPopup';
import AddPostModal from '../../popups/AddPostModal';
import GenericModal from '../../popups/GenericModal'

import { io } from 'socket.io-client';
import axiosInstance from '../../../services/axiosInstance';
const socket = io("http://localhost:3001");

const StudentHomepage = () => {
  const [postsData, setPostsData] = useState([]);
  const [profileData, setProfileData] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    address: '',
  });

  const [newPostContent, setNewPostContent] = useState('');
  const [newPostImage, setNewPostImage] = useState(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const [skillsModalOpen, setSkillsModalOpen] = useState(false);
  const [experienceModalOpen, setExperienceModalOpen] = useState(false);
  const [certificateModalOpen, setCertificateModalOpen] = useState(false);
  const [achievementModalOpen, setAchievementModalOpen] = useState(false);

  const addSkill = (skill) => setSkills((prev) => [...prev, skill]);
  const addExperience = (experience) => setExperiences((prev) => [...prev, experience]);
  const addCertificate = (certificate) => setCertificates((prev) => [...prev, certificate]);
  const addAchievement = (achievement) => setAchievements((prev) => [...prev, achievement]);
  
  const handleImageUpload = async (file) => {
    const imageData = new FormData();
    imageData.append("profileImg", file);

    try {
        const token = localStorage.getItem("token");
        if (!token) {
            setMessage("Authentication token not found. Please log in again.");
            return;
        }

        const response = await axiosInstance.post("/api/uploadProfileImage", imageData, {
            headers: {
                "Content-Type": "multipart/form-data",
                Authorization: `Bearer ${token}`,
            },
        });

        if (response.data.success) {
            setUploadedImage(response.data.profileImg);
            setMessage("Image uploaded successfully!");
        } else {
            setMessage("Image upload failed. Please try again.");
        }
    } catch (error) {
        console.error("Image upload error:", error);
        setMessage("Error uploading image. Please try again.");
    }
};

// Function to format the time difference as "x minutes ago", "x hours ago", etc.
  const formatTimeAgo = (timestamp) => {
  const now = new Date();
  const postDate = new Date(timestamp);
  const diffInMs = now - postDate;
  const diffInMinutes = Math.floor(diffInMs / 60000);

  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
};

// Fetch profile data
useEffect(() => {
  const fetchProfileData = async () => {
    try {
      const response = await axiosInstance.get('/api/profile');
      if (response.data.success) {
        setProfileData(response.data.profile.profileDetails || {});
      }
    } catch (error) {
      console.error('Error fetching profile data:', error);
    }
  };

  fetchProfileData();
}, []);

// Fetch posts data and setup socket listeners
useEffect(() => {
  const fetchPostsData = async () => {
    try {
      const response = await fetch("http://localhost:3001/api/posts");
      const data = await response.json();
      setPostsData(data);
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  };

  fetchPostsData();

  socket.on("new_post", (post) => {
    setPostsData((prevPosts) => [post, ...prevPosts]);
  });
  socket.on("receive_comment", ({ postId, comment }) => {
    setPostsData((prevPosts) =>
      prevPosts.map((post) =>
        post._id === postId
          ? { ...post, comments: [...post.comments, comment] }
          : post
      )
    );
  });

  return () => {
    socket.off("new_post");
    socket.off("receive_comment");
  };
}, []);


  const handleInputChange = (e) => {
    setNewPostContent(e.target.value);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewPostImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };


  const handleClosePopup = () => {
    setIsPopupOpen(false);
    setNewPostContent('');
    setNewPostImage(null);
  };

  const handleAddPost = () => {
    if (newPostContent.trim()) {
      const newPost = {
        profileImg: profileicon,
        name: `${profileData.firstName} ${profileData.lastName}` || 'Student',
        content: newPostContent,
        postImg: newPostImage,
      };
      fetch("http://localhost:3001/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newPost),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            // Rely on socket event to update the list
          }
          handleClosePopup();
        })
        .catch((err) => console.error("Error adding post:", err));
    }
  };

  const handleUpvote = async (postId) => {
    try {
      const response = await fetch(`http://localhost:3001/api/posts/${postId}/upvote`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
  
      if (!response.ok) {
        throw new Error("Failed to toggle upvote");
      }
  
      const data = await response.json();
  
      if (data.success) {
        setPostsData((prevPosts) =>
          prevPosts.map((post) =>
            post._id === postId ? { ...post, upvotes: data.post.upvotes } : post
          )
        );
      }
    } catch (err) {
      console.error("Error toggling upvote:", err);
    }
  };
  
  

  const handleCommentSubmit = (postId, comment) => {
    if (comment.trim()) {
      setPostsData((prevPosts) =>
        prevPosts.map((post) =>
          post.id === postId
            ? { ...post, comments: [comment, ...post.comments] } // Prepend new comment
            : post
        )
      );
    }
  };

  const renderPost = (post, index) => {
    const userId = "user_id_from_auth"; // Replace this with actual user ID from authentication
  
    const hasUpvoted = post.votedUsers.includes(userId); // Check if user has upvoted
  
    return (
      <div className="post" key={post._id || index}>
        <div className="toppostcontent">
          <img src={post.profileImg || profileicon} alt={post.name} />
          <div className="frompost">
            <h5>{post.name}</h5>
            <p>{formatTimeAgo(post.timestamp)}</p>
          </div>
        </div>
        <div className="postcontent">
          <p>{post.content}</p>
          {post.postImg && <img src={post.postImg} alt="Post" className="post-image" />}
        </div>
        <div className="downpostcontent">
          <button
            onClick={() => handleUpvote(post._id)}
            style={{ backgroundColor: hasUpvoted ? "lightblue" : "white" }} // Highlight upvoted
          >
            <img src={upvoteicon} alt="Upvote" /> {post.upvotes}
          </button>
          <button onClick={() => toggleComments(post._id)}>
            <img src={commenticon} alt="Comment" /> {post.comments.length}
          </button>
        </div>
        {post.showComments && (
          <PostCommentPopup
            post={post}
            handleCommentSubmit={handleCommentSubmit}
            toggleComments={toggleComments}
          />
        )}
      </div>
    );
  };
  
  
  /* Updated map function */
  {postsData.map((post, index) => renderPost(post, index))}
  

  const toggleComments = (postId) => {
    setPostsData((prevPosts) =>
      prevPosts.map((post) =>
        post.id === postId ? { ...post, showComments: !post.showComments } : post
      )
    );
  };


  return (
    <div className="StudentHomepage-container">
      <Headerhomepage />

      <div className="content-container">
        <aside className="sidebar">
          <div className="profile">
            <img src={profileicon} alt="Profile Icon" />
            <h2>{`${profileData.firstName} ${profileData.middleName || ''} ${profileData.lastName}`.trim()}</h2>
            <p>Student at Technological University of the Philippines</p>
            <p>{profileData.address || 'Not Available'}</p>
          </div>
          <div className="complete-section">
            <h4>Complete</h4>
            <div className="add-btn-container">
            <button className="add-skills" onClick={() => setSkillsModalOpen(true)}>+ Add Skills</button>
              <button className="add-experience" onClick={() => setExperienceModalOpen(true)}>+ Add Experience</button>
              <button className="add-certificate" onClick={() => setCertificateModalOpen(true)}>+ Add Certificate</button>
              <button className="add-skills" onClick={() => setAchievementModalOpen(true)}>+ Add Achievement</button>
            </div>
          </div>
        </aside>

        <main className="feed">
          <div className="post-input" onClick={() => setIsPopupOpen(true)}>
            <div>
              <img src={profileicon} alt="Profile Icon" />
            </div>
            <div className="subpost-input">
              <input
                type="text"
                placeholder="Start a post"
                readOnly
              />
              <button className="media-btn">
                <img src={mediaupload} alt="Media Upload" /> Media
              </button>
            </div>
          </div>

          {postsData.map(renderPost)}
        </main>
      </div>

      <Messagepop />

      {/* Popup Modal for New Post */}
      {isPopupOpen && (
        <AddPostModal
          newPostContent={newPostContent}
          handleInputChange={handleInputChange}
          newPostImage={newPostImage}
          handleImageChange={handleImageChange}
          handleClosePopup={handleClosePopup}
          handleAddPost={handleAddPost}
        />
      )}

      <GenericModal
        show={skillsModalOpen}
        onClose={() => setSkillsModalOpen(false)}
        title="Skills"
        onSave={addSkill}
      />
      <GenericModal
        show={experienceModalOpen}
        onClose={() => setExperienceModalOpen(false)}
        title="Experience"
        onSave={addExperience}
      />
      <GenericModal
        show={certificateModalOpen}
        onClose={() => setCertificateModalOpen(false)}
        title="Certificate"
        onSave={addCertificate}
      />
      <GenericModal
        show={achievementModalOpen}
        onClose={() => setAchievementModalOpen(false)}
        title="Achievement"
        onSave={addAchievement}
      />
    </div>
  );
};

export default StudentHomepage;
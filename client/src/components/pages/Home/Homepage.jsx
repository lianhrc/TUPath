import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './Homepage.css';
import Headerhomepage from '../../common/headerhomepage';
import mediaupload from '../../../assets/mediaupload.png';
import upvoteicon from '../../../assets/upvote.png';
import commenticon from '../../../assets/comment.png';
import Messagepop from '../../popups/messagingpop';
import PostCommentPopup from '../../popups/PostCommentPopup';
import AddPostModal from '../../popups/AddPostModal';
import { io } from 'socket.io-client';
import axiosInstance from '../../../services/axiosInstance';
import dots from '../../../assets/dots.png';
import EditPostOption from '../../popups/EditOptionsModal';
import { useNavigate } from "react-router-dom";

const socket = io('http://localhost:3001');

const Homepage = () => {
  const [postsData, setPostsData] = useState([]);
  const [profileData, setProfileData] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    studentId:'',
    address: '',
    profileImg: '',
    department: '',
    yearLevel: '',
    position: '',
    industry: '',
  });

  const [newPostContent, setNewPostContent] = useState('');
  const [newPostImage, setNewPostImage] = useState(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [activePostId, setActivePostId] = useState(null);
  const [editingPostId, setEditingPostId] = useState(null);
  const [editingContent, setEditingContent] = useState('');
  const [editingImage, setEditingImage] = useState(null);
  const [postSuccess, setPostSuccess] = useState(null); // New state to track post submission status
  const navigate = useNavigate();

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
    if (diffInDays <= 2) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;

    return postDate.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
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

  const fetchPostsData = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/posts');
      const data = await response.json();
      const updatedPosts = data.map((post) => ({
        ...post,
        showComments: false,
      }));

      setPostsData(updatedPosts);
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  };

  useEffect(() => {
    fetchPostsData();
    
    socket.on('new_post', (post) => {
      setPostsData((prevPosts) => [{ ...post, showComments: false }, ...prevPosts]);
    });

    socket.on('receive_comment', ({ postId, comment }) => {
      setPostsData((prevPosts) =>
        prevPosts.map((post) =>
          post._id === postId
            ? { ...post, comments: [...post.comments, comment] }
            : post
        )
      );
    });

    return () => {
      socket.off('new_post');
      socket.off('receive_comment');
    };
  }, []);

  useEffect(() => {
    socket.on("delete_post", ({ postId }) => {
      setPostsData((prevPosts) => prevPosts.filter((post) => post._id !== postId));
    });
  
    return () => {
      socket.off("delete_post");
    };
  }, []);

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

  const profileImageUrl = profileData.profileImg?.startsWith('/')
    ? `http://localhost:3001${profileData.profileImg}`
    : profileData.profileImg;

  const toggleComments = (postId) => {
    setPostsData((prevPosts) =>
      prevPosts.map((post) =>
        post._id === postId ? { ...post, showComments: !post.showComments } : post
      )
    );
  };

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

  const handleEditImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditingImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClosePopup = () => {
    setIsPopupOpen(false);
    setNewPostContent('');
    setNewPostImage(null);
  };

  const handleAddPost = async () => {
    if (newPostContent.trim()) {
      try {
        const newPost = {
          profileImg: profileData.profileImg,
          name: `${profileData.firstName} ${profileData.middleName ? profileData.middleName.charAt(0) + '.' : ''} ${profileData.lastName}`.trim() || 'Student',
          content: newPostContent,
          postImg: newPostImage,
        };
  
        const response = await axiosInstance.post('/api/posts', newPost);
        if (response.data.success) {
          toast.success("Posted Successfully!");  // Success toast
          setPostSuccess(true);  // Indicate post was successful
          handleClosePopup();
          setNewPostContent('');
          setNewPostImage(null);
        } else {
          toast.error("Failed to add post. Please try again.");  // Error toast
          setPostSuccess(false); // Indicate post failed
          console.error('Failed to add post:', response.data.message);
        }
      } catch (err) {
        toast.error("Failed to add post. Please try again.");  // Error toast
        setPostSuccess(false); // Indicate post failed
        console.error('Error adding post:', err);
      }
    }
  };


  const toggleEditModal = (postId) => {
    setActivePostId((prevId) => (prevId === postId ? null : postId));
  };

  const handleProfileClick = (userId) => {
    navigate(`/profile/${userId}`);
  };

  const handleDeletePost = async (postId) => {
    try {
      const response = await axiosInstance.delete(`/api/posts/${postId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
  
      const { success, message } = response.data;
  
      if (success) {
        setPostsData((prevPosts) =>
          prevPosts.filter((post) => post._id !== postId)
        );
      } else {
        console.error("Error deleting post:", message);
        alert(message || "Failed to delete post");
      }
    } catch (err) {
      console.error("Error deleting post:", err);
      alert("An error occurred while deleting the post. Please try again.");
    }
  };

  const saveEdit = async () => {
    if (editingPostId && editingContent.trim()) {
      try {
        const updatedPost = {
          content: editingContent,
          postImg: editingImage || undefined, // Ensure the new image is added if provided
        };
  
        const response = await axiosInstance.put(`/api/posts/${editingPostId}`, updatedPost);
        if (response.data.success) {
          setPostsData((prevPosts) =>
            prevPosts.map((post) =>
              post._id === editingPostId
                ? { ...post, content: editingContent, postImg: editingImage || post.postImg }
                : post
            )
          );
          toast.success("Post updated successfully!");  // Success toast
          setEditingPostId(null);
          setEditingContent('');
          setEditingImage(null); // Reset the editing image state
        } else {
          toast.error("Failed to update post. Please try again.");  // Error toast
        }
      } catch (err) {
        toast.error("Failed to update post. Please try again.");  // Error toast
        console.error("Error updating post:", err);
      }
    }
  };
  

  const cancelEdit = () => {
    setEditingPostId(null);
    setEditingContent('');
    setEditingImage(null);
  };

  const renderPost = (post, index) => {
    // Construct the current user's full name
    const userFullName = `${profileData.firstName} ${profileData.middleName ? profileData.middleName.charAt(0) + '.' : ''} ${profileData.lastName}`.trim();
  
    // Check if the post creator's name matches the logged-in user's name
    const isPostOwner = post.name === userFullName;
  
    const userId = 'user_id_from_auth'; // Adjust as needed to get the actual user ID
    const hasUpvoted = post.votedUsers.includes(userId);
  
    return (
      <div className="post" key={post._id || index}>
        <div className="toppostcontent">
          <div className="topleftpostcontent">
            <img
              src={post.profileImg}
              alt={post.name}
              onClick={() => handleProfileClick(post.userId)}
              style={{ cursor: 'pointer' }}
            />
            <div className="frompost">
              <h5
                onClick={() => handleProfileClick(post.userId)}
                style={{ cursor: 'pointer' }}
              >
                {post.name}
              </h5>
              <p>{formatTimeAgo(post.timestamp)}</p>
            </div>
          </div>
  
          {/* Show the edit and delete options only if the user is the post creator */}
          {isPostOwner && (
            <div className="editdots-container">
              <img
                className="editdots"
                src={dots}
                alt="Options"
                onClick={() => toggleEditModal(post._id)}
              />
              {activePostId === post._id && (
                <EditPostOption
                  isOpen={activePostId === post._id}
                  onClose={() => setActivePostId(null)}
                  onDelete={() => handleDeletePost(post._id)}
                  onEditMode={() => {
                    setEditingPostId(post._id);
                    setEditingContent(post.content);
                    setEditingImage(post.postImg);
                    setActivePostId(null);
                  }}
                />
              )}
            </div>
          )}
        </div>
  
        <div className="postcontent">
          {editingPostId === post._id ? (
            <div className='postcontenttxtareacontainer'>
              <textarea
                value={editingContent}
                onChange={(e) => setEditingContent(e.target.value)}
              />
             <div className="editbuttonpostcontainer">
             <label htmlFor="file-input" className="icon-label">
              <img src={mediaupload} alt="" />
            </label>
            <input
              id="file-input"
              type="file"
              accept="image/*"
              onChange={handleEditImageChange}
              style={{ display: "none" }}
           />
              <div className="editbuttonscontainer">
                  <button onClick={saveEdit}>Save</button>
                  <button onClick={cancelEdit}>Cancel</button>
              </div>
             </div>
              {editingImage && <img src={editingImage} alt="Preview" className="post-image" />}
             
            </div>
          ) : (
            <>
              <p>{post.content}</p>
              {post.postImg && <img src={post.postImg} alt="Post" className="post-image" />}
            </>
          )}
        </div>
  
        <div className="downpostcontent">
          <button
            onClick={() => handleUpvote(post._id)}
            style={{ backgroundColor: hasUpvoted ? 'lightblue' : 'white' }}
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
            handleCommentSubmit={() => console.log('Comment submit')}
            toggleComments={toggleComments}
          />
        )}
      </div>
    );
  };
  

  return (
    <div className="Homepage-container">
      <Headerhomepage />
      <div className="content-container">
        <aside className="sidebar">
          <div className="profile">
            <img onClick={() => navigate('/Profile')} src={profileImageUrl} alt="Profile Icon" style={{ cursor: 'pointer' }} />
            <h2 onClick={() => navigate('/Profile')} style={{ cursor: 'pointer' }}>{`${profileData.firstName} ${profileData.middleName ? profileData.middleName.charAt(0) + '.' : ''} ${profileData.lastName}`.trim()}</h2>
            <p>{profileData.studentId}</p>
            <p>{profileData.department || profileData.industry}</p>
            <p>{profileData.yearLevel || profileData.position }</p>
            <p>{profileData.address}</p>
          </div> 
        </aside>
        <main className="feed">
      
        {/* Notification for post success or failure */}
         

          <div className="post-input">
            <div className="postinputimg-container">
              <img src={profileImageUrl} alt="Profile Icon" />
            </div>
            <div className="subpost-input">
              <input  onClick={() => setIsPopupOpen(true)} type="text" placeholder="Start a post" readOnly />
              <button className="media-btn"  onClick={() => setIsPopupOpen(true)}>
                <img src={mediaupload} alt="Media Upload" /> Media
              </button>
            </div>
          </div>
          {postsData.map(renderPost)}
        </main>
      </div>
      <Messagepop />
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
    </div>
  );
};

export default Homepage;

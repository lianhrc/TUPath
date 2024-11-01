import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import './StudentHomepage.css';
import Headerhomepage from '../../common/headerhomepage';
import profileicon from '../../../assets/profileicon.png';
import profileicon2 from '../../../assets/profile2.png';
import mediaupload from '../../../assets/mediaupload.png';
import postimage from '../../../assets/joinTUP.jpg';
import upvoteicon from '../../../assets/upvote.png';
import commenticon from '../../../assets/comment.png';
import Messagepop from '../../popups/messagingpop';
import PostCommentPopup from '../../popups/PostCommentPopup';
import AddPostModal from '../../popups/AddPostModal';

const socket = io("http://localhost:3001"); // Connect to backend Socket.IO

const StudentHomepage = () => {
  const [postsData, setPostsData] = useState([]);
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostImage, setNewPostImage] = useState(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);

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

  // Fetch posts from backend on component mount
  useEffect(() => {
    fetch("http://localhost:3001/api/posts")
      .then((res) => res.json())
      .then((data) => setPostsData(data)) // Data is already sorted by backend
      .catch((err) => console.error("Error fetching posts:", err));

    // Listen for new posts and comments in real-time
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

    // Clean up event listeners on component unmount
    return () => {
      socket.off("new_post");
      socket.off("receive_comment");
    };
  }, []);

  // Update elapsed time display every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setPostsData((prevPosts) => [...prevPosts]); // Trigger re-render to update timestamps
    }, 60000);
    return () => clearInterval(interval);
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

  const handleAddPost = () => {
    if (newPostContent.trim()) {
      const newPost = {
        profileImg: profileicon,
        name: 'Stupidyante',
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
            // Do not manually add data.post to postsData here
            // Instead, rely on the socket event to update the list
          }
          handleClosePopup();
        })
        .catch((err) => console.error("Error adding post:", err));
    }
  };
  

  const handleCommentSubmit = (postId, commentText) => {
    if (commentText.trim()) {
      const newComment = { author: 'Student', comment: commentText };
      fetch(`http://localhost:3001/api/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newComment),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setPostsData((prevPosts) =>
              prevPosts.map((post) =>
                post._id === postId
                  ? { ...post, comments: [...post.comments, data.comment] }
                  : post
              )
            );
          }
        })
        .catch((err) => console.error("Error adding comment:", err));
    }
  };

  const toggleComments = (postId) => {
    setPostsData((prevPosts) =>
      prevPosts.map((post) =>
        post._id === postId ? { ...post, showComments: !post.showComments } : post
      )
    );
  };

  const handleUpvote = (postId) => {
    setPostsData((prevPosts) =>
      prevPosts.map((post) =>
        post._id === postId ? { ...post, upvotes: post.upvotes + 1 } : post
      )
    );
  };

  const handleClosePopup = () => {
    setIsPopupOpen(false);
    setNewPostContent('');
    setNewPostImage(null);
  };

  const renderPost = (post) => (
    <div className="post" key={post._id}>
      <div className="toppostcontent">
        <img src={post.profileImg || profileicon} alt={post.name} />
        <div className="frompost">
          <h5>{post.name}</h5>
          <p>{formatTimeAgo(post.timestamp)}</p> {/* Display formatted timestamp */}
        </div>
      </div>
      <div className="postcontent">
        <p>{post.content}</p>
        {post.postImg && (
          <div className="postimagecontent">
            <img src={post.postImg} alt="Post" className="post-image" />
          </div>
        )}
      </div>
      <div className="downpostcontent">
        <button onClick={() => handleUpvote(post._id)}>
          <img src={upvoteicon} alt="Upvote" /> {post.upvotes}
        </button>
        <button onClick={() => toggleComments(post._id)}>
          <img src={commenticon} alt="Comment" /> {post.comments.length}
        </button>
      </div>
      {/* Comments Section */}
      {post.showComments && (
        <PostCommentPopup
          post={post}
          handleCommentSubmit={handleCommentSubmit}
          toggleComments={toggleComments}
        />
      )}
    </div>
  );

  return (
    <div className="StudentHomepage-container">
      <Headerhomepage />

      <div className="content-container">
        <aside className="sidebar">
          <div className="profile">
            <img src={profileicon} alt="Profile Icon" />
            <h2>Maykel Jisun</h2>
            <p>Student at Technological University of the Philippines</p>
            <p>Metro Manila, Philippines</p>
          </div>
          <div className="complete-section">
            <h4>Complete</h4>
            <div className="add-btn-container">
              <button className="add-experience">+ Add Experience</button>
              <button className="add-certificate">+ Add Certificate</button>
              <button className="add-skills">+ Add Achievement</button>
              <button className="add-skills">+ Add Skills</button>
              <button className="add-skills">+ Add Skills</button>
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
    </div>
  );
};

export default StudentHomepage;

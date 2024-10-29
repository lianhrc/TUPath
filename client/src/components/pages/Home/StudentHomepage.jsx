import React, { useState } from 'react';
import './StudentHomepage.css';
import Headerhomepage from '../../common/headerhomepage';
import profileicon from '../../../assets/profileicon.png';
import profileicon2 from '../../../assets/profile2.png';
import mediaupload from '../../../assets/mediaupload.png';
import postimage from '../../../assets/joinTUP.jpg';
import upvoteicon from '../../../assets/upvote.png';
import commenticon from '../../../assets/comment.png';
import Messagepop from '../../popups/messagingpop';

const StudentHomepage = () => {
  const [postsData, setPostsData] = useState([
    {
      id: 1,
      profileImg: profileicon2,
      name: 'Stupidyante',
      time: '2hrs ago',
      content: 'These 5 students are about to land the dream gig at the greatest company ever as software engineers! Gusto mo bang sumali? Comment below if you\'re ready to level up!',
      postImg: postimage,
      upvotes: 130,
      comments: [],
      showComments: false,
    },
    {
      id: 2,
      profileImg: profileicon,
      name: 'Stupidyante',
      time: '3hrs ago',
      content: 'In today’s fast-paced tech world, the demand for skilled software engineers has skyrocketed...',
      postImg: null,
      upvotes: 20,
      comments: [],
      showComments: false,
    }
  ]);

  const [newPostContent, setNewPostContent] = useState('');
  const [newPostImage, setNewPostImage] = useState(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);

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

  const handleOpenPopup = () => {
    setIsPopupOpen(true);
  };

  const handleClosePopup = () => {
    setIsPopupOpen(false);
    setNewPostContent('');
    setNewPostImage(null);
  };

  const handleAddPost = () => {
    if (newPostContent.trim()) {
      const newPost = {
        id: postsData.length + 1,
        profileImg: profileicon,
        name: 'Stupidyante',
        time: 'Just now',
        content: newPostContent,
        postImg: newPostImage,
        upvotes: 0,
        comments: [],
        showComments: false,
      };
      setPostsData([newPost, ...postsData]);
      handleClosePopup(); // Close popup after adding post
    }
  };

  const handleUpvote = (postId) => {
    setPostsData((prevPosts) =>
      prevPosts.map((post) =>
        post.id === postId ? { ...post, upvotes: post.upvotes + 1 } : post
      )
    );
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

  const renderPost = (post) => (
    <div className="post" key={post.id}>
      <div className="toppostcontent">
        <img src={post.profileImg} alt={post.name} />
        <div className="frompost">
          <h5>{post.name}</h5>
          <p>{post.time}</p>
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
        <button onClick={() => handleUpvote(post.id)}>
          <img src={upvoteicon} alt="Upvote" /> {post.upvotes}
        </button>
        <button onClick={() => toggleComments(post.id)}>
          <img src={commenticon} alt="Comment" /> {post.comments.length}
        </button>
      </div>
      {/* Comments Section */}
      {post.showComments && (
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
      )}
    </div>
  );

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
          <div className="post-input" onClick={handleOpenPopup}>
            <div>
              <img src={profileicon} alt="Profile Icon" />
            </div>
            <div className="subpost-input">
              <input
                type="text"
                placeholder="Start a post"
                readOnly
              />
              <button className="media-btn" onClick={handleOpenPopup}>
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
        <div className="modal-overlay">
          <div className="modal-content">
            <h6>+ Create a post</h6>
            <textarea
              placeholder="What's on your mind?"
              value={newPostContent}
              onChange={handleInputChange}
            ></textarea>
            <input className='postimageupload' type="file" accept="image/*" onChange={handleImageChange} />
            {newPostImage && (
              <div className="image-preview">
                <img src={newPostImage} alt="Preview" />
              </div>
            )}
            <div className="postbuttons">
              <button onClick={handleClosePopup}>cancel</button>
              <button className='postbtn' onClick={handleAddPost}>post</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentHomepage;

import React from 'react';
import './StudentHomepage.css'; // Custom CSS for styling
import Headerhomepage from '../../common/headerhomepage'; // Import CSS if needed
import profileicon from '../../../assets/profileicon.png'; // Replace with actual icon path
import profileicon2 from '../../../assets/profile2.png'; // Replace with actual icon path
import mediaupload from '../../../assets/mediaupload.png'; // Replace with actual icon path
import postimage from '../../../assets/joinTUP.jpg'; // Replace with actual icon path
import upvoteicon from '../../../assets/upvote.png'; // Replace with actual icon path
import commenticon from '../../../assets/comment.png'; // Replace with actual icon path
import Messagepop from '../../popups/messagingpop';


const StudentHomepage = () => {
  return (
    <div className="StudentHomepage-container">
     <Headerhomepage />

      {/* Main Content Section */}
      <div className="content-container">
        {/* Sidebar Section */}
        <aside className="sidebar">
          <div className="profile">
              <img src={profileicon}></img>
              <h2>Maykel Jisun</h2>
            <p>Student at Technological University of the Philippines</p>
            <p>Metro Manila, Philippines</p>
          </div>
          <div className="complete-section">
            <h4>Complete</h4>
            <div className='add-btn-container'>
              <button className="add-experience">+ Add Experience</button>
              <button className="add-certificate">+ Add Certificate</button>
              <button className="add-skills">+ Add Achievement</button>
              <button className="add-skills">+ Add skills</button>
            </div>
          </div>
        </aside>

        <main className="feed">
          <div className="post-input">
            <div>
              <img src={profileicon} alt="Profile Icon" />
            </div>
            <div className="subpost-input">
              <input type="text" placeholder="Start a post" />
              <button className="media-btn">
                <img src={mediaupload} alt="Media Upload" /> Media
              </button>
            </div>
          </div>

          {/* First Post */}
          <div className="post">
            <div className="toppostcontent">
              <img src={profileicon2} alt="Stupidyante" />
              <div className="frompost">
                <h5>Stupidyante</h5>
                <p>2hrs ago</p>
              </div>
            </div>
            <div className="postcontent">
              <p>
                "These 5 students are about to land the dream gig at the greatest company ever as software engineers! Gusto mo bang sumali? Comment below if you're ready to level up!"
              </p>
              <div className="postimagecontent">
                <img src={postimage} alt="Group" className="post-image" />
              </div>
            </div>
            <div className="downpostcontent">
              <button>
                <img src={upvoteicon} alt="Upvote" /> 130
              </button>
              <button>
                <img src={commenticon} alt="Comment" /> 5
              </button>
            </div>
          </div>

          {/* Second Post */}
          <div className="post">
            <div className="toppostcontent">
              <img src={profileicon} alt="Stupidyante" />
              <div className="frompost">
                <h5>Stupidyante</h5>
                <p>3hrs ago</p>
              </div>
            </div>
            <div className="postcontent">
              <p>
                In today’s fast-paced tech world, the demand for skilled software engineers has skyrocketed. Companies are constantly on the lookout for fresh talent that can bring innovative ideas to the table. As students gear up to enter the workforce, they find themselves at the crossroads of opportunity and uncertainty. With the rise of technologies like artificial intelligence, machine learning, and blockchain, aspiring engineers are tasked with not just keeping up with trends but also staying ahead of the curve. For those ready to embrace the challenge, the tech industry offers a dynamic environment where creativity and technical skills can thrive. Joining a top-tier company as a software engineer is no longer just a dream; it’s becoming a reality for many motivated students. Imagine working alongside brilliant minds, collaborating on cutting-edge projects, and having a direct impact on the digital landscape. The journey may be filled with late-night coding sessions and debugging challenges, but the rewards are well worth it. If you're looking to kickstart your career in tech, now is the perfect time to sharpen your skills, network with like-minded peers, and prepare for the exciting adventures that await in the tech industry. So, are you ready to take the plunge and join this talented group of future software engineers? Comment below and let’s make it happen!
              </p>
              <div className="postimagecontent"></div>
            </div>
            <div className="downpostcontent">
              <button>
                <img src={upvoteicon} alt="Upvote" /> 20
              </button>
              <button>
                <img src={commenticon} alt="Comment" /> 3
              </button>
            </div>
          </div>

          {/* Third Post */}
          <div className="post">
            <div className="toppostcontent">
              <img src={profileicon2} alt="Stupidyante" />
              <div className="frompost">
                <h5>Stupidyante</h5>
                <p>2hrs ago</p>
              </div>
            </div>
            <div className="postcontent">
              <p>
                "These 5 students are about to land the dream gig at the greatest company ever as software engineers! Gusto mo bang sumali? Comment below if you're ready to level up!"
              </p>
              <div className="postimagecontent">
                <img src={postimage} alt="Group" className="post-image" />
              </div>
            </div>
            <div className="downpostcontent">
              <button>
                <img src={upvoteicon} alt="Upvote" /> 130
              </button>
              <button>
                <img src={commenticon} alt="Comment" /> 5
              </button>
            </div>
          </div>
        </main>

        


      </div>
      <Messagepop />
    </div>
  );
};

export default StudentHomepage;

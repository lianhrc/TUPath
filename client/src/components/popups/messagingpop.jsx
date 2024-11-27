import React, { useState, useEffect } from 'react';
import './messagingpop.css';
import writemessage from '../../assets/writemessage.png'; // Replace with actual icon path
import profileicon from '../../assets/profileicon.png'; // Replace with actual icon path
import NewMessageModal from './NewMessageModal'; // Import the new modal component
import axiosInstance from '../../services/axiosInstance'; // Import axios instance for API calls


const MessagingPop = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isNewMessageOpen, setIsNewMessageOpen] = useState(false); // State for new message modal
  const [profileData, setProfileData] = useState({
    profileImg: profileicon, // Default profile icon
  });


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

  const togglePopup = () => {
    setIsOpen(!isOpen);
  };

  const toggleNewMessageModal = () => {
    setIsNewMessageOpen(!isNewMessageOpen);
  };

  const profileImageUrl = profileData.profileImg?.startsWith('/')
  ? `http://localhost:3001${profileData.profileImg}`
  : profileData.profileImg || profileicon;

  return (
    <div className={`message-popup ${isOpen ? 'popup-open' : 'popup-close'}`}>
      <button className="message-toggle" onClick={togglePopup}>
        <div>
          <img src={profileImageUrl} alt="Profile" />
          Messaging
        </div>
        <img className='writeicon' src={writemessage} alt="Write Message" onClick={toggleNewMessageModal} />
      </button>

      {isOpen && (
        <div className="popup-content">
          <div className="messages">
            <div className="message">
              <span className="sender">User:</span>
              <span className="message-text">Hello Daddy! 👋</span>
              <span className="timestamp">10 mins ago</span>
            </div>

            <div className="message">
              <span className="sender">User:</span>
              <span className="message-text">Lemme come! 👋</span>
              <span className="timestamp">20 mins ago</span>
           </div>

           <div className="message">
            <span className="sender">User:</span>
            <span className="message-text">Can we meet again? 👋</span>
            <span className="timestamp">30 mins ago</span>
          </div>

          </div>
        </div>
      )}

      {/* New Message Modal */}
      <NewMessageModal isOpen={isNewMessageOpen} onClose={toggleNewMessageModal} />
    </div>
  );
};

export default MessagingPop;

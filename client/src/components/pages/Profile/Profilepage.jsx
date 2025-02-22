import React, { useState, useEffect } from 'react';
import axiosInstance from '../../../services/axiosInstance';
import './Profilepage.css';

const Profilepage = () => {
  const [profileData, setProfileData] = useState(null);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const response = await axiosInstance.get('/api/profile');
        if (response.data.success) {
          setProfileData(response.data.profile.profileDetails);
        }
      } catch (error) {
        console.error('Error fetching profile data:', error);
      }
    };

    fetchProfileData();
  }, []);

  if (!profileData) {
    return <div>Loading...</div>;
  }

  return (
    <div className="Profilepage">
      <div className="profile-container">
        <img src={profileData.profileImg} alt="Profile" />
        <h2>{`${profileData.firstName} ${profileData.middleName ? profileData.middleName.charAt(0) + '.' : ''} ${profileData.lastName}`.trim()}</h2>
        <p>{profileData.studentId}</p>
        <p>{profileData.department || profileData.industry}</p>
        <p>{profileData.yearLevel || profileData.position}</p>
        <p>{profileData.address}</p>
      </div>
    </div>
  );
};

export default Profilepage;

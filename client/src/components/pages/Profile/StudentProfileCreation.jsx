import React from 'react';
import './StudentProfileCreation.css';
import logo from '../../../assets/logoicon.png';

function StudentProfileCreation() {
  return (
    <div className="profile-container">
      <div className="profile-header">
        <img src={logo} alt="Logo" />
      </div>
      <div className="profile-content">
        <div className="profile-picture">
          <button><div className="picture-placeholder">+</div></button>
            
        </div>
        <form className="profile-form">
          <input type="text" placeholder="Full Name" />
          <input type="text" placeholder="Student ID" />
          <select>
            <option>Information Technology</option>
            <option>Computer Science</option>
            <option>Information System</option>
            {/* Add more options as needed */}
          </select>
          <input type="text" placeholder="Year Level" />
          <textarea placeholder="Bio / About me"></textarea>
          <input type="text" placeholder="City" />
          <input type="text" placeholder="Contact" />
        </form>
        </div>
        <div className="profilecreation-btn">
          <button type="submit" className="submit-button">Submit</button>
        </div>
    </div>
  );
}

export default StudentProfileCreation;

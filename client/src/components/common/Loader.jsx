import React from 'react';
import './Loader.css'; // Import the CSS file
import logoiconloaders from '../../assets/logo.png'; // Path to your main logo
import logoicon2loaders from '../../assets/logoicon2.png'; // Path to your logo icon

const Loader = () => {
  return (
    <div className="loader-wrapper">
      <div className="spinner">
        <img src={logoiconloaders} alt="Logo" className="logoiconloaders" />
        <img src={logoicon2loaders} alt="Logo Icon" className="logoicon2loaders" />
      </div>
      <p className="loading-text">Please wait for a moment...</p>
    </div>
  );
};

export default Loader;

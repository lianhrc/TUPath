import React from 'react';
import './AdminLogin.css';
import adminheadericon from '../../../assets/logoicon2.png';
import adminloginicon from '../../../assets/user-gear.png';

const AdminLogin = () => {
  return (
    <div className="admin-login-container">
    <header className="admin-header">
    
    <img src={adminheadericon} alt="Admin Header Icon" />
    
    </header>
    <div className="">
    <div className="loginboxadmin">
    <img src={adminloginicon} alt="Admin Login Icon" />
    <h5>Admin</h5>
  </div>
  <div className="login-box">
  
    <input type="text" placeholder="Username" />
    <input type="password" placeholder="Password" />
    <button>Login</button>
    <p className="footer-note">Only authorized personnel are allowed to access this panel.</p>
  </div>
    </div>
    </div>
  );
};

export default AdminLogin;

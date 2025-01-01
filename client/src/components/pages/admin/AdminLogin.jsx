import React from 'react';
import './AdminLogin.css';
import { motion } from 'framer-motion';
import adminheadericon from '../../../assets/logoicon2.png';
import adminloginicon from '../../../assets/user-gear.png';

const AdminLogin = () => {
  return (
    <div className="admin-login-container">
    <header className="admin-header">
    
    <img src={adminheadericon} alt="Admin Header Icon" />
    
    </header>
      <motion.div className=""
      initial={{ opacity: 0, translateY: 30 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{
          duration: 0.6, // Smooth animation duration
          ease: [0.25, 0.1, 0.25, 1], // Cubic-bezier for a polished feel
      }}
      viewport={{ once: true, amount: 0.1 }}>
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
      </motion.div>
    </div>
  );
};

export default AdminLogin;

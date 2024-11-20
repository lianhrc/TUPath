import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import '../Login/LoginRoles.css';
import student from '../../../assets/studenticon.png';
import employer from '../../../assets/employericon.png';
import Header from '../../common/headerlogsign';

function LoginRoles() {
    const [role, setRole] = useState('student'); // Default role
    const navigate = useNavigate(); // Initialize useNavigate for routing

    const handleRoleSelection = (selectedRole) => {
        setRole(selectedRole);
    };

    const handleSignupRedirect = () => {
        if (role === 'student') {
            navigate('/StudentSignup'); // Navigate to StudentSignup
        } else {
            navigate('/EmployerSignup'); // Navigate to EmployerSignup
        }
    };

    return (
        <div className="LoginRoles">
            <Header />
            
            <motion.div className="loginroles-container"
                initial={{ opacity: 0, y: 100 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 100, damping: 10 }}
                viewport={{ once: true, amount: 0.2 }}  
            >
                    <div className="div">
                <h3 className="title">Sign up as a student or employer</h3>
                <div className="card-choice boxchoice">
                    <div 
                        className={`card ${role === 'student' ? 'selected' : ''}`} 
                        onClick={() => handleRoleSelection('student')}
                    >
                        <div className="topcard">
                            <img src={student} alt="Student Icon" />
                            <input 
                                type="radio" 
                                name="role" 
                                id="student" 
                                className="custom-radio" 
                                checked={role === 'student'} 
                                onChange={() => handleRoleSelection('student')} 
                            />
                            <label htmlFor="student" className="custom-label"></label>
                        </div>
                        <div className="card-body">
                            <h5 className="card-title">I'm a TUP student, for academic profiling</h5>
                        </div>
                    </div>
                    <div 
                        className={`card ${role === 'employer' ? 'selected' : ''}`} 
                        onClick={() => handleRoleSelection('employer')}
                    >
                        <div className="topcard">
                            <img src={employer} alt="Employer Icon" />
                            <input 
                                type="radio" 
                                name="role" 
                                id="employer" 
                                className="custom-radio" 
                                checked={role === 'employer'} 
                                onChange={() => handleRoleSelection('employer')} 
                            />
                            <label htmlFor="employer" className="custom-label"></label>
                        </div>
                        <div className="card-body">
                            <h5 className="card-title">I'm an employer, looking for potential students for work or a project</h5>
                        </div>
                    </div>
                </div>
                <button onClick={handleSignupRedirect} className="join-button">
                    Sign up as {role === 'student' ? 'Student' : 'Employer'}
                </button>
            </div>
         </motion.div>
        </div>
    );
}

export default LoginRoles;

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../Login/LoginRoles.css';
import student from '../../../assets/studenticon.png';
import employer from '../../../assets/employericon.png';
import Header from '../../common/header';

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
            navigate('/ExpertSignup'); // Navigate to ExpertSignup
        }
    };

    return (
        <div className="LoginRoles">
            <Header />
            <div className="loginroles-container">
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
                        className={`card ${role === 'expert' ? 'selected' : ''}`} 
                        onClick={() => handleRoleSelection('expert')}
                    >
                        <div className="topcard">
                            <img src={employer} alt="Employer Icon" />
                            <input 
                                type="radio" 
                                name="role" 
                                id="expert" 
                                className="custom-radio" 
                                checked={role === 'expert'} 
                                onChange={() => handleRoleSelection('expert')} 
                            />
                            <label htmlFor="expert" className="custom-label"></label>
                        </div>
                        <div className="card-body">
                            <h5 className="card-title">I'm an expert, looking for potential students for work or a project</h5>
                        </div>
                    </div>
                </div>
                <button onClick={handleSignupRedirect} className="join-button">
                    Sign up as {role === 'student' ? 'Student' : 'Expert'}
                </button>
            </div>
        </div>
    );
}

export default LoginRoles;

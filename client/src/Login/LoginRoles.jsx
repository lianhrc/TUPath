import React, { useState } from 'react';
import './LoginRoles.css';
import student from '../assets/studenticon.png';
import employer from '../assets/employericon.png';
import Header from '../components/header';

function LoginRoles() {
    const [role, setRole] = useState('student');

    const studentUrl = '/StudentSignup';
    const expertUrl = '/ExpertSignup';

    return (
        <div className="LoginRoles">
        <Header />
        <div className="loginroles-container">
                <h3 className="title">Sign up as a student or employer</h3>
                <div className="card-choice boxchoice">
                    <div 
                        className={`card ${role === 'student' ? 'selected' : ''}`} 
                        onClick={() => setRole('student')}
                    >
                        <div className="topcard">
                            <img src={student} alt="Academic Showcase" />
                            <input 
                                type="radio" 
                                name="role" 
                                id="student" 
                                className="custom-radio" 
                                checked={role === 'student'} 
                                onChange={() => setRole('student')} 
                            />
                            <label htmlFor="student" className="custom-label"></label>
                        </div>
                        <div className="card-body">
                            <h5 className="card-title">I'm a TUP student, for academic profiling</h5>
                        </div>
                    </div>
                    <div 
                        className={`card ${role === 'expert' ? 'selected' : ''}`} 
                        onClick={() => setRole('expert')}
                    >
                        <div className="topcard">
                            <img src={employer} alt="Academic Showcase" />
                            <input 
                                type="radio" 
                                name="role" 
                                id="expert" 
                                className="custom-radio" 
                                checked={role === 'expert'} 
                                onChange={() => setRole('expert')} 
                            />
                            <label htmlFor="expert" className="custom-label"></label>
                        </div>
                        <div className="card-body">
                            <h5 className="card-title">I'm an expert, looking for potential students for work or a project</h5>
                        </div>
                    </div>
                </div>
                <a href={role === 'student' ? studentUrl : expertUrl} className="join-button">
                    Sign up as {role === 'student' ? 'Student' : 'Expert'}
                </a>
               
                </div>
        </div>
    );
}

export default LoginRoles;

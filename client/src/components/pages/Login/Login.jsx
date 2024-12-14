import { motion } from 'framer-motion';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../../services/axiosInstance.js';
import Header from '../../common/headerlogsign';
import student from '../../../assets/studenticon.png';
import employer from '../../../assets/employericon.png';
import { GoogleLogin } from '@react-oauth/google';
import './Login.css';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('student'); // Default role
    const [message, setMessage] = useState('');
    const navigate = useNavigate();
    const token = localStorage.getItem('token');

    useEffect(() => {
        if (token) {
            navigate(role === 'student' ? '/homepage' : '/homepage', { replace: true });
        }
    }, [navigate, role, token]); 

    const handleGoogleLogin = async (response) => {
        try {
            const googleToken = response.credential;
            const res = await axiosInstance.post('/google-login', { token: googleToken, role });
            if (res.data.success) {
                localStorage.setItem('token', res.data.token);
                const redirectPath = res.data.redirectPath || '/homepage';
                navigate(redirectPath, { replace: true });
            } else {
                setMessage('Google login failed. Please try again.');
            }
        } catch (error) {
            if (error.response && error.response.status === 404) {
                setMessage('Account not found. Please sign up first.');
            } else {
                setMessage('An error occurred during Google login. Please try again.');
            }
        }
    };

    const handleLogin = async (event) => {
        event.preventDefault();
        try {
            const response = await axiosInstance.post('/login', { email, password, role });
            if (response.data.success) {
                localStorage.setItem('token', response.data.token);
                const redirectPath = response.data.redirectPath || '/homepage';
                navigate(redirectPath, { replace: true });
            } else {
                setMessage(response.data.message || 'Login failed. Invalid credentials.');
            }
        } catch (error) {
            setMessage('An error occurred. Please try again.');
        }
    };

    const handleSignupRedirect = () => {
        navigate('/loginroles'); // Redirects to the signup page
    };
    const handleForgotPasswordRedirect = () =>{
        navigate('/forgot-password');
    }

    return (
        <div className="Login" >
            <Header />
            <motion.div
                className="logincontent"
                initial={{ opacity: 0, translateY: 30 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{
                    duration: 0.6, // Smooth animation duration
                    ease: [0.25, 0.1, 0.25, 1], // Cubic-bezier for a polished feel
                }}
                viewport={{ once: true, amount: 0.1 }} // Trigger animation when slightly in view
                >
                <div className="Login-container">
                 <h5>Make the most of your career</h5>
                    <div className="googlelogincontainer">
                            <GoogleLogin
                                onSuccess={handleGoogleLogin}
                                onError={() => setMessage('Google login failed')}
                            />
                    </div>
                    <div className="separator">or</div>

                    {/* Role selection between student and employer */}
                    <div className='chooserolecontainer'>
                        <div className={`chosenrole ${role === 'student' ? 'active-role' : ''}`}>
                            <img src={student} alt="Student" />
                            <label>
                                <input
                                    type="radio"
                                    value="student"
                                    checked={role === 'student'}
                                    onChange={() => setRole('student')}
                                />
                            </label>
                            Student
                        </div>
                        <div className={`chosenrole ${role === 'employer' ? 'active-role' : ''}`}>
                            <img src={employer} alt="Employer" />
                            <label>
                                <input
                                    type="radio"
                                    value="employer"
                                    checked={role === 'employer'}
                                    onChange={() => setRole('employer')}
                                />
                            </label>
                            Employer
                        </div>
                    </div>

                    {/* Login form */}
                    <form onSubmit={handleLogin}>
                        <div className="form-group">
                            <label htmlFor="email">Email</label>
                            <input
                                type="email"
                                id="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="password">Password</label>
                            <input
                                type="password"
                                id="password"
                                placeholder="Enter Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        <button type="submit" className="login-button">Login</button>
                    </form>

                    {/* Display message if there's any feedback */}
                    {message && <p className="message">{message}</p>}

                    <p className="signup-prompt">
                        Don't have an account? <span onClick={handleSignupRedirect} className="signup-link">Sign Up</span>
                    </p>
                    <p className="forgot-password-link" onClick={handleForgotPasswordRedirect}>
                        Forgot Password?
                    </p>
                </div>
            </motion.div>
        </div>
    );
}

export default Login;




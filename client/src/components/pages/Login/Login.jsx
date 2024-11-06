import { motion } from 'framer-motion';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../../services/axiosInstance.js';
import Header from '../../common/headerlogsign';
import student from '../../../assets/studenticon.png';
import employer from '../../../assets/employericon.png';
import { GoogleLogin } from '@react-oauth/google';
import Loader from '../../common/Loader.jsx'; // Import the Loader component
import './Login.css';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('student');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false); // New loading state
    const navigate = useNavigate();

    useEffect(() => {
        if (localStorage.getItem('token')) {
            navigate(role === 'student' ? '/studenthomepage' : '/experthomepage', { replace: true });
        }
    }, [navigate, role]);

    const handleGoogleLogin = async (response) => {
        setLoading(true); // Set loading to true immediately
    
        try {
            const googleToken = response.credential;
            const res = await axiosInstance.post('/google-login', { token: googleToken, role });
    
            if (res.data.success) {
                localStorage.setItem('token', res.data.token);
                
                // Use a fixed timeout of 3 seconds for navigation
                setTimeout(() => {
                    setLoading(false); // Reset loading before navigating
                    navigate(role === 'student' ? '/studenthomepage' : '/experthomepage', { replace: true });
                }, 3000);
            } else {
                setMessage('Google login failed. Please try again.');
                setLoading(false); // Reset loading on failure
            }
        } catch (error) {
            setMessage('An error occurred during Google login. Please try again.');
            setLoading(false); // Reset loading on error
        }
    };
    
    const handleLogin = async (event) => {
        event.preventDefault();
        setLoading(true); // Set loading to true
    
        try {
            const response = await axiosInstance.post('/login', { email, password, role });
            if (response.data.success) {
                localStorage.setItem('token', response.data.token);
                
                // Use a fixed timeout of 3 seconds for navigation
                setTimeout(() => {
                    setLoading(false); // Reset loading before navigating
                    navigate(role === 'student' ? '/studenthomepage' : '/experthomepage', { replace: true });
                }, 3000);
            } else {
                setMessage(response.data.message || 'Login failed. Invalid credentials.');
                setLoading(false); // Reset loading on failure
            }
        } catch (error) {
            setMessage('An error occurred. Please try again.');
            setLoading(false); // Reset loading on error
        }
    };
    

    const handleSignupRedirect = () => {
        navigate('/loginroles'); // Redirects to the signup page
    };

    return (
        <div className="Login" >
            {loading ? ( // Only display loader when loading
                <Loader />
            ) : (
                <>
                    <Header />
                    <motion.div className='logincontent'
                        initial={{ opacity: 0, y: 100 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ type: "spring", stiffness: 100, damping: 10 }}
                        viewport={{ once: true, amount: 0.2 }}  
                    >
                        <div className="Login-container">
                            <h3>Make the most of your career</h3>
                            <div className="google-login-button">
                                <GoogleLogin onSuccess={handleGoogleLogin} onError={() => setMessage('Google login failed')} />
                            </div>
                            <div className="separator">or</div>
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
                                <div className={`chosenrole ${role === 'expert' ? 'active-role' : ''}`}>
                                    <img src={employer} alt="Employer" />
                                    <label>
                                        <input
                                            type="radio"
                                            value="expert"
                                            checked={role === 'expert'}
                                            onChange={() => setRole('expert')}
                                        />
                                    </label>
                                    Expert
                                </div>
                            </div>
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
                            {message && <p className="message">{message}</p>}
                            <p className="signup-prompt">
                                Don't have an account? <span onClick={handleSignupRedirect} className="signup-link">Sign Up</span>
                            </p>
                        </div>
                    </motion.div>
                </>
            )}
        </div>
    );
}

export default Login;

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Header from '../components/header';
import student from '../assets/studenticon.png';
import employer from '../assets/employericon.png';
import './Login.css'; // Import custom CSS

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [userType, setUserType] = useState('student'); // New state for user type
    const navigate = useNavigate();

    const handleLogin = async (event) => {
        event.preventDefault();
        try {
            const response = await axios.post('http://localhost:3001/login', { email, password, userType }); // Include userType in request
            console.log('Response from server:', response.data); 

            if (response.data.success) {
                setMessage('Login successful!');
                navigate(userType === 'student' ? '/studenthomepage' : '/employerhomepage'); // Redirect based on user type
            } else {
                setMessage(response.data.message || 'Login failed. Invalid credentials.');
            }
        } catch (error) {
            console.error('Error during login:', error);
            if (error.response && error.response.data && error.response.data.message) {
                setMessage(error.response.data.message);
            } else {
                setMessage('An error occurred. Please try again.');
            }
        }
    };

    const handleSignupRedirect = () => {
        navigate('/register');
    };

    return (
        <div className="Login">
            <Header />
            <div className='logincontent'>
                <div className="Login-container">
                    <h2>Make the most of your career</h2>

                    <button className="google-login">Continue with Google</button>
                    <div className="separator">or</div>
                        <div className='chooserolecontainer'>
                                <div className='chosenrole'>
                                    <img src={student} alt="Academic Showcase" />
                                    <input
                                        type="radio"
                                        value="student"
                                        checked={userType === 'student'}
                                        onChange={() => setUserType('student')}
                                    />
                                </div>
                                <div className='chosenrole'>
                                    <img src={employer} alt="Employer Showcase" />
                                    <input
                                        type="radio"
                                        value="employer"
                                        checked={userType === 'employer'}
                                        onChange={() => setUserType('employer')}
                                    />
                                </div>
                            </div>
                    <form onSubmit={handleLogin}>
                        <div className="form-group">
                            <label htmlFor="email">
                                {userType === 'student' ? 'TUP Student ID Number' : 'Email'}
                            </label>
                            <input
                                type="text"
                                id="email"
                                placeholder={userType === 'student' ? 'TUPM-**-****' : 'Enter your email'}
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
                    <p className="signup-prompt">Don't have an account? <span onClick={handleSignupRedirect} className="signup-link">Sign Up</span></p>
                </div>
            </div>
        </div>
    );
}

export default Login;

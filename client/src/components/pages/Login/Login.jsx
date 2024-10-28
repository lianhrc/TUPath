import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Header from '../../common/header';
import student from '../../../assets/studenticon.png';
import employer from '../../../assets/employericon.png';
import './Login.css';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [role, setRole] = useState('student'); // Set default role as student
    const navigate = useNavigate();

    // Handle the login submission
    const handleLogin = async (event) => {
        event.preventDefault();
        try {
            // Send login data to server including the role
            const response = await axios.post('http://localhost:3001/login', { email, password, role });
            console.log('Response from server:', response.data);

            // If login is successful
            if (response.data.success) {
                setMessage('Login successful!');

                // Redirect user based on whether they are new or returning
                navigate(response.data.redirectPath);
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

    // Redirect to the signup page
    const handleSignupRedirect = () => {
        navigate('/loginroles');
    };

    return (
        <div className="Login">
            <Header />
            <div className='logincontent'>
                <div className="Login-container">
                    <h2>Make the most of your career</h2>

                    <button className="google-login">Continue with Google</button>
                    <div className="separator">or</div>

                    {/* Role selection between student and expert */}
                    <div className='chooserolecontainer'>
                        <div className={`chosenrole ${role === 'student' ? 'active-role' : ''}`}>
                            <img src={student} alt="Student Showcase" />
                            <label>
                                <input
                                    type="radio"
                                    value="student"
                                    checked={role === 'student'}
                                    onChange={() => setRole('student')} // Set role as student
                                />
                                </label>
                                Student
                        </div>
                        <div className={`chosenrole ${role === 'expert' ? 'active-role' : ''}`}>
                            <img src={employer} alt="Employer Showcase" />
                            <label>
                                <input
                                    type="radio"
                                    value="expert"
                                    checked={role === 'expert'}
                                    onChange={() => setRole('expert')} // Set role as expert
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

                    <p className="signup-prompt">Don't have an account? <span onClick={handleSignupRedirect} className="signup-link">Sign Up</span></p>
                </div>
            </div>
        </div>
    );
}

export default Login;

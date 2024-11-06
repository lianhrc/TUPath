import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../../services/axiosInstance.js';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Signup.css';
import { GoogleLogin } from '@react-oauth/google';
import Loader from '../../common/Loader.jsx'; // Import the Loader component

function StudentSignup() {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('student'); // Default role for Google Signup
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false); // New loading state
    const navigate = useNavigate();

    const handleSignup = async (event) => {
        event.preventDefault(); 
        setLoading(true); // Set loading to true

        try {
            const response = await axiosInstance.post('/studentsignup', {
                firstName,
                lastName,
                email,
                password,
            });

            // Simulate a delay of 3 seconds before navigating
            setTimeout(() => {
                if (response.data.success) {
                    setMessage('Signup successful!');
                    navigate('/login');
                }
            }, 3000);
        } catch (error) {
            setMessage(error.response?.data?.message || 'An error occurred. Please try again.');
        } finally {
            setTimeout(() => {
                setLoading(false); // Reset loading after 3 seconds
            }, 3000);
        }
    };

    
    const handleGoogleSignup = async (response) => {
        // Check for the "Account already exists" case first
        const googleToken = response.credential;
        
        try {
            const res = await axiosInstance.post('/google-signup', { token: googleToken, role });
    
            // If account already exists, show the message and do not show loader
            if (res.data.message === 'Account already exists. Please log in.') {
                setMessage('Account already exists. Please log in.');
                return; // Stop here, do not show loader
            }
    
            // Proceed to loading and signup if account doesn't exist
            setLoading(true); // Start the loader when the signup is in process
    
            setTimeout(() => {
                if (res.data.success) {
                    localStorage.setItem('token', res.data.token);
                    navigate('/studenthomepage', { replace: true });
                } else {
                    setMessage(res.data.message || 'Sign-up failed. Please try again.');
                }
            }, 3000); // Simulate delay for success
    
        } catch (error) {
            setMessage(error.response?.data?.message || 'An error occurred during Google sign-up. Please try again.');
        } finally {
            // Stop the loader after the process is done
            if (message !== 'Account already exists. Please log in.') {
                setTimeout(() => {
                    setLoading(false); // Stop loader after success/failure
                }, 3000);
            }
        }
    };
    
    
    

    

    const handleLoginRedirect = () => {
        navigate('/login');
    };

    return (
        <div className="studentsignup-container">
            {loading ? ( // Only display loader when loading
                <Loader />
            ) : (
                <div className="div">
                    <h4 className="text-center mb-4">Student Sign Up</h4>
                    <div className="d-flex justify-content-center mb-3">
                        <div className="google-signup-btn">
                            <GoogleLogin
                                onSuccess={handleGoogleSignup}
                                onError={() => setMessage('Google sign-up failed')}
                            />
                        </div>
                    </div>
                    <p className="d-flex justify-content-center mb-3">or</p>
                    <form onSubmit={handleSignup}>
                        <div className='nameinput'>
                            <div className="form-groups mb-3">
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="First name"
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="form-groups mb-3">
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Last name"
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                        <div className="form-group mb-3">
                            <input
                                type="email"
                                className="form-control"
                                placeholder="Student Email Address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-group mb-3">
                            <input
                                type="password"
                                className="form-control"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-check mb-3">
                            <input
                                type="checkbox"
                                className="form-check-input"
                                id="termsCheck"
                                required
                            />
                            <label className="form-check-label" htmlFor="termsCheck">
                                Yes, I understand and agree to the <span><button>Terms of Service</button></span> including the <span><button>Privacy Policy</button></span>.
                            </label>
                        </div>
                        <button type="submit" className="createbtn">Create my account</button>
                    </form>
                    {message && <p className="mt-3 text-center">{message}</p>}
                    <p className="text-center mt-3 ">
                        Already have an account? <button onClick={handleLoginRedirect} className="btn btn-link p-0 logindirect-btn">Login</button>
                    </p>
                </div>
            )}
        </div>
    );
}

export default StudentSignup;

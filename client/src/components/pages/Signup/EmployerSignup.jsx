import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../../services/axiosInstance.js';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Signup.css';
import { GoogleLogin } from '@react-oauth/google';

function EmployerSignup() {
    // const [firstName, setFirstName] = useState('');
    // const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const handleSignup = async (event) => {
        event.preventDefault();
    
        if (!email || !password) {
            setMessage('All fields are required.');
            return;
        }
    
        try {
            const response = await axiosInstance.post('/employersignup', {
                // firstName,
                // lastName,
                email,
                password,
            });
    
            if (response.data.success) {
                setMessage('Signup successful!');
                localStorage.setItem('token', response.data.token); // Save token if provided
                navigate('/employerprofilecreation', { replace: true });
            }
        } catch (error) {
            setMessage(error.response?.data?.message || 'An error occurred. Please try again.');
            console.error("Signup error:", error); // Log detailed error for debugging
        }
    };
    

    const handleGoogleSignup = async (response) => {
        const googleToken = response.credential;
        const role = "employer"; // Define the role explicitly
    
        try {
            const res = await axiosInstance.post('/google-signup', { token: googleToken, role });
    
            if (res.data.message === 'Account already exists. Please log in.') {
                setMessage('Account already exists. Please log in.');
                return;
            }
    
            if (res.data.success) {
                localStorage.setItem('token', res.data.token);
                navigate('/employerprofilecreation', { replace: true });
            } else {
                setMessage(res.data.message || 'Sign-up failed. Please try again.');
            }
        } catch (error) {
            setMessage(error.response?.data?.message || 'An error occurred during Google sign-up. Please try again.');
        }
    };
    

    const handleLoginRedirect = () => {
        navigate('/login');
    };

    return (
        <div className="studentsignup-container">
            <div className="div">
                <h5 className="text-center mb-4">Employer Sign Up</h5>
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
                    {/* <div className='nameinput'>
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
                    </div> */}
                    <div className="form-group mb-3">
                        <input
                            type="email"
                            className="form-control"
                            placeholder="Employer Email Address"
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
                            Yes, I understand and agree to the <span> <button>Terms of Service</button></span> including the <span><button>Privacy Policy</button></span>.
                        </label>
                    </div>
                    <button type="submit" className="createbtn">Create my account</button>
                </form>
                {message && <p className="mt-3 text-center">{message}</p>}
                <p className="text-center mt-3">
                    Already have an account? <button onClick={handleLoginRedirect} className="btn btn-link p-0 logindirect-btn">Login</button>
                </p>
            </div>
        </div>
    );
}

export default EmployerSignup;

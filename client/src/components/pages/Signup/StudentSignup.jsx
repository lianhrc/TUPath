import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../../services/axiosInstance.js';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Signup.css';
import { GoogleLogin } from '@react-oauth/google';

function StudentSignup() {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('student'); // Default role for Google Signup
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const handleSignup = async (event) => {
        event.preventDefault();
        try {
            const response = await axiosInstance.post('/studentsignup', {
                firstName,
                lastName,
                email,
                password,
            });
            if (response.data.success) {
                setMessage('Signup successful!');
                navigate('/login');
            }
        } catch (error) {
            setMessage(error.response?.data?.message || 'An error occurred. Please try again.');
        }
    };

    const handleGoogleSignup = async (response) => {
        try {
            const googleToken = response.credential;
            const res = await axiosInstance.post('/google-signup', { token: googleToken, role });
            if (res.data.success) {
                localStorage.setItem('token', res.data.token);
                navigate('/studentprofilecreation', { replace: true }); // Redirect to profile creation
            }
        } catch (error) {
            setMessage(error.response?.data?.message || 'An error occurred during Google sign-up. Please try again.');
        }
    };

    const handleLoginRedirect = () => {
        navigate('/login');
    };

    return (
        <div className="container mt-5" style={{ maxWidth: '600px' }}>
            <h2 className="text-center mb-4">Student Sign Up</h2>
            <div className="d-flex justify-content-center mb-3">
                <GoogleLogin
                    onSuccess={handleGoogleSignup}
                    onError={() => setMessage('Google sign-up failed')}
                />
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
                        Yes, I understand and agree to the <a href="#">Terms of Service</a> including the <a href="#">Privacy Policy</a>
                    </label>
                </div>
                <button type="submit" className="createbtn">Create my account</button>
            </form>
            {message && <p className="mt-3 text-center">{message}</p>}
            <p className="text-center mt-3">
                Already have an account? <button onClick={handleLoginRedirect} className="btn btn-link p-0">Login</button>
            </p>
        </div>
    );
}

export default StudentSignup;

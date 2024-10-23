import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Signup.css'

function StudentSignup() {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const handleSignup = async (event) => {
        event.preventDefault();

        try {
            const response = await axios.post('http://localhost:3001/register', { firstName, lastName, email, password });
            if (response.data.success) {
                setMessage('Signup successful!');
                navigate('/loginroles');
            } else {
                setMessage('Signup failed. Please try again.');
            }
        } catch (error) {
            console.error('Error during signup:', error.response ? error.response.data : error.message);
            setMessage('An error occurred. Please try again.');
        }
    };

    const handleLoginRedirect = () => {
        navigate('/login');
    };

    return (
        <div className="container mt-5" style={{ maxWidth: '600px' }}>
            <h2 className="text-center mb-4">Sign up to be a TUP student</h2>
            <div className="d-flex justify-content-center mb-3">
            <button className="gbtn" style={{ width: '40%' }}>
                <span className="google-icon" /> Continue with Google
            </button>
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
                        placeholder="Work email address"
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

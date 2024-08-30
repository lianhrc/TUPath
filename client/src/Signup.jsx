import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';

function Signup() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const handleSignup = async (event) => {
        event.preventDefault();

        try {
            const response = await axios.post('http://localhost:3001/register', { name, email, password });
            if (response.data.success) {
                setMessage('Signup successful!');
                // Redirect to LoginRoles page after successful signup
                navigate('/loginroles');
            } else {
                setMessage('Signup failed. Please try again.');
            }
        } catch (error) {
            console.error('Error during signup:', error);
            setMessage('An error occurred. Please try again.');
        }
    };

    const handleLoginRedirect = () => {
        console.log('Redirecting to login page');
        navigate('/login');
    };

    return (
        <div className="container mt-5" style={{ maxWidth: '400px' }}>
            <h2 className="mb-4">Register</h2>
            <form onSubmit={handleSignup}>
                <div className="form-group">
                    <label htmlFor="name">Name:</label>
                    <input
                        type="text"
                        className="form-control"
                        id="name"
                        placeholder="Enter Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="email">Email:</label>
                    <input
                        type="email"
                        className="form-control"
                        id="email"
                        placeholder="Enter Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="password">Password:</label>
                    <input
                        type="password"
                        className="form-control"
                        id="password"
                        placeholder="Enter Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <button type="submit" className="btn btn-success btn-block">Register</button>
            </form>
            {message && <p className="mt-3">{message}</p>}
            <p className="mt-3">Already Have an Account?</p>
            <button onClick={handleLoginRedirect} className="btn btn-secondary btn-block">Login</button>
        </div>
    );
}

export default Signup;

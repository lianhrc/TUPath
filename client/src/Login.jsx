import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (event) => {
        event.preventDefault();
        try {
            const response = await axios.post('http://localhost:3001/login', { email, password });
            console.log('Response from server:', response.data); // Updated logging line
    
            if (response.data.success) {
                setMessage('Login successful!');
                navigate('/homepage'); // Navigate to the homepage on success
            } else {
                setMessage(response.data.message || 'Login failed. Invalid credentials.');
            }
        } catch (error) {
            console.error('Error during login:', error); // Log detailed error
            setMessage('An error occurred. Please try again.');
        }
    };
    

    const handleSignupRedirect = () => {
        navigate('/register');
    };

    return (
        <div className="container mt-5" style={{ maxWidth: '400px' }}>
            <h2 className="mb-4">Login</h2>
            <form onSubmit={handleLogin}>
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
                <button type="submit" className="btn btn-primary btn-block">Login</button>
            </form>
            {message && <p className="mt-3">{message}</p>}
            <p className="mt-3">Don't have an account?</p>
            <button onClick={handleSignupRedirect} className="btn btn-secondary btn-block">Register</button>
        </div>
    );
}

export default Login;

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import './login.css';
import API_BASE_URL from '../config';

// Login
const Login = ({ setUser }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false); // New state for password visibility
    const navigate = useNavigate();


    // Handle login
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Login request
            const res = await axios.post(`${API_BASE_URL}/api/auth/login`, { email, password });
            
            // Store token
            localStorage.setItem('token', res.data.token);
            
            // Fetch and set user
            const userRes = await axios.get(`${API_BASE_URL}/api/auth/me`, {
                headers: { 'x-auth-token': res.data.token }
            });
            setUser(userRes.data);

            // Notify navbar
            window.dispatchEvent(new Event('authChange'));

            // Success message
            toast.success('Logged in successfully');

            // Redirect
            navigate('/problems');
        } catch (err) {
            const msg = err.response?.data?.error || 'Error logging in';
            toast.error(msg);
        }
    };

    return (
        <div className="login-container">
            <Toaster />
            <div className="login-card">
                <h1 className="login-title">Coding Arena</h1>
                <h2 className="login-subtitle">Welcome!!</h2>
                <form className="login-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="Enter your email"
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <div className="password-input-container">
                            <input
                                type={showPassword ? 'text' : 'password'} // Toggle type based on state
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                placeholder="Enter your password"
                            />
                            <span 
                                className="password-toggle-icon" 
                                onClick={() => setShowPassword(!showPassword)} // Toggle showPassword state
                            >
                                {showPassword ? '🙈' : '👁️'} {/* Eye icon for visibility toggle */}
                            </span>
                        </div>
                    </div>
                    <button type="submit" className="login-btn">SIGN IN</button>
                </form>
                <div className="login-footer">
                    <p><Link to="/forgot-password">Forgot Password?</Link></p>
                    <p>Don't have an account? <Link to="/register">Sign Up</Link></p>
                </div>
            </div>
        </div>
    );
};

export default Login;

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import './register.css';
import API_BASE_URL from '../config';

const Register = () => {
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [otp, setOtp] = useState('');
    const [showOtpField, setShowOtpField] = useState(false);
    const [verified, setVerified] = useState(false);
    const navigate = useNavigate();


    const handleSubmit = async (e) => {
        e.preventDefault();

        if (phone.length !== 10 || !/^\d+$/.test(phone)) {
            toast.error('Phone number must be exactly 10 digits.');
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/signup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, phone, email, password }),
            });
            const data = await response.json();
            
            if (response.ok) {
                toast.success('Registration successful! Please login to continue.');
                setTimeout(() => {
                    navigate('/login');
                }, 1000);
            } else {
                toast.error(data.error || data.msg || 'Registration failed. Please try again.');
            }
        } catch (error) {
            console.error('Error during registration:', error);
            toast.error('An error occurred during registration. Please check your connection and try again.');
        }
    };

    return (
        <div className="register-container">
            <Toaster />
            <div className="register-card">
                <h1 className="register-title">Coding Arena</h1>
                <h2 className="register-subtitle">Create Account</h2>
                <form className="register-form" onSubmit={handleSubmit}>
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="name">Full Name</label>
                            <input
                                type="text"
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                placeholder="Enter your full name"
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="phone">Phone Number</label>
                            <input
                                type="tel"
                                id="phone"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                required
                                placeholder="Enter phone number"
                            />
                        </div>
                    </div>
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => {
                                    setEmail(e.target.value);
                                    setVerified(false);
                                    setShowOtpField(false);
                                }}
                                required
                                placeholder="Enter your email"
                                style={{ flex: 1 }}
                            />
                            <button
                                type="button"
                                className="verify-btn"
                                onClick={async () => {
                                    if (!email) {
                                        toast.error('Please enter an email first');
                                        return;
                                    }
                                    try {
                                        const response = await fetch(`${API_BASE_URL}/api/auth/send-otp`, {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({ email }),
                                        });
                                        const data = await response.json();
                                        if (response.ok) {
                                            toast.success('OTP sent to your email');
                                            setShowOtpField(true);
                                        } else {
                                            toast.error(data.msg || 'Failed to send OTP');
                                        }
                                    } catch (error) {
                                        toast.error('Error sending OTP');
                                    }
                                }}
                                disabled={verified}
                                style={{ marginLeft: '8px' }}
                            >
                                {verified ? 'Verified' : 'Verify'}
                            </button>
                        </div>
                    </div>
                    {showOtpField && !verified && (
                        <div className="form-group">
                            <label htmlFor="otp">Enter OTP</label>
                            <input
                                type="text"
                                id="otp"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                placeholder="Enter OTP"
                            />
                            <button
                                type="button"
                                className="verify-btn"
                                onClick={async () => {
                                    if (!otp) {
                                        toast.error('Please enter the OTP');
                                        return;
                                    }
                                    try {
                                        const response = await fetch(`${API_BASE_URL}/api/auth/verify-otp`, {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({ email, otp }),
                                        });
                                        const data = await response.json();
                                        if (response.ok) {
                                            toast.success('Email verified successfully');
                                            setVerified(true);
                                            setShowOtpField(false);
                                        } else {
                                            toast.error(data.msg || 'Invalid OTP');
                                        }
                                    } catch (error) {
                                        toast.error('Error verifying OTP');
                                    }
                                }}
                            >
                                Verify OTP
                            </button>
                        </div>
                    )}
                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            placeholder="Create a password"
                        />
                    </div>
                    <button type="submit" className="register-btn" disabled={!verified}>
                        CREATE ACCOUNT
                    </button>
                </form>
                <div className="login-link">
                    <p>Already have an account? <Link to="/login">Sign In</Link></p>
                </div>
            </div>
        </div>
    );
};

export default Register;

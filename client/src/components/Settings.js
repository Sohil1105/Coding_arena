import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from '../config';
import './Settings.css';

const Settings = () => {
    const [user, setUser] = useState({});
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        profilePicture: null
    });
    const [passwordData, setPasswordData] = useState({
        newPassword: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [deleteConfirm, setDeleteConfirm] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        fetchUserData();
    }, []);

    const fetchUserData = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_BASE_URL}/api/users`, {
                headers: { 'x-auth-token': token }
            });
            setUser(res.data);
            setFormData({
                name: res.data.name || '',
                email: res.data.email || '',
                phone: res.data.phone || '',
                profilePicture: null
            });
        } catch (err) {
            console.error('Error fetching user data:', err);
        }
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        setFormData({ ...formData, profilePicture: e.target.files[0] });
    };

    const handlePasswordChange = (e) => {
        setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
    };

    const handleSaveChanges = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        try {
            const token = localStorage.getItem('token');
            const formDataToSend = new FormData();
            formDataToSend.append('name', formData.name);
            formDataToSend.append('email', formData.email);
            formDataToSend.append('phone', formData.phone);
            if (formData.profilePicture) {
                formDataToSend.append('profilePicture', formData.profilePicture);
            }

            await axios.patch(`${API_BASE_URL}/api/users/profile`, formDataToSend, {
                headers: {
                    'x-auth-token': token,
                    'Content-Type': 'multipart/form-data'
                }
            });

            alert('Profile updated successfully!');
            navigate(`/profile/${user._id}`);
        } catch (err) {
            setMessage(err.response?.data?.msg || 'Error updating profile');
        } finally {
            setLoading(false);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setMessage('New passwords do not match');
            return;
        }

        setLoading(true);
        setMessage('');

        try {
            const token = localStorage.getItem('token');
            const res = await axios.patch(`${API_BASE_URL}/api/users/change-password`, {
                newPassword: passwordData.newPassword
            }, {
                headers: { 'x-auth-token': token }
            });

            alert(res.data.msg || 'Password changed successfully!');
            setPasswordData({ newPassword: '', confirmPassword: '' });
            localStorage.removeItem('token');
            alert('Please login with your new password.');
            window.location.href = '/login';
        } catch (err) {
            setMessage(err.response?.data?.msg || 'Error changing password');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAccount = async () => {
        if (!deleteConfirm) {
            setDeleteConfirm(true);
            return;
        }

        setLoading(true);
        setMessage('');

        try {
            const token = localStorage.getItem('token');
            const res = await axios.delete(`${API_BASE_URL}/api/users/delete-account`, {
                headers: { 'x-auth-token': token }
            });

            alert(res.data.msg);
            localStorage.removeItem('token');
            window.location.href = '/login';
        } catch (err) {
            setMessage(err.response?.data?.msg || 'Error requesting account deletion');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="settings-container">
            <div className="settings-card">
                <div className="settings-header">
                    <span className="back-arrow" onClick={() => user._id && navigate(`/profile/${user._id}`)}>
                        ←
                    </span>
                    <h1 className="settings-title">Settings</h1>
                </div>

                {message && <div className="message">{message}</div>}

                <form onSubmit={handleSaveChanges} className="settings-form">
                    <div className="section">
                        <h2>Profile Management</h2>

                        <div className="form-group">
                            <label>Profile Picture</label>
                            <input
                                type="file"
                                accept="image/jpeg,image/jpg,image/png"
                                onChange={handleFileChange}
                            />
                            {user.profilePicture && (
                                <img
                                    src={`/uploads/${user.profilePicture}`}
                                    alt="Profile"
                                    className="profile-preview"
                                />
                            )}
                        </div>

                        <div className="form-group">
                            <label>Full Name</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                            />
                        </div>

                        <div className="form-group">
                            <label>Email ID</label>
                            <input
                                type="text"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                            />
                        </div>

                        <div className="form-group">
                            <label>Phone Number</label>
                            <input
                                type="text"
                                name="phone"
                                value={formData.phone}
                                onChange={handleInputChange}
                            />
                        </div>
                    </div>

                    <div className="section">
                        <h2>Security</h2>



                        <div className="form-group">
                            <label>New Password</label>
                            <input
                                type="password"
                                name="newPassword"
                                value={passwordData.newPassword}
                                onChange={handlePasswordChange}
                            />
                        </div>

                        <div className="form-group">
                            <label>Confirm New Password</label>
                            <input
                                type="password"
                                name="confirmPassword"
                                value={passwordData.confirmPassword}
                                onChange={handlePasswordChange}
                            />
                        </div>

                        <button 
                            type="button" 
                            onClick={handleChangePassword} 
                            className="change-password-btn"
                        >
                            Change Password
                        </button>
                    </div>

                    <div className="form-actions">
                        <button 
                            type="submit" 
                            className="save-changes-btn" 
                            disabled={loading}
                        >
                            {loading ? 'Saving...' : 'Save Changes'}
                        </button>

                        <button
                            type="button"
                            onClick={handleDeleteAccount}
                            className="delete-account-btn"
                            disabled={loading}
                        >
                            {deleteConfirm ? 'Confirm Delete Account' : 'Delete Account'}
                        </button>
                    </div>

                    {deleteConfirm && (
                        <div className="warning">
                            <p>Are you sure you want to delete your account?</p>
                            <p>This action cannot be undone. Your account will be deleted after admin approval (15-30 days).</p>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
};

export default Settings;

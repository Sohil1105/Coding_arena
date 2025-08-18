import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Profile.css';
import API_BASE_URL from '../config';
import Loader from './Loader'; // Import Loader

const Profile = ({ user: loggedInUser }) => {
    const navigate = useNavigate();
    const { id: paramId } = useParams(); // Rename id from useParams to avoid conflict
    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfileData = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }
            
            // Determine which user's profile to fetch
            // Prioritize loggedInUser.id if available, otherwise use paramId
            const userIdToFetch = loggedInUser?.id || paramId; // Use optional chaining for safety

            if (!userIdToFetch) {
                setLoading(false);
                setProfileData(null);
                return;
            }

            const config = {
                headers: {
                    'x-auth-token': token
                }
            };
            
            try {
                const res = await axios.get(`${API_BASE_URL}/api/users/${userIdToFetch}/profile`, config);
                setProfileData(res.data);
            } catch (err) {
                console.error('Error fetching profile data:', err);
                if (err.response && err.response.status === 401) {
                    localStorage.removeItem('token');
                    navigate('/login');
                }
                setProfileData(null);
            } finally {
                setLoading(false);
            }
        };

        // Only fetch if loggedInUser is available and has an ID, or if paramId is present
        // This ensures we don't try to fetch with a null ID
        if (loggedInUser?.id || paramId) {
            setLoading(true); // Always set loading true before starting fetch
            fetchProfileData();
        } else {
            // If neither loggedInUser.id nor paramId is available, we are not ready to fetch
            setLoading(false);
            setProfileData(null);
        }
    }, [loggedInUser, paramId, navigate]);

    if (loading) {
        return <Loader />;
    }

    if (!profileData) {
        return <div>User not found</div>;
    }

    const { user, contributedProblems, solvedProblems, attemptedProblems, solvedCount, attemptedCount } = profileData;

    const handleSettingsClick = () => {
        // Ensure we navigate to the correct user ID for settings
        const settingsId = loggedInUser ? loggedInUser.id : paramId;
        navigate(`/settings/${settingsId}`);
    };

    const capitalizeFirstLetter = (string) => {
        return string.charAt(0).toUpperCase() + string.slice(1);
    };

    return (
        <div className="profile-container">
            <div className="profile-card">
                <button className="settings-button" onClick={handleSettingsClick}>
                    Settings
                </button>
                <img 
                    src="https://www.shutterstock.com/image-vector/default-avatar-profile-icon-social-600nw-1906669723.jpg" 
                    alt="Profile Avatar" 
                    className="profile-avatar" 
                />
                <h1 className="profile-username">{capitalizeFirstLetter(user.name)}</h1>
                <p className="profile-email">{user.email}</p>
                <p className="profile-phone">Phone: {user.phone}</p>

                <div className="profile-stats">
                    <div className="stat-card">
                        <p className="stat-value">{user.score}</p>
                        <p className="stat-label">Score</p>
                    </div>
                    <div className="stat-card">
                        <p className="stat-value">{solvedCount}</p>
                        <p className="stat-label">Solved</p>
                    </div>
                    <div className="stat-card">
                        <p className="stat-value">{attemptedCount}</p>
                        <p className="stat-label">Attempted</p>
                    </div>
                    <div className="stat-card">
                        <p className="stat-value">{contributedProblems.length}</p>
                        <p className="stat-label">Contributed</p>
                    </div>
                </div>

                <div className="profile-problems">
                    <h3 className="problem-list-title">Problems Solved ({solvedCount})</h3>
                    <ul className="problem-list">
                        {solvedProblems.filter(problem => problem).map((problem) => (
                            <li key={problem._id} className="problem-item">
                                <a href={`/problems/${problem._id}`}>{problem.title}</a>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="profile-problems">
                    <h3 className="problem-list-title">Problems Attempted ({attemptedCount})</h3>
                    <ul className="problem-list">
                        {attemptedProblems.filter(problem => problem).map((problem) => (
                            <li key={problem._id} className="problem-item">
                                <a href={`/problems/${problem._id}`}>{problem.title}</a>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="profile-problems">
                    <h3 className="problem-list-title">Problems Contributed ({contributedProblems.length})</h3>
                    <ul className="problem-list">
                        {contributedProblems.filter(problem => problem).map((problem, index) => (
                            <li key={index} className="problem-item">
                                <a href={`/problems/${problem._id}`}>{problem.title}</a>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default Profile;

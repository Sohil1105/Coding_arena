import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './dashboard.css';
import axios from 'axios';
import API_BASE_URL from '../config';
import Loader from './Loader'; // Import Loader

const Dashboard = () => {
    const [problems, setProblems] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true); // Add loading state

    useEffect(() => {
        const fetchProblems = async () => {
            try {
                console.log('Fetching problems from:', `${API_BASE_URL}/api/problems`);
                
                const res = await axios.get(`${API_BASE_URL}/api/problems`, {
                    timeout: 10000,
                    headers: {
                        'Content-Type': 'application/json',
                    }
                });
                
                console.log('Problems fetched successfully:', res.data.length, 'problems');
                setProblems(res.data);
                setError(null);
            } catch (err) {
                console.error('Error fetching problems:', err);
                
                let errorMessage = 'Error fetching problems';
                if (err.code === 'ERR_NETWORK') {
                    errorMessage = 'Network error: Cannot connect to server. Please ensure the backend is running on port 5000.';
                } else if (err.code === 'ERR_CONNECTION_REFUSED') {
                    errorMessage = 'Connection refused: Server is not running or not accessible.';
                } else if (err.response?.status === 404) {
                    errorMessage = 'Problems endpoint not found (404).';
                } else if (err.response?.status >= 500) {
                    errorMessage = 'Server error: Please try again later.';
                }
                
                setError(errorMessage);
            } finally {
                setLoading(false); // Set loading to false after fetch
            }
        };

        fetchProblems();
    }, []);

    if (loading) {
        return <Loader />;
    }

    return (
        <div className="dashboard-page">
            <div className="main-content">
                <div className="problems-section">
                    <div className="problems-list">
                        {error && <p className="error-message">{error}</p>}
                        {!error && problems.length === 0 && <p>No problems available.</p>}
                        {problems.map((problem) => (
                            <div key={problem.id} className="dashboard-problem-item">
                                <Link to={`/problem/${problem.id}`} className="problem-title-link">
                                    <span className="problem-title">{problem.title}</span>
                                </Link>
                                <span className={`problem-difficulty ${problem.difficulty.toLowerCase()}`}>{problem.difficulty}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;

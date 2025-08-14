import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './Admin.css';
import API_BASE_URL from '../config';

const Admin = () => {
    const [problems, setProblems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const fetchProblemsAndUser = async () => {
            const token = localStorage.getItem('token');
            const config = {
                headers: {
                    'x-auth-token': token
                }
            };
            try {
                const [problemsRes, userRes] = await Promise.all([
                    axios.get(`${API_BASE_URL}/api/problems`),
                    axios.get(`${API_BASE_URL}/api/users`, config)
                ]);
                setProblems(problemsRes.data);
                setUser(userRes.data);
                setLoading(false);
            } catch (err) {
                console.error(err);
                setLoading(false);
            }
        };
        fetchProblemsAndUser();
    }, []);

    const deleteProblem = async (id) => {
        const token = localStorage.getItem('token');
        const config = {
            headers: {
                'x-auth-token': token
            }
        };
        try {
            await axios.delete(`${API_BASE_URL}/api/problems/${id}`, config);
            setProblems(problems.filter(problem => problem.id !== id));
        } catch (err) {
            console.error(err.response.data);
        }
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="admin-page">
            <h2>Admin Panel</h2>
            <div className="problems-list">
                {problems.map(problem => (
                    <div key={problem.id} className="admin-problem-item">
                        <span>{problem.title}</span>
                        <div className="admin-actions">
                            {user && (user.isAdmin || (problem.author && problem.author._id === user._id)) && (
                                <>
                                    <Link to={`/edit-problem/${problem.id}`} className="edit-btn">Edit</Link>
                                    <button className="delete-btn" onClick={() => deleteProblem(problem.id)}>Delete</button>
                                </>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Admin;

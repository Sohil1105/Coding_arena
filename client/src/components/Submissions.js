import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import './Submissions.css';
import API_BASE_URL from '../config';

const Submissions = () => {
    const { id } = useParams(); // User ID
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSubmissions = async () => {
            const token = localStorage.getItem('token');
            const config = {
                headers: {
                    'x-auth-token': token
                }
            };
            try {
                const res = await axios.get(`${API_BASE_URL}/api/submissions/user/${id}`, config);
                setSubmissions(res.data);
                setLoading(false);
            } catch (err) {
                console.error(err);
                setLoading(false);
            }
        };
        fetchSubmissions();
    }, [id]);

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="submissions-page">
            <h2>My Submissions</h2>
            <div className="submissions-list">
                {submissions.map((submission, index) => (
                    <div key={index} className="submission-item">
                        <p><strong>Problem:</strong> {submission.problemTitle}</p>
                        <p><strong>Language:</strong> {submission.language}</p>
                        <p><strong>Output:</strong> {submission.output}</p>
                        <p><strong>Submitted:</strong> {new Date(submission.submittedAt).toLocaleString()}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Submissions;

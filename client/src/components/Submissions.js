import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import './Submissions.css';
import API_BASE_URL from '../config';
import Loader from './Loader'; // Import Loader

const Submissions = ({ refreshKey }) => {
    const { id } = useParams(); // User ID from route param
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSubmissions = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                setLoading(false);
                return;
            }
            const config = {
                headers: {
                    'x-auth-token': token
                }
            };
            try {
                let userId = id;
                if (!userId) {
                    // If no id param, fetch current user info to get userId
                    const userRes = await axios.get(`${API_BASE_URL}/api/auth/me`, config);
                    userId = userRes.data.id || userRes.data._id;
                }
                const res = await axios.get(`${API_BASE_URL}/api/submissions/user/${userId}`, config);
                console.log('Submissions fetched:', res.data);
                setSubmissions(res.data);
            } catch (err) {
                console.error('Error fetching submissions:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchSubmissions();
    }, [id, refreshKey]);


    if (loading) {
        return <Loader />;
    }

    return (
        <div className="submissions-page">
            <h2>My Submissions</h2>
            <div className="submissions-list">
                {submissions.length === 0 ? (
                    <div className="submissions-empty">No submissions yet.</div>
                ) : (
                    submissions.map((submission, index) => (
                        <div key={index} className="submission-item">
                            <p><strong>Problem:</strong> {submission.problemTitle}</p>
                            <p><strong>Language:</strong> {submission.language}</p>
                            <p><strong>Status:</strong> {submission.status}</p>
                            <p><strong>Submitted:</strong> {new Date(submission.submittedAt).toLocaleString()}</p>
                            {submission.testResults && submission.testResults.length > 0 && (
                                <div className="test-results">
                                    <h4>Test Results:</h4>
                                    {submission.testResults.map((test, testIndex) => (
                                        <div key={testIndex} className={`test-case-result ${test.passed ? 'passed' : 'failed'}`}>
                                            <p><strong>Test Case {testIndex + 1}:</strong> {test.passed ? 'Passed' : 'Failed'}</p>
                                            <p>Input: {test.input || 'N/A'}</p>
                                            <p>Expected Output: {test.expectedOutput || 'N/A'}</p>
                                            <p>Actual Output: {test.actualOutput || 'N/A'}</p>
                                            {test.error && <p className="test-error">Error: {test.error}</p>}
                                        </div>
                                    ))}
                                </div>
                            )}
                            <div className="submission-code">
                                <h4>Code:</h4>
                                <pre>{submission.code}</pre>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Submissions;

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import './Submissions.css';
import API_BASE_URL from '../config';
import Loader from './Loader'; // Import Loader

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
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchSubmissions();
    }, [id]);

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

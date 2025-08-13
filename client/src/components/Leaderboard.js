import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Leaderboard.css';
import API_BASE_URL from '../config';

const Leaderboard = () => {
    const [topSolvers, setTopSolvers] = useState([]);
    const [topContributors, setTopContributors] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const solversRes = await axios.get(`${API_BASE_URL}/api/leaderboard/solvers`);
                const contributorsRes = await axios.get(`${API_BASE_URL}/api/leaderboard/contributors`);
                setTopSolvers(solversRes.data);
                setTopContributors(contributorsRes.data);
                setLoading(false);
            } catch (err) {
                console.error(err);
                setLoading(false);
            }
        };
        fetchLeaderboard();
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="leaderboard-container">
            <div className="leaderboard-content">
                <h1 className="leaderboard-title">Leaderboard</h1>
                <div className="leaderboard-section">
                    <h2 className="section-title">Top Solvers</h2>
                    <table className="leaderboard-table">
                        <thead>
                            <tr>
                                <th>Rank</th>
                                <th>Username</th>
                                <th>Score</th>
                            </tr>
                        </thead>
                        <tbody>
                            {topSolvers.map((solver, index) => (
                                <tr key={index}>
                                    <td data-label="Rank" className="rank">{index + 1}</td>
                                    <td data-label="Username" className="username">{solver.name}</td>
                                    <td data-label="Score" className="score">{solver.score}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="leaderboard-section">
                    <h2 className="section-title">Top Contributors</h2>
                    <table className="leaderboard-table">
                        <thead>
                            <tr>
                                <th>Rank</th>
                                <th>Username</th>
                                <th>Contributions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {topContributors.map((contributor, index) => (
                                <tr key={index}>
                                    <td data-label="Rank" className="rank">{index + 1}</td>
                                    <td data-label="Username" className="username">{contributor.name}</td>
                                    <td data-label="Contributions" className="score">{contributor.contributions}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Leaderboard;

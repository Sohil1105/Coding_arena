import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import './index.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Register from './components/register';
import Login from './components/login';
import Dashboard from './components/dashboard';
import ProblemDetail from './components/ProblemDetail';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Contribute from './components/Contribute';
import Admin from './components/Admin';
import Leaderboard from './components/Leaderboard';
import Profile from './components/Profile';
import Submissions from './components/Submissions';
import Landing from './components/Landing';
import EditProblem from './components/EditProblem';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import Settings from './components/Settings';
import API_BASE_URL from './config';
import Loader from './components/Loader';

function App() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const res = await axios.get(`${API_BASE_URL}/api/auth/me`, {
                        headers: { 'x-auth-token': token }
                    });
                    setUser(res.data);
                } catch (error) {
                    console.error('Failed to fetch user', error);
                    localStorage.removeItem('token');
                }
            }
            setLoading(false);
        };
        fetchUser();
    }, []);

    if (loading) {
        return <Loader />;
    }

    return (
        <BrowserRouter>
            <Navbar user={user} setUser={setUser} />
            <div className="main-container">
                <Routes>
                    {/* App routes */}
                    <Route path="/" element={<Landing />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/login" element={<Login setUser={setUser} />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/reset-password/:token" element={<ResetPassword />} />
                    <Route path="/problems" element={<Dashboard />} />
                    <Route path="/problem/:id" element={<ProblemDetail />} />
                    <Route path="/contribute" element={<ProtectedRoute><Contribute /></ProtectedRoute>} />
                    <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
                    <Route path="/edit-problem/:id" element={<ProtectedRoute><EditProblem /></ProtectedRoute>} />
                    <Route path="/leaderboard" element={<Leaderboard />} />
                    <Route path="/profile/:id" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                    <Route path="/settings/:id" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
                    <Route path="/submissions/:id" element={<Submissions />} />
                </Routes>
            </div>
        </BrowserRouter>
    );
}

export default App;

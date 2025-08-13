import React, { useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import API_BASE_URL from '../config';
import './ResetPassword.css';

const ResetPassword = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');

    const onSubmit = async e => {
        e.preventDefault();
        try {
            const res = await axios.post(`${API_BASE_URL}/api/users/reset-password/${token}`, { password });
            setMessage(res.data.msg);
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            setMessage(err.response.data.msg);
        }
    };

    return (
        <div className="login-page">
            <h2>Reset Password</h2>
            <form onSubmit={onSubmit}>
                <div className="form-group">
                    <label>New Password</label>
                    <input
                        type="password"
                        name="password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required
                    />
                </div>
                <button type="submit">Submit</button>
            </form>
            {message && <p>{message}</p>}
        </div>
    );
};

export default ResetPassword;

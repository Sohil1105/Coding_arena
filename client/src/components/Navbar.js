import React from 'react';
import { Link, useNavigate, NavLink } from 'react-router-dom';
import './Navbar.css';

const Navbar = ({ user, setUser }) => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        setUser(null);
        navigate('/login');
    };

    return (
        <nav className="navbar">
            <Link to="/" className="navbar-logo">
                Coding Arena
            </Link>
            <ul className="navbar-links">
                <li><NavLink to="/problems" className={({ isActive }) => (isActive ? 'active' : '')}>Problem Space</NavLink></li>
                <li><NavLink to="/leaderboard" className={({ isActive }) => (isActive ? 'active' : '')}>Leaderboard</NavLink></li>
                <li><NavLink to="/contribute" className={({ isActive }) => (isActive ? 'active' : '')}>Contribute</NavLink></li>
                {user && user.role === 'admin' && <li><NavLink to="/admin" className={({ isActive }) => (isActive ? 'active' : '')}>Admin</NavLink></li>}
                
                {user ? (
                    <>
                        <li><NavLink to={`/profile/${user._id}`} className={({ isActive }) => (isActive ? 'active' : '')}>Profile</NavLink></li>
                        <li><button onClick={handleLogout} className="logout-btn">Logout</button></li>
                    </>
                ) : (
                    <>
                        <li><NavLink to="/login" className={({ isActive }) => (isActive ? 'active' : '')}>Login</NavLink></li>
                        <li><NavLink to="/register" className={({ isActive }) => "register-btn" + (isActive ? " active" : "")}>Register</NavLink></li>
                    </>
                )}
            </ul>
        </nav>
    );
};

export default Navbar;

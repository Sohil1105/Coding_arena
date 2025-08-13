import React from 'react';
import { Navigate } from 'react-router-dom';

// Protect authenticated routes
const ProtectedRoute = ({ children }) => {
    const token = localStorage.getItem('token');

    // Redirect if not authenticated
    if (!token) {
        return <Navigate to="/login" />;
    }

    return children;
};

export default ProtectedRoute;

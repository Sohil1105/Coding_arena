const jwt = require('jsonwebtoken');

// Authenticate requests
const auth = (req, res, next) => {
    // Get token
    const token = req.header('x-auth-token');

    // Deny if no token
    if (!token) {
        return res.status(401).json({ msg: 'No token, authorization denied' });
    }

    try {
        // Decode token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key');
        req.user = decoded.user;
        next();
    } catch (err) {
        res.status(401).json({ msg: 'Token is not valid' });
    }
};

module.exports = auth;

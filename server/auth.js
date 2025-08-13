const express = require('express');
const router = express.Router();
const User = require('./models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const authMiddleware = require('./middleware/auth');

// Get user
router.get('/me', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Signup
router.post('/signup', async (req, res) => {
    try {
        console.log('Received signup request:', req.body);
        const { name, email, password, phone } = req.body;

        // Check user exists
        let user = await User.findOne({ email });
        if (user) {
            console.log('User already exists with email:', email);
            return res.status(400).json({ msg: 'User already exists' });
        }

        // New user
        user = new User({
            name,
            email,
            password,
            phone
        });

        if (email === 'souravsohil1111@gmail.com') {
            user.role = 'admin';
            user.isAdmin = true;
        }

        // Encrypt password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        await user.save();

        // Return JWT
        const payload = {
            user: {
                id: user.id
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: 3600 },
            (err, token) => {
                if (err) throw err;
                res.json({ token });
            }
        );
    } catch (err) {
        console.error('Signup error:', err);
        res.status(500).json({ error: 'Server error', message: err.message });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check user exists
        let user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        // Return JWT
        const payload = {
            user: {
                id: user.id
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: 3600 },
            (err, token) => {
                if (err) throw err;
                res.json({ token });
            }
        );
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error', message: err.message });
    }
});

module.exports = router;

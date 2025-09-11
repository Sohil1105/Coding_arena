const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const User = require('./models/user');
const Problem = require('./models/problem');
const Submission = require('./models/submission');
const auth = require('./middleware/auth');

// Login user
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        let user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ msg: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid credentials' });
        }

        const payload = {
            user: {
                id: user.id,
                role: user.role
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
        res.status(500).send('Server Error');
    }
});

// Get user
router.get('/', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Get user by ID
router.get('/:id', auth, async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }
        res.json(user);
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'User not found' });
        }
        res.status(500).send('Server Error');
    }
});

// Forgot password
router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: 'Password Reset',
            text: `Click the following link to reset your password: ${process.env.CLIENT_URL}/reset-password/${token}`,
        };

        await transporter.sendMail(mailOptions);
        res.status(200).json({ msg: 'Email sent' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Reset password
router.post('/reset-password/:token', async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);

        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        await user.save();

        res.json({ msg: 'Password updated' });
    } catch (err) {
        console.error(err.message);
        res.status(401).json({ msg: 'Token is not valid' });
    }
});

// Get user profile
router.get('/:id/profile', auth, async (req, res) => {
    try {
        const userId = req.params.id;

        // Get user
        // Populate solvedProblems with both _id and title for accurate comparison and display
        const user = await User.findById(userId).select('-password').populate('solvedProblems', '_id title');
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        // Get contributed
        const contributedProblems = await Problem.find({ author: userId });

        // Get submissions
        const submissions = await Submission.find({ userId: userId }).populate('problemId', '_id title'); // Populate with _id and title
        
        const attemptedProblemIds = new Set();
        const attemptedProblems = [];

        submissions.forEach(sub => {
            if (sub.problemId && !user.solvedProblems.some(p => p._id.equals(sub.problemId._id))) {
                const problemIdStr = sub.problemId._id.toString();
                if (!attemptedProblemIds.has(problemIdStr)) {
                    attemptedProblemIds.add(problemIdStr);
                    attemptedProblems.push({
                        _id: sub.problemId._id,
                        title: sub.problemId.title
                    });
                }
            }
        });

        res.json({
            user,
            contributedProblems,
            solvedProblems: user.solvedProblems,
            attemptedProblems: attemptedProblems,
            solvedCount: user.solvedProblems.length,
            attemptedCount: attemptedProblems.length,
        });

    } catch (err) {
        console.error('Error fetching profile data:', err);
        res.status(500).send('Server Error');
    }
});

module.exports = router;

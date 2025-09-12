const express = require('express');
const router = express.Router();
const User = require('./models/user');
const OTP = require('./models/otp');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
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

        // Check if email is verified
        const otpRecord = await OTP.findOne({ email });
        if (!otpRecord) {
            return res.status(400).json({ msg: 'Email not verified. Please verify your email before registering.' });
        }
        // Check if OTP expired
        if (otpRecord.expiresAt < new Date()) {
            return res.status(400).json({ msg: 'OTP expired. Please verify your email again.' });
        }

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

        // Delete OTP record after successful registration
        await OTP.deleteOne({ email });

        // Return JWT
        const payload = {
            user: {
                id: user.id
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '24h' },
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
            { expiresIn: '24h' },
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

// Send OTP
router.post('/send-otp', async (req, res) => {
    const { email } = req.body;

    try {
        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ msg: 'User already exists with this email' });
        }

        // Generate OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Hash OTP
        const hashedOtp = await bcrypt.hash(otp, 10);

        // Save to OTP collection
        await OTP.findOneAndUpdate(
            { email },
            { otp: hashedOtp, expiresAt: new Date(Date.now() + 10 * 60 * 1000) }, // 10 min
            { upsert: true }
        );

        // For testing, log OTP to console instead of sending email
        console.log(`OTP for ${email}: ${otp}`);

        // Uncomment below for actual email sending
        /*
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Email Verification OTP',
            text: `Your OTP for email verification is: ${otp}. It expires in 10 minutes.`
        };

        await transporter.sendMail(mailOptions);
        */

        res.json({ msg: 'OTP sent to your email' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Verify OTP
router.post('/verify-otp', async (req, res) => {
    const { email, otp } = req.body;

    try {
        const otpRecord = await OTP.findOne({ email });
        if (!otpRecord) {
            return res.status(400).json({ msg: 'OTP not found' });
        }

        if (otpRecord.expiresAt < new Date()) {
            return res.status(400).json({ msg: 'OTP expired' });
        }

        const isMatch = await bcrypt.compare(otp, otpRecord.otp);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid OTP' });
        }

        res.json({ msg: 'OTP verified' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;

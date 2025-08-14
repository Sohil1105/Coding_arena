const express = require('express');
const router = express.Router();
const Submission = require('./models/submission');
const auth = require('./middleware/auth');
const Problem = require('./models/problem');
const axios = require('axios');

// New submission with compiler service
router.post('/', auth, async (req, res) => {
    const { problemId, code, language } = req.body;

    try {
        // Validate input
        if (!problemId || !code || !language) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: problemId, code, or language'
            });
        }

        // Fetch problem
        const problem = await Problem.findOne({ id: Number(problemId) });
        if (!problem) {
            return res.status(404).json({
                success: false,
                message: 'Problem not found'
            });
        }

        // Send to compiler service
        const compilerResponse = await axios.post(`${process.env.COMPILER_URL}/submit`, {
            code,
            extension: language, // Compiler service expects 'extension'
            testcases: problem.testCases || [] // Compiler service expects 'testcases'
        }, {
            timeout: 30000 // 30 second timeout
        });

        // Create submission record
        const newSubmission = new Submission({
            problemId: problem._id,
            code,
            language,
            output: compilerResponse.data.output || 'No output received',
            userId: req.user.id,
            status: compilerResponse.data.success ? 'Completed' : 'Failed',
            testResults: compilerResponse.data.testResults || [],
            submittedAt: new Date()
        });

        await newSubmission.save();

        res.json({
            success: compilerResponse.data.success,
            output: compilerResponse.data.output || 'No output received',
            testResults: compilerResponse.data.testResults || [],
            submission: newSubmission
        });

    } catch (err) {
        console.error('Submission POST error:', err);
        
        let errorMessage = 'An unexpected error occurred';
        if (err.code === 'ECONNREFUSED') {
            errorMessage = 'Compiler service is not available';
        } else if (err.response) {
            errorMessage = err.response.data?.message || 'Compiler service error';
        } else if (err.request) {
            errorMessage = 'Cannot connect to compiler service';
        }

        res.status(500).json({
            success: false,
            message: errorMessage,
            output: `Error: ${errorMessage}`
        });
    }
});

// Get user submissions
router.get('/user/:userId', auth, async (req, res) => {
    try {
        const submissions = await Submission.find({ userId: req.params.userId })
            .populate('problemId', 'title id')
            .sort({ submittedAt: -1 });

        const formattedSubmissions = submissions.map(submission => ({
            ...submission.toObject(),
            problemTitle: submission.problemId ? submission.problemId.title : 'Unknown Problem',
            problemId: submission.problemId ? submission.problemId.id : null
        }));

        res.json(formattedSubmissions);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Get all submissions (admin only)
router.get('/', auth, async (req, res) => {
    try {
        const submissions = await Submission.find()
            .populate('problemId', 'title id')
            .populate('userId', 'username')
            .sort({ submittedAt: -1 });

        res.json(submissions);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const Submission = require('./models/submission');
const auth = require('./middleware/auth');

const axios = require('axios');
const Problem = require('./models/problem');

// New submission
router.post('/', auth, async (req, res) => {
    const { problemId, code, language } = req.body;

    try {
        // Fetch problem
        const problem = await Problem.findById(problemId);
        if (!problem) {
            return res.status(404).json({ msg: 'Problem not found' });
        }

        const testCases = problem.testCases || [];
        
        // Execute test cases
        const results = await Promise.all(testCases.map(async (testCase) => {
            try {
                const response = await axios.post(`${process.env.COMPILER_URL}/run`, {
                    language,
                    code,
                    input: testCase.input
                });

                const output = response.data.output.trim();
                const passed = output === testCase.output;

                return {
                    input: testCase.input,
                    expectedOutput: testCase.output,
                    actualOutput: output,
                    passed
                };
            } catch (compilerError) {
                const errorOutput = compilerError.response?.data?.error || 'Compiler Error';
                console.error('Compiler service error:', errorOutput);
                // Failed test case
                return {
                    input: testCase.input,
                    expectedOutput: testCase.output,
                    actualOutput: errorOutput,
                    passed: false,
                    error: true,
                };
            }
        }));

        // Summarize results
        const allPassed = results.every(r => r.passed);
        const outputSummary = allPassed ? 'Accepted' : 'Failed';
        const detailedOutput = JSON.stringify(results, null, 2);

        // New submission record
        const newSubmission = new Submission({
            problemId,
            code,
            language,
            output: `${outputSummary}\n${detailedOutput}`,
            userId: req.user.id,
            status: allPassed ? 'Accepted' : 'Failed',
        });

        await newSubmission.save();

        // Send response
        res.json({
            success: true,
            output: `${outputSummary}\n${detailedOutput}`,
            submission: newSubmission,
        });
    } catch (err) {
        console.error('Submission POST error:', err);
        res.status(500).json({
            success: false,
            output: 'An unexpected error occurred on the server.',
        });
    }
});

// Get user submissions
router.get('/user/:userId', auth, async (req, res) => {
    try {
        const submissions = await Submission.find({ userId: req.params.userId })
            .populate('problemId', 'title') // Populate problemId and select only the 'title' field
            .sort({ submittedAt: -1 });

        // Map submissions to include problemTitle directly
        const formattedSubmissions = submissions.map(submission => ({
            ...submission.toObject(),
            problemTitle: submission.problemId ? submission.problemId.title : 'Unknown Problem'
        }));

        res.json(formattedSubmissions);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;

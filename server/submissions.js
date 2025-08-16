const express = require('express');
const router = express.Router();
const Submission = require('./models/submission');
const auth = require('./middleware/auth');
const Problem = require('./models/problem');
const User = require('./models/user');
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

        let allTestsPassed = true;
        const testResults = [];
        let overallOutput = '';

        if (problem.testCases && problem.testCases.length > 0) {
            for (const [index, testCase] of problem.testCases.entries()) {
                try {
                    const compilerResponse = await axios.post(`${process.env.COMPILER_URL}/run`, {
                        code,
                        language,
                        input: testCase.input || ''
                    }, {
                        timeout: 30000 // 30 second timeout
                    });

                    const actualOutput = compilerResponse.data.output ? compilerResponse.data.output.trim() : '';
                    const expectedOutput = testCase.output ? testCase.output.trim() : '';
                    const passed = actualOutput === expectedOutput;

                    testResults.push({
                        input: testCase.input,
                        expectedOutput: testCase.output,
                        actualOutput: actualOutput,
                        passed: passed,
                        error: compilerResponse.data.error || null
                    });

                    if (!passed) {
                        allTestsPassed = false;
                    }
                    overallOutput += `Test Case ${index + 1}: ${passed ? 'Passed' : 'Failed'}\nOutput: ${actualOutput}\nExpected: ${expectedOutput}\n\n`;

                } catch (compilerErr) {
                    allTestsPassed = false;
                    let errorMessage = compilerErr.response?.data?.error || compilerErr.message || 'Compiler error';
                    if (typeof errorMessage === 'object') {
                        errorMessage = JSON.stringify(errorMessage);
                    }
                    testResults.push({
                        input: testCase.input,
                        expectedOutput: testCase.output,
                        actualOutput: '',
                        passed: false,
                        error: errorMessage
                    });
                    overallOutput += `Test Case ${index + 1}: Failed (Error)\nError: ${errorMessage}\n\n`;
                    console.error(`Error running test case ${index + 1}:`, compilerErr);
                }
            }
        } else {
            // If no test cases, run once without input or with a default empty input
            try {
                const compilerResponse = await axios.post(`${process.env.COMPILER_URL}/run`, {
                    code,
                    language,
                    input: ''
                }, {
                    timeout: 30000
                });
                overallOutput = compilerResponse.data.output || 'No output received';
                allTestsPassed = compilerResponse.data.success;
                testResults.push({
                    input: '',
                    expectedOutput: '',
                    actualOutput: overallOutput,
                    passed: allTestsPassed,
                    error: compilerResponse.data.error || null
                });
            } catch (compilerErr) {
                allTestsPassed = false;
                let errorMessage = compilerErr.response?.data?.error || compilerErr.message || 'Compiler error';
                if (typeof errorMessage === 'object') {
                    errorMessage = JSON.stringify(errorMessage);
                }
                overallOutput = `Error: ${errorMessage}`;
                testResults.push({
                    input: '',
                    expectedOutput: '',
                    actualOutput: '',
                    passed: false,
                    error: errorMessage
                });
                console.error('Error running code without test cases:', compilerErr);
            }
        }

        // Create submission record
        const newSubmission = new Submission({
            problemId: problem._id,
            code,
            language,
            output: overallOutput,
            userId: req.user.id,
            status: allTestsPassed ? 'Accepted' : 'Failed',
            testResults: testResults,
            submittedAt: new Date()
        });

        await newSubmission.save();

        if (allTestsPassed) {
            const user = await User.findById(req.user.id);
            if (user && !user.solvedProblems.includes(problem._id)) {
                user.solvedProblems.push(problem._id);
                let scoreToAdd = 0;
                switch (problem.difficulty) {
                    case 'Easy':
                        scoreToAdd = 10;
                        break;
                    case 'Medium':
                        scoreToAdd = 20;
                        break;
                    case 'Hard':
                        scoreToAdd = 30;
                        break;
                    default:
                        scoreToAdd = 10;
                }
                user.score += scoreToAdd;
                await user.save();
            }
        }

        res.json({
            success: allTestsPassed,
            output: overallOutput,
            testResults: testResults,
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

const express = require('express');
const router = express.Router();
const Problem = require('./models/problem');
const auth = require('./middleware/auth');

// Get all problems
router.get('/', async (req, res) => {
    try {
        const problems = await Problem.find().populate('author', 'name email');
        res.json(problems);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Get problem by ID
router.get('/:id', async (req, res) => {
    try {
        const problem = await Problem.findOne({ id: Number(req.params.id) });
        if (!problem) {
            return res.status(404).json({ msg: 'Problem not found' });
        }
        res.json(problem);
    } catch (err) {
        console.error('Error fetching problem by ID:', err.message);
        res.status(500).send('Server Error');
    }
});

// Create problem
router.post('/', auth, async (req, res) => {
    console.log('Received request to create problem:', req.body);
    console.log('User from auth middleware:', req.user);
    const { id, title, description, difficulty, tags, testCases, inputFormat, outputFormat } = req.body;

    try {
        const newProblem = new Problem({
            id,
            title,
            description,
            inputFormat,
            outputFormat,
            difficulty,
            tags,
            testCases,
            author: req.user.id // Use the user's id as the author
        });

        const problem = await newProblem.save();
        res.json(problem);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Update problem
router.put('/:id', auth, async (req, res) => {
    const { title, description, difficulty, tags, testCases, inputFormat, outputFormat } = req.body;

    const problemFields = {};
    if (title) problemFields.title = title;
    if (description) problemFields.description = description;
    if (inputFormat) problemFields.inputFormat = inputFormat;
    if (outputFormat) problemFields.outputFormat = outputFormat;
    if (difficulty) problemFields.difficulty = difficulty;
    if (tags) problemFields.tags = tags;
    if (testCases) problemFields.testCases = testCases;

    try {
        let problem = await Problem.findOne({ id: Number(req.params.id) });

        if (!problem) return res.status(404).json({ msg: 'Problem not found' });

        // Verify user
        if (problem.author.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({ msg: 'User not authorized' });
        }

        problem = await Problem.findOneAndUpdate(
            { id: Number(req.params.id) },
            { $set: problemFields },
            { new: true }
        );

        res.json(problem);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Delete problem
router.delete('/:id', auth, async (req, res) => {
    try {
        let problem = await Problem.findOne({ id: Number(req.params.id) });

        if (!problem) return res.status(404).json({ msg: 'Problem not found' });

        // Verify user
        if (problem.author.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({ msg: 'User not authorized' });
        }

        await Problem.findOneAndDelete({ id: Number(req.params.id) });

        res.json({ msg: 'Problem removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;

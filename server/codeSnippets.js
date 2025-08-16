const express = require('express');
const router = express.Router();
const CodeSnippet = require('./models/codeSnippet');
const auth = require('./middleware/auth');

// Save or update a code snippet
router.post('/', auth, async (req, res) => {
    const { problemId, code, language } = req.body;
    try {
        let snippet = await CodeSnippet.findOne({ userId: req.user.id, problemId });
        if (snippet) {
            // Update existing snippet
            snippet.code = code;
            snippet.language = language;
            await snippet.save();
            res.json(snippet);
        } else {
            // Create new snippet
            snippet = new CodeSnippet({
                userId: req.user.id,
                problemId,
                code,
                language
            });
            await snippet.save();
            res.json(snippet);
        }
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Get a code snippet for a specific problem
router.get('/:problemId', auth, async (req, res) => {
    try {
        const snippet = await CodeSnippet.findOne({ userId: req.user.id, problemId: req.params.problemId });
        if (!snippet) {
            return res.status(404).json({ msg: 'Snippet not found' });
        }
        res.json(snippet);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;

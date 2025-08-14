const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const auth = require('./middleware/auth');
const Problem = require('./models/problem');

// AI review
router.post('/review', auth, async (req, res) => {
    const { code, language, problemId } = req.body;

    try {
        // Use findOne to query by the 'id' field from problems.json
        const problem = await Problem.findOne({ id: problemId });
        if (!problem) {
            return res.status(404).json({ msg: 'Problem not found' });
        }

        const prompt = `
            You are an expert programmer and code reviewer. Please review the following ${language} code for a problem titled "${problem.title}".

            Problem Description:
            ${problem.description}

            User's Code:
            \`\`\`${language}
            ${code}
            \`\`\`

            Provide a concise code review, including:
            1.  Correctness: Does the code solve the problem?
            2.  Efficiency: What is the time and space complexity?
            3.  Best Practices: Are there ways to improve the code's style and structure?
            4.  Suggestions for Improvement: Offer specific, actionable advice.
        `;

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const review = await response.text();

        res.json({ review });

    } catch (err) {
        console.error('AI review error:', err);
        res.status(500).json({ error: 'Error getting AI review' });
    }
});

module.exports = router;

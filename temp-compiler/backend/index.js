const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { generateFile } = require('./generateFile');
const { executeCpp, executeJava, executePython, executeC } = require('./executeCode');

const app = express();
dotenv.config();

//middlewares
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get("/", (req, res) => {
    res.json({ online: 'compiler' });
});

app.post("/run", async (req, res) => {
    const { language = 'cpp', code, input } = req.body;

    if (code === undefined) {
        return res.status(400).json({ success: false, error: "Empty code!" });
    }

    try {
        const filePath = generateFile(language, code);
        let output;

        switch (language) {
            case 'cpp':
                output = await executeCpp(filePath, input);
                break;
            case 'java':
                output = await executeJava(filePath, input);
                break;
            case 'py':
                output = await executePython(filePath, input);
                break;
            case 'c':
                output = await executeC(filePath, input);
                break;
            default:
                return res.status(400).json({ success: false, error: "Unsupported language" });
        }

        res.json({ filePath, output });
    } catch (err) {
        const errorDetails = err.stderr || (err.error && err.error.message) || err.message || "An error occurred";
        res.status(500).json({ success: false, error: errorDetails });
    }
});

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}!`);
});

import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './Compiler.css';
import API_BASE_URL from '../config';

const Compiler = ({ problemId }) => {
    const [code, setCode] = useState('');
    const [language, setLanguage] = useState('cpp');
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const languages = [
        { value: 'c', label: 'C' },
        { value: 'cpp', label: 'C++' },
        { value: 'java', label: 'Java' },
        { value: 'python', label: 'Python' }
    ];

    const runCode = async () => {
        if (!code.trim()) {
            setError('Please enter some code');
            return;
        }

        setLoading(true);
        setError('');
        setOutput('');

        try {
            const response = await axios.post(`${process.env.REACT_APP_COMPILER_URL}/run`, {
                language, // Compiler service expects 'language'
                code,
                input
            });

            if (response.data.success) {
                setOutput(response.data.output);
            } else {
                setError(response.data.error || 'Compilation failed');
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to compile code');
        } finally {
            setLoading(false);
        }
    };

    const getLanguageTemplate = (lang) => {
        const templates = {
            'c': '#include <stdio.h>\n\nint main() {\n    printf("Hello, World!\\n");\n    return 0;\n}',
            'cpp': '#include <iostream>\n\nint main() {\n    std::cout << "Hello, World!" << std::endl;\n    return 0;\n}',
            'java': 'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}',
            'python': 'print("Hello, World!")'
        };
        return templates[lang] || '';
    };

    const saveSnippet = useCallback(async () => {
        const token = localStorage.getItem('token');
        if (!token || !problemId) return;

        try {
            await axios.post(`${API_BASE_URL}/api/snippets`, {
                problemId,
                code,
                language
            }, {
                headers: { 'x-auth-token': token }
            });
        } catch (err) {
            console.error('Failed to save snippet:', err);
        }
    }, [code, language, problemId]);

    useEffect(() => {
        const fetchSnippet = async () => {
            const token = localStorage.getItem('token');
            if (!token || !problemId) return;

            try {
                const res = await axios.get(`${API_BASE_URL}/api/snippets/${problemId}`, {
                    headers: { 'x-auth-token': token }
                });
                setCode(res.data.code);
                setLanguage(res.data.language);
            } catch (err) {
                // If no snippet is found, set the default template
                if (err.response && err.response.status === 404) {
                    setCode(getLanguageTemplate(language));
                } else {
                    console.error('Failed to fetch snippet:', err);
                }
            }
        };

        fetchSnippet();
    }, [problemId, language]);

    useEffect(() => {
        const timer = setTimeout(() => {
            saveSnippet();
        }, 5000); // Save every 5 seconds

        return () => clearTimeout(timer);
    }, [code, language, saveSnippet]);

    const handleLanguageChange = (lang) => {
        setLanguage(lang);
        // The code update is now handled by the useEffect for language
    };

    return (
        <div className="compiler-container">
            <h2>Online Code Compiler</h2>
            
            <div className="compiler-controls">
                <select 
                    value={language} 
                    onChange={(e) => handleLanguageChange(e.target.value)}
                    className="language-select"
                >
                    {languages.map(lang => (
                        <option key={lang.value} value={lang.value}>
                            {lang.label}
                        </option>
                    ))}
                </select>
                
                <button 
                    onClick={runCode} 
                    disabled={loading}
                    className="run-button"
                >
                    {loading ? 'Running...' : 'Run Code'}
                </button>
            </div>

            <div className="compiler-layout">
                <div className="code-section">
                    <h3>Code Editor</h3>
                    <textarea
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        placeholder="Enter your code here..."
                        className="code-editor"
                        spellCheck="false"
                    />
                    
                    <h3>Input</h3>
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Enter input (optional)..."
                        className="input-editor"
                    />
                </div>
                
                <div className="output-section">
                    <h3>Output</h3>
                    <div className="output-display">
                        {error && <div className="error-message">{error}</div>}
                        {output && <pre className="output-text">{output}</pre>}
                        {!output && !error && <div className="no-output">Run your code to see output here</div>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Compiler;

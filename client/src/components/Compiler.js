import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Compiler.css';

const Compiler = () => {
    // Initialize state from localStorage or default values
    const [code, setCode] = useState(() => localStorage.getItem('compilerCode') || '');
    const [language, setLanguage] = useState(() => localStorage.getItem('compilerLanguage') || 'cpp');
    const [input, setInput] = useState(() => localStorage.getItem('compilerInput') || '');
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

    // Save code, language, and input to localStorage whenever they change
    useEffect(() => {
        localStorage.setItem('compilerCode', code);
    }, [code]);

    useEffect(() => {
        localStorage.setItem('compilerLanguage', language);
        // Update code template when language changes, but only if code is empty or default
        if (!code || code === getLanguageTemplate(language)) { // Check if code is empty or matches previous language's template
            setCode(getLanguageTemplate(language));
        }
    }, [language]);

    useEffect(() => {
        localStorage.setItem('compilerInput', input);
    }, [input]);

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

import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from '../config';
import Editor from '@monaco-editor/react';
import './ProblemDetail.css';

const ProblemDetail = () => {
  const { id } = useParams();
  const [problem, setProblem] = useState(null);
  const [code, setCode] = useState('');
  const [submissionResult, setSubmissionResult] = useState('');
  const [language, setLanguage] = useState('cpp');
  const [error, setError] = useState(null);
  const [isReviewing, setIsReviewing] = useState(false);
  const [aiReview, setAiReview] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('description');
  const [input, setInput] = useState(''); // New state for custom input
  const [output, setOutput] = useState(''); // New state for custom output
  const [isRunning, setIsRunning] = useState(false); // New state for run button loading
  const [showAiReviewModal, setShowAiReviewModal] = useState(false); // New state for AI review modal

  useEffect(() => {
    const fetchProblem = async () => {
      const token = localStorage.getItem('token');
      const config = token ? { headers: { 'x-auth-token': token } } : {}; // Only send token if available
      try {
        const res = await axios.get(`${API_BASE_URL}/api/problems/${id}`, config);
        setProblem(res.data);
        setError(null); // Clear any previous errors
      } catch (err) {
        console.error('Error fetching problem details:', err);
        if (err.response && err.response.status === 404) {
          setError('Problem not found.');
        } else if (err.request) {
          setError('Network error. Please check your connection.');
        } else {
          setError('An unexpected error occurred while fetching problem details.');
        }
        setProblem(null); // Ensure problem is null on error
      }
    };
    fetchProblem();
  }, [id]);

  const handleSubmit = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('You need to log in to submit your code');
      return;
    }

    if (!code.trim()) {
      setError('Please write some code before submitting');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSubmissionResult('Submitting your code... Please wait.');
    setOutput(''); // Clear previous run output

        try {
          const res = await axios.post(`${API_BASE_URL}/api/submissions`, {
            problemId: id,
            code,
            language,
          }, {
            headers: {
              'Content-Type': 'application/json',
              'x-auth-token': token,
            },
          });

          if (res.data.success) {
            const outputData = res.data.output;
            const testResults = res.data.testResults || [];
            
            if (testResults.length > 0) {
              let formattedOutput = `${outputData}\n\nTest Case Results:\n`;
              testResults.forEach((test, index) => {
                formattedOutput += `\nTest Case ${index + 1}:\n`;
                formattedOutput += `  Input: ${test.input || 'N/A'}\n`;
                formattedOutput += `  Expected Output: ${test.expectedOutput || 'N/A'}\n`;
                formattedOutput += `  Actual Output: ${test.actualOutput || 'N/A'}\n`;
                formattedOutput += `  Result: ${test.passed ? 'Passed' : 'Failed'}\n`;
                if (test.error) {
                  formattedOutput += `  Error: ${test.error || 'Unknown error'}\n`;
                }
              });
              setSubmissionResult(formattedOutput);
            } else {
              setSubmissionResult(outputData || 'Code executed successfully');
            }
          } else {
            setSubmissionResult(res.data.output || res.data.message || 'Submission failed');
          }
        } catch (err) {
          setError('Error submitting code. Please try again.');
          console.error('Error submitting code', err);
          setSubmissionResult(`Error: ${err.response?.data?.message || err.message || 'Unknown error'}`);
        } finally {
          setIsSubmitting(false);
        }
  };

  const handleAiReview = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('You need to log in to get an AI review');
      return;
    }

    setIsReviewing(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/ai/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        },
        body: JSON.stringify({ code, language, problemId: id })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to get AI review');
      }

      setAiReview(data.review || 'No review available');
      setShowAiReviewModal(true); // Show the modal after getting review
    } catch (err) {
      setError(err.message || 'An error occurred while getting AI review');
    } finally {
      setIsReviewing(false);
    }
  };

  const runCode = async () => {
    if (!code.trim()) {
        setError('Please enter some code');
        return;
    }

    setIsRunning(true);
    setError('');
    setOutput('');

    try {
        const response = await axios.post(`${process.env.REACT_APP_COMPILER_URL}/run`, {
            language,
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
        setIsRunning(false);
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
    if (!token || !id) return;

    try {
        await axios.post(`${API_BASE_URL}/api/snippets`, {
            problemId: id,
            code,
            language
        }, {
            headers: { 'x-auth-token': token }
        });
    } catch (err) {
        console.error('Failed to save snippet:', err);
    }
  }, [code, language, id]);

  useEffect(() => {
    const fetchSnippet = async () => {
        const token = localStorage.getItem('token');
        if (!token || !id) {
            // If no token, we can't fetch or save snippets, but still allow viewing problem
            setCode(getLanguageTemplate(language)); // Set default template
            return;
        }

        try {
            const res = await axios.get(`${API_BASE_URL}/api/snippets/${id}`, {
                headers: { 'x-auth-token': token }
            });
            setCode(res.data.code);
            setLanguage(res.data.language);
        } catch (err) {
            if (err.response && err.response.status === 404) {
                setCode(getLanguageTemplate(language));
            } else {
                console.error('Failed to fetch snippet:', err);
            }
        }
    };

    fetchSnippet();
  }, [id, language]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return; // Only save snippet if user is logged in

    const timer = setTimeout(() => {
        saveSnippet();
    }, 5000); // Save every 5 seconds

    return () => clearTimeout(timer);
  }, [code, language, saveSnippet]);

  const isLoggedIn = !!localStorage.getItem('token');

  if (error) return <div className="error-message">{error}</div>;
  if (!problem) return <div className="loading">Loading problem details...</div>;

  return (
    <div className="problem-detail-page">
      <div className="problem-panel">
        <div className="problem-header">
          <h1 className="problem-title">{problem.title}</h1>
          <div className="problem-meta">
            <span className={`difficulty-badge ${problem.difficulty.toLowerCase()}`}>
              {problem.difficulty}
            </span>
            <div className="tags">
              {problem.tags && problem.tags.map((tag, index) => (
                <span key={index} className="tag">{tag}</span>
              ))}
            </div>
          </div>
        </div>

        <div className="problem-tabs">
          <button
            className={`tab-button ${activeTab === 'description' ? 'active' : ''}`}
            onClick={() => setActiveTab('description')}
          >
            Description
          </button>
          <button
            className={`tab-button ${activeTab === 'solutions' ? 'active' : ''}`}
            onClick={() => setActiveTab('solutions')}
          >
            Solutions
          </button>
          <button
            className={`tab-button ${activeTab === 'submissions' ? 'active' : ''}`}
            onClick={() => setActiveTab('submissions')}
          >
            Submissions
          </button>
        </div>

        <div className="problem-content">
          {activeTab === 'description' && (
            <>
              <div className="problem-statement">
                <h3>Problem Statement:</h3>
                <p>{problem.description}</p>
              </div>

              {/* ===== New Input Format Section ===== */}
              {problem.inputFormat && (
                <div className="examples-section">
                  <h3>Input Format:</h3>
                  <p>{problem.inputFormat}</p>
                </div>
              )}

              {/* ===== New Output Format Section ===== */}
              {problem.outputFormat && (
                <div className="examples-section">
                  <h3>Output Format:</h3>
                  <p>{problem.outputFormat}</p>
                </div>
              )}

              {problem.testCases && problem.testCases.length > 0 && (
                <div className="examples-section">
                  <h3>Examples:</h3>
                  {problem.testCases.map((testCase, index) => (
                    <div key={index} className="example">
                      <h4>Example {index + 1}:</h4>
                      <p><strong>Input:</strong> {testCase.input}</p>
                      <p><strong>Output:</strong> {testCase.output}</p>
                      {testCase.explanation && <p><strong>Explanation:</strong> {testCase.explanation}</p>}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {activeTab === 'solutions' && <p>User-submitted solutions will appear here.</p>}
          {activeTab === 'submissions' && <p>Your submission history will appear here.</p>}
        </div>
      </div>

      <div className="editor-panel">
        <div className="editor-header">
          <div className="editor-title">Code</div>
          <div className="language-selector">
            <select value={language} onChange={(e) => setLanguage(e.target.value)} className="language-select">
              <option value="c">C</option>
              <option value="cpp">C++</option>
              <option value="java">Java</option>
              <option value="python">Python</option>
            </select>
          </div>
        </div>

        <div className="editor-container">
          <Editor
            height="45vh"
            defaultLanguage={language}
            value={code}
            onChange={(value) => setCode(value || '')}
            theme="vs-dark"
          />
        </div>

        <div className="results-panel">
          <div className="button-group">
            <button onClick={handleSubmit} className="submit-button" disabled={isSubmitting || !isLoggedIn}>
              {isSubmitting ? 'Submitting...' : 'Submit Code'}
            </button>
            <button onClick={runCode} className="run-button" disabled={isRunning || !isLoggedIn}>
              {isRunning ? 'Running...' : 'Run Code'}
            </button>
            <button onClick={handleAiReview} className="ai-review-button" disabled={isReviewing || !isLoggedIn}>
              {isReviewing ? 'Getting Review...' : 'Get AI Review'}
            </button>
          </div>

          {!isLoggedIn && (
            <div className="login-notice">
              Please log in to run, submit, or get AI review for your code.
            </div>
          )}

          <div className="input-output-section">
            <div className="input-section">
              <h3>Input:</h3>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Enter custom input (optional)..."
                className="custom-input-editor"
                disabled={!isLoggedIn}
              />
            </div>
            <div className="output-section">
              <h3>Output:</h3>
              <pre className="output-display">{output || 'Run your code to see output here.'}</pre>
            </div>
          </div>

          <div className="submission-result-section">
            <h3>Submission Result:</h3>
            <pre>{submissionResult || 'No submission result yet.'}</pre>
          </div>

          {showAiReviewModal && (
            <div className="ai-review-modal-overlay">
              <div className="ai-review-modal">
                <div className="modal-header">
                  <h3>AI Review:</h3>
                  <button className="close-button" onClick={() => setShowAiReviewModal(false)}>X</button>
                </div>
                <div className="modal-content">
                  <pre>{aiReview}</pre>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProblemDetail;

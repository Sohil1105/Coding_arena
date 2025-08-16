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

  useEffect(() => {
    const fetchProblem = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setError("Please log in to view the problem details.");
        return;
      }
      const config = {
        headers: { 'x-auth-token': token }
      };
      try {
        const res = await axios.get(`${API_BASE_URL}/api/problems/${id}`, config);
        setProblem(res.data);
      } catch (err) {
        console.error('Error fetching problem details:', err);
        if (err.response) {
          setError(`Error: ${err.response.data.message || 'Problem not found'}`);
        } else if (err.request) {
          setError('Network error. Please check your connection.');
        } else {
          setError('An unexpected error occurred.');
        }
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
    } catch (err) {
      setError(err.message || 'An error occurred while getting AI review');
    } finally {
      setIsReviewing(false);
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
        if (!token || !id) return;

        try {
            const res = await axios.get(`${API_BASE_URL}/api/snippets/${id}`, {
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
  }, [id, language]);

  useEffect(() => {
    const timer = setTimeout(() => {
        saveSnippet();
    }, 5000); // Save every 5 seconds

    return () => clearTimeout(timer);
  }, [code, language, saveSnippet]);

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
            <button onClick={handleSubmit} className="submit-button" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit Code'}
            </button>
            <button onClick={handleAiReview} className="ai-review-button" disabled={isReviewing}>
              {isReviewing ? 'Getting Review...' : 'Get AI Review'}
            </button>
          </div>

          <div className="output-section">
            <h3>Output:</h3>
            <pre>{submissionResult || 'No output yet. Submit your code to see results.'}</pre>
          </div>

          {aiReview && (
            <div className="output-section">
              <h3>AI Review:</h3>
              <pre>{aiReview}</pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProblemDetail;

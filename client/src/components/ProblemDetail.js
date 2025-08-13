import React, { useState, useEffect } from 'react';
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
      const config = {
        headers: { 'x-auth-token': token }
      };
      try {
        const res = await axios.get(`${API_BASE_URL}/api/problems/${id}`, config);
        setProblem(res.data);
      } catch (err) {
        setError('Error fetching problem details');
        console.error('Error fetching problem details', err);
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
        if (outputData.startsWith('Accepted') || outputData.startsWith('Failed')) {
          const lines = outputData.split('\n');
          const summary = lines[0];
          const details = JSON.parse(lines.slice(1).join('\n'));
          let formattedOutput = `${summary}\n\nTest Case Results:\n`;
          details.forEach((test, index) => {
            formattedOutput += `\nTest Case ${index + 1}:\n`;
            formattedOutput += `  Input: ${test.input}\n`;
            formattedOutput += `  Expected Output: ${test.expectedOutput}\n`;
            formattedOutput += `  Actual Output: ${test.actualOutput}\n`;
            formattedOutput += `  Result: ${test.passed ? 'Passed' : 'Failed'}\n`;
            if (test.error) {
              formattedOutput += `  Error: ${test.actualOutput}\n`;
            }
          });
          setSubmissionResult(formattedOutput);
        } else {
          setSubmissionResult(outputData);
        }
      } else {
        setSubmissionResult(res.data.output);
      }
    } catch (err) {
      setError('Error submitting code. Please try again.');
      console.error('Error submitting code', err);
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
        body: JSON.stringify({ code, language, problemId: problem.id })
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
              <option value="py">Python</option>
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

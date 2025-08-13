import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import './Contribute.css';
import API_BASE_URL from '../config';

const Contribute = () => {
    const [formData, setFormData] = useState({
        id: '',
        title: '',
        description: '',
        inputFormat: '',
        outputFormat: '',
        difficulty: 'Easy',
        tags: '',
        testCases: [{ input: '', output: '' }],
    });
    const [user, setUser] = useState(null);

    useEffect(() => {
        const fetchUser = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                const config = {
                    headers: {
                        'x-auth-token': token
                    }
                };
                try {
                    const res = await axios.get(`${API_BASE_URL}/api/users`, config);
                    setUser(res.data);
                } catch (err) {
                    console.error('Failed to fetch user', err);
                }
            }
        };
        fetchUser();
    }, []);

    const { id, title, description, difficulty, tags, testCases, inputFormat, outputFormat } = formData;

    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleTestCaseChange = (index, e) => {
        const newTestCases = testCases.map((testCase, i) => {
            if (i === index) {
                return { ...testCase, [e.target.name]: e.target.value };
            }
            return testCase;
        });
        setFormData({ ...formData, testCases: newTestCases });
    };

    const addTestCase = () => {
        setFormData({ ...formData, testCases: [...testCases, { input: '', output: '' }] });
    };

    const onSubmit = async e => {
        e.preventDefault();
        if (!user) {
            console.error('User not loaded yet');
            return;
        }
        const token = localStorage.getItem('token');
        const config = {
            headers: {
                'Content-Type': 'application/json',
                'x-auth-token': token
            }
        };
        const body = JSON.stringify({
            ...formData,
            tags: tags.split(',').map(tag => tag.trim()),
            author: user._id
        });
        try {
            const res = await axios.post(`${API_BASE_URL}/api/problems`, body, config);
            console.log(res.data);
            toast.success('Problem contributed successfully!');
            setFormData({
                id: '',
                title: '',
                description: '',
                inputFormat: '',
                outputFormat: '',
                difficulty: 'Easy',
                tags: '',
                testCases: [{ input: '', output: '' }],
            });
        } catch (err) {
            console.error(err.response.data);
            toast.error('Failed to contribute problem.');
        }
    };

    return (
        <div className="contribute-page">
            <Toaster />
            <h2>Contribute a Problem</h2>
            <form onSubmit={onSubmit}>
                <div className="form-group">
                    <label>Problem ID</label>
                    <input type="text" name="id" value={id} onChange={onChange} placeholder="Problem ID" required />
                </div>
                <div className="form-group">
                    <label>Problem Title</label>
                    <input type="text" name="title" value={title} onChange={onChange} placeholder="Problem Title" required />
                </div>
                <div className="form-group">
                    <label>Problem Description</label>
                    <textarea name="description" value={description} onChange={onChange} placeholder="Problem Description" required />
                </div>
                <div className="form-group">
                    <label>Input Format</label>
                    <textarea name="inputFormat" value={inputFormat} onChange={onChange} placeholder="Input Format" />
                </div>
                <div className="form-group">
                    <label>Output Format</label>
                    <textarea name="outputFormat" value={outputFormat} onChange={onChange} placeholder="Output Format" />
                </div>
                <div className="form-group">
                    <label>Difficulty</label>
                    <select name="difficulty" value={difficulty} onChange={onChange}>
                        <option value="Easy">Easy</option>
                        <option value="Medium">Medium</option>
                        <option value="Hard">Hard</option>
                    </select>
                </div>
                <div className="form-group">
                    <label>Tags (comma separated)</label>
                    <input type="text" name="tags" value={tags} onChange={onChange} placeholder="Tags (comma separated)" required />
                </div>
                <h3>Test Cases</h3>
                {testCases.map((testCase, index) => (
                    <div key={index} className="test-case">
                        <textarea name="input" value={testCase.input} onChange={e => handleTestCaseChange(index, e)} placeholder="Input" required />
                        <textarea name="output" value={testCase.output} onChange={e => handleTestCaseChange(index, e)} placeholder="Output" required />
                    </div>
                ))}
                <button type="button" onClick={addTestCase} className="add-test-case-btn">Add Test Case</button>
                <button type="submit">Submit Problem</button>
            </form>
        </div>
    );
};

export default Contribute;

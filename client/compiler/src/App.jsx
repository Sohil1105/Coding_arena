import React, { useState, useEffect } from 'react';
import Editor from 'react-simple-code-editor';
import { highlight, languages } from 'prismjs/components/prism-core';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
import 'prismjs/themes/prism.css';
import axios from 'axios';
import { motion } from 'framer-motion';
import './App.css';

const stubs = {
  cpp: `#include <iostream>

int main() {
    // Your C++ code here
    std::cout << "Hello, World!" << std::endl;
    return 0;
}`,
  c: `#include <stdio.h>

int main() {
    // Your C code here
    printf("Hello, World!\\n");
    return 0;
}`,
  py: `# Your Python code here
print("Hello, World!")`,
  java: `public class Main {
    public static void main(String[] args) {
        // Your Java code here
        System.out.println("Hello, World!");
    }
}`,
};


function App() {
  const [code, setCode] = useState(() => {
    const savedCode = localStorage.getItem('compilerCode');
    return savedCode !== null ? savedCode : stubs.cpp;
  });
  const [output, setOutput] = useState('');
  const [language, setLanguage] = useState('cpp');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('compilerCode', code);
  }, [code]);

  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    setCode(stubs[lang]);
    setIsDropdownOpen(false);
  };

  const handleSubmit = async () => {
    const payload = {
      language,
      code
    };

    try {
      const { data } = await axios.post(import.meta.env.VITE_BACKEND_URL, payload);
      console.log(data);
      setOutput(data.output);
    } catch (error) {
      console.log(error.response);
    }
  }

  return (
    <div className="container mx-auto py-8 flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-4">AlgoU Online Code Compiler</h1>
      <div className="relative">
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="select-box border border-gray-300 rounded-lg py-1.5 px-4 mb-1 focus:outline-none focus:border-indigo-500"
        >
          {language.toUpperCase()}
        </button>
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: isDropdownOpen ? 1 : 0, y: isDropdownOpen ? 0 : -10 }}
          transition={{ duration: 0.2 }}
          className="absolute top-full left-0 w-full bg-white border border-gray-300 rounded-lg shadow-md"
        >
          {isDropdownOpen && (
            <ul className="py-1">
              <li
                onClick={() => handleLanguageChange('cpp')}
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
              >
                C++
              </li>
              <li
                onClick={() => handleLanguageChange('c')}
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
              >
                C
              </li>
              <li
                onClick={() => handleLanguageChange('py')}
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
              >
                Python
              </li>
              <li
                onClick={() => handleLanguageChange('java')}
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
              >
                Java
              </li>
            </ul>
          )}
        </motion.div>
      </div>
      <br />
      <div className="bg-gray-100 shadow-md w-full max-w-lg mb-4" style={{ height: '300px', overflowY: 'auto' }}>
        <Editor
          value={code}
          onValueChange={code => setCode(code)}
          highlight={code => highlight(code, languages.js)}
          padding={10}
          style={{
            fontFamily: '"Fira code", "Fira Mono", monospace',
            fontSize: 12,
            outline: 'none',
            border: 'none',
            backgroundColor: '#f7fafc',
            height: '100%',
            overflowY: 'auto'
          }}
        />
      </div>

      <button onClick={handleSubmit} type="button" className="text-center inline-flex items-center text-white bg-gradient-to-br from-pink-500 to-orange-400 hover:bg-gradient-to-bl focus:outline-none font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5 me-2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.91 11.672a.375.375 0 0 1 0 .656l-5.603 3.113a.375.375 0 0 1-.557-.328V8.887c0-.286.307-.466.557-.327l5.603 3.112Z" />
        </svg>
        Run
      </button>

      {output &&
        <div className="outputbox mt-4 bg-gray-100 rounded-md shadow-md p-4">
          <p style={{
            fontFamily: '"Fira code", "Fira Mono", monospace',
            fontSize: 12,
          }}>{output}</p>
        </div>
      }
    </div>
  );
}

export default App;

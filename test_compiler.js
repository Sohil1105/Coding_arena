const axios = require('axios');

const compilerUrl = 'http://localhost:8000/run';

const testCases = {
    cpp: {
        language: 'cpp',
        code: `
#include <iostream>
int main() {
    std::cout << "Hello from C++";
    return 0;
}`
    },
    c: {
        language: 'c',
        code: `
#include <stdio.h>
int main() {
    printf("Hello from C");
    return 0;
}`
    },
    py: {
        language: 'py',
        code: `print("Hello from Python")`
    },
    java: {
        language: 'java',
        code: `
public class Main {
    public static void main(String[] args) {
        System.out.println("Hello from Java");
    }
}`,
        input: ""
    }
};

const runTest = async (testCase) => {
    try {
        console.log(`Testing ${testCase.language}...`);
        const response = await axios.post(compilerUrl, testCase);
        console.log(`Response for ${testCase.language}:`, response.data);
    } catch (error) {
        console.error(`Error testing ${testCase.language}:`, error.response ? error.response.data : error.message);
    }
};

const runAllTests = async () => {
    for (const key in testCases) {
        await runTest(testCases[key]);
    }
};

runAllTests();

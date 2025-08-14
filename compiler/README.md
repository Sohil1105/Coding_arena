# CodeJudge - Compiler Service

This is the compiler service component of the CodeJudge online judge platform. It's responsible for executing user code in a secure environment and providing results back to the main application.

## Features

- **Code Execution**
  - Support for multiple programming languages:
    - C
    - C++
    - Java
    - Python
  - Secure execution environment
  - Resource limiting (CPU time, memory)
  - Custom input support

- **AI Code Review**
  - Integration with Google Gemini AI
  - Code analysis and optimization suggestions
  - Best practices recommendations

- **Security**
  - JWT authentication for secure API access
  - Docker isolation for code execution
  - Resource limitations to prevent abuse

## Tech Stack

- **Express.js** - Web framework
- **Node.js** - Runtime
- **Docker** - Container isolation
- **Google Gemini API** - AI code review
- **UUID** - Unique file naming

## Project Structure

```
compiler/
├── src/
│   ├── middleware/   # Custom middleware
│   ├── public/       # Temporary storage for code files
│   ├── aiFeatures.js # AI integration functions
│   ├── aiReview.js   # Code review implementation
│   ├── createFile.js # File creation utilities
│   ├── executeFile.js # Code execution logic
│   └── ...
├── .env             # Environment variables
├── Dockerfile       # Docker configuration
├── index.js         # Server entry point
└── package.json     # Dependencies and scripts
```

## Getting Started

### Prerequisites

- Node.js v18 or later
- Docker (for containerized execution)
- Compilers/interpreters for supported languages:
  - GCC (for C/C++)
  - OpenJDK (for Java)
  - Python 3
- npm or bun

### Installation

#### Local Development

1. Clone the repository
2. Navigate to the compiler directory:
   ```bash
   cd compiler
   ```
3. Install dependencies:
   ```bash
   npm install
   # or
   bun install
   ```
4. Create a `.env` file with the following variables:
   ```
   PORT=8080
   CORS_ORIGIN=http://localhost:5173,http://localhost:8000
   JWT_SECRET=your_jwt_secret
   GEMINI_API_KEY=your_google_gemini_api_key
   ```
5. Start the development server:
   ```bash
   npm run dev
   # or
   bun run dev
   ```

#### Docker Deployment

```bash
docker build -t codejudge-compiler .
docker run -p 8080:8080 codejudge-compiler
```

## API Endpoints

### Code Execution

- `POST /run` - Run code with custom input
  ```json
  {
    "extension": "cpp", // Language: cpp, c, java, python
    "code": "...", // Source code
    "input": "..." // Optional input
  }
  ```
  Response:
  ```json
  {
    "success": true,
    "output": "...", // Program output
    "executionTime": 123, // Time in milliseconds
    "memoryUsed": 10 // Memory in MB
  }
  ```

### AI Code Review

- `POST /review` - Get AI review for code
  ```json
  {
    "code": "...", // Source code
    "language": "cpp" // Language
  }
  ```
  Response:
  ```json
  {
    "success": true,
    "review": "..." // Markdown formatted review
  }
  ```

## Supported Languages

| Language | Extension | Compilation | Execution |
|----------|-----------|-------------|-----------|
| C        | c         | `gcc -o {outputFile} {inputFile}` | `{outputFile}` |
| C++      | cpp       | `g++ -o {outputFile} {inputFile}` | `{outputFile}` |
| Java     | java      | `javac {inputFile}` | `java {className}` |
| Python   | python    | N/A (interpreted) | `python {inputFile}` |

## Security Considerations

- Code is executed in isolated environments
- Resource limits are enforced
- Temporary files are cleaned up after execution
- Access to the service requires valid JWT tokens

## License

This project is licensed under the MIT License.

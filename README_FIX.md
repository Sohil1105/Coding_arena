# Fix for "Invalid URL" Error

## Problem
The "Invalid URL" error occurs when submitting code because the `COMPILER_URL` environment variable is not set for local development.

## Solution
Create a .env file with the following content:

```bash
# Environment Configuration for Local Development

# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
MONGO_URL=

# JWT Secret
JWT_SECRET=your_super_secret_key_here_change_in_production

# Compiler Service URL - This fixes the "Invalid URL" error
COMPILER_URL=http://localhost:8000

# Client Configuration
CLIENT_URL=http://localhost:3000
REACT_APP_API_URL=http://localhost:5000
```

### 1. Environment Setup
Create a .env file in the root directory with the following content:

```bash
# Environment Configuration for Local Development
PORT=5000
NODE_ENV=development
MONGO_URL=mongodb://localhost:27017/coding_arena
JWT_SECRET=your_super_secret_key_here_change_in_production
COMPILER_URL=http://localhost:8000
CLIENT_URL=http://localhost:3000
REACT_APP_API_URL=http://localhost:5000
```

### 2. Start Services in Correct Order
```bash
# Option 1: Using the development script
npm run dev:full

# Option 2: Manual startup
npm run dev
```

### 3. Start Services in Correct Order
```bash
# Option 1: Using the development script
npm run dev:full

# Option 2: Manual startup
npm run dev
```

### 4. Test the Fix
1. Open http://localhost:3000
2. Navigate to any problem
3. Write some code and click "Submit"
4. The code should now execute successfully without "Invalid URL" error

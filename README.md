# Coding Arena - Online Judge Platform

A modern, full-stack coding platform built with React, Node.js, and MongoDB. Features include problem solving, code execution, AI code review, and user management.

## 🚀 Features

- **Modern UI/UX**: Beautiful, responsive design with glassmorphism effects
- **Code Editor**: Monaco Editor with syntax highlighting and multiple language support
- **Problem Management**: Create, solve, and manage coding problems
- **AI Code Review**: Get instant feedback on your code
- **User Authentication**: Secure JWT-based authentication
- **Leaderboard**: Track user performance and rankings
- **Responsive Design**: Works perfectly on desktop and mobile devices

## 🛠️ Tech Stack

### Frontend
- React 18
- React Router DOM
- Monaco Editor
- Axios for API calls
- Modern CSS with gradients and animations

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- bcryptjs for password hashing

### Development
- Docker & Docker Compose
- Nodemon for development
- Environment variables for configuration

## 📦 Installation

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (or Docker)
- npm or yarn

### Quick Start with Docker

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd coding_arena
   ```

2. **Set up environment variables**
   - Create a `.env` file in the server directory with the following content:
     ```
     JWT_SECRET=your_super_secret_key_here_for_jwt_tokens
     MONGO_URL=mongodb://localhost:27017/codingarena
     ```
   - Create a `.env` file in the client directory with the following content:
     ```
     REACT_APP_API_URL=http://localhost:5000
     ```

3. **Start the application with Docker**
   ```bash
   # Run Docker Compose to start all services
   docker-compose up
   ```
   This will start the client, server, and MongoDB services. The application will be available at http://localhost:3000.

### Manual Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd coding_arena
   ```

2. **Set up environment variables**
   - Follow the environment variable setup instructions above.

3. **Install dependencies and start the server**
   ```bash
   # Install server dependencies
   cd server
   npm install
   
   # Start the server
   npm start
   ```

4. **Install dependencies and start the client**
   ```bash
   # In a new terminal, install client dependencies
   cd client
   npm install
   
   # Start the client
   npm start
   ```

5. **Access the application**
   - The client will be running at http://localhost:3000
   - The server will be running at http://localhost:5000

## 🧪 Testing

1. **Run tests for the server**
   ```bash
   cd server
   npm test
   ```

2. **Run tests for the client**
   ```bash
   cd client
   npm test
   ```

### Manual Setup

1. **Install dependencies**
   ```bash
   # Install root dependencies
   npm install
   
   # Install client dependencies
   cd client
   npm install
   
   # Install server dependencies
   cd ../server
   npm install
   ```

2. **Set up environment variables**
   ```bash
   # In the root directory, create .env file
   JWT_SECRET=your_super_secret_key_here
   MONGO_URL=mongodb://localhost:27017/codingarena
   ```

3. **Start MongoDB**
   ```bash
   # If using local MongoDB
   mongod
   
   # Or use Docker
   docker run -d -p 27017:27017 --name mongodb mongo
   ```

4. **Start the development servers**
   ```bash
   # Start backend (from root directory)
   npm run server
   
   # Start frontend (in another terminal, from root directory)
   npm run client
   
   # Or start both together
   npm run dev
   ```

## 🏗️ Project Structure

```
 coding_arena/
├── client/                 # React frontend
│   ├── compiler/          # Frontend compiler logic
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── App.js         # Main app component
│   │   └── index.js       # Entry point
│   └── package.json
├── server/                 # Node.js backend
│   ├── compiler/          # Backend compiler logic
│   ├── models/            # MongoDB schemas
│   ├── middleware/        # Custom middleware
│   ├── auth.js           # Authentication routes
│   ├── problems.js       # Problem management
│   ├── submissions.js    # Code submissions
│   ├── users.js          # User management
│   ├── leaderboard.js    # Leaderboard
│   ├── ai.js             # AI code review
│   └── server.js         # Main server file
├── docker-compose.yml     # Docker configuration
└── package.json          # Root package.json
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# JWT Secret for authentication
JWT_SECRET=your_super_secret_key_here

# MongoDB connection string
MONGO_URL=mongodb://localhost:27017/codingarena

# Server port (optional, defaults to 5000)
PORT=5000
```

### API Endpoints

- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `GET /api/problems` - Get all problems
- `GET /api/problems/:id` - Get specific problem
- `POST /api/submissions` - Submit code
- `POST /api/ai/review` - Get AI code review
- `GET /api/leaderboard` - Get leaderboard

## 🎨 Customization

### Styling
The application uses modern CSS with:
- CSS Grid and Flexbox for layouts
- CSS Custom Properties for theming
- Glassmorphism effects
- Smooth animations and transitions

### Adding New Features
1. Create new components in `client/src/components/`
2. Add routes in `client/src/App.js`
3. Create API endpoints in `server/`
4. Add MongoDB models if needed

## 🚀 Deployment

### Production Build
```bash
# Build the frontend
cd client
npm run build

# Start production server
cd ../server
npm start
```

### Docker Production
```bash
# Build and run production containers
docker-compose -f docker-compose.prod.yml up --build
```

## 🤝 Contributing

1. **Fork the repository**
2. **Create a new branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Make your changes**
4. **Commit your changes**
   ```bash
   git commit -m "Add your commit message"
   ```
5. **Push to your branch**
   ```bash
   git push origin feature/your-feature-name
   ```
6. **Create a pull request**

## 📝 License

This project is licensed under the ISC License.

## 🆘 Support

If you encounter any issues:
1. Check the console for error messages
2. Ensure all dependencies are installed
3. Verify MongoDB is running
4. Check environment variables are set correctly

## 🔮 Future Enhancements

- [ ] Real-time code collaboration
- [ ] Advanced code execution with multiple languages
- [ ] Code plagiarism detection
- [ ] User profiles with statistics
- [ ] Contest mode
- [ ] Mobile app
- [ ] Integration with external coding platforms

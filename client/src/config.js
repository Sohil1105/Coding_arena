export const API_BASE_URL = window.location.hostname === 'localhost'
  ? 'http://localhost:5000'
  : (process.env.REACT_APP_API_URL || 'http://localhost:5000');

export const COMPILER_URL = process.env.REACT_APP_COMPILER_URL ||
  (window.location.hostname === 'localhost' ? 'http://localhost:8000' : 'http://localhost:8000');

export default API_BASE_URL;

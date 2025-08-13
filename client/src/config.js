const API_BASE_URL = window.location.hostname === 'localhost'
  ? 'http://localhost:5000'
  : process.env.REACT_APP_API_URL;

export default API_BASE_URL;

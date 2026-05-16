import axios from 'axios';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 120000, // 2 minutes for analysis operations
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    const message = error.response?.data?.detail || error.message || 'An error occurred';
    console.error('API Error:', message);
    return Promise.reject(new Error(message));
  }
);

// API functions
export const analyzeRepo = async (repoUrl, forceRefresh = false) => {
  return apiClient.post('/analyze', {
    repo_url: repoUrl,
    force_refresh: forceRefresh,
  });
};

export const sendChat = async (repoUrl, question, sessionId) => {
  return apiClient.post('/chat', {
    repo_url: repoUrl,
    question,
    session_id: sessionId,
  });
};

export const getStats = async () => {
  return apiClient.get('/stats');
};

export const healthCheck = async () => {
  return apiClient.get('/health');
};

export default apiClient;

// Made with Bob

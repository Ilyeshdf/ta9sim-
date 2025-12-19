// API Configuration
// Update these values when you deploy your backend

export const API_CONFIG = {
  // Development
  DEV_BASE_URL: 'http://localhost:3000/api',
  
  // Production (update when you deploy)
  PROD_BASE_URL: 'https://your-api-domain.com/api',
  
  // Current environment
  IS_PRODUCTION: false,
  
  // Request timeout in milliseconds
  TIMEOUT: 10000,
  
  // API version
  VERSION: 'v1',
};

// Get the current base URL based on environment
export const getBaseUrl = (): string => {
  return API_CONFIG.IS_PRODUCTION 
    ? API_CONFIG.PROD_BASE_URL 
    : API_CONFIG.DEV_BASE_URL;
};

// API Endpoints
export const ENDPOINTS = {
  // Auth
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    ME: '/auth/me',
  },
  
  // Tasks
  TASKS: {
    LIST: '/tasks',
    CREATE: '/tasks',
    GET: (id: string) => `/tasks/${id}`,
    UPDATE: (id: string) => `/tasks/${id}`,
    DELETE: (id: string) => `/tasks/${id}`,
    TOGGLE: (id: string) => `/tasks/${id}/toggle`,
  },
  
  // Schedule
  SCHEDULE: {
    LIST: '/schedule',
    CREATE: '/schedule',
    GET: (id: string) => `/schedule/${id}`,
    UPDATE: (id: string) => `/schedule/${id}`,
    DELETE: (id: string) => `/schedule/${id}`,
    BY_DATE: (date: string) => `/schedule/date/${date}`,
    GENERATE: '/schedule/generate',
  },
  
  // User
  USER: {
    PROFILE: '/user/profile',
    UPDATE: '/user/profile',
    METRICS: '/user/metrics',
    PREFERENCES: '/user/preferences',
  },
  
  // AI Agent
  AI: {
    CHAT: '/ai/chat',
    GENERATE_SCHEDULE: '/ai/generate-schedule',
    ANALYZE: '/ai/analyze',
    SUGGESTIONS: '/ai/suggestions',
  },
};

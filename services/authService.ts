import apiClient, { ApiResponse, TokenManager } from './api';
import { ENDPOINTS } from '../config/api';

// Auth Types
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  createdAt: string;
  preferences?: UserPreferences;
}

export interface UserPreferences {
  themeMode: 'light' | 'dark' | 'system';
  notifications: boolean;
  focusHoursStart: number;
  focusHoursEnd: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}

// Auth Service
export const authService = {
  async login(credentials: LoginCredentials): Promise<ApiResponse<AuthResponse>> {
    const response = await apiClient.post<AuthResponse>(
      ENDPOINTS.AUTH.LOGIN,
      credentials,
      { requiresAuth: false }
    );
    
    if (response.success && response.data) {
      await TokenManager.setToken(response.data.token);
      await TokenManager.setRefreshToken(response.data.refreshToken);
    }
    
    return response;
  },
  
  async register(data: RegisterData): Promise<ApiResponse<AuthResponse>> {
    const response = await apiClient.post<AuthResponse>(
      ENDPOINTS.AUTH.REGISTER,
      data,
      { requiresAuth: false }
    );
    
    if (response.success && response.data) {
      await TokenManager.setToken(response.data.token);
      await TokenManager.setRefreshToken(response.data.refreshToken);
    }
    
    return response;
  },
  
  async logout(): Promise<void> {
    try {
      await apiClient.post(ENDPOINTS.AUTH.LOGOUT);
    } finally {
      await TokenManager.clearTokens();
    }
  },
  
  async getCurrentUser(): Promise<ApiResponse<User>> {
    return apiClient.get<User>(ENDPOINTS.AUTH.ME);
  },
  
  async isAuthenticated(): Promise<boolean> {
    const token = await TokenManager.getToken();
    return !!token;
  },
};

export default authService;

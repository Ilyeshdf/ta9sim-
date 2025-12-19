// Services Index - Export all services for easy importing
export { default as apiClient, TokenManager } from './api';
export type { ApiResponse, PaginatedResponse } from './api';

export { default as authService } from './authService';
export type { User, UserPreferences, LoginCredentials, RegisterData, AuthResponse } from './authService';

export { default as taskService } from './taskService';
export type { ApiTask, TaskPayload, TaskQueryParams } from './taskService';

export { default as scheduleService } from './scheduleService';
export type { ApiScheduleEvent, SchedulePayload, GenerateScheduleRequest } from './scheduleService';

export { default as aiService } from './aiService';
export type { 
  AIChatMessage, 
  AIChatRequest, 
  AIChatResponse, 
  AIAction,
  AIAnalysisRequest,
  AIAnalysisResponse,
  AIInsight,
  AIScheduleRequest,
  AIScheduleResponse,
  AISuggestion,
} from './aiService';

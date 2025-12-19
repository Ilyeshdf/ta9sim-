import apiClient, { ApiResponse } from './api';
import { ENDPOINTS } from '../config/api';
import { Task, ScheduleEvent, UserMetrics } from '../contexts/AppContext';

// AI Chat Message
export interface AIChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: string;
}

// AI Chat Request
export interface AIChatRequest {
  message: string;
  context?: {
    tasks?: Task[];
    schedule?: ScheduleEvent[];
    metrics?: UserMetrics;
    currentDate?: string;
  };
  conversationHistory?: AIChatMessage[];
}

// AI Chat Response
export interface AIChatResponse {
  message: string;
  suggestions?: string[];
  actions?: AIAction[];
}

// AI Action (things the AI suggests doing)
export interface AIAction {
  type: 'create_task' | 'create_event' | 'reschedule' | 'suggest_break' | 'update_metrics';
  payload: Record<string, unknown>;
  label: string;
}

// AI Analysis Request
export interface AIAnalysisRequest {
  tasks: Task[];
  schedule: ScheduleEvent[];
  metrics: UserMetrics;
  timeRange?: 'day' | 'week' | 'month';
}

// AI Analysis Response
export interface AIAnalysisResponse {
  summary: string;
  insights: AIInsight[];
  recommendations: string[];
  burnoutRisk: 'Low' | 'Medium' | 'High';
  productivityScore: number;
  balanceScore: number;
}

export interface AIInsight {
  type: 'warning' | 'success' | 'info';
  title: string;
  description: string;
  category?: string;
}

// AI Schedule Generation Request
export interface AIScheduleRequest {
  date: string;
  tasks: Task[];
  preferences?: {
    wakeTime?: string;
    sleepTime?: string;
    focusHoursStart?: number;
    focusHoursEnd?: number;
    breakFrequency?: number;
    priorityCategories?: string[];
  };
  existingEvents?: ScheduleEvent[];
}

// AI Schedule Generation Response
export interface AIScheduleResponse {
  schedule: ScheduleEvent[];
  explanation: string;
  tips?: string[];
}

// AI Suggestions
export interface AISuggestion {
  id: string;
  type: 'task' | 'schedule' | 'wellness' | 'productivity';
  title: string;
  description: string;
  priority: 'Low' | 'Medium' | 'High';
  action?: AIAction;
}

// AI Service
export const aiService = {
  // Send chat message to AI
  async chat(request: AIChatRequest): Promise<ApiResponse<AIChatResponse>> {
    return apiClient.post<AIChatResponse>(ENDPOINTS.AI.CHAT, request);
  },
  
  // Get AI-generated schedule
  async generateSchedule(request: AIScheduleRequest): Promise<ApiResponse<AIScheduleResponse>> {
    return apiClient.post<AIScheduleResponse>(ENDPOINTS.AI.GENERATE_SCHEDULE, request);
  },
  
  // Get AI analysis of productivity
  async analyze(request: AIAnalysisRequest): Promise<ApiResponse<AIAnalysisResponse>> {
    return apiClient.post<AIAnalysisResponse>(ENDPOINTS.AI.ANALYZE, request);
  },
  
  // Get AI suggestions
  async getSuggestions(context?: {
    tasks?: Task[];
    schedule?: ScheduleEvent[];
    metrics?: UserMetrics;
  }): Promise<ApiResponse<AISuggestion[]>> {
    return apiClient.post<AISuggestion[]>(ENDPOINTS.AI.SUGGESTIONS, context || {});
  },
  
  // Format AI message for display
  formatMessage(content: string): string {
    // Convert markdown-like formatting to plain text with emoji
    return content
      .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold markdown
      .replace(/\*(.*?)\*/g, '$1')     // Remove italic markdown
      .trim();
  },
  
  // Parse AI actions from response
  parseActions(response: AIChatResponse): AIAction[] {
    return response.actions || [];
  },
  
  // Execute AI action (converts to local action)
  executeAction(action: AIAction): { type: string; data: unknown } {
    switch (action.type) {
      case 'create_task':
        return { type: 'ADD_TASK', data: action.payload };
      case 'create_event':
        return { type: 'ADD_EVENT', data: action.payload };
      case 'reschedule':
        return { type: 'RESCHEDULE', data: action.payload };
      case 'suggest_break':
        return { type: 'BREAK_SUGGESTION', data: action.payload };
      case 'update_metrics':
        return { type: 'UPDATE_METRICS', data: action.payload };
      default:
        return { type: 'UNKNOWN', data: action.payload };
    }
  },
};

export default aiService;

import apiClient, { ApiResponse, PaginatedResponse } from './api';
import { ENDPOINTS } from '../config/api';
import { ScheduleEvent } from '../contexts/AppContext';

// API Schedule Event type
export interface ApiScheduleEvent {
  id: string;
  date: string;
  time: string;
  title: string;
  description?: string;
  category: 'Academics' | 'Work' | 'Wellness' | 'Social' | 'Break';
  location?: string;
  duration: string;
  color: string;
  isRecurring?: boolean;
  recurringPattern?: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
}

// Create/Update schedule payload
export interface SchedulePayload {
  date: string;
  time: string;
  title: string;
  description?: string;
  category: 'Academics' | 'Work' | 'Wellness' | 'Social' | 'Break';
  location?: string;
  duration: string;
  color?: string;
  isRecurring?: boolean;
  recurringPattern?: string;
}

// AI Generate schedule request
export interface GenerateScheduleRequest {
  date: string;
  taskIds?: string[];
  preferences?: {
    focusHoursStart?: number;
    focusHoursEnd?: number;
    breakDuration?: number;
    prioritizeCategories?: string[];
  };
}

// Schedule Service
export const scheduleService = {
  // Get all schedule events
  async getEvents(params?: { page?: number; limit?: number }): Promise<PaginatedResponse<ApiScheduleEvent>> {
    const queryString = params 
      ? '?' + new URLSearchParams(
          Object.entries(params)
            .filter(([_, v]) => v !== undefined)
            .map(([k, v]) => [k, String(v)])
        ).toString()
      : '';
    
    const response = await apiClient.get<PaginatedResponse<ApiScheduleEvent>>(
      `${ENDPOINTS.SCHEDULE.LIST}${queryString}`
    );
    
    if (response.success && response.data) {
      return response.data as unknown as PaginatedResponse<ApiScheduleEvent>;
    }
    
    return {
      success: false,
      data: [],
      pagination: { page: 1, limit: 50, total: 0, totalPages: 0 },
    };
  },
  
  // Get events for a specific date
  async getEventsByDate(date: string): Promise<ApiResponse<ApiScheduleEvent[]>> {
    return apiClient.get<ApiScheduleEvent[]>(ENDPOINTS.SCHEDULE.BY_DATE(date));
  },
  
  // Get single event
  async getEvent(id: string): Promise<ApiResponse<ApiScheduleEvent>> {
    return apiClient.get<ApiScheduleEvent>(ENDPOINTS.SCHEDULE.GET(id));
  },
  
  // Create new event
  async createEvent(event: SchedulePayload): Promise<ApiResponse<ApiScheduleEvent>> {
    return apiClient.post<ApiScheduleEvent>(ENDPOINTS.SCHEDULE.CREATE, event);
  },
  
  // Update event
  async updateEvent(id: string, updates: Partial<SchedulePayload>): Promise<ApiResponse<ApiScheduleEvent>> {
    return apiClient.patch<ApiScheduleEvent>(ENDPOINTS.SCHEDULE.UPDATE(id), updates);
  },
  
  // Delete event
  async deleteEvent(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete(ENDPOINTS.SCHEDULE.DELETE(id));
  },
  
  // AI-Generate schedule for a date
  async generateSchedule(request: GenerateScheduleRequest): Promise<ApiResponse<ApiScheduleEvent[]>> {
    return apiClient.post<ApiScheduleEvent[]>(ENDPOINTS.SCHEDULE.GENERATE, request);
  },
  
  // Convert API event to local format
  toLocalEvent(apiEvent: ApiScheduleEvent): ScheduleEvent {
    return {
      id: apiEvent.id,
      date: apiEvent.date,
      time: apiEvent.time,
      title: apiEvent.title,
      category: apiEvent.category,
      location: apiEvent.location,
      duration: apiEvent.duration,
      color: apiEvent.color,
    };
  },
  
  // Convert local event to API payload
  toApiPayload(event: Omit<ScheduleEvent, 'id'>): SchedulePayload {
    return {
      date: event.date,
      time: event.time,
      title: event.title,
      category: event.category,
      location: event.location,
      duration: event.duration,
      color: event.color,
    };
  },
  
  // Get category color
  getCategoryColor(category: string): string {
    const colors: Record<string, string> = {
      Academics: '#3B82F6',
      Work: '#9061F9',
      Wellness: '#22C997',
      Social: '#F97316',
      Break: '#6B7280',
    };
    return colors[category] || '#7B6BFB';
  },
};

export default scheduleService;

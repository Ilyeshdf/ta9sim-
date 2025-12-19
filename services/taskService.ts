import apiClient, { ApiResponse, PaginatedResponse } from './api';
import { ENDPOINTS } from '../config/api';
import { Task } from '../contexts/AppContext';

// API Task type (what comes from backend)
export interface ApiTask {
  id: string;
  title: string;
  description?: string;
  category: 'Academics' | 'Work' | 'Wellness' | 'Social';
  priority: 'Low' | 'Medium' | 'High';
  completed: boolean;
  dueDate?: string;
  time?: string;
  duration?: string;
  effortLevel?: number;
  createdAt: string;
  updatedAt: string;
  userId: string;
}

// Create/Update task payload
export interface TaskPayload {
  title: string;
  description?: string;
  category: 'Academics' | 'Work' | 'Wellness' | 'Social';
  priority: 'Low' | 'Medium' | 'High';
  dueDate?: string;
  time?: string;
  duration?: string;
  effortLevel?: number;
}

// Query params for listing tasks
export interface TaskQueryParams {
  page?: number;
  limit?: number;
  category?: string;
  priority?: string;
  completed?: boolean;
  search?: string;
  sortBy?: 'createdAt' | 'dueDate' | 'priority';
  sortOrder?: 'asc' | 'desc';
}

// Task Service
export const taskService = {
  // Get all tasks with optional filters
  async getTasks(params?: TaskQueryParams): Promise<PaginatedResponse<ApiTask>> {
    const queryString = params 
      ? '?' + new URLSearchParams(
          Object.entries(params)
            .filter(([_, v]) => v !== undefined)
            .map(([k, v]) => [k, String(v)])
        ).toString()
      : '';
    
    const response = await apiClient.get<PaginatedResponse<ApiTask>>(
      `${ENDPOINTS.TASKS.LIST}${queryString}`
    );
    
    if (response.success && response.data) {
      return response.data as unknown as PaginatedResponse<ApiTask>;
    }
    
    return {
      success: false,
      data: [],
      pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
    };
  },
  
  // Get single task
  async getTask(id: string): Promise<ApiResponse<ApiTask>> {
    return apiClient.get<ApiTask>(ENDPOINTS.TASKS.GET(id));
  },
  
  // Create new task
  async createTask(task: TaskPayload): Promise<ApiResponse<ApiTask>> {
    return apiClient.post<ApiTask>(ENDPOINTS.TASKS.CREATE, task);
  },
  
  // Update task
  async updateTask(id: string, updates: Partial<TaskPayload>): Promise<ApiResponse<ApiTask>> {
    return apiClient.patch<ApiTask>(ENDPOINTS.TASKS.UPDATE(id), updates);
  },
  
  // Delete task
  async deleteTask(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete(ENDPOINTS.TASKS.DELETE(id));
  },
  
  // Toggle task completion
  async toggleTask(id: string): Promise<ApiResponse<ApiTask>> {
    return apiClient.post<ApiTask>(ENDPOINTS.TASKS.TOGGLE(id));
  },
  
  // Convert API task to local Task format
  toLocalTask(apiTask: ApiTask): Task {
    return {
      id: apiTask.id,
      title: apiTask.title,
      category: apiTask.category,
      priority: apiTask.priority,
      completed: apiTask.completed,
      dueDate: apiTask.dueDate,
      time: apiTask.time,
      duration: apiTask.duration,
      effortLevel: apiTask.effortLevel,
      description: apiTask.description,
    };
  },
  
  // Convert local Task to API payload
  toApiPayload(task: Omit<Task, 'id'>): TaskPayload {
    return {
      title: task.title,
      description: task.description,
      category: task.category,
      priority: task.priority,
      dueDate: task.dueDate,
      time: task.time,
      duration: task.duration,
      effortLevel: task.effortLevel,
    };
  },
};

export default taskService;

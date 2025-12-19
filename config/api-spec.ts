/**
 * Backend API Specification
 * 
 * This file defines the expected API contract for the productivity app backend.
 * Use this as a reference when building your backend server.
 * 
 * Base URL: http://localhost:3000/api (development)
 * 
 * All endpoints return JSON with the following structure:
 * Success: { success: true, data: <payload>, message?: string }
 * Error: { success: false, error: string, message?: string }
 */

// ============================================
// AUTHENTICATION ENDPOINTS
// ============================================

/**
 * POST /api/auth/register
 * Register a new user
 * 
 * Request Body:
 * {
 *   email: string,
 *   password: string,
 *   name: string
 * }
 * 
 * Response:
 * {
 *   success: true,
 *   data: {
 *     user: {
 *       id: string,
 *       email: string,
 *       name: string,
 *       createdAt: string (ISO date)
 *     },
 *     token: string (JWT),
 *     refreshToken: string
 *   }
 * }
 */

/**
 * POST /api/auth/login
 * Login existing user
 * 
 * Request Body:
 * {
 *   email: string,
 *   password: string
 * }
 * 
 * Response: Same as register
 */

/**
 * POST /api/auth/logout
 * Logout user (invalidate tokens)
 * 
 * Headers: Authorization: Bearer <token>
 * 
 * Response:
 * { success: true, message: "Logged out successfully" }
 */

/**
 * POST /api/auth/refresh
 * Refresh access token
 * 
 * Request Body:
 * { refreshToken: string }
 * 
 * Response:
 * {
 *   success: true,
 *   data: {
 *     token: string,
 *     refreshToken: string (optional, if rotating)
 *   }
 * }
 */

/**
 * GET /api/auth/me
 * Get current user
 * 
 * Headers: Authorization: Bearer <token>
 * 
 * Response:
 * {
 *   success: true,
 *   data: {
 *     id: string,
 *     email: string,
 *     name: string,
 *     avatar?: string,
 *     createdAt: string,
 *     preferences?: {
 *       themeMode: 'light' | 'dark' | 'system',
 *       notifications: boolean,
 *       focusHoursStart: number,
 *       focusHoursEnd: number
 *     }
 *   }
 * }
 */

// ============================================
// TASK ENDPOINTS
// ============================================

/**
 * GET /api/tasks
 * Get all tasks for current user
 * 
 * Headers: Authorization: Bearer <token>
 * 
 * Query Params:
 * - page?: number (default: 1)
 * - limit?: number (default: 20)
 * - category?: 'Academics' | 'Work' | 'Wellness' | 'Social'
 * - priority?: 'Low' | 'Medium' | 'High'
 * - completed?: boolean
 * - search?: string (search in title)
 * - sortBy?: 'createdAt' | 'dueDate' | 'priority'
 * - sortOrder?: 'asc' | 'desc'
 * 
 * Response:
 * {
 *   success: true,
 *   data: Task[],
 *   pagination: {
 *     page: number,
 *     limit: number,
 *     total: number,
 *     totalPages: number
 *   }
 * }
 */

/**
 * POST /api/tasks
 * Create a new task
 * 
 * Headers: Authorization: Bearer <token>
 * 
 * Request Body:
 * {
 *   title: string,
 *   description?: string,
 *   category: 'Academics' | 'Work' | 'Wellness' | 'Social',
 *   priority: 'Low' | 'Medium' | 'High',
 *   dueDate?: string (ISO date),
 *   time?: string,
 *   duration?: string,
 *   effortLevel?: number (1-5)
 * }
 * 
 * Response:
 * { success: true, data: Task }
 */

/**
 * GET /api/tasks/:id
 * Get a specific task
 * 
 * Response:
 * { success: true, data: Task }
 */

/**
 * PATCH /api/tasks/:id
 * Update a task
 * 
 * Request Body: Partial<Task> (any fields to update)
 * 
 * Response:
 * { success: true, data: Task }
 */

/**
 * DELETE /api/tasks/:id
 * Delete a task
 * 
 * Response:
 * { success: true, message: "Task deleted" }
 */

/**
 * POST /api/tasks/:id/toggle
 * Toggle task completion status
 * 
 * Response:
 * { success: true, data: Task }
 */

// ============================================
// SCHEDULE ENDPOINTS
// ============================================

/**
 * GET /api/schedule
 * Get all schedule events
 * 
 * Query Params:
 * - page?: number
 * - limit?: number
 * 
 * Response:
 * {
 *   success: true,
 *   data: ScheduleEvent[],
 *   pagination: { ... }
 * }
 */

/**
 * GET /api/schedule/date/:date
 * Get events for a specific date
 * 
 * Param: date (YYYY-MM-DD format)
 * 
 * Response:
 * { success: true, data: ScheduleEvent[] }
 */

/**
 * POST /api/schedule
 * Create a schedule event
 * 
 * Request Body:
 * {
 *   date: string (YYYY-MM-DD),
 *   time: string (e.g., "09:00 AM"),
 *   title: string,
 *   description?: string,
 *   category: 'Academics' | 'Work' | 'Wellness' | 'Social' | 'Break',
 *   location?: string,
 *   duration: string (e.g., "2h", "30m"),
 *   color?: string (hex color),
 *   isRecurring?: boolean,
 *   recurringPattern?: string
 * }
 * 
 * Response:
 * { success: true, data: ScheduleEvent }
 */

/**
 * POST /api/schedule/generate
 * AI-generate a schedule for a date
 * 
 * Request Body:
 * {
 *   date: string,
 *   taskIds?: string[],
 *   preferences?: {
 *     focusHoursStart?: number,
 *     focusHoursEnd?: number,
 *     breakDuration?: number,
 *     prioritizeCategories?: string[]
 *   }
 * }
 * 
 * Response:
 * { success: true, data: ScheduleEvent[] }
 */

// ============================================
// USER ENDPOINTS
// ============================================

/**
 * GET /api/user/profile
 * Get user profile
 * 
 * Response: { success: true, data: User }
 */

/**
 * PUT /api/user/profile
 * Update user profile
 * 
 * Request Body:
 * {
 *   name?: string,
 *   avatar?: string,
 *   preferences?: UserPreferences
 * }
 * 
 * Response: { success: true, data: User }
 */

/**
 * GET /api/user/metrics
 * Get user metrics (energy, stress, etc.)
 * 
 * Response:
 * {
 *   success: true,
 *   data: {
 *     energy: number (0-100),
 *     stress: number (0-100),
 *     burnoutRisk: 'Low' | 'Medium' | 'High'
 *   }
 * }
 */

// ============================================
// AI ENDPOINTS
// ============================================

/**
 * POST /api/ai/chat
 * Send message to AI assistant
 * 
 * Request Body:
 * {
 *   message: string,
 *   context?: {
 *     tasks?: Task[],
 *     schedule?: ScheduleEvent[],
 *     metrics?: UserMetrics,
 *     currentDate?: string
 *   },
 *   conversationHistory?: { role: string, content: string }[]
 * }
 * 
 * Response:
 * {
 *   success: true,
 *   data: {
 *     message: string,
 *     suggestions?: string[],
 *     actions?: AIAction[]
 *   }
 * }
 */

/**
 * POST /api/ai/generate-schedule
 * AI generates optimized schedule
 * 
 * Request Body:
 * {
 *   date: string,
 *   tasks: Task[],
 *   preferences?: { ... },
 *   existingEvents?: ScheduleEvent[]
 * }
 * 
 * Response:
 * {
 *   success: true,
 *   data: {
 *     schedule: ScheduleEvent[],
 *     explanation: string,
 *     tips?: string[]
 *   }
 * }
 */

/**
 * POST /api/ai/analyze
 * AI analyzes productivity
 * 
 * Request Body:
 * {
 *   tasks: Task[],
 *   schedule: ScheduleEvent[],
 *   metrics: UserMetrics,
 *   timeRange?: 'day' | 'week' | 'month'
 * }
 * 
 * Response:
 * {
 *   success: true,
 *   data: {
 *     summary: string,
 *     insights: AIInsight[],
 *     recommendations: string[],
 *     burnoutRisk: 'Low' | 'Medium' | 'High',
 *     productivityScore: number,
 *     balanceScore: number
 *   }
 * }
 */

/**
 * POST /api/ai/suggestions
 * Get AI suggestions based on context
 * 
 * Request Body:
 * {
 *   tasks?: Task[],
 *   schedule?: ScheduleEvent[],
 *   metrics?: UserMetrics
 * }
 * 
 * Response:
 * {
 *   success: true,
 *   data: AISuggestion[]
 * }
 */

// ============================================
// DATA MODELS
// ============================================

interface Task {
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

interface ScheduleEvent {
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

interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  createdAt: string;
  preferences?: UserPreferences;
}

interface UserPreferences {
  themeMode: 'light' | 'dark' | 'system';
  notifications: boolean;
  focusHoursStart: number;
  focusHoursEnd: number;
}

interface UserMetrics {
  energy: number;
  stress: number;
  burnoutRisk: 'Low' | 'Medium' | 'High';
}

interface AIAction {
  type: 'create_task' | 'create_event' | 'reschedule' | 'suggest_break' | 'update_metrics';
  payload: Record<string, unknown>;
  label: string;
}

interface AIInsight {
  type: 'warning' | 'success' | 'info';
  title: string;
  description: string;
  category?: string;
}

interface AISuggestion {
  id: string;
  type: 'task' | 'schedule' | 'wellness' | 'productivity';
  title: string;
  description: string;
  priority: 'Low' | 'Medium' | 'High';
  action?: AIAction;
}

export {};

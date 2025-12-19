import 'react-native-url-polyfill/dist/polyfill';
import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';

// ============================================
// SUPABASE CONFIGURATION
// ============================================

// Replace with your Supabase project credentials
const SUPABASE_URL = 'https://ussjlwyvncrxuanijvcs.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_ZbRIzGOK9elcbkZHBe0cPg_0RxNVP6q';

// ============================================
// SECURE STORAGE ADAPTER
// ============================================

const ExpoSecureStoreAdapter = {
  getItem: async (key: string): Promise<string | null> => {
    try {
      return await SecureStore.getItemAsync(key);
    } catch {
      return null;
    }
  },
  setItem: async (key: string, value: string): Promise<void> => {
    await SecureStore.setItemAsync(key, value);
  },
  removeItem: async (key: string): Promise<void> => {
    await SecureStore.deleteItemAsync(key);
  },
};

// ============================================
// SUPABASE CLIENT
// ============================================

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: ExpoSecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// ============================================
// DATABASE TYPES (generated from schema)
// ============================================

export type TaskCategory = 'Academics' | 'Work' | 'Wellness' | 'Social';
export type ScheduleCategory = 'Academics' | 'Work' | 'Wellness' | 'Social' | 'Break';
export type PriorityLevel = 'Low' | 'Medium' | 'High';
export type BurnoutRisk = 'Low' | 'Medium' | 'High';
export type ThemeMode = 'light' | 'dark' | 'system';
export type BalanceStatus = 'BALANCED' | 'OVERLOADED' | 'RELAXED';

export interface Profile {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface UserPreferences {
  id: string;
  user_id: string;
  theme_mode: ThemeMode;
  notifications_enabled: boolean;
  focus_hours_start: number;
  focus_hours_end: number;
  break_duration_minutes: number;
  created_at: string;
  updated_at: string;
}

export interface UserMetrics {
  id: string;
  user_id: string;
  energy: number;
  stress: number;
  burnout_risk: BurnoutRisk;
  balance_status: BalanceStatus;
  last_calculated_at: string;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  category: TaskCategory;
  priority: PriorityLevel;
  completed: boolean;
  due_date?: string;
  due_time?: string;
  duration?: string;
  effort_level?: number;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface ScheduleEvent {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  category: ScheduleCategory;
  event_date: string;
  event_time: string;
  duration: string;
  location?: string;
  color: string;
  is_recurring: boolean;
  recurring_pattern?: string;
  linked_task_id?: string;
  created_at: string;
  updated_at: string;
}

// ============================================
// AUTH HELPER FUNCTIONS
// ============================================

export const auth = {
  // Sign up with email and password
  async signUp(email: string, password: string, name: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
      },
    });
    return { data, error };
  },

  // Sign in with email and password
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  },

  // Sign out
  async signOut() {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  // Get current session
  async getSession() {
    const { data, error } = await supabase.auth.getSession();
    return { data, error };
  },

  // Get current user
  async getUser() {
    const { data, error } = await supabase.auth.getUser();
    return { data, error };
  },

  // Reset password
  async resetPassword(email: string) {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email);
    return { data, error };
  },

  // Update password
  async updatePassword(newPassword: string) {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    return { data, error };
  },

  // Listen to auth state changes
  onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback);
  },
};

// ============================================
// DATABASE FUNCTION CALLS
// ============================================

export const db = {
  // ==========================================
  // PROFILE FUNCTIONS
  // ==========================================
  
  async getUserProfile() {
    const { data, error } = await supabase.rpc('get_user_profile');
    return { data, error };
  },

  async updateUserProfile(name?: string, avatarUrl?: string) {
    const { data, error } = await supabase.rpc('update_user_profile', {
      p_name: name,
      p_avatar_url: avatarUrl,
    });
    return { data, error };
  },

  async updateUserPreferences(preferences: {
    themeMode?: ThemeMode;
    notificationsEnabled?: boolean;
    focusHoursStart?: number;
    focusHoursEnd?: number;
    breakDurationMinutes?: number;
  }) {
    const { data, error } = await supabase.rpc('update_user_preferences', {
      p_theme_mode: preferences.themeMode,
      p_notifications_enabled: preferences.notificationsEnabled,
      p_focus_hours_start: preferences.focusHoursStart,
      p_focus_hours_end: preferences.focusHoursEnd,
      p_break_duration_minutes: preferences.breakDurationMinutes,
    });
    return { data, error };
  },

  // ==========================================
  // TASK FUNCTIONS
  // ==========================================

  async getTasks(options?: {
    category?: TaskCategory;
    priority?: PriorityLevel;
    completed?: boolean;
    search?: string;
    sortBy?: 'created_at' | 'due_date' | 'priority';
    sortOrder?: 'asc' | 'desc';
    limit?: number;
    offset?: number;
  }) {
    const { data, error } = await supabase.rpc('get_tasks', {
      p_category: options?.category,
      p_priority: options?.priority,
      p_completed: options?.completed,
      p_search: options?.search,
      p_sort_by: options?.sortBy || 'created_at',
      p_sort_order: options?.sortOrder || 'desc',
      p_limit: options?.limit || 50,
      p_offset: options?.offset || 0,
    });
    return { data, error };
  },

  async getTask(taskId: string) {
    const { data, error } = await supabase.rpc('get_task', {
      p_task_id: taskId,
    });
    return { data, error };
  },

  async createTask(task: {
    title: string;
    category: TaskCategory;
    priority?: PriorityLevel;
    description?: string;
    dueDate?: string;
    dueTime?: string;
    duration?: string;
    effortLevel?: number;
  }) {
    const { data, error } = await supabase.rpc('create_task', {
      p_title: task.title,
      p_category: task.category,
      p_priority: task.priority || 'Medium',
      p_description: task.description,
      p_due_date: task.dueDate,
      p_due_time: task.dueTime,
      p_duration: task.duration,
      p_effort_level: task.effortLevel,
    });
    return { data, error };
  },

  async updateTask(taskId: string, updates: {
    title?: string;
    category?: TaskCategory;
    priority?: PriorityLevel;
    description?: string;
    dueDate?: string;
    dueTime?: string;
    duration?: string;
    effortLevel?: number;
    completed?: boolean;
  }) {
    const { data, error } = await supabase.rpc('update_task', {
      p_task_id: taskId,
      p_title: updates.title,
      p_category: updates.category,
      p_priority: updates.priority,
      p_description: updates.description,
      p_due_date: updates.dueDate,
      p_due_time: updates.dueTime,
      p_duration: updates.duration,
      p_effort_level: updates.effortLevel,
      p_completed: updates.completed,
    });
    return { data, error };
  },

  async deleteTask(taskId: string) {
    const { data, error } = await supabase.rpc('delete_task', {
      p_task_id: taskId,
    });
    return { data, error };
  },

  async toggleTaskCompletion(taskId: string) {
    const { data, error } = await supabase.rpc('toggle_task_completion', {
      p_task_id: taskId,
    });
    return { data, error };
  },

  async getTaskStats() {
    const { data, error } = await supabase.rpc('get_task_stats');
    return { data, error };
  },

  // ==========================================
  // SCHEDULE EVENT FUNCTIONS
  // ==========================================

  async getScheduleEvents(options?: {
    startDate?: string;
    endDate?: string;
    category?: ScheduleCategory;
    limit?: number;
    offset?: number;
  }) {
    const { data, error } = await supabase.rpc('get_schedule_events', {
      p_start_date: options?.startDate || new Date().toISOString().split('T')[0],
      p_end_date: options?.endDate || new Date().toISOString().split('T')[0],
      p_category: options?.category,
      p_limit: options?.limit || 100,
      p_offset: options?.offset || 0,
    });
    return { data, error };
  },

  async getEventsByDate(date: string) {
    const { data, error } = await supabase.rpc('get_events_by_date', {
      p_date: date,
    });
    return { data, error };
  },

  async getScheduleEvent(eventId: string) {
    const { data, error } = await supabase.rpc('get_schedule_event', {
      p_event_id: eventId,
    });
    return { data, error };
  },

  async createScheduleEvent(event: {
    title: string;
    category: ScheduleCategory;
    eventDate: string;
    eventTime: string;
    duration: string;
    description?: string;
    location?: string;
    color?: string;
    isRecurring?: boolean;
    recurringPattern?: string;
    linkedTaskId?: string;
  }) {
    const { data, error } = await supabase.rpc('create_schedule_event', {
      p_title: event.title,
      p_category: event.category,
      p_event_date: event.eventDate,
      p_event_time: event.eventTime,
      p_duration: event.duration,
      p_description: event.description,
      p_location: event.location,
      p_color: event.color || '#7B6BFB',
      p_is_recurring: event.isRecurring || false,
      p_recurring_pattern: event.recurringPattern,
      p_linked_task_id: event.linkedTaskId,
    });
    return { data, error };
  },

  async updateScheduleEvent(eventId: string, updates: {
    title?: string;
    category?: ScheduleCategory;
    eventDate?: string;
    eventTime?: string;
    duration?: string;
    description?: string;
    location?: string;
    color?: string;
    isRecurring?: boolean;
    recurringPattern?: string;
  }) {
    const { data, error } = await supabase.rpc('update_schedule_event', {
      p_event_id: eventId,
      p_title: updates.title,
      p_category: updates.category,
      p_event_date: updates.eventDate,
      p_event_time: updates.eventTime,
      p_duration: updates.duration,
      p_description: updates.description,
      p_location: updates.location,
      p_color: updates.color,
      p_is_recurring: updates.isRecurring,
      p_recurring_pattern: updates.recurringPattern,
    });
    return { data, error };
  },

  async deleteScheduleEvent(eventId: string) {
    const { data, error } = await supabase.rpc('delete_schedule_event', {
      p_event_id: eventId,
    });
    return { data, error };
  },

  async clearScheduleForDate(date: string) {
    const { data, error } = await supabase.rpc('clear_schedule_for_date', {
      p_date: date,
    });
    return { data, error };
  },

  async getDatesWithEvents(startDate: string, endDate: string) {
    const { data, error } = await supabase.rpc('get_dates_with_events', {
      p_start_date: startDate,
      p_end_date: endDate,
    });
    return { data, error };
  },

  // ==========================================
  // USER METRICS FUNCTIONS
  // ==========================================

  async getUserMetrics() {
    const { data, error } = await supabase.rpc('get_user_metrics');
    return { data, error };
  },

  async calculateUserBalance() {
    const { data, error } = await supabase.rpc('calculate_user_balance');
    return { data, error };
  },

  async updateUserMetrics(metrics: { energy?: number; stress?: number }) {
    const { data, error } = await supabase.rpc('update_user_metrics', {
      p_energy: metrics.energy,
      p_stress: metrics.stress,
    });
    return { data, error };
  },

  // ==========================================
  // ANALYTICS FUNCTIONS
  // ==========================================

  async getWeeklyStats() {
    const { data, error } = await supabase.rpc('get_weekly_stats');
    return { data, error };
  },

  // ==========================================
  // SEARCH FUNCTIONS
  // ==========================================

  async globalSearch(query: string, limit?: number) {
    const { data, error } = await supabase.rpc('global_search', {
      p_query: query,
      p_limit: limit || 20,
    });
    return { data, error };
  },
};

// ============================================
// REALTIME SUBSCRIPTIONS
// ============================================

export const realtime = {
  // Subscribe to task changes
  subscribeToTasks(userId: string, callback: (payload: any) => void) {
    return supabase
      .channel('tasks-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks',
          filter: `user_id=eq.${userId}`,
        },
        callback
      )
      .subscribe();
  },

  // Subscribe to schedule changes
  subscribeToSchedule(userId: string, callback: (payload: any) => void) {
    return supabase
      .channel('schedule-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'schedule_events',
          filter: `user_id=eq.${userId}`,
        },
        callback
      )
      .subscribe();
  },

  // Subscribe to metrics changes
  subscribeToMetrics(userId: string, callback: (payload: any) => void) {
    return supabase
      .channel('metrics-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_metrics',
          filter: `user_id=eq.${userId}`,
        },
        callback
      )
      .subscribe();
  },

  // Unsubscribe from a channel
  unsubscribe(channel: any) {
    return supabase.removeChannel(channel);
  },
};

export default supabase;

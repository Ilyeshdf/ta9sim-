-- ============================================
-- SUPABASE DATABASE SCHEMA
-- Productivity App - Full SQL Setup
-- ============================================
-- Run this in your Supabase SQL Editor
-- This creates all tables, functions, triggers, and RLS policies
-- ============================================

-- Enable UUID extension (usually enabled by default in Supabase)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- ENUM TYPES
-- ============================================

-- Task categories
CREATE TYPE task_category AS ENUM ('Academics', 'Work', 'Wellness', 'Social');

-- Schedule event categories (includes Break)
CREATE TYPE schedule_category AS ENUM ('Academics', 'Work', 'Wellness', 'Social', 'Break');

-- Priority levels
CREATE TYPE priority_level AS ENUM ('Low', 'Medium', 'High');

-- Burnout risk levels
CREATE TYPE burnout_risk AS ENUM ('Low', 'Medium', 'High');

-- Theme modes
CREATE TYPE theme_mode AS ENUM ('light', 'dark', 'system');

-- Balance status
CREATE TYPE balance_status AS ENUM ('BALANCED', 'OVERLOADED', 'RELAXED');

-- ============================================
-- PROFILES TABLE (extends auth.users)
-- ============================================

CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    name TEXT NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Index for faster lookups
CREATE INDEX idx_profiles_email ON public.profiles(email);

-- ============================================
-- USER PREFERENCES TABLE
-- ============================================

CREATE TABLE public.user_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    theme_mode theme_mode DEFAULT 'system' NOT NULL,
    notifications_enabled BOOLEAN DEFAULT true NOT NULL,
    focus_hours_start INTEGER DEFAULT 9 CHECK (focus_hours_start >= 0 AND focus_hours_start <= 23),
    focus_hours_end INTEGER DEFAULT 17 CHECK (focus_hours_end >= 0 AND focus_hours_end <= 23),
    break_duration_minutes INTEGER DEFAULT 15,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Index for user lookups
CREATE INDEX idx_user_preferences_user_id ON public.user_preferences(user_id);

-- ============================================
-- USER METRICS TABLE
-- ============================================

CREATE TABLE public.user_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    energy INTEGER DEFAULT 80 CHECK (energy >= 0 AND energy <= 100),
    stress INTEGER DEFAULT 20 CHECK (stress >= 0 AND stress <= 100),
    burnout_risk burnout_risk DEFAULT 'Low' NOT NULL,
    balance_status balance_status DEFAULT 'BALANCED' NOT NULL,
    last_calculated_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Index for user lookups
CREATE INDEX idx_user_metrics_user_id ON public.user_metrics(user_id);

-- ============================================
-- TASKS TABLE
-- ============================================

CREATE TABLE public.tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL CHECK (char_length(title) > 0 AND char_length(title) <= 500),
    description TEXT,
    category task_category NOT NULL,
    priority priority_level DEFAULT 'Medium' NOT NULL,
    completed BOOLEAN DEFAULT false NOT NULL,
    due_date DATE,
    due_time TIME,
    duration TEXT, -- e.g., '2h', '30m'
    effort_level INTEGER CHECK (effort_level >= 1 AND effort_level <= 5),
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes for common queries
CREATE INDEX idx_tasks_user_id ON public.tasks(user_id);
CREATE INDEX idx_tasks_category ON public.tasks(category);
CREATE INDEX idx_tasks_priority ON public.tasks(priority);
CREATE INDEX idx_tasks_completed ON public.tasks(completed);
CREATE INDEX idx_tasks_due_date ON public.tasks(due_date);
CREATE INDEX idx_tasks_created_at ON public.tasks(created_at DESC);

-- Composite index for filtered queries
CREATE INDEX idx_tasks_user_completed ON public.tasks(user_id, completed);
CREATE INDEX idx_tasks_user_category ON public.tasks(user_id, category);

-- ============================================
-- SCHEDULE EVENTS TABLE
-- ============================================

CREATE TABLE public.schedule_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL CHECK (char_length(title) > 0 AND char_length(title) <= 500),
    description TEXT,
    category schedule_category NOT NULL,
    event_date DATE NOT NULL,
    event_time TIME NOT NULL,
    duration TEXT NOT NULL, -- e.g., '2h', '30m', '1h 30m'
    location TEXT,
    color TEXT DEFAULT '#7B6BFB',
    is_recurring BOOLEAN DEFAULT false,
    recurring_pattern TEXT, -- e.g., 'daily', 'weekly', 'monthly'
    linked_task_id UUID REFERENCES public.tasks(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes for common queries
CREATE INDEX idx_schedule_user_id ON public.schedule_events(user_id);
CREATE INDEX idx_schedule_date ON public.schedule_events(event_date);
CREATE INDEX idx_schedule_category ON public.schedule_events(category);
CREATE INDEX idx_schedule_user_date ON public.schedule_events(user_id, event_date);

-- ============================================
-- TRIGGER: Auto-update updated_at timestamp
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all tables
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at
    BEFORE UPDATE ON public.user_preferences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_metrics_updated_at
    BEFORE UPDATE ON public.user_metrics
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at
    BEFORE UPDATE ON public.tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_schedule_events_updated_at
    BEFORE UPDATE ON public.schedule_events
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- TRIGGER: Auto-create profile on user signup
-- ============================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Create profile
    INSERT INTO public.profiles (id, email, name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1))
    );
    
    -- Create default preferences
    INSERT INTO public.user_preferences (user_id)
    VALUES (NEW.id);
    
    -- Create default metrics
    INSERT INTO public.user_metrics (user_id)
    VALUES (NEW.id);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on auth.users insert
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- TRIGGER: Set completed_at when task completed
-- ============================================

CREATE OR REPLACE FUNCTION set_task_completed_at()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.completed = true AND OLD.completed = false THEN
        NEW.completed_at = NOW();
    ELSIF NEW.completed = false AND OLD.completed = true THEN
        NEW.completed_at = NULL;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER task_completed_timestamp
    BEFORE UPDATE ON public.tasks
    FOR EACH ROW
    WHEN (OLD.completed IS DISTINCT FROM NEW.completed)
    EXECUTE FUNCTION set_task_completed_at();

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedule_events ENABLE ROW LEVEL SECURITY;

-- PROFILES POLICIES
CREATE POLICY "Users can view own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

-- USER PREFERENCES POLICIES
CREATE POLICY "Users can view own preferences"
    ON public.user_preferences FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences"
    ON public.user_preferences FOR UPDATE
    USING (auth.uid() = user_id);

-- USER METRICS POLICIES
CREATE POLICY "Users can view own metrics"
    ON public.user_metrics FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update own metrics"
    ON public.user_metrics FOR UPDATE
    USING (auth.uid() = user_id);

-- TASKS POLICIES
CREATE POLICY "Users can view own tasks"
    ON public.tasks FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create own tasks"
    ON public.tasks FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tasks"
    ON public.tasks FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own tasks"
    ON public.tasks FOR DELETE
    USING (auth.uid() = user_id);

-- SCHEDULE EVENTS POLICIES
CREATE POLICY "Users can view own schedule"
    ON public.schedule_events FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create own events"
    ON public.schedule_events FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own events"
    ON public.schedule_events FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own events"
    ON public.schedule_events FOR DELETE
    USING (auth.uid() = user_id);

-- ============================================
-- DATABASE FUNCTIONS
-- ============================================

-- ============================================
-- PROFILE FUNCTIONS
-- ============================================

-- Get current user profile with preferences and metrics
CREATE OR REPLACE FUNCTION get_user_profile()
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'id', p.id,
        'email', p.email,
        'name', p.name,
        'avatar_url', p.avatar_url,
        'created_at', p.created_at,
        'preferences', json_build_object(
            'theme_mode', up.theme_mode,
            'notifications_enabled', up.notifications_enabled,
            'focus_hours_start', up.focus_hours_start,
            'focus_hours_end', up.focus_hours_end,
            'break_duration_minutes', up.break_duration_minutes
        ),
        'metrics', json_build_object(
            'energy', um.energy,
            'stress', um.stress,
            'burnout_risk', um.burnout_risk,
            'balance_status', um.balance_status
        )
    ) INTO result
    FROM public.profiles p
    LEFT JOIN public.user_preferences up ON p.id = up.user_id
    LEFT JOIN public.user_metrics um ON p.id = um.user_id
    WHERE p.id = auth.uid();
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update user profile
CREATE OR REPLACE FUNCTION update_user_profile(
    p_name TEXT DEFAULT NULL,
    p_avatar_url TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    UPDATE public.profiles
    SET 
        name = COALESCE(p_name, name),
        avatar_url = COALESCE(p_avatar_url, avatar_url)
    WHERE id = auth.uid();
    
    SELECT get_user_profile() INTO result;
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update user preferences
CREATE OR REPLACE FUNCTION update_user_preferences(
    p_theme_mode theme_mode DEFAULT NULL,
    p_notifications_enabled BOOLEAN DEFAULT NULL,
    p_focus_hours_start INTEGER DEFAULT NULL,
    p_focus_hours_end INTEGER DEFAULT NULL,
    p_break_duration_minutes INTEGER DEFAULT NULL
)
RETURNS JSON AS $$
BEGIN
    UPDATE public.user_preferences
    SET 
        theme_mode = COALESCE(p_theme_mode, theme_mode),
        notifications_enabled = COALESCE(p_notifications_enabled, notifications_enabled),
        focus_hours_start = COALESCE(p_focus_hours_start, focus_hours_start),
        focus_hours_end = COALESCE(p_focus_hours_end, focus_hours_end),
        break_duration_minutes = COALESCE(p_break_duration_minutes, break_duration_minutes)
    WHERE user_id = auth.uid();
    
    RETURN (SELECT get_user_profile());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- TASK FUNCTIONS
-- ============================================

-- Get all tasks for current user with filters
CREATE OR REPLACE FUNCTION get_tasks(
    p_category task_category DEFAULT NULL,
    p_priority priority_level DEFAULT NULL,
    p_completed BOOLEAN DEFAULT NULL,
    p_search TEXT DEFAULT NULL,
    p_sort_by TEXT DEFAULT 'created_at',
    p_sort_order TEXT DEFAULT 'desc',
    p_limit INTEGER DEFAULT 50,
    p_offset INTEGER DEFAULT 0
)
RETURNS JSON AS $$
DECLARE
    result JSON;
    total_count INTEGER;
BEGIN
    -- Get total count
    SELECT COUNT(*) INTO total_count
    FROM public.tasks
    WHERE user_id = auth.uid()
        AND (p_category IS NULL OR category = p_category)
        AND (p_priority IS NULL OR priority = p_priority)
        AND (p_completed IS NULL OR completed = p_completed)
        AND (p_search IS NULL OR title ILIKE '%' || p_search || '%');
    
    -- Get tasks with dynamic sorting
    SELECT json_build_object(
        'data', COALESCE(json_agg(t ORDER BY 
            CASE WHEN p_sort_by = 'created_at' AND p_sort_order = 'desc' THEN t.created_at END DESC,
            CASE WHEN p_sort_by = 'created_at' AND p_sort_order = 'asc' THEN t.created_at END ASC,
            CASE WHEN p_sort_by = 'due_date' AND p_sort_order = 'desc' THEN t.due_date END DESC NULLS LAST,
            CASE WHEN p_sort_by = 'due_date' AND p_sort_order = 'asc' THEN t.due_date END ASC NULLS LAST,
            CASE WHEN p_sort_by = 'priority' AND p_sort_order = 'desc' THEN t.priority END DESC,
            CASE WHEN p_sort_by = 'priority' AND p_sort_order = 'asc' THEN t.priority END ASC
        ), '[]'::json),
        'pagination', json_build_object(
            'total', total_count,
            'limit', p_limit,
            'offset', p_offset,
            'has_more', (p_offset + p_limit) < total_count
        )
    ) INTO result
    FROM (
        SELECT 
            id,
            title,
            description,
            category,
            priority,
            completed,
            due_date,
            due_time,
            duration,
            effort_level,
            completed_at,
            created_at,
            updated_at
        FROM public.tasks
        WHERE user_id = auth.uid()
            AND (p_category IS NULL OR category = p_category)
            AND (p_priority IS NULL OR priority = p_priority)
            AND (p_completed IS NULL OR completed = p_completed)
            AND (p_search IS NULL OR title ILIKE '%' || p_search || '%')
        LIMIT p_limit
        OFFSET p_offset
    ) t;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get single task by ID
CREATE OR REPLACE FUNCTION get_task(p_task_id UUID)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'id', id,
        'title', title,
        'description', description,
        'category', category,
        'priority', priority,
        'completed', completed,
        'due_date', due_date,
        'due_time', due_time,
        'duration', duration,
        'effort_level', effort_level,
        'completed_at', completed_at,
        'created_at', created_at,
        'updated_at', updated_at
    ) INTO result
    FROM public.tasks
    WHERE id = p_task_id AND user_id = auth.uid();
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a new task
CREATE OR REPLACE FUNCTION create_task(
    p_title TEXT,
    p_category task_category,
    p_priority priority_level DEFAULT 'Medium',
    p_description TEXT DEFAULT NULL,
    p_due_date DATE DEFAULT NULL,
    p_due_time TIME DEFAULT NULL,
    p_duration TEXT DEFAULT NULL,
    p_effort_level INTEGER DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
    new_task_id UUID;
    result JSON;
BEGIN
    INSERT INTO public.tasks (
        user_id, title, category, priority, description, 
        due_date, due_time, duration, effort_level
    )
    VALUES (
        auth.uid(), p_title, p_category, p_priority, p_description,
        p_due_date, p_due_time, p_duration, p_effort_level
    )
    RETURNING id INTO new_task_id;
    
    -- Recalculate user metrics
    PERFORM calculate_user_balance();
    
    SELECT get_task(new_task_id) INTO result;
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update a task
CREATE OR REPLACE FUNCTION update_task(
    p_task_id UUID,
    p_title TEXT DEFAULT NULL,
    p_category task_category DEFAULT NULL,
    p_priority priority_level DEFAULT NULL,
    p_description TEXT DEFAULT NULL,
    p_due_date DATE DEFAULT NULL,
    p_due_time TIME DEFAULT NULL,
    p_duration TEXT DEFAULT NULL,
    p_effort_level INTEGER DEFAULT NULL,
    p_completed BOOLEAN DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    UPDATE public.tasks
    SET 
        title = COALESCE(p_title, title),
        category = COALESCE(p_category, category),
        priority = COALESCE(p_priority, priority),
        description = COALESCE(p_description, description),
        due_date = COALESCE(p_due_date, due_date),
        due_time = COALESCE(p_due_time, due_time),
        duration = COALESCE(p_duration, duration),
        effort_level = COALESCE(p_effort_level, effort_level),
        completed = COALESCE(p_completed, completed)
    WHERE id = p_task_id AND user_id = auth.uid();
    
    -- Recalculate user metrics
    PERFORM calculate_user_balance();
    
    SELECT get_task(p_task_id) INTO result;
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Delete a task
CREATE OR REPLACE FUNCTION delete_task(p_task_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM public.tasks
    WHERE id = p_task_id AND user_id = auth.uid();
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    -- Recalculate user metrics
    PERFORM calculate_user_balance();
    
    RETURN deleted_count > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Toggle task completion
CREATE OR REPLACE FUNCTION toggle_task_completion(p_task_id UUID)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    UPDATE public.tasks
    SET completed = NOT completed
    WHERE id = p_task_id AND user_id = auth.uid();
    
    -- Recalculate user metrics
    PERFORM calculate_user_balance();
    
    SELECT get_task(p_task_id) INTO result;
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get task statistics
CREATE OR REPLACE FUNCTION get_task_stats()
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'total', COUNT(*),
        'completed', COUNT(*) FILTER (WHERE completed = true),
        'pending', COUNT(*) FILTER (WHERE completed = false),
        'by_category', json_build_object(
            'Academics', COUNT(*) FILTER (WHERE category = 'Academics'),
            'Work', COUNT(*) FILTER (WHERE category = 'Work'),
            'Wellness', COUNT(*) FILTER (WHERE category = 'Wellness'),
            'Social', COUNT(*) FILTER (WHERE category = 'Social')
        ),
        'by_priority', json_build_object(
            'High', COUNT(*) FILTER (WHERE priority = 'High' AND completed = false),
            'Medium', COUNT(*) FILTER (WHERE priority = 'Medium' AND completed = false),
            'Low', COUNT(*) FILTER (WHERE priority = 'Low' AND completed = false)
        ),
        'due_today', COUNT(*) FILTER (WHERE due_date = CURRENT_DATE AND completed = false),
        'overdue', COUNT(*) FILTER (WHERE due_date < CURRENT_DATE AND completed = false)
    ) INTO result
    FROM public.tasks
    WHERE user_id = auth.uid();
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- SCHEDULE EVENT FUNCTIONS
-- ============================================

-- Get all schedule events for a date range
CREATE OR REPLACE FUNCTION get_schedule_events(
    p_start_date DATE DEFAULT CURRENT_DATE,
    p_end_date DATE DEFAULT CURRENT_DATE,
    p_category schedule_category DEFAULT NULL,
    p_limit INTEGER DEFAULT 100,
    p_offset INTEGER DEFAULT 0
)
RETURNS JSON AS $$
DECLARE
    result JSON;
    total_count INTEGER;
BEGIN
    -- Get total count
    SELECT COUNT(*) INTO total_count
    FROM public.schedule_events
    WHERE user_id = auth.uid()
        AND event_date BETWEEN p_start_date AND p_end_date
        AND (p_category IS NULL OR category = p_category);
    
    SELECT json_build_object(
        'data', COALESCE(json_agg(e ORDER BY e.event_date, e.event_time), '[]'::json),
        'pagination', json_build_object(
            'total', total_count,
            'limit', p_limit,
            'offset', p_offset,
            'has_more', (p_offset + p_limit) < total_count
        )
    ) INTO result
    FROM (
        SELECT 
            id,
            title,
            description,
            category,
            event_date,
            event_time,
            duration,
            location,
            color,
            is_recurring,
            recurring_pattern,
            linked_task_id,
            created_at,
            updated_at
        FROM public.schedule_events
        WHERE user_id = auth.uid()
            AND event_date BETWEEN p_start_date AND p_end_date
            AND (p_category IS NULL OR category = p_category)
        ORDER BY event_date, event_time
        LIMIT p_limit
        OFFSET p_offset
    ) e;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get events for a specific date
CREATE OR REPLACE FUNCTION get_events_by_date(p_date DATE)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT COALESCE(json_agg(
        json_build_object(
            'id', id,
            'title', title,
            'description', description,
            'category', category,
            'event_date', event_date,
            'event_time', event_time,
            'duration', duration,
            'location', location,
            'color', color,
            'is_recurring', is_recurring,
            'recurring_pattern', recurring_pattern,
            'linked_task_id', linked_task_id,
            'created_at', created_at,
            'updated_at', updated_at
        ) ORDER BY event_time
    ), '[]'::json) INTO result
    FROM public.schedule_events
    WHERE user_id = auth.uid() AND event_date = p_date;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get single schedule event
CREATE OR REPLACE FUNCTION get_schedule_event(p_event_id UUID)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'id', id,
        'title', title,
        'description', description,
        'category', category,
        'event_date', event_date,
        'event_time', event_time,
        'duration', duration,
        'location', location,
        'color', color,
        'is_recurring', is_recurring,
        'recurring_pattern', recurring_pattern,
        'linked_task_id', linked_task_id,
        'created_at', created_at,
        'updated_at', updated_at
    ) INTO result
    FROM public.schedule_events
    WHERE id = p_event_id AND user_id = auth.uid();
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a schedule event
CREATE OR REPLACE FUNCTION create_schedule_event(
    p_title TEXT,
    p_category schedule_category,
    p_event_date DATE,
    p_event_time TIME,
    p_duration TEXT,
    p_description TEXT DEFAULT NULL,
    p_location TEXT DEFAULT NULL,
    p_color TEXT DEFAULT '#7B6BFB',
    p_is_recurring BOOLEAN DEFAULT false,
    p_recurring_pattern TEXT DEFAULT NULL,
    p_linked_task_id UUID DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
    new_event_id UUID;
    result JSON;
BEGIN
    INSERT INTO public.schedule_events (
        user_id, title, category, event_date, event_time,
        duration, description, location, color,
        is_recurring, recurring_pattern, linked_task_id
    )
    VALUES (
        auth.uid(), p_title, p_category, p_event_date, p_event_time,
        p_duration, p_description, p_location, p_color,
        p_is_recurring, p_recurring_pattern, p_linked_task_id
    )
    RETURNING id INTO new_event_id;
    
    SELECT get_schedule_event(new_event_id) INTO result;
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update a schedule event
CREATE OR REPLACE FUNCTION update_schedule_event(
    p_event_id UUID,
    p_title TEXT DEFAULT NULL,
    p_category schedule_category DEFAULT NULL,
    p_event_date DATE DEFAULT NULL,
    p_event_time TIME DEFAULT NULL,
    p_duration TEXT DEFAULT NULL,
    p_description TEXT DEFAULT NULL,
    p_location TEXT DEFAULT NULL,
    p_color TEXT DEFAULT NULL,
    p_is_recurring BOOLEAN DEFAULT NULL,
    p_recurring_pattern TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    UPDATE public.schedule_events
    SET 
        title = COALESCE(p_title, title),
        category = COALESCE(p_category, category),
        event_date = COALESCE(p_event_date, event_date),
        event_time = COALESCE(p_event_time, event_time),
        duration = COALESCE(p_duration, duration),
        description = COALESCE(p_description, description),
        location = COALESCE(p_location, location),
        color = COALESCE(p_color, color),
        is_recurring = COALESCE(p_is_recurring, is_recurring),
        recurring_pattern = COALESCE(p_recurring_pattern, recurring_pattern)
    WHERE id = p_event_id AND user_id = auth.uid();
    
    SELECT get_schedule_event(p_event_id) INTO result;
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Delete a schedule event
CREATE OR REPLACE FUNCTION delete_schedule_event(p_event_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM public.schedule_events
    WHERE id = p_event_id AND user_id = auth.uid();
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Delete all events for a specific date
CREATE OR REPLACE FUNCTION clear_schedule_for_date(p_date DATE)
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM public.schedule_events
    WHERE user_id = auth.uid() AND event_date = p_date;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get dates with events (for calendar dots)
CREATE OR REPLACE FUNCTION get_dates_with_events(
    p_start_date DATE,
    p_end_date DATE
)
RETURNS JSON AS $$
BEGIN
    RETURN COALESCE(
        (SELECT json_agg(DISTINCT event_date ORDER BY event_date)
         FROM public.schedule_events
         WHERE user_id = auth.uid()
             AND event_date BETWEEN p_start_date AND p_end_date),
        '[]'::json
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- USER METRICS FUNCTIONS
-- ============================================

-- Calculate and update user balance/metrics
CREATE OR REPLACE FUNCTION calculate_user_balance()
RETURNS JSON AS $$
DECLARE
    v_academics_count INTEGER;
    v_wellness_count INTEGER;
    v_work_count INTEGER;
    v_social_count INTEGER;
    v_total_incomplete INTEGER;
    v_burnout_risk burnout_risk;
    v_balance_status balance_status;
    v_stress INTEGER;
    v_energy INTEGER;
    result JSON;
BEGIN
    -- Count incomplete tasks by category
    SELECT 
        COUNT(*) FILTER (WHERE category = 'Academics'),
        COUNT(*) FILTER (WHERE category = 'Wellness'),
        COUNT(*) FILTER (WHERE category = 'Work'),
        COUNT(*) FILTER (WHERE category = 'Social'),
        COUNT(*)
    INTO v_academics_count, v_wellness_count, v_work_count, v_social_count, v_total_incomplete
    FROM public.tasks
    WHERE user_id = auth.uid() AND completed = false;
    
    -- Calculate burnout risk
    IF v_academics_count + v_work_count > 10 THEN
        v_burnout_risk := 'High';
    ELSIF v_academics_count + v_work_count > 6 THEN
        v_burnout_risk := 'Medium';
    ELSE
        v_burnout_risk := 'Low';
    END IF;
    
    -- Calculate balance status
    IF v_total_incomplete = 0 THEN
        v_balance_status := 'RELAXED';
    ELSIF (v_academics_count + v_work_count) > 8 AND v_wellness_count < 2 THEN
        v_balance_status := 'OVERLOADED';
    ELSE
        v_balance_status := 'BALANCED';
    END IF;
    
    -- Calculate stress and energy based on workload
    v_stress := LEAST(100, (v_academics_count + v_work_count) * 8);
    v_energy := GREATEST(20, 100 - (v_total_incomplete * 5));
    
    -- Update user metrics
    UPDATE public.user_metrics
    SET 
        burnout_risk = v_burnout_risk,
        balance_status = v_balance_status,
        stress = v_stress,
        energy = v_energy,
        last_calculated_at = NOW()
    WHERE user_id = auth.uid();
    
    -- Return updated metrics
    SELECT json_build_object(
        'energy', v_energy,
        'stress', v_stress,
        'burnout_risk', v_burnout_risk,
        'balance_status', v_balance_status,
        'task_counts', json_build_object(
            'academics', v_academics_count,
            'wellness', v_wellness_count,
            'work', v_work_count,
            'social', v_social_count,
            'total_incomplete', v_total_incomplete
        )
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get user metrics
CREATE OR REPLACE FUNCTION get_user_metrics()
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'energy', energy,
        'stress', stress,
        'burnout_risk', burnout_risk,
        'balance_status', balance_status,
        'last_calculated_at', last_calculated_at
    ) INTO result
    FROM public.user_metrics
    WHERE user_id = auth.uid();
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update user metrics manually
CREATE OR REPLACE FUNCTION update_user_metrics(
    p_energy INTEGER DEFAULT NULL,
    p_stress INTEGER DEFAULT NULL
)
RETURNS JSON AS $$
BEGIN
    UPDATE public.user_metrics
    SET 
        energy = COALESCE(p_energy, energy),
        stress = COALESCE(p_stress, stress)
    WHERE user_id = auth.uid();
    
    RETURN get_user_metrics();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- ANALYTICS FUNCTIONS
-- ============================================

-- Get weekly productivity stats
CREATE OR REPLACE FUNCTION get_weekly_stats()
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'tasks_completed', (
            SELECT COUNT(*)
            FROM public.tasks
            WHERE user_id = auth.uid()
                AND completed = true
                AND completed_at >= CURRENT_DATE - INTERVAL '7 days'
        ),
        'tasks_created', (
            SELECT COUNT(*)
            FROM public.tasks
            WHERE user_id = auth.uid()
                AND created_at >= CURRENT_DATE - INTERVAL '7 days'
        ),
        'events_attended', (
            SELECT COUNT(*)
            FROM public.schedule_events
            WHERE user_id = auth.uid()
                AND event_date BETWEEN CURRENT_DATE - INTERVAL '7 days' AND CURRENT_DATE
        ),
        'daily_breakdown', (
            SELECT COALESCE(json_agg(
                json_build_object(
                    'date', d.date,
                    'completed', COALESCE(t.completed_count, 0),
                    'created', COALESCE(t.created_count, 0)
                ) ORDER BY d.date
            ), '[]'::json)
            FROM generate_series(
                CURRENT_DATE - INTERVAL '6 days',
                CURRENT_DATE,
                '1 day'::interval
            ) AS d(date)
            LEFT JOIN (
                SELECT 
                    DATE(completed_at) as date,
                    COUNT(*) as completed_count,
                    0 as created_count
                FROM public.tasks
                WHERE user_id = auth.uid()
                    AND completed = true
                    AND completed_at >= CURRENT_DATE - INTERVAL '7 days'
                GROUP BY DATE(completed_at)
            ) t ON d.date = t.date
        ),
        'category_distribution', (
            SELECT json_build_object(
                'Academics', COUNT(*) FILTER (WHERE category = 'Academics'),
                'Work', COUNT(*) FILTER (WHERE category = 'Work'),
                'Wellness', COUNT(*) FILTER (WHERE category = 'Wellness'),
                'Social', COUNT(*) FILTER (WHERE category = 'Social')
            )
            FROM public.tasks
            WHERE user_id = auth.uid()
                AND completed = true
                AND completed_at >= CURRENT_DATE - INTERVAL '7 days'
        )
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- UTILITY FUNCTIONS
-- ============================================

-- Search across tasks and events
CREATE OR REPLACE FUNCTION global_search(p_query TEXT, p_limit INTEGER DEFAULT 20)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'tasks', (
            SELECT COALESCE(json_agg(
                json_build_object(
                    'id', id,
                    'title', title,
                    'category', category,
                    'type', 'task'
                )
            ), '[]'::json)
            FROM public.tasks
            WHERE user_id = auth.uid()
                AND title ILIKE '%' || p_query || '%'
            LIMIT p_limit
        ),
        'events', (
            SELECT COALESCE(json_agg(
                json_build_object(
                    'id', id,
                    'title', title,
                    'category', category,
                    'event_date', event_date,
                    'type', 'event'
                )
            ), '[]'::json)
            FROM public.schedule_events
            WHERE user_id = auth.uid()
                AND title ILIKE '%' || p_query || '%'
            LIMIT p_limit
        )
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- GRANTS (for API access via Supabase client)
-- ============================================

-- Grant execute on all functions to authenticated users
GRANT EXECUTE ON FUNCTION get_user_profile() TO authenticated;
GRANT EXECUTE ON FUNCTION update_user_profile(TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION update_user_preferences(theme_mode, BOOLEAN, INTEGER, INTEGER, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_tasks(task_category, priority_level, BOOLEAN, TEXT, TEXT, TEXT, INTEGER, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_task(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION create_task(TEXT, task_category, priority_level, TEXT, DATE, TIME, TEXT, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION update_task(UUID, TEXT, task_category, priority_level, TEXT, DATE, TIME, TEXT, INTEGER, BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION delete_task(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION toggle_task_completion(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_task_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION get_schedule_events(DATE, DATE, schedule_category, INTEGER, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_events_by_date(DATE) TO authenticated;
GRANT EXECUTE ON FUNCTION get_schedule_event(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION create_schedule_event(TEXT, schedule_category, DATE, TIME, TEXT, TEXT, TEXT, TEXT, BOOLEAN, TEXT, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION update_schedule_event(UUID, TEXT, schedule_category, DATE, TIME, TEXT, TEXT, TEXT, TEXT, BOOLEAN, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION delete_schedule_event(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION clear_schedule_for_date(DATE) TO authenticated;
GRANT EXECUTE ON FUNCTION get_dates_with_events(DATE, DATE) TO authenticated;
GRANT EXECUTE ON FUNCTION calculate_user_balance() TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_metrics() TO authenticated;
GRANT EXECUTE ON FUNCTION update_user_metrics(INTEGER, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_weekly_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION global_search(TEXT, INTEGER) TO authenticated;

-- ============================================
-- END OF SCHEMA
-- ============================================

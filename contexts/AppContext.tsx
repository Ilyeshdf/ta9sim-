import React, { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import { lightTheme, ThemeColors } from '../constants/theme';
import { db, supabase } from '../lib/supabase';

// Types
export interface Task {
    id: string;
    title: string;
    category: 'Academics' | 'Work' | 'Wellness' | 'Social';
    priority: 'Low' | 'Medium' | 'High';
    completed: boolean;
    dueDate?: string;
    time?: string;
    duration?: string;
    effortLevel?: number;
    description?: string;
}

export interface ScheduleEvent {
    id: string;
    date: string; // ISO date string YYYY-MM-DD
    time: string;
    title: string;
    category: 'Academics' | 'Work' | 'Wellness' | 'Social' | 'Break';
    location?: string;
    duration: string;
    color: string;
}

export interface AIMessage {
    id: string;
    role: 'user' | 'agent';
    content: string;
    timestamp: Date;
}

export interface UserMetrics {
    energy: number;
    stress: number;
    burnoutRisk: 'Low' | 'Medium' | 'High';
}

export type BalanceStatus = 'BALANCED' | 'OVERLOADED' | 'RELAXED';
export type WorkflowStage = 'welcome' | 'input' | 'processing' | 'result' | 'edit';
export type ThemeMode = 'light';

interface AppContextType {
    // User data
    userName: string;
    setUserName: (name: string) => void;

    // Tasks
    tasks: Task[];
    addTask: (task: Omit<Task, 'id'>) => void;
    updateTask: (id: string, updates: Partial<Task>) => void;
    deleteTask: (id: string) => void;
    toggleTaskCompletion: (id: string) => void;
    loadTasks: () => Promise<void>;
    isLoadingTasks: boolean;

    // Schedule
    schedule: ScheduleEvent[];
    setSchedule: (events: ScheduleEvent[]) => void;
    generateSchedule: (date?: Date) => void;
    getEventsForDate: (date: Date) => ScheduleEvent[];
    addEvent: (event: Omit<ScheduleEvent, 'id'>) => void;
    loadSchedule: () => Promise<void>;

    // Metrics
    metrics: UserMetrics;
    updateMetrics: (updates: Partial<UserMetrics>) => void;

    // Balance
    balanceStatus: BalanceStatus;
    calculateBalance: () => void;

    // AI Agent
    aiMessages: AIMessage[];
    addAIMessage: (message: Omit<AIMessage, 'id' | 'timestamp'>) => void;
    agentVisible: boolean;
    setAgentVisible: (visible: boolean) => void;

    // Workflow
    workflowStage: WorkflowStage;
    setWorkflowStage: (stage: WorkflowStage) => void;
    isProcessing: boolean;
    setIsProcessing: (processing: boolean) => void;

    // Demo mode
    demoMode: boolean;
    toggleDemoMode: () => void;
    loadDemoData: () => void;

    // Theme
    themeMode: ThemeMode;
    setThemeMode: (mode: ThemeMode) => void;
    isDark: boolean;
    theme: ThemeColors;

    // Search
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    filteredTasks: Task[];

    // Sync status
    isSyncing: boolean;
    lastSyncTime: Date | null;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useApp must be used within AppProvider');
    }
    return context;
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [userName, setUserName] = useState('Alex');
    const [tasks, setTasks] = useState<Task[]>([]);
    const [isLoadingTasks, setIsLoadingTasks] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);
    const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);

    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const tomorrowStr = new Date(today.getTime() + 86400000).toISOString().split('T')[0];
    const dayAfterStr = new Date(today.getTime() + 86400000 * 2).toISOString().split('T')[0];

    const [schedule, setSchedule] = useState<ScheduleEvent[]>([]);

    const [metrics, setMetrics] = useState<UserMetrics>({
        energy: 85,
        stress: 20,
        burnoutRisk: 'Low',
    });

    const [balanceStatus, setBalanceStatus] = useState<BalanceStatus>('BALANCED');
    const [aiMessages, setAIMessages] = useState<AIMessage[]>([]);
    const [agentVisible, setAgentVisible] = useState(false);
    const [workflowStage, setWorkflowStage] = useState<WorkflowStage>('result');
    const [isProcessing, setIsProcessing] = useState(false);
    const [demoMode, setDemoMode] = useState(false);
    const [themeMode, setThemeMode] = useState<ThemeMode>('light');
    const [searchQuery, setSearchQuery] = useState('');

    // Force light mode only
    const isDark = false;
    const theme = lightTheme;

    // Filtered tasks for search
    const filteredTasks = tasks.filter(task =>
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Load tasks from Supabase
    const loadTasks = useCallback(async () => {
        setIsLoadingTasks(true);
        try {
            const { data: session } = await supabase.auth.getSession();
            if (session?.session) {
                const { data, error } = await db.getTasks();
                if (!error && data) {
                    const mappedTasks: Task[] = data.map((t: any) => ({
                        id: t.id,
                        title: t.title,
                        category: t.category,
                        priority: t.priority,
                        completed: t.completed,
                        dueDate: t.due_date,
                        time: t.due_time,
                        duration: t.duration,
                        effortLevel: t.effort_level,
                        description: t.description,
                    }));
                    setTasks(mappedTasks);
                    setLastSyncTime(new Date());
                }
            } else {
                // Load demo data if not authenticated
                loadLocalDemoTasks();
            }
        } catch (err) {
            console.error('Failed to load tasks:', err);
            loadLocalDemoTasks();
        } finally {
            setIsLoadingTasks(false);
        }
    }, []);

    const loadLocalDemoTasks = () => {
        setTasks([
            { id: '1', title: 'Finish Econ 101 Essay', category: 'Academics', priority: 'High', completed: false, dueDate: 'Tomorrow' },
            { id: '2', title: '30 Min Gym Session', category: 'Wellness', priority: 'Medium', completed: false },
            { id: '3', title: 'Submit Shift Availability', category: 'Work', priority: 'Medium', completed: false },
        ]);
    };

    // Load schedule from Supabase
    const loadSchedule = useCallback(async () => {
        try {
            const { data: session } = await supabase.auth.getSession();
            if (session?.session) {
                const startDate = new Date().toISOString().split('T')[0];
                const endDate = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];
                const { data, error } = await db.getScheduleEvents({ startDate, endDate });
                if (!error && data) {
                    const mappedEvents: ScheduleEvent[] = data.map((e: any) => ({
                        id: e.id,
                        date: e.event_date,
                        time: e.event_time,
                        title: e.title,
                        category: e.category,
                        location: e.location,
                        duration: e.duration,
                        color: e.color,
                    }));
                    setSchedule(mappedEvents);
                }
            } else {
                loadLocalDemoSchedule();
            }
        } catch (err) {
            console.error('Failed to load schedule:', err);
            loadLocalDemoSchedule();
        }
    }, []);

    const loadLocalDemoSchedule = () => {
        const todayStr = new Date().toISOString().split('T')[0];
        const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split('T')[0];
        setSchedule([
            { id: 's1', date: todayStr, time: '09:00 AM', title: 'Lecture: Microeconomics 101', category: 'Academics', location: 'Room 304', duration: '2h', color: '#3B82F6' },
            { id: 's2', date: todayStr, time: '11:00 AM', title: 'Deep Work: Study Block', category: 'Academics', duration: '2h', color: '#7C3AED' },
            { id: 's3', date: todayStr, time: '01:00 PM', title: 'Lunch with Sarah', category: 'Social', location: 'Campus Cafe', duration: '1h', color: '#F97316' },
            { id: 's4', date: tomorrowStr, time: '10:00 AM', title: 'Team Meeting', category: 'Work', location: 'Conference Room B', duration: '1h', color: '#9061F9' },
        ]);
    };

    // Initialize data on mount
    useEffect(() => {
        loadTasks();
        loadSchedule();
    }, []);

    // Listen for auth state changes
    useEffect(() => {
        const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_IN') {
                loadTasks();
                loadSchedule();
            } else if (event === 'SIGNED_OUT') {
                loadLocalDemoTasks();
                loadLocalDemoSchedule();
            }
        });

        return () => {
            authListener.subscription.unsubscribe();
        };
    }, []);

    // Task operations
    const addTask = async (task: Omit<Task, 'id'>) => {
        const newTask = {
            ...task,
            id: Date.now().toString(),
        };
        setTasks(prev => [...prev, newTask]);
        calculateBalance();

        // Sync to Supabase if authenticated
        try {
            const { data: session } = await supabase.auth.getSession();
            if (session?.session) {
                setIsSyncing(true);
                await db.createTask({
                    title: task.title,
                    category: task.category,
                    priority: task.priority,
                    description: task.description,
                    dueDate: task.dueDate,
                    dueTime: task.time,
                    duration: task.duration,
                    effortLevel: task.effortLevel,
                });
                await loadTasks(); // Refresh to get server-generated ID
                setIsSyncing(false);
            }
        } catch (err) {
            console.error('Failed to sync task:', err);
            setIsSyncing(false);
        }

        // AI response
        if (tasks.length > 8) {
            setTimeout(() => {
                addAIMessage({
                    role: 'agent',
                    content: "I notice you're building up quite a task list! Would you like me to help prioritize and create a balanced schedule?",
                });
            }, 1000);
        }
    };

    const updateTask = async (id: string, updates: Partial<Task>) => {
        setTasks(prev => prev.map(task => (task.id === id ? { ...task, ...updates } : task)));
        calculateBalance();

        // Sync to Supabase
        try {
            const { data: session } = await supabase.auth.getSession();
            if (session?.session) {
                await db.updateTask(id, {
                    title: updates.title,
                    category: updates.category,
                    priority: updates.priority,
                    description: updates.description,
                    dueDate: updates.dueDate,
                    dueTime: updates.time,
                    duration: updates.duration,
                    effortLevel: updates.effortLevel,
                    completed: updates.completed,
                });
            }
        } catch (err) {
            console.error('Failed to update task:', err);
        }
    };

    const deleteTask = async (id: string) => {
        setTasks(prev => prev.filter(task => task.id !== id));
        calculateBalance();

        // Sync to Supabase
        try {
            const { data: session } = await supabase.auth.getSession();
            if (session?.session) {
                await db.deleteTask(id);
            }
        } catch (err) {
            console.error('Failed to delete task:', err);
        }
    };

    const toggleTaskCompletion = async (id: string) => {
        let completedTask: Task | undefined;
        setTasks(prev => prev.map(task => {
            if (task.id === id) {
                completedTask = { ...task, completed: !task.completed };
                return completedTask;
            }
            return task;
        }));
        calculateBalance();

        // AI congratulations
        if (completedTask?.completed) {
            setTimeout(() => {
                addAIMessage({
                    role: 'agent',
                    content: `Great job completing "${completedTask?.title}"! Keep up the momentum! 🎉`,
                });
            }, 500);
        }

        // Sync to Supabase
        try {
            const { data: session } = await supabase.auth.getSession();
            if (session?.session) {
                await db.toggleTaskCompletion(id);
            }
        } catch (err) {
            console.error('Failed to toggle task:', err);
        }
    };

    // Balance calculation
    const calculateBalance = () => {
        const incompleteTasks = tasks.filter(t => !t.completed);
        const academics = incompleteTasks.filter(t => t.category === 'Academics').length;
        const wellness = incompleteTasks.filter(t => t.category === 'Wellness').length;
        const social = incompleteTasks.filter(t => t.category === 'Social').length;
        const total = incompleteTasks.length;

        if (total === 0) {
            setBalanceStatus('RELAXED');
        } else if (academics > 8 && wellness < 2) {
            setBalanceStatus('OVERLOADED');

            // AI warning
            setTimeout(() => {
                addAIMessage({
                    role: 'agent',
                    content: "⚠️ Your workload seems heavy with many academic tasks. I recommend adding some wellness activities to maintain balance!",
                });
            }, 800);
        } else if (total < 5 && wellness >= 1) {
            setBalanceStatus('BALANCED');
        } else {
            setBalanceStatus('BALANCED');
        }

        // Update burnout risk
        const newBurnoutRisk = academics > 10 ? 'High' : academics > 6 ? 'Medium' : 'Low';
        setMetrics(prev => ({ ...prev, burnoutRisk: newBurnoutRisk }));
    };

    // Schedule generation
    const generateSchedule = (date?: Date) => {
        setIsProcessing(true);
        const targetDate = date || new Date();
        const dateStr = targetDate.toISOString().split('T')[0];

        // Simulate AI processing
        setTimeout(() => {
            const incompleteTasks = tasks.filter(t => !t.completed);
            const newEvents: ScheduleEvent[] = [];
            let currentHour = 9;

            // Group by category
            const academicTasks = incompleteTasks.filter(t => t.category === 'Academics');
            const wellnessTasks = incompleteTasks.filter(t => t.category === 'Wellness');
            const workTasks = incompleteTasks.filter(t => t.category === 'Work');

            // Add morning academic block
            if (academicTasks.length > 0) {
                newEvents.push({
                    id: 'gen_' + Date.now(),
                    date: dateStr,
                    time: `${currentHour.toString().padStart(2, '0')}:00 AM`,
                    title: academicTasks[0].title,
                    category: 'Academics',
                    duration: '2h',
                    color: '#3B82F6',
                });
                currentHour += 2;
            }

            // Add break
            newEvents.push({
                id: 'break_' + Date.now(),
                date: dateStr,
                time: `${currentHour.toString().padStart(2, '0')}:00 AM`,
                title: 'Break & Recharge',
                category: 'Break',
                duration: '30m',
                color: '#gray',
            });
            currentHour += 1;

            // Add work task
            if (workTasks.length > 0) {
                newEvents.push({
                    id: 'gen_work_' + Date.now(),
                    date: dateStr,
                    time: `${currentHour.toString().padStart(2, '0')}:00 ${currentHour >= 12 ? 'PM' : 'AM'}`,
                    title: workTasks[0].title,
                    category: 'Work',
                    duration: '2h',
                    color: '#9061F9',
                });
                currentHour += 2;
            }

            // Add wellness
            if (wellnessTasks.length > 0) {
                const isPM = currentHour >= 12;
                const displayHour = isPM && currentHour > 12 ? currentHour - 12 : currentHour;
                newEvents.push({
                    id: 'gen_wellness_' + Date.now(),
                    date: dateStr,
                    time: `${displayHour.toString().padStart(2, '0')}:00 ${isPM ? 'PM' : 'AM'}`,
                    title: wellnessTasks[0].title,
                    category: 'Wellness',
                    duration: '1h',
                    color: '#22C997',
                });
            }

            // Keep events from other dates and add new ones
            setSchedule(prev => [
                ...prev.filter(e => e.date !== dateStr),
                ...newEvents
            ]);
            setIsProcessing(false);
            setWorkflowStage('result');

            addAIMessage({
                role: 'agent',
                content: `I've created a balanced schedule for ${targetDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}! I prioritized your high-energy hours for academics and included wellness breaks.`,
            });
        }, 2500);
    };

    // Get events for a specific date
    const getEventsForDate = (date: Date): ScheduleEvent[] => {
        const dateStr = date.toISOString().split('T')[0];
        return schedule.filter(e => e.date === dateStr).sort((a, b) => {
            // Sort by time
            const timeA = a.time.replace(/[^0-9:]/g, '');
            const timeB = b.time.replace(/[^0-9:]/g, '');
            return timeA.localeCompare(timeB);
        });
    };

    // Add a single event
    const addEvent = (event: Omit<ScheduleEvent, 'id'>) => {
        const newEvent: ScheduleEvent = {
            ...event,
            id: 'evt_' + Date.now(),
        };
        setSchedule(prev => [...prev, newEvent]);
    };

    // AI messages
    const addAIMessage = (message: Omit<AIMessage, 'id' | 'timestamp'>) => {
        const newMessage: AIMessage = {
            ...message,
            id: Date.now().toString(),
            timestamp: new Date(),
        };
        setAIMessages(prev => [...prev, newMessage]);
    };

    // Metrics update
    const updateMetrics = (updates: Partial<UserMetrics>) => {
        setMetrics(prev => ({ ...prev, ...updates }));
    };

    // Demo mode
    const toggleDemoMode = () => {
        setDemoMode(!demoMode);
    };

    const loadDemoData = () => {
        const demoTasks: Task[] = [
            { id: 'd1', title: 'Calculus Problem Set', category: 'Academics', priority: 'High', completed: false },
            { id: 'd2', title: 'Chemistry Lab Report', category: 'Academics', priority: 'High', completed: false },
            { id: 'd3', title: 'Read Economics Chapter 5', category: 'Academics', priority: 'Medium', completed: false },
            { id: 'd4', title: '30 Min Morning Run', category: 'Wellness', priority: 'High', completed: false },
            { id: 'd5', title: 'Meditation Session', category: 'Wellness', priority: 'Medium', completed: false },
            { id: 'd6', title: 'Part-time Job Shift', category: 'Work', priority: 'High', completed: false },
            { id: 'd7', title: 'Coffee with Study Group', category: 'Social', priority: 'Low', completed: false },
            { id: 'd8', title: 'Physics Practice Problems', category: 'Academics', priority: 'Medium', completed: false },
        ];

        setTasks(demoTasks);
        setWorkflowStage('input');

        addAIMessage({
            role: 'agent',
            content: "Welcome to Demo Mode! I've loaded a realistic student schedule. Click 'Generate Balanced Day' to see me create an optimized plan!",
        });

        calculateBalance();
    };

    const value: AppContextType = {
        userName,
        setUserName,
        tasks,
        addTask,
        updateTask,
        deleteTask,
        toggleTaskCompletion,
        loadTasks,
        isLoadingTasks,
        schedule,
        setSchedule,
        generateSchedule,
        getEventsForDate,
        addEvent,
        loadSchedule,
        metrics,
        updateMetrics,
        balanceStatus,
        calculateBalance,
        aiMessages,
        addAIMessage,
        agentVisible,
        setAgentVisible,
        workflowStage,
        setWorkflowStage,
        isProcessing,
        setIsProcessing,
        demoMode,
        toggleDemoMode,
        loadDemoData,
        themeMode,
        setThemeMode,
        isDark,
        theme,
        searchQuery,
        setSearchQuery,
        filteredTasks,
        isSyncing,
        lastSyncTime,
    };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

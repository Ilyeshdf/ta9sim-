import React, { createContext, useContext, useState, ReactNode } from 'react';

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

    // Schedule
    schedule: ScheduleEvent[];
    setSchedule: (events: ScheduleEvent[]) => void;
    generateSchedule: () => void;

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
    const [tasks, setTasks] = useState<Task[]>([
        {
            id: '1',
            title: 'Finish Econ 101 Essay',
            category: 'Academics',
            priority: 'High',
            completed: false,
            dueDate: 'Tomorrow',
        },
        {
            id: '2',
            title: '30 Min Gym Session',
            category: 'Wellness',
            priority: 'Medium',
            completed: false,
        },
        {
            id: '3',
            title: 'Submit Shift Availability',
            category: 'Work',
            priority: 'Medium',
            completed: false,
        },
    ]);

    const [schedule, setSchedule] = useState<ScheduleEvent[]>([
        {
            id: 's1',
            time: '09:00 AM',
            title: 'Lecture: Microeconomics 101',
            category: 'Academics',
            location: 'Room 304',
            duration: '2h',
            color: '#3B82F6',
        },
        {
            id: 's2',
            time: '11:00 AM',
            title: 'Deep Work: Study Block',
            category: 'Academics',
            duration: '2h',
            color: '#7C3AED',
        },
        {
            id: 's3',
            time: '01:00 PM',
            title: 'Lunch with Sarah',
            category: 'Social',
            location: 'Campus Cafe',
            duration: '1h',
            color: '#F97316',
        },
    ]);

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

    // Task operations
    const addTask = (task: Omit<Task, 'id'>) => {
        const newTask = {
            ...task,
            id: Date.now().toString(),
        };
        setTasks([...tasks, newTask]);
        calculateBalance();

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

    const updateTask = (id: string, updates: Partial<Task>) => {
        setTasks(tasks.map(task => (task.id === id ? { ...task, ...updates } : task)));
        calculateBalance();
    };

    const deleteTask = (id: string) => {
        setTasks(tasks.filter(task => task.id !== id));
        calculateBalance();
    };

    const toggleTaskCompletion = (id: string) => {
        setTasks(tasks.map(task => {
            if (task.id === id) {
                const newCompleted = !task.completed;

                // AI congratulations
                if (newCompleted) {
                    setTimeout(() => {
                        addAIMessage({
                            role: 'agent',
                            content: `Great job completing "${task.title}"! Keep up the momentum! 🎉`,
                        });
                    }, 500);
                }

                return { ...task, completed: newCompleted };
            }
            return task;
        }));
        calculateBalance();
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
    const generateSchedule = () => {
        setIsProcessing(true);

        // Simulate AI processing
        setTimeout(() => {
            const incompleteTasks = tasks.filter(t => !t.completed);
            const newSchedule: ScheduleEvent[] = [];
            let currentHour = 9;

            // Group by category
            const academicTasks = incompleteTasks.filter(t => t.category === 'Academics');
            const wellnessTasks = incompleteTasks.filter(t => t.category === 'Wellness');
            const workTasks = incompleteTasks.filter(t => t.category === 'Work');

            // Add morning academic block
            if (academicTasks.length > 0) {
                newSchedule.push({
                    id: 'gen_' + Date.now(),
                    time: `${currentHour.toString().padStart(2, '0')}:00 AM`,
                    title: academicTasks[0].title,
                    category: 'Academics',
                    duration: '2h',
                    color: '#3B82F6',
                });
                currentHour += 2;
            }

            // Add break
            newSchedule.push({
                id: 'break_' + Date.now(),
                time: `${currentHour.toString().padStart(2, '0')}:00 AM`,
                title: 'Break & Recharge',
                category: 'Break',
                duration: '30m',
                color: '#gray',
            });
            currentHour += 0.5;

            // Add wellness
            if (wellnessTasks.length > 0) {
                const isPM = currentHour >= 12;
                const displayHour = isPM ? currentHour - 12 : currentHour;
                newSchedule.push({
                    id: 'gen_wellness_' + Date.now(),
                    time: `${Math.floor(displayHour).toString().padStart(2, '0')}:${currentHour % 1 === 0.5 ? '30' : '00'} ${isPM ? 'PM' : 'AM'}`,
                    title: wellnessTasks[0].title,
                    category: 'Wellness',
                    duration: '1h',
                    color: '#10B981',
                });
            }

            setSchedule(newSchedule);
            setIsProcessing(false);
            setWorkflowStage('result');

            addAIMessage({
                role: 'agent',
                content: "I've created a balanced schedule for you! I prioritized your high-energy hours for academics and included wellness breaks. How does this look?",
            });
        }, 2500);
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
        schedule,
        setSchedule,
        generateSchedule,
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
    };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

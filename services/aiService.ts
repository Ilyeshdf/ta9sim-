import { ENDPOINTS } from '../config/api';
import { ScheduleEvent, Task, UserMetrics } from '../contexts/AppContext';
import apiClient, { ApiResponse } from './api';
import { AIAgentResponse, documentService, PlanningData } from './documentService';
import { AIRecommendation } from './recommendationService';

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

// Three AI Agents System Interfaces

// Agent 1: PDF Planning Reader Response
export interface PDFExtractionResponse {
  success: boolean;
  extractedData: PlanningData;
  confidence: number;
  processingTime: number;
}

// Agent 2: Daily Priority Decision Maker Response
export interface PriorityAnalysisResponse {
  topPriorityTask: string;
  urgencyScore: number;
  confidenceLevel: number;
  moduleImportance: 'high' | 'medium' | 'low';
  reasoning: {
    deadlineProximity: string;
    moduleWeight: string;
    workloadBalance: string;
  };
}

// Agent 3: Student Decision Advisor Response
export interface StudentAdvisorResponse {
  recommendation: string; // 1-2 concise sentences
  actionableSteps: string[];
  estimatedDuration: string;
  confidence: number;
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

  // ============================================
  // THREE AI AGENTS SYSTEM
  // ============================================

  /**
   * Agent 1: PDF Planning Reader
   * Extracts academic planning information from PDF documents
   * Uses CrewAI PDF Planning Reader agent for document understanding
   */
  async extractPlanningFromPDF(pdfUri: string): Promise<PDFExtractionResponse> {
    // This is now handled by the Python CrewAI service
    // The implementation is in the Python server at crewai_project/server.py
    
    // Mock implementation for now - will be replaced with actual API call
    return {
      success: true,
      extractedData: {
        classes: [],
        exams: [],
        assignments: [],
        commitments: [],
        modules: [],
      },
      confidence: 0.95,
      processingTime: 2500,
    };
  },

  /**
   * Agent 2: Daily Priority Decision Maker
   * Analyzes extracted planning + current tasks to determine priorities
   * Weighs deadline urgency, confidence level, and module importance
   * Uses CrewAI Daily Priority Decision Maker agent
   */
  async analyzeDailyPriorities(
    planningData: PlanningData,
    currentTasks: Task[],
    userMetrics?: UserMetrics
  ): Promise<PriorityAnalysisResponse> {
    // This is now handled by the Python CrewAI service
    // The implementation is in the Python server at crewai_project/server.py
    
    // Mock implementation for now - will be replaced with actual API call
    return {
      topPriorityTask: 'Complete Data Structures assignment',
      urgencyScore: 0.92,
      confidenceLevel: 0.88,
      moduleImportance: 'high',
      reasoning: {
        deadlineProximity: 'Due tomorrow',
        moduleWeight: 'Core module worth 20% of final grade',
        workloadBalance: 'Manageable with current capacity',
      },
    };
  },

  /**
   * Agent 3: Student Decision Advisor
   * Distills analysis into 1-2 clear, actionable sentences
   * Provides immediate next steps for the student
   * Uses CrewAI Student Decision Advisor agent
   */
  async generateStudentRecommendation(
    priorityAnalysis: PriorityAnalysisResponse,
    planningContext: PlanningData
  ): Promise<StudentAdvisorResponse> {
    // This is now handled by the Python CrewAI service
    // The implementation is in the Python server at crewai_project/server.py
    
    // Mock implementation for now - will be replaced with actual API call
    return {
      recommendation: 'Focus on Data Structures assignment today. Your exam is in 3 days, and this assignment counts 20% toward your final grade.',
      actionableSteps: [
        'Start with binary tree implementation',
        'Test edge cases thoroughly',
        'Submit before 11:59 PM tonight',
      ],
      estimatedDuration: '3-4 hours',
      confidence: 0.92,
    };
  },

  /**
   * Orchestrate all three agents to generate daily recommendation
   * This is the main entry point for the AI system
   * Now uses the Python CrewAI backend service
   */
  async generateDailyRecommendation(
    planningData: PlanningData,
    currentTasks: Task[],
    userMetrics?: UserMetrics
  ): Promise<AIRecommendation> {
    try {
      // Get the most recent document for PDF processing
      const recentDoc = documentService.getMostRecentDocument();
      
      if (!recentDoc) {
        throw new Error('No document available for AI processing');
      }
      
      // Prepare data for the AI agent
      const aiInputData = {
        student_name: 'Student', // This would come from user context in a real implementation
        new_task_description: '',
        confidence_level: 'medium' as const,
        module_coefficient: 1,
        task_deadline: ''
      };
      
      // Call the Python CrewAI service through documentService
      const aiResponse: AIAgentResponse = await documentService.sendToAIAgent(
        { 
          uri: recentDoc.uri, 
          name: recentDoc.name, 
          size: recentDoc.size, 
          mimeType: 'application/pdf' 
        } as any,
        aiInputData
      );
      
      if (!aiResponse.success) {
        throw new Error(aiResponse.error || 'Failed to get AI recommendation');
      }

      // Create recommendation from AI response
      const recommendation: AIRecommendation = {
        id: Date.now().toString(),
        text: aiResponse.recommendation || 'Focus on your most important task today.',
        priority: aiResponse.priority || 'medium',
        confidence: aiResponse.confidence || 0.8,
        timestamp: new Date(),
        status: 'pending',
        context: {
          workload: aiResponse.estimatedDuration || 'Not specified',
          moduleImportance: aiResponse.moduleImportance || 'medium',
        },
        reasoning: JSON.stringify(aiResponse.reasoning || {}),
      };

      return recommendation;
    } catch (error) {
      console.error('Error generating daily recommendation:', error);
      throw error;
    }
  },
};

export default aiService;

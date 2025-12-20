// Recommendation Service - Manages AI-generated daily recommendations
import { PlanningData } from './documentService';

export interface AIRecommendation {
    id: string;
    text: string;
    priority: 'high' | 'medium' | 'low';
    confidence: number;
    timestamp: Date;
    status: 'pending' | 'accepted' | 'dismissed';
    context: {
        module?: string;
        deadline?: string;
        examDate?: string;
        workload?: string;
        moduleImportance?: 'high' | 'medium' | 'low';
    };
    reasoning?: string;
}

export interface DailyPriorityAnalysis {
    recommendedTasks: string[];
    urgencyScore: number;
    capacityAssessment: string;
    balanceStatus: 'balanced' | 'overloaded' | 'light';
}

class RecommendationService {
    private recommendations: Map<string, AIRecommendation> = new Map();
    private dailyRecommendation: AIRecommendation | null = null;

    /**
     * Generate today's priority recommendation using AI
     * This integrates all three AI agents:
     * 1. PDF Planning Reader (data from extracted planning)
     * 2. Daily Priority Decision Maker (weighs urgency, confidence, importance)
     * 3. Student Decision Advisor (distills into 1-2 clear sentences)
     */
    async generateDailyRecommendation(
        planningData: PlanningData,
        userTasks: any[],
        userContext?: any
    ): Promise<AIRecommendation> {
        // TODO: Call the three AI agents sequentially
        // 1. Extract relevant info from planning
        // 2. Analyze priorities based on deadlines, exams, workload
        // 3. Generate concise recommendation (1-2 sentences)

        // Mock implementation for now
        const recommendation: AIRecommendation = {
            id: Date.now().toString(),
            text: "Focus on Data Structures assignment today. Your exam is in 3 days, and this assignment counts 20% toward your final grade.",
            priority: 'high',
            confidence: 0.92,
            timestamp: new Date(),
            status: 'pending',
            context: {
                module: 'CS-301 - Data Structures',
                deadline: 'December 22, 2024',
                examDate: 'December 23, 2024',
                workload: '4 hours estimated',
                moduleImportance: 'high',
            },
            reasoning: 'Assignment deadline is tomorrow, related exam in 3 days, high module importance',
        };

        this.dailyRecommendation = recommendation;
        this.recommendations.set(recommendation.id, recommendation);
        
        return recommendation;
    }

    /**
     * Get today's recommended focus
     */
    getTodayRecommendation(): AIRecommendation | null {
        return this.dailyRecommendation;
    }

    /**
     * Get all recommendations (sorted by timestamp, newest first)
     */
    getAllRecommendations(): AIRecommendation[] {
        return Array.from(this.recommendations.values())
            .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    }

    /**
     * Get recommendations by status
     */
    getRecommendationsByStatus(status: 'pending' | 'accepted' | 'dismissed'): AIRecommendation[] {
        return this.getAllRecommendations().filter(rec => rec.status === status);
    }

    /**
     * Accept a recommendation
     */
    acceptRecommendation(id: string): void {
        const rec = this.recommendations.get(id);
        if (rec) {
            rec.status = 'accepted';
            this.recommendations.set(id, rec);
        }
    }

    /**
     * Dismiss a recommendation
     */
    dismissRecommendation(id: string): void {
        const rec = this.recommendations.get(id);
        if (rec) {
            rec.status = 'dismissed';
            this.recommendations.set(id, rec);
        }
    }

    /**
     * Analyze daily priorities (used by Daily Priority Decision Maker agent)
     */
    async analyzeDailyPriorities(
        planningData: PlanningData,
        tasks: any[]
    ): Promise<DailyPriorityAnalysis> {
        // TODO: Implement Daily Priority Decision Maker logic
        // - Weigh deadline urgency
        // - Consider confidence levels
        // - Evaluate module importance
        // - Assess current workload capacity

        return {
            recommendedTasks: [],
            urgencyScore: 0.8,
            capacityAssessment: 'You have 4 hours of available study time today',
            balanceStatus: 'balanced',
        };
    }

    /**
     * Calculate recommendation confidence
     */
    calculateConfidence(context: {
        daysUntilDeadline: number;
        moduleImportance: 'high' | 'medium' | 'low';
        taskComplexity: number;
        userCapacity: number;
    }): number {
        // TODO: Implement confidence calculation algorithm
        // Factors: proximity to deadline, importance, complexity, capacity

        let confidence = 0.5;

        // Deadline urgency (0-0.4)
        if (context.daysUntilDeadline <= 1) confidence += 0.4;
        else if (context.daysUntilDeadline <= 3) confidence += 0.3;
        else if (context.daysUntilDeadline <= 7) confidence += 0.2;

        // Module importance (0-0.3)
        if (context.moduleImportance === 'high') confidence += 0.3;
        else if (context.moduleImportance === 'medium') confidence += 0.2;
        else confidence += 0.1;

        // Capacity match (0-0.2)
        confidence += context.userCapacity * 0.2;

        return Math.min(confidence, 1.0);
    }

    /**
     * Get recommendation statistics
     */
    getStatistics(): {
        total: number;
        accepted: number;
        dismissed: number;
        pending: number;
        avgConfidence: number;
    } {
        const all = this.getAllRecommendations();
        const accepted = this.getRecommendationsByStatus('accepted');
        const dismissed = this.getRecommendationsByStatus('dismissed');
        const pending = this.getRecommendationsByStatus('pending');
        
        const avgConfidence = all.length > 0
            ? all.reduce((sum, rec) => sum + rec.confidence, 0) / all.length
            : 0;

        return {
            total: all.length,
            accepted: accepted.length,
            dismissed: dismissed.length,
            pending: pending.length,
            avgConfidence,
        };
    }

    /**
     * Clear old recommendations (keep last 30 days)
     */
    clearOldRecommendations(): void {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        for (const [id, rec] of this.recommendations) {
            if (rec.timestamp < thirtyDaysAgo) {
                this.recommendations.delete(id);
            }
        }
    }
}

export const recommendationService = new RecommendationService();
export default recommendationService;

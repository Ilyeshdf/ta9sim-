// Document Service - Handles PDF upload, storage, and extraction results
import * as DocumentPicker from 'expo-document-picker';

export interface AIAgentResponse {
    success: boolean;
    recommendation?: string;
    priority?: 'high' | 'medium' | 'low';
    confidence?: number;
    extractedData?: PlanningData;
    message?: string;
    error?: string;
    // CrewAI specific fields
    topPriorityTask?: string;
    urgencyScore?: number;
    reasoning?: {
        deadlineProximity?: string;
        moduleWeight?: string;
        workloadBalance?: string;
    };
    actionableSteps?: string[];
    estimatedDuration?: string;
}

export interface UploadedDocument {
    id: string;
    name: string;
    uri: string;
    size: number;
    uploadDate: Date;
    status: 'processing' | 'processed' | 'error';
    extractedData?: PlanningData;
}

export interface PlanningData {
    classes?: Array<{
        name: string;
        time: string;
        days: string;
        location?: string;
        instructor?: string;
    }>;
    exams?: Array<{
        name: string;
        date: string;
        time?: string;
        module: string;
        location?: string;
        weight?: number;
    }>;
    assignments?: Array<{
        name: string;
        deadline: string;
        module: string;
        weight?: number;
        description?: string;
    }>;
    commitments?: Array<{
        name: string;
        time: string;
        recurrence?: string;
        category?: string;
    }>;
    modules?: Array<{
        code: string;
        name: string;
        importance: 'high' | 'medium' | 'low';
        credits?: number;
    }>;
}

class DocumentService {
    private documents: Map<string, UploadedDocument> = new Map();

    /**
     * Call external AI agent with PDF + JSON metadata
     * Sends multipart form-data to http://127.0.0.1:5003/run
     */
    async sendToAIAgent(
        file: DocumentPicker.DocumentPickerAsset,
        otherData: {
            student_name: string;
            new_task_description: string;
            confidence_level: 'low' | 'medium' | 'high';
            module_coefficient: number;
            task_deadline: string;
        }
    ): Promise<AIAgentResponse> {
        try {
            const formData = new FormData();

            // Append PDF file
            formData.append(
                'file',
                {
                    uri: file.uri,
                    name: file.name,
                    type: 'application/pdf',
                } as any
            );

            // Append JSON data as text field
            formData.append('other_data', JSON.stringify({
                ...otherData,
                current_date: new Date().toISOString().split('T')[0]
            }));

            const response = await fetch('http://127.0.0.1:5003/run', {
                method: 'POST',
                body: formData,
                headers: {
                    Accept: 'application/json',
                },
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('AI API Error Response:', errorText);
                return {
                    success: false,
                    error: `API returned ${response.status}: ${errorText || 'Unknown error'}`,
                };
            }

            const data = await response.json();
            console.log('AI Agent Success Response:', data);

            // Parse CrewAI response structure
            return {
                success: true,
                recommendation: data.recommendation || data.final_decision || data.message || 'Task analyzed successfully',
                priority: data.priority || this.mapUrgencyToPriority(data.urgencyScore),
                confidence: data.confidence || data.confidenceLevel || 0.85,
                extractedData: data.extractedData || data.planning_data || this.parseAIResponse(data),
                message: data.message,
                // CrewAI specific fields
                topPriorityTask: data.topPriorityTask || data.top_priority_task,
                urgencyScore: data.urgencyScore || data.urgency_score,
                reasoning: data.reasoning,
                actionableSteps: data.actionableSteps || data.actionable_steps,
                estimatedDuration: data.estimatedDuration || data.estimated_duration,
            };
        } catch (error) {
            console.error('AI Agent Request Failed:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Network error connecting to AI agent',
            };
        }
    }

    /**
     * Parse AI response into structured planning data
     */
    private parseAIResponse(data: any): PlanningData | undefined {
        // Try to extract planning data from various response formats
        if (data.classes || data.exams || data.assignments) {
            return {
                classes: data.classes,
                exams: data.exams,
                assignments: data.assignments,
                commitments: data.commitments,
                modules: data.modules,
            };
        }
        
        // Try to parse planning_data field
        if (data.planning_data) {
            return {
                classes: data.planning_data.classes,
                exams: data.planning_data.exams,
                assignments: data.planning_data.assignments,
                commitments: data.planning_data.commitments,
                modules: data.planning_data.modules,
            };
        }
        
        return undefined;
    }

    /**
     * Map urgency score (0-1) to priority level
     */
    private mapUrgencyToPriority(urgencyScore?: number): 'high' | 'medium' | 'low' {
        if (urgencyScore === undefined) return 'medium';
        
        if (urgencyScore >= 0.8) return 'high';
        if (urgencyScore >= 0.5) return 'medium';
        return 'low';
    }

    /**
     * Upload and process a PDF document
     */
    async uploadDocument(file: DocumentPicker.DocumentPickerAsset): Promise<UploadedDocument> {
        const doc: UploadedDocument = {
            id: Date.now().toString(),
            name: file.name,
            uri: file.uri,
            size: file.size || 0,
            uploadDate: new Date(),
            status: 'processing',
        };

        this.documents.set(doc.id, doc);

        // Simulate processing - In production, this would call the AI service
        setTimeout(() => {
            this.processDocument(doc.id);
        }, 2000);

        return doc;
    }

    /**
     * Process document and extract planning data using AI
     */
    private async processDocument(docId: string): Promise<void> {
        const doc = this.documents.get(docId);
        if (!doc) return;

        try {
            // TODO: Call PDF Planning Reader Agent here
            // const extractedData = await aiService.extractPlanningFromPDF(doc.uri);
            
            // Mock extracted data for now
            const extractedData: PlanningData = {
                classes: [
                    { 
                        name: 'Data Structures', 
                        time: '10:00 AM', 
                        days: 'Mon, Wed, Fri',
                        location: 'Room 301',
                        instructor: 'Dr. Smith'
                    },
                ],
                exams: [
                    { 
                        name: 'Data Structures Midterm', 
                        date: '2024-12-23',
                        time: '9:00 AM', 
                        module: 'CS-301',
                        location: 'Hall A',
                        weight: 30
                    },
                ],
                assignments: [
                    { 
                        name: 'Binary Tree Implementation', 
                        deadline: '2024-12-22', 
                        module: 'CS-301',
                        weight: 20,
                        description: 'Implement binary tree operations including insert, delete, and search'
                    },
                ],
                commitments: [
                    { name: 'Study Group', time: 'Every Tuesday 6 PM', recurrence: 'weekly', category: 'Academic' },
                ],
                modules: [
                    { code: 'CS-301', name: 'Data Structures', importance: 'high', credits: 4 },
                ],
            };
            
            // Mock AI response for demonstration
            const mockAIResponse: AIAgentResponse = {
                success: true,
                recommendation: 'Focus on the Binary Tree Implementation assignment as it has a high weight (20%) and is due before your midterm exam.',
                priority: 'high',
                confidence: 0.92,
                extractedData: extractedData,
                topPriorityTask: 'Binary Tree Implementation',
                urgencyScore: 0.85,
                reasoning: {
                    deadlineProximity: 'Assignment is due in 2 days',
                    moduleWeight: 'Assignment carries 20% of final grade',
                    workloadBalance: 'Balanced workload with one major task'
                },
                actionableSteps: [
                    'Review binary tree concepts from lectures',
                    'Implement basic tree structure with insert/delete/search methods',
                    'Test edge cases with empty trees and single nodes',
                    'Submit before deadline to avoid late penalty'
                ],
                estimatedDuration: '3-4 hours'
            };

            doc.extractedData = extractedData;
            doc.aiResponse = mockAIResponse;
            doc.status = 'processed';
            this.documents.set(docId, doc);
        } catch (error) {
            doc.status = 'error';
            this.documents.set(docId, doc);
            throw error;
        }
    }

    /**
     * Get all uploaded documents
     */
    getAllDocuments(): UploadedDocument[] {
        return Array.from(this.documents.values()).sort(
            (a, b) => b.uploadDate.getTime() - a.uploadDate.getTime()
        );
    }

    /**
     * Get a specific document by ID
     */
    getDocument(id: string): UploadedDocument | undefined {
        return this.documents.get(id);
    }

    /**
     * Delete a document
     */
    deleteDocument(id: string): boolean {
        return this.documents.delete(id);
    }

    /**
     * Get the most recent processed document
     */
    getMostRecentDocument(): UploadedDocument | undefined {
        const docs = this.getAllDocuments();
        return docs.find(doc => doc.status === 'processed');
    }

    /**
     * Get extracted planning data from the most recent document
     */
    getLatestPlanningData(): PlanningData | undefined {
        const recent = this.getMostRecentDocument();
        return recent?.extractedData;
    }

    /**
     * Subscribe to document processing updates
     */
    onDocumentUpdate(docId: string, callback: (doc: UploadedDocument) => void): () => void {
        // In a real implementation, this would use an event emitter or observable
        const interval = setInterval(() => {
            const doc = this.documents.get(docId);
            if (doc) {
                callback(doc);
                if (doc.status !== 'processing') {
                    clearInterval(interval);
                }
            }
        }, 500);

        return () => clearInterval(interval);
    }
}

export const documentService = new DocumentService();
export default documentService;

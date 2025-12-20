import { aiService } from '@/services/aiService';
import { documentService, PlanningData, UploadedDocument } from '@/services/documentService';
import { AIRecommendation, recommendationService } from '@/services/recommendationService';
import * as DocumentPicker from 'expo-document-picker';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';

interface AIContextType {
    // Documents
    documents: UploadedDocument[];
    uploadDocument: (file: DocumentPicker.DocumentPickerAsset) => Promise<void>;
    deleteDocument: (id: string) => void;
    isUploading: boolean;
    
    // Planning Data
    planningData: PlanningData | null;
    
    // Recommendations
    todayRecommendation: AIRecommendation | null;
    allRecommendations: AIRecommendation[];
    acceptRecommendation: (id: string) => void;
    dismissRecommendation: (id: string) => void;
    refreshRecommendations: () => Promise<void>;
    
    // Processing Status
    isProcessing: boolean;
    processingStep: 'idle' | 'reading' | 'analyzing' | 'advising' | 'complete';
    
    // Statistics
    stats: {
        totalRecommendations: number;
        acceptedCount: number;
        avgConfidence: number;
    };
}

const AIContext = createContext<AIContextType | undefined>(undefined);

export function AIProvider({ children }: { children: ReactNode }) {
    const [documents, setDocuments] = useState<UploadedDocument[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [planningData, setPlanningData] = useState<PlanningData | null>(null);
    const [todayRecommendation, setTodayRecommendation] = useState<AIRecommendation | null>(null);
    const [allRecommendations, setAllRecommendations] = useState<AIRecommendation[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [processingStep, setProcessingStep] = useState<'idle' | 'reading' | 'analyzing' | 'advising' | 'complete'>('idle');

    // Load initial data
    useEffect(() => {
        loadDocuments();
        loadRecommendations();
    }, []);

    // Load planning data when documents change
    useEffect(() => {
        const latestData = documentService.getLatestPlanningData();
        setPlanningData(latestData || null);
    }, [documents]);

    const loadDocuments = () => {
        const docs = documentService.getAllDocuments();
        setDocuments(docs);
    };

    const loadRecommendations = () => {
        const today = recommendationService.getTodayRecommendation();
        const all = recommendationService.getAllRecommendations();
        setTodayRecommendation(today);
        setAllRecommendations(all);
    };

    const uploadDocument = async (file: DocumentPicker.DocumentPickerAsset) => {
        setIsUploading(true);
        setIsProcessing(true);
        setProcessingStep('reading');

        try {
            // Upload document
            const doc = await documentService.uploadDocument(file);
            
            // Simulate three-agent processing
            setTimeout(() => setProcessingStep('analyzing'), 1000);
            setTimeout(() => setProcessingStep('advising'), 2000);
            setTimeout(() => {
                setProcessingStep('complete');
                setIsProcessing(false);
                loadDocuments();
                
                // Generate new recommendation after document is processed
                refreshRecommendations();
            }, 3000);
            
        } catch (error) {
            console.error('Error uploading document:', error);
            setIsProcessing(false);
            setProcessingStep('idle');
            throw error;
        } finally {
            setIsUploading(false);
        }
    };

    const deleteDocument = (id: string) => {
        documentService.deleteDocument(id);
        loadDocuments();
    };

    const acceptRecommendation = (id: string) => {
        recommendationService.acceptRecommendation(id);
        loadRecommendations();
    };

    const dismissRecommendation = (id: string) => {
        recommendationService.dismissRecommendation(id);
        loadRecommendations();
    };

    const refreshRecommendations = async () => {
        if (!planningData) return;

        try {
            // Generate new daily recommendation using the three AI agents
            const recommendation = await aiService.generateDailyRecommendation(
                planningData,
                [], // TODO: Pass actual user tasks
                undefined // TODO: Pass actual user metrics
            );

            setTodayRecommendation(recommendation);
            loadRecommendations();
        } catch (error) {
            console.error('Error refreshing recommendations:', error);
        }
    };

    const stats = {
        totalRecommendations: allRecommendations.length,
        acceptedCount: allRecommendations.filter(r => r.status === 'accepted').length,
        avgConfidence: allRecommendations.length > 0
            ? allRecommendations.reduce((sum, r) => sum + r.confidence, 0) / allRecommendations.length
            : 0,
    };

    return (
        <AIContext.Provider
            value={{
                documents,
                uploadDocument,
                deleteDocument,
                isUploading,
                planningData,
                todayRecommendation,
                allRecommendations,
                acceptRecommendation,
                dismissRecommendation,
                refreshRecommendations,
                isProcessing,
                processingStep,
                stats,
            }}
        >
            {children}
        </AIContext.Provider>
    );
}

export function useAI() {
    const context = useContext(AIContext);
    if (context === undefined) {
        throw new Error('useAI must be used within an AIProvider');
    }
    return context;
}

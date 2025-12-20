import PDFUploader from '@/components/PDFUploader';
import PlanningOverview from '@/components/PlanningOverview';
import { useApp } from '@/contexts/AppContext';
import { AIAgentResponse, documentService, PlanningData } from '@/services/documentService';
import * as DocumentPicker from 'expo-document-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { CheckCircle2, Eye, FileText, Trash2 } from 'lucide-react-native';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Document {
    id: string;
    name: string;
    uploadDate: Date;
    size: number;
    status: 'processed' | 'processing' | 'error';
    aiResponse?: AIAgentResponse;
    extractedData?: PlanningData;
}

export default function DocumentsScreen() {
    const { theme } = useApp();
    const [isProcessing, setIsProcessing] = useState(false);
    const [processingStatus, setProcessingStatus] = useState<string>('');
    const [documents, setDocuments] = useState<Document[]>([]);

    const [activePlanningData, setActivePlanningData] = useState<PlanningData | null>(null);

    const handleUpload = async (file: DocumentPicker.DocumentPickerAsset) => {
        setIsProcessing(true);
        setProcessingStatus('Uploading PDF to AI agent...');
        
        try {
            // Get user name from context if available
            const studentName = 'Student'; // TODO: Get from AppContext user profile
            
            // Prepare task data for AI agent
            const otherData = {
                student_name: studentName,
                new_task_description: file.name.replace('.pdf', ''),
                confidence_level: 'high' as const,
                module_coefficient: 1.0,
                task_deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            };

            setProcessingStatus('AI analyzing document...');
            
            // Call Python AI agent API
            const aiResponse = await documentService.sendToAIAgent(file, otherData);
            
            if (!aiResponse.success) {
                throw new Error(aiResponse.error || 'AI agent failed to process document');
            }

            console.log('AI Analysis Complete:', aiResponse);
            setProcessingStatus('Processing complete!');

            // Create document entry with AI response
            const newDoc: Document = {
                id: Date.now().toString(),
                name: file.name,
                uploadDate: new Date(),
                size: Math.round((file.size || 0) / 1024),
                status: 'processed',
                aiResponse,
                extractedData: aiResponse.extractedData,
            };
            
            setDocuments([newDoc, ...documents]);
            
            // Set as active planning data if available
            if (aiResponse.extractedData) {
                setActivePlanningData(aiResponse.extractedData);
            }
            
            // Show detailed success with all AI response fields
            let successMessage = '✅ Document processed successfully!';
            
            if (aiResponse.recommendation) {
                successMessage += `\n\n📝 Recommendation:\n${aiResponse.recommendation}`;
            }
            
            if (aiResponse.priority || aiResponse.confidence) {
                successMessage += '\n\n📊 Analysis:';
                if (aiResponse.priority) {
                    const priorityEmoji = aiResponse.priority === 'high' ? '🔴' : aiResponse.priority === 'medium' ? '🟡' : '🟢';
                    successMessage += `\n${priorityEmoji} Priority: ${aiResponse.priority.charAt(0).toUpperCase() + aiResponse.priority.slice(1)}`;
                }
                if (aiResponse.confidence) {
                    const confidenceLevel = aiResponse.confidence >= 0.8 ? 'High' : aiResponse.confidence >= 0.6 ? 'Medium' : 'Low';
                    successMessage += `\n📈 Confidence: ${(aiResponse.confidence * 100).toFixed(0)}% (${confidenceLevel})`;
                }
            }
            
            // Add reasoning details if available
            if (aiResponse.reasoning) {
                successMessage += '\n\n🤔 Reasoning:';
                if (aiResponse.reasoning.deadlineProximity) {
                    successMessage += `\n⏰ ${aiResponse.reasoning.deadlineProximity}`;
                }
                if (aiResponse.reasoning.moduleWeight) {
                    successMessage += `\n📚 ${aiResponse.reasoning.moduleWeight}`;
                }
                if (aiResponse.reasoning.workloadBalance) {
                    successMessage += `\n⚖️ ${aiResponse.reasoning.workloadBalance}`;
                }
            }
            
            if (aiResponse.actionableSteps && aiResponse.actionableSteps.length > 0) {
                successMessage += `\n\n📋 Actionable Steps:\n${aiResponse.actionableSteps.map((step, i) => `${i + 1}. ${step}`).join('\n')}`;
            }
            
            // Add additional details
            if (aiResponse.estimatedDuration || aiResponse.topPriorityTask || aiResponse.urgencyScore !== undefined) {
                successMessage += '\n\n🔍 Additional Details:';
                if (aiResponse.topPriorityTask) {
                    successMessage += `\n⭐ Top Priority Task: ${aiResponse.topPriorityTask}`;
                }
                if (aiResponse.estimatedDuration) {
                    successMessage += `\n⏱ Estimated Duration: ${aiResponse.estimatedDuration}`;
                }
                if (aiResponse.urgencyScore !== undefined) {
                    const urgencyLevel = aiResponse.urgencyScore >= 0.8 ? 'Urgent' : aiResponse.urgencyScore >= 0.5 ? 'Moderate' : 'Low';
                    successMessage += `\n⚡ Urgency Score: ${aiResponse.urgencyScore.toFixed(2)} (${urgencyLevel})`;
                }
            }
            
            Alert.alert(
                'AI Analysis Complete',
                successMessage,
                [
                    { text: 'OK', style: 'default' }
                ]
            );
        } catch (error) {
            console.error('Upload error:', error);
            
            // Add failed document to list
            const failedDoc: Document = {
                id: Date.now().toString(),
                name: file.name,
                uploadDate: new Date(),
                size: Math.round((file.size || 0) / 1024),
                status: 'error',
            };
            setDocuments([failedDoc, ...documents]);
            
            Alert.alert(
                '❌ Error',
                error instanceof Error ? error.message : 'Failed to process document. Make sure your AI agent is running at http://127.0.0.1:5000'
            );
        } finally {
            setIsProcessing(false);
            setProcessingStatus('');
        }
    };

    const handleDelete = (id: string) => {
        setDocuments(documents.filter(doc => doc.id !== id));
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
            <LinearGradient
                colors={['#F3E8FF', '#FAF5FF', theme.background]}
                style={styles.gradientBackground}
            >
                <ScrollView 
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Header */}
                    <View style={styles.header}>
                        <View style={[styles.headerIcon, { backgroundColor: theme.primaryMuted }]}>
                            <FileText color={theme.primary} size={28} strokeWidth={2.5} />
                        </View>
                        <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>
                            Documents
                        </Text>
                        <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>
                            Upload and manage your academic planning
                        </Text>
                    </View>

                    {/* Upload Section */}
                    <View style={styles.section}>
                        <PDFUploader onUpload={handleUpload} isProcessing={isProcessing} />
                        
                        {/* Processing Status */}
                        {isProcessing && processingStatus && (
                            <View style={[styles.statusCard, { backgroundColor: theme.primaryMuted }]}>
                                <ActivityIndicator color={theme.primary} size="small" />
                                <Text style={[styles.statusText, { color: theme.primary }]}>{processingStatus}</Text>
                            </View>
                        )}
                    </View>

                    {/* Planning Overview */}
                    {activePlanningData && (
                        <View style={styles.section}>
                            <View style={styles.sectionHeaderRow}>
                                <CheckCircle2 color={theme.success} size={20} />
                                <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
                                    AI Extracted Planning
                                </Text>
                            </View>
                            <PlanningOverview 
                                data={activePlanningData} 
                                uploadDate={documents[0]?.uploadDate}
                                aiInsights={documents[0]?.aiResponse ? {
                                    recommendation: documents[0].aiResponse.recommendation,
                                    priority: documents[0].aiResponse.priority,
                                    confidence: documents[0].aiResponse.confidence,
                                    topPriorityTask: documents[0].aiResponse.topPriorityTask,
                                    estimatedDuration: documents[0].aiResponse.estimatedDuration,
                                    urgencyScore: documents[0].aiResponse.urgencyScore
                                } : undefined}
                            />
                        </View>
                    )}

                    {/* Documents List */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
                                My Documents
                            </Text>
                            <View style={[styles.countBadge, { backgroundColor: theme.primaryMuted }]}>
                                <Text style={[styles.countText, { color: theme.primary }]}>
                                    {documents.length}
                                </Text>
                            </View>
                        </View>

                        {documents.length === 0 ? (
                            <View style={[styles.emptyState, { backgroundColor: theme.card }]}>
                                <FileText color={theme.textTertiary} size={48} strokeWidth={1.5} />
                                <Text style={[styles.emptyStateText, { color: theme.textSecondary }]}>
                                    No documents uploaded yet
                                </Text>
                                <Text style={[styles.emptyStateSubtext, { color: theme.textTertiary }]}>
                                    Upload your academic planning PDF to get started
                                </Text>
                            </View>
                        ) : (
                            documents.map((doc) => (
                                <View 
                                    key={doc.id} 
                                    style={[styles.documentCard, { backgroundColor: theme.card }]}
                                >
                                    <View style={[styles.documentIcon, { backgroundColor: theme.primaryMuted }]}>
                                        <FileText color={theme.primary} size={24} />
                                    </View>
                                    <View style={styles.documentInfo}>
                                        <Text style={[styles.documentName, { color: theme.textPrimary }]}>
                                            {doc.name}
                                        </Text>
                                        <View style={styles.documentMeta}>
                                            <Text style={[styles.documentDate, { color: theme.textTertiary }]}>
                                                {new Date(doc.uploadDate).toLocaleDateString()}
                                            </Text>
                                            <Text style={[styles.documentSize, { color: theme.textTertiary }]}>
                                                {doc.size} KB
                                            </Text>
                                            <View style={[
                                                styles.statusBadge,
                                                { 
                                                    backgroundColor: doc.status === 'processed' 
                                                        ? '#D1FAE5'
                                                        : doc.status === 'error'
                                                        ? '#FEE2E2'
                                                        : '#FEF3C7'
                                                }
                                            ]}>
                                                <Text style={[
                                                    styles.statusText,
                                                    { 
                                                        color: doc.status === 'processed' 
                                                            ? theme.success
                                                            : doc.status === 'error'
                                                            ? theme.error
                                                            : theme.warning
                                                    }
                                                ]}>
                                                    {doc.status === 'processed' ? '✓ Processed' : doc.status === 'error' ? '✗ Failed' : 'Processing'}
                                                </Text>
                                            </View>
                                        </View>
                                    </View>
                                    <View style={styles.documentActions}>
                                        <Pressable style={[styles.actionButton, { backgroundColor: theme.gray100 }]}>
                                            <Eye color={theme.textTertiary} size={20} />
                                        </Pressable>
                                        <Pressable 
                                            style={[styles.actionButton, { backgroundColor: theme.gray100 }]}
                                            onPress={() => handleDelete(doc.id)}
                                        >
                                            <Trash2 color="#EF4444" size={20} />
                                        </Pressable>
                                    </View>
                                </View>
                            ))
                        )}
                    </View>
                </ScrollView>
            </LinearGradient>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    gradientBackground: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 40,
    },
    header: {
        alignItems: 'center',
        marginBottom: 32,
    },
    headerIcon: {
        width: 64,
        height: 64,
        borderRadius: 32,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    headerTitle: {
        fontSize: 32,
        fontWeight: '700',
        marginBottom: 8,
    },
    headerSubtitle: {
        fontSize: 16,
        textAlign: 'center',
    },
    section: {
        marginBottom: 32,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    sectionHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '700',
    },
    statusCard: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        padding: 16,
        borderRadius: 16,
        marginTop: 16,
    },
    statusText: {
        fontSize: 14,
        fontWeight: '600',
    },
    countBadge: {
        minWidth: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 12,
    },
    countText: {
        fontSize: 14,
        fontWeight: '700',
    },
    emptyState: {
        alignItems: 'center',
        padding: 40,
        borderRadius: 24,
        shadowColor: '#9b87f5',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 2,
    },
    emptyStateText: {
        fontSize: 16,
        fontWeight: '600',
        marginTop: 16,
        marginBottom: 4,
    },
    emptyStateSubtext: {
        fontSize: 14,
        textAlign: 'center',
    },
    documentCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 20,
        marginBottom: 12,
        shadowColor: '#9b87f5',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 2,
    },
    documentIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    documentInfo: {
        flex: 1,
    },
    documentName: {
        fontSize: 15,
        fontWeight: '600',
        marginBottom: 6,
    },
    documentMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        flexWrap: 'wrap',
    },
    documentDate: {
        fontSize: 13,
    },
    documentSize: {
        fontSize: 13,
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 8,
    },
    documentActions: {
        flexDirection: 'row',
        gap: 8,
    },
    actionButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
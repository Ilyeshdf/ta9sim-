import { useApp } from '@/contexts/AppContext';
import { LinearGradient } from 'expo-linear-gradient';
import { AlertTriangle, BookOpen, Clock, TrendingUp, X } from 'lucide-react-native';
import React from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import PriorityIndicator from './PriorityIndicator';

interface AIInsightModalProps {
    visible: boolean;
    onClose: () => void;
    recommendation: string;
    confidence: number;
    priority: 'high' | 'medium' | 'low';
    context?: {
        module?: string;
        deadline?: string;
        examDate?: string;
        workload?: string;
        moduleImportance?: 'high' | 'medium' | 'low';
    };
    // Additional AI agent response fields
    topPriorityTask?: string;
    urgencyScore?: number;
    reasoning?: {
        deadlineProximity?: string;
        moduleWeight?: string;
        workloadBalance?: string;
    };
    actionableSteps?: string[];
    estimatedDuration?: string;
    onAccept?: () => void;
    onDismiss?: () => void;
}

export default function AIInsightModal({
    visible,
    onClose,
    recommendation,
    confidence,
    priority,
    context,
    topPriorityTask,
    urgencyScore,
    reasoning,
    actionableSteps,
    estimatedDuration,
    onAccept,
    onDismiss,
}: AIInsightModalProps) {
    const { theme } = useApp();
    const handleAccept = () => {
        onAccept?.();
        onClose();
    };

    const handleDismiss = () => {
        onDismiss?.();
        onClose();
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={[styles.modalContainer, { backgroundColor: theme.card }]}>
                    {/* Header with Gradient */}
                    <LinearGradient
                        colors={['#9b87f5', '#7E69AB']}
                        style={styles.header}
                    >
                        <View style={styles.headerTop}>
                            <Text style={styles.headerTitle}>AI Recommendation Details</Text>
                            <Pressable onPress={onClose} style={styles.closeButton}>
                                <X color="#FFFFFF" size={24} strokeWidth={2.5} />
                            </Pressable>
                        </View>
                        <View style={styles.priorityContainer}>
                            <PriorityIndicator 
                                level={priority} 
                                confidence={confidence}
                                moduleImportance={context?.moduleImportance}
                            />
                        </View>
                    </LinearGradient>

                    {/* Content */}
                    <ScrollView 
                        style={styles.content}
                        contentContainerStyle={styles.scrollContent}
                        showsVerticalScrollIndicator={false}
                    >
                        {/* Recommendation Text */}
                        <View style={styles.section}>
                            <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Recommendation</Text>
                            <Text style={[styles.recommendationText, { color: theme.textSecondary }]}>{recommendation}</Text>
                        </View>

                        {/* Context Information */}
                        {context && (
                            <View style={styles.section}>
                                <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Context</Text>
                                <View style={styles.contextGrid}>
                                    {context.module && (
                                        <View style={[styles.contextItem, { backgroundColor: theme.surface }]}>
                                            <View style={[styles.contextIcon, { backgroundColor: theme.primaryMuted }]}>
                                                <BookOpen color={theme.primary} size={20} />
                                            </View>
                                            <View style={styles.contextContent}>
                                                <Text style={[styles.contextLabel, { color: theme.textSecondary }]}>Module</Text>
                                                <Text style={[styles.contextValue, { color: theme.textPrimary }]}>{context.module}</Text>
                                            </View>
                                        </View>
                                    )}

                                    {context.deadline && (
                                        <View style={[styles.contextItem, { backgroundColor: theme.surface }]}>
                                            <View style={[styles.contextIcon, { backgroundColor: '#FEF3C7' }]}>
                                                <Clock color="#F59E0B" size={20} />
                                            </View>
                                            <View style={styles.contextContent}>
                                                <Text style={[styles.contextLabel, { color: theme.textSecondary }]}>Deadline</Text>
                                                <Text style={[styles.contextValue, { color: theme.textPrimary }]}>{context.deadline}</Text>
                                            </View>
                                        </View>
                                    )}

                                    {context.examDate && (
                                        <View style={[styles.contextItem, { backgroundColor: theme.surface }]}>
                                            <View style={[styles.contextIcon, { backgroundColor: '#FEE2E2' }]}>
                                                <AlertTriangle color="#EF4444" size={20} />
                                            </View>
                                            <View style={styles.contextContent}>
                                                <Text style={[styles.contextLabel, { color: theme.textSecondary }]}>Exam Date</Text>
                                                <Text style={[styles.contextValue, { color: theme.textPrimary }]}>{context.examDate}</Text>
                                            </View>
                                        </View>
                                    )}

                                    {context.workload && (
                                        <View style={[styles.contextItem, { backgroundColor: theme.surface }]}>
                                            <View style={[styles.contextIcon, { backgroundColor: '#D1FAE5' }]}>
                                                <TrendingUp color="#10B981" size={20} />
                                            </View>
                                            <View style={styles.contextContent}>
                                                <Text style={[styles.contextLabel, { color: theme.textSecondary }]}>Workload</Text>
                                                <Text style={[styles.contextValue, { color: theme.textPrimary }]}>{context.workload}</Text>
                                            </View>
                                        </View>
                                    )}
                                </View>
                            </View>
                        )}

                        {/* Detailed Analysis */}
                        <View style={styles.section}>
                            <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Analysis Details</Text>
                            <View style={[styles.whyCard, { backgroundColor: theme.primaryMuted, borderLeftColor: theme.primary }]}>
                                <Text style={[styles.whyText, { color: theme.textSecondary }]}>
                                    Our AI has analyzed your academic schedule, upcoming deadlines, and 
                                    workload distribution to determine this is the optimal task to focus 
                                    on right now. This recommendation considers deadline urgency, module 
                                    importance, and your current capacity.
                                </Text>
                            </View>
                        </View>

                        {/* Detailed Reasoning */}
                        {reasoning && (
                            <View style={styles.section}>
                                <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Detailed Reasoning</Text>
                                <View style={[styles.detailCard, { backgroundColor: theme.surface, padding: 16, borderRadius: 16 }]}>
                                    {reasoning.deadlineProximity && (
                                        <View style={styles.reasoningItem}>
                                            <Text style={[styles.reasoningLabel, { color: theme.textSecondary }]}>Deadline Proximity:</Text>
                                            <Text style={[styles.reasoningValue, { color: theme.textPrimary }]}>{reasoning.deadlineProximity}</Text>
                                        </View>
                                    )}
                                    {reasoning.moduleWeight && (
                                        <View style={styles.reasoningItem}>
                                            <Text style={[styles.reasoningLabel, { color: theme.textSecondary }]}>Module Weight:</Text>
                                            <Text style={[styles.reasoningValue, { color: theme.textPrimary }]}>{reasoning.moduleWeight}</Text>
                                        </View>
                                    )}
                                    {reasoning.workloadBalance && (
                                        <View style={styles.reasoningItem}>
                                            <Text style={[styles.reasoningLabel, { color: theme.textSecondary }]}>Workload Balance:</Text>
                                            <Text style={[styles.reasoningValue, { color: theme.textPrimary }]}>{reasoning.workloadBalance}</Text>
                                        </View>
                                    )}
                                </View>
                            </View>
                        )}

                        {/* Actionable Steps */}
                        {actionableSteps && actionableSteps.length > 0 && (
                            <View style={styles.section}>
                                <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Actionable Steps</Text>
                                <View style={[styles.detailCard, { backgroundColor: theme.surface, padding: 16, borderRadius: 16 }]}>
                                    {actionableSteps.map((step, index) => (
                                        <View key={index} style={styles.stepItem}>
                                            <View style={[styles.stepNumber, { backgroundColor: theme.primaryMuted }]}>
                                                <Text style={[styles.stepNumberText, { color: theme.primary }]}>{index + 1}</Text>
                                            </View>
                                            <Text style={[styles.stepText, { color: theme.textPrimary }]}>{step}</Text>
                                        </View>
                                    ))}
                                </View>
                            </View>
                        )}

                        {/* Additional Details */}
                        <View style={styles.section}>
                            <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Additional Details</Text>
                            <View style={[styles.detailCard, { backgroundColor: theme.surface, padding: 16, borderRadius: 16 }]}>
                                {topPriorityTask && (
                                    <View style={styles.detailItem}>
                                        <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>Top Priority Task:</Text>
                                        <Text style={[styles.detailValue, { color: theme.textPrimary }]}>{topPriorityTask}</Text>
                                    </View>
                                )}
                                {estimatedDuration && (
                                    <View style={styles.detailItem}>
                                        <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>Estimated Duration:</Text>
                                        <Text style={[styles.detailValue, { color: theme.textPrimary }]}>{estimatedDuration}</Text>
                                    </View>
                                )}
                                {urgencyScore !== undefined && (
                                    <View style={styles.detailItem}>
                                        <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>Urgency Score:</Text>
                                        <Text style={[styles.detailValue, { color: theme.textPrimary }]}>{urgencyScore.toFixed(2)}</Text>
                                    </View>
                                )}
                            </View>
                        </View>
                    </ScrollView>

                    {/* Action Buttons */}
                    <View style={[styles.actions, { borderTopColor: theme.border }]}>
                        <Pressable style={[styles.dismissActionButton, { backgroundColor: theme.gray100 }]} onPress={handleDismiss}>
                            <Text style={[styles.dismissActionText, { color: theme.textSecondary }]}>Not Now</Text>
                        </Pressable>
                        <Pressable style={[styles.acceptActionButton, { backgroundColor: theme.primary }]} onPress={handleAccept}>
                            <Text style={styles.acceptActionText}>Accept & Add to Tasks</Text>
                        </Pressable>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContainer: {
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        maxHeight: '90%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 12,
    },
    header: {
        padding: 24,
        paddingTop: 32,
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    closeButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    priorityContainer: {
        marginTop: 8,
    },
    content: {
        flex: 1,
    },
    scrollContent: {
        padding: 24,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 12,
    },
    recommendationText: {
        fontSize: 18,
        fontWeight: '600',
        lineHeight: 28,
    },
    contextGrid: {
        gap: 12,
    },
    contextItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 16,
        gap: 12,
    },
    contextIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    contextContent: {
        flex: 1,
    },
    contextLabel: {
        fontSize: 12,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 2,
    },
    contextValue: {
        fontSize: 15,
        fontWeight: '600',
    },
    whyCard: {
        padding: 16,
        borderRadius: 16,
        borderLeftWidth: 4,
    },
    whyText: {
        fontSize: 14,
        lineHeight: 22,
    },
    detailCard: {
        padding: 16,
        borderRadius: 16,
    },
    detailItem: {
        marginBottom: 12,
    },
    detailLabel: {
        fontSize: 13,
        fontWeight: '600',
        marginBottom: 4,
    },
    detailValue: {
        fontSize: 14,
        lineHeight: 20,
    },
    reasoningItem: {
        marginBottom: 12,
    },
    reasoningLabel: {
        fontSize: 13,
        fontWeight: '600',
        marginBottom: 4,
    },
    reasoningValue: {
        fontSize: 14,
        lineHeight: 20,
    },
    stepItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    stepNumber: {
        width: 24,
        height: 24,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
        marginTop: 2,
    },
    stepNumberText: {
        fontSize: 12,
        fontWeight: '700',
    },
    stepText: {
        flex: 1,
        fontSize: 14,
        lineHeight: 20,
    },
    actions: {
        flexDirection: 'row',
        padding: 20,
        paddingTop: 16,
        gap: 12,
        borderTopWidth: 1,
    },
    dismissActionButton: {
        flex: 1,
        paddingVertical: 16,
        borderRadius: 16,
        alignItems: 'center',
    },
    dismissActionText: {
        fontSize: 16,
        fontWeight: '700',
    },
    acceptActionButton: {
        flex: 2,
        paddingVertical: 16,
        borderRadius: 16,
        alignItems: 'center',
        shadowColor: '#9b87f5',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 4,
    },
    acceptActionText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#FFFFFF',
    },
});

import { useApp } from '@/contexts/AppContext';
import { LinearGradient } from 'expo-linear-gradient';
import { Check, Sparkles } from 'lucide-react-native';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

interface AIRecommendationCardProps {
    recommendation: string;
    confidence: number;
    priority: 'high' | 'medium' | 'low';
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
    timestamp?: Date;
}

export default function AIRecommendationCard({
    recommendation,
    confidence,
    priority,
    topPriorityTask,
    urgencyScore,
    reasoning,
    actionableSteps,
    estimatedDuration,
    onAccept,
    onDismiss,
    timestamp,
}: AIRecommendationCardProps) {
    const { theme } = useApp();
    
    const getPriorityGradient = () => {
        switch (priority) {
            case 'high':
                return ['#9b87f5', '#7E69AB'];
            case 'medium':
                return ['#D6BCFA', '#B794F6'];
            case 'low':
                return ['#E9D5FF', '#D8B4FE'];
            default:
                return ['#D6BCFA', '#B794F6'];
        }
    };

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={getPriorityGradient()}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradient}
            >
                <View style={styles.header}>
                    <View style={styles.iconContainer}>
                        <Sparkles color="#FFFFFF" size={20} strokeWidth={2.5} />
                    </View>
                    <View style={styles.headerText}>
                        <Text style={styles.title}>AI Recommendation</Text>
                        {timestamp && (
                            <Text style={styles.timestamp}>
                                {new Date(timestamp).toLocaleTimeString('en-US', { 
                                    hour: 'numeric', 
                                    minute: '2-digit' 
                                })}
                            </Text>
                        )}
                    </View>
                </View>

                <Text style={styles.recommendation}>{recommendation}</Text>

                {/* Additional AI Details */}
                <View style={styles.detailsContainer}>
                    {topPriorityTask && (
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Top Task:</Text>
                            <Text style={styles.detailValue}>{topPriorityTask}</Text>
                        </View>
                    )}
                    
                    {estimatedDuration && (
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Est. Duration:</Text>
                            <Text style={styles.detailValue}>{estimatedDuration}</Text>
                        </View>
                    )}
                    
                    {urgencyScore !== undefined && (
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Urgency:</Text>
                            <Text style={styles.detailValue}>{urgencyScore.toFixed(2)}</Text>
                        </View>
                    )}
                </View>

                <View style={styles.footer}>
                    <View style={styles.confidenceContainer}>
                        <View style={styles.confidenceDot} />
                        <Text style={styles.confidenceText}>
                            {Math.round(confidence * 100)}% confident
                        </Text>
                    </View>

                    <View style={styles.actions}>
                        {onDismiss && (
                            <Pressable 
                                style={styles.dismissButton}
                                onPress={onDismiss}
                            >
                                <Text style={styles.dismissText}>Dismiss</Text>
                            </Pressable>
                        )}
                        
                        {onAccept && (
                            <Pressable 
                                style={[styles.acceptButton, { backgroundColor: theme.surface }]}
                                onPress={onAccept}
                            >
                                <Check color={theme.primary} size={16} strokeWidth={3} />
                                <Text style={[styles.acceptText, { color: theme.primary }]}>Accept</Text>
                            </Pressable>
                        )}
                    </View>
                </View>
            </LinearGradient>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 16,
        borderRadius: 24,
        overflow: 'hidden',
        shadowColor: '#9b87f5',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.25,
        shadowRadius: 16,
        elevation: 8,
    },
    gradient: {
        padding: 20,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        gap: 12,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerText: {
        flex: 1,
    },
    title: {
        fontSize: 16,
        fontWeight: '700',
        color: '#FFFFFF',
        marginBottom: 2,
    },
    timestamp: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.8)',
        fontWeight: '500',
    },
    recommendation: {
        fontSize: 18,
        fontWeight: '600',
        color: '#FFFFFF',
        lineHeight: 26,
        marginBottom: 16,
    },
    detailsContainer: {
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        borderRadius: 12,
        padding: 12,
        marginBottom: 16,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 6,
    },
    detailLabel: {
        fontSize: 13,
        fontWeight: '600',
        color: 'rgba(255, 255, 255, 0.9)',
    },
    detailValue: {
        fontSize: 13,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    confidenceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    confidenceDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#FFFFFF',
    },
    confidenceText: {
        fontSize: 13,
        fontWeight: '600',
        color: 'rgba(255, 255, 255, 0.9)',
    },
    actions: {
        flexDirection: 'row',
        gap: 8,
    },
    dismissButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 12,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
    },
    dismissText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    acceptButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 12,
    },
    acceptText: {
        fontSize: 14,
        fontWeight: '700',
    },
});

import AIRecommendationCard from '@/components/AIRecommendationCard';
import PriorityIndicator from '@/components/PriorityIndicator';
import { useApp } from '@/contexts/AppContext';
import { LinearGradient } from 'expo-linear-gradient';
import { Calendar, ChevronRight, Sparkles, TrendingUp } from 'lucide-react-native';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function InsightsScreen() {
    const { theme } = useApp();
    const [selectedRecommendation, setSelectedRecommendation] = useState<string | null>(null);

    // Mock data - will be replaced with real AI recommendations
    const todayRecommendation = {
        text: "Focus on Data Structures assignment today. Your exam is in 3 days, and this assignment counts 20% toward your final grade.",
        confidence: 0.92,
        priority: 'high' as const,
        topPriorityTask: 'Binary Tree Implementation',
        estimatedDuration: '2 hours',
        urgencyScore: 0.85,
        timestamp: new Date(),
    };

    const recentRecommendations = [
        {
            id: '1',
            text: "Complete Machine Learning lab before tomorrow's class.",
            confidence: 0.85,
            priority: 'high' as const,
            topPriorityTask: 'ML Lab Assignment',
            estimatedDuration: '1.5 hours',
            urgencyScore: 0.78,
            timestamp: new Date(Date.now() - 86400000),
        },
        {
            id: '2',
            text: "Review Calculus notes for 30 minutes during your break.",
            confidence: 0.78,
            priority: 'medium' as const,
            topPriorityTask: 'Calculus Review',
            estimatedDuration: '30 minutes',
            urgencyScore: 0.65,
            timestamp: new Date(Date.now() - 172800000),
        },
        {
            id: '3',
            text: "Start working on your Software Engineering project proposal.",
            confidence: 0.88,
            priority: 'high' as const,
            topPriorityTask: 'SE Project Proposal',
            estimatedDuration: '3 hours',
            urgencyScore: 0.82,
            timestamp: new Date(Date.now() - 259200000),
        },
    ];

    const insights = [
        { label: 'Tasks Completed', value: '12', trend: '+3' },
        { label: 'Avg. Confidence', value: '87%', trend: '+5%' },
        { label: 'Focus Time', value: '4.2h', trend: '+0.8h' },
    ];

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
                            <Sparkles color={theme.primary} size={28} strokeWidth={2.5} />
                        </View>
                        <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>
                            AI Insights
                        </Text>
                        <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>
                            Smart recommendations powered by AI
                        </Text>
                    </View>

                    {/* Today's Recommendation */}
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
                            Today's Focus
                        </Text>
                        <AIRecommendationCard
                            recommendation={todayRecommendation.text}
                            confidence={todayRecommendation.confidence}
                            priority={todayRecommendation.priority}
                            topPriorityTask={todayRecommendation.topPriorityTask}
                            estimatedDuration={todayRecommendation.estimatedDuration}
                            urgencyScore={todayRecommendation.urgencyScore}
                            timestamp={todayRecommendation.timestamp}
                            onAccept={() => console.log('Accepted')}
                            onDismiss={() => console.log('Dismissed')}
                        />
                    </View>

                    {/* Quick Stats */}
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
                            Your Progress
                        </Text>
                        <View style={styles.statsGrid}>
                            {insights.map((stat, index) => (
                                <View key={index} style={[styles.statCard, { backgroundColor: theme.card }]}>
                                    <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
                                        {stat.label}
                                    </Text>
                                    <View style={styles.statRow}>
                                        <Text style={[styles.statValue, { color: theme.textPrimary }]}>
                                            {stat.value}
                                        </Text>
                                        <View style={styles.trendBadge}>
                                            <TrendingUp color="#10B981" size={12} />
                                            <Text style={styles.trendText}>{stat.trend}</Text>
                                        </View>
                                    </View>
                                </View>
                            ))}
                        </View>
                    </View>

                    {/* Recent Recommendations */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
                                Recent Recommendations
                            </Text>
                            <Pressable>
                                <Text style={[styles.viewAll, { color: theme.primary }]}>
                                    View All
                                </Text>
                            </Pressable>
                        </View>

                        {recentRecommendations.map((rec) => (
                            <Pressable 
                                key={rec.id} 
                                style={[styles.recommendationItem, { backgroundColor: theme.card }]}
                            >
                                <View style={styles.recommendationContent}>
                                    <Text style={[styles.recommendationText, { color: theme.textPrimary }]}>
                                        {rec.text}
                                    </Text>
                                    <View style={styles.recommendationMeta}>
                                        <PriorityIndicator level={rec.priority} confidence={rec.confidence} />
                                        <Text style={[styles.recommendationTime, { color: theme.textTertiary }]}>
                                            {new Date(rec.timestamp).toLocaleDateString()}
                                        </Text>
                                    </View>
                                </View>
                                <ChevronRight color={theme.textTertiary} size={20} />
                            </Pressable>
                        ))}
                    </View>

                    {/* Schedule Quick Access */}
                    <Pressable style={[styles.quickAccessCard, { backgroundColor: theme.card }]}>
                        <View style={[styles.quickAccessIcon, { backgroundColor: theme.primaryMuted }]}>
                            <Calendar color={theme.primary} size={24} />
                        </View>
                        <View style={styles.quickAccessContent}>
                            <Text style={[styles.quickAccessTitle, { color: theme.textPrimary }]}>
                                View Full Planning
                            </Text>
                            <Text style={[styles.quickAccessSubtitle, { color: theme.textSecondary }]}>
                                See all extracted schedule data
                            </Text>
                        </View>
                        <ChevronRight color={theme.textTertiary} size={24} />
                    </Pressable>
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
    },
    section: {
        marginBottom: 32,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '700',
        marginBottom: 16,
    },
    viewAll: {
        fontSize: 14,
        fontWeight: '600',
    },
    statsGrid: {
        flexDirection: 'row',
        gap: 12,
    },
    statCard: {
        flex: 1,
        padding: 16,
        borderRadius: 16,
        shadowColor: '#9b87f5',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 2,
    },
    statLabel: {
        fontSize: 12,
        fontWeight: '600',
        marginBottom: 8,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    statRow: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        gap: 8,
    },
    statValue: {
        fontSize: 24,
        fontWeight: '700',
    },
    trendBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2,
        backgroundColor: '#D1FAE5',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 8,
    },
    trendText: {
        fontSize: 11,
        fontWeight: '700',
        color: '#10B981',
    },
    recommendationItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 16,
        marginBottom: 12,
        shadowColor: '#9b87f5',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 2,
    },
    recommendationContent: {
        flex: 1,
        gap: 8,
    },
    recommendationText: {
        fontSize: 15,
        fontWeight: '500',
        lineHeight: 20,
    },
    recommendationMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    recommendationTime: {
        fontSize: 12,
    },
    quickAccessCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        borderRadius: 20,
        shadowColor: '#9b87f5',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 3,
        marginTop: 8,
    },
    quickAccessIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    quickAccessContent: {
        flex: 1,
    },
    quickAccessTitle: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 4,
    },
    quickAccessSubtitle: {
        fontSize: 14,
    },
});

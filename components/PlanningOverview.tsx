import { useApp } from '@/contexts/AppContext';
import { AlertTriangle, BookOpen, Calendar, Clock, FileText, Sparkles } from 'lucide-react-native';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

interface PlanningData {
    classes?: Array<{ name: string; time: string; days: string; location?: string; instructor?: string }>;
    exams?: Array<{ name: string; date: string; time?: string; module: string; location?: string; weight?: number }>;
    assignments?: Array<{ name: string; deadline: string; module: string; weight?: number; description?: string }>;
    commitments?: Array<{ name: string; time: string; recurrence?: string; category?: string }>;
    modules?: Array<{ code: string; name: string; importance: 'high' | 'medium' | 'low'; credits?: number }>;
}

interface PlanningOverviewProps {
    data: PlanningData;
    uploadDate?: Date;
    aiInsights?: {
        recommendation?: string;
        priority?: 'high' | 'medium' | 'low';
        confidence?: number;
        topPriorityTask?: string;
        estimatedDuration?: string;
        urgencyScore?: number;
    };
}

export default function PlanningOverview({ data, uploadDate, aiInsights }: PlanningOverviewProps) {
    const { theme } = useApp();
    const totalItems = 
        (data.classes?.length || 0) + 
        (data.exams?.length || 0) + 
        (data.assignments?.length || 0) +
        (data.commitments?.length || 0);

    return (
        <View style={[styles.container, { backgroundColor: theme.card }]}>
            <View style={[styles.header, { borderBottomColor: theme.divider }]}>
                <View style={styles.headerLeft}>
                    <Calendar color={theme.primary} size={24} strokeWidth={2} />
                    <View>
                        <Text style={[styles.title, { color: theme.textPrimary }]}>Planning Overview</Text>
                        {uploadDate && (
                            <Text style={[styles.uploadDate, { color: theme.textTertiary }]}>
                                Updated {new Date(uploadDate).toLocaleDateString()}
                            </Text>
                        )}
                    </View>
                </View>
                <View style={[styles.badge, { backgroundColor: theme.primaryMuted }]}>
                    <Text style={[styles.badgeText, { color: theme.primary }]}>{totalItems} items</Text>
                </View>
            </View>

            {/* AI Insights Summary */}
            {aiInsights && (
                <View style={[styles.aiSummary, { backgroundColor: theme.primaryMuted, borderLeftColor: theme.primary }]}>
                    <View style={styles.aiSummaryHeader}>
                        <Sparkles color={theme.primary} size={16} />
                        <Text style={[styles.aiSummaryTitle, { color: theme.textPrimary }]}>AI Insights</Text>
                    </View>
                    
                    {aiInsights.recommendation && (
                        <Text style={[styles.aiRecommendation, { color: theme.textSecondary }]}>{aiInsights.recommendation}</Text>
                    )}
                    
                    <View style={styles.aiMetrics}>
                        {aiInsights.priority && (
                            <View style={styles.metricItem}>
                                <Text style={[styles.metricLabel, { color: theme.textTertiary }]}>Priority</Text>
                                <Text style={[styles.metricValue, { color: theme.textPrimary }]}>
                                    {aiInsights.priority.charAt(0).toUpperCase() + aiInsights.priority.slice(1)}
                                </Text>
                            </View>
                        )}
                        
                        {aiInsights.confidence !== undefined && (
                            <View style={styles.metricItem}>
                                <Text style={[styles.metricLabel, { color: theme.textTertiary }]}>Confidence</Text>
                                <Text style={[styles.metricValue, { color: theme.textPrimary }]}>
                                    {(aiInsights.confidence * 100).toFixed(0)}%
                                </Text>
                            </View>
                        )}
                        
                        {aiInsights.topPriorityTask && (
                            <View style={styles.metricItem}>
                                <Text style={[styles.metricLabel, { color: theme.textTertiary }]}>Top Task</Text>
                                <Text style={[styles.metricValue, { color: theme.textPrimary }]} numberOfLines={1}>
                                    {aiInsights.topPriorityTask}
                                </Text>
                            </View>
                        )}
                    </View>
                </View>
            )}

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {data.classes && data.classes.length > 0 && (
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <BookOpen color={theme.primary} size={18} />
                            <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Classes ({data.classes.length})</Text>
                        </View>
                        {data.classes.map((item, index) => (
                            <View key={index} style={styles.item}>
                                <View style={[styles.itemDot, { backgroundColor: theme.primary }]} />
                                <View style={styles.itemContent}>
                                    <Text style={styles.itemName}>{item.name}</Text>
                                    <Text style={[styles.itemDetail, { color: theme.textSecondary }]}>{item.time} • {item.days}</Text>
                                    {item.location && (
                                        <Text style={[styles.itemExtra, { color: theme.textTertiary }]}>📍 {item.location}</Text>
                                    )}
                                    {item.instructor && (
                                        <Text style={[styles.itemExtra, { color: theme.textTertiary }]}>👨‍🏫 {item.instructor}</Text>
                                    )}
                                </View>
                            </View>
                        ))}
                    </View>
                )}

                {data.exams && data.exams.length > 0 && (
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <AlertTriangle color="#EF4444" size={18} />
                            <Text style={styles.sectionTitle}>Upcoming Exams ({data.exams.length})</Text>
                        </View>
                        {data.exams.map((item, index) => (
                            <View key={index} style={styles.item}>
                                <View style={[styles.itemDot, { backgroundColor: '#EF4444' }]} />
                                <View style={styles.itemContent}>
                                    <Text style={styles.itemName}>{item.name}</Text>
                                    <Text style={styles.itemDetail}>{item.date} • {item.module}</Text>
                                    {item.time && (
                                        <Text style={[styles.itemExtra, { color: theme.textTertiary }]}>🕘 {item.time}</Text>
                                    )}
                                    {item.location && (
                                        <Text style={[styles.itemExtra, { color: theme.textTertiary }]}>📍 {item.location}</Text>
                                    )}
                                    {item.weight && (
                                        <Text style={[styles.itemExtra, { color: theme.textTertiary }]}>📊 {item.weight}% weight</Text>
                                    )}
                                </View>
                            </View>
                        ))}
                    </View>
                )}

                {data.assignments && data.assignments.length > 0 && (
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <FileText color="#F59E0B" size={18} />
                            <Text style={styles.sectionTitle}>Assignments ({data.assignments.length})</Text>
                        </View>
                        {data.assignments.map((item, index) => (
                            <View key={index} style={styles.item}>
                                <View style={[styles.itemDot, { backgroundColor: '#F59E0B' }]} />
                                <View style={styles.itemContent}>
                                    <Text style={styles.itemName}>{item.name}</Text>
                                    <Text style={styles.itemDetail}>{item.deadline} • {item.module}</Text>
                                    {item.weight && (
                                        <Text style={[styles.itemExtra, { color: theme.textTertiary }]}>📊 {item.weight}% weight</Text>
                                    )}
                                    {item.description && (
                                        <Text style={[styles.itemExtra, { color: theme.textTertiary }]}>{item.description}</Text>
                                    )}
                                </View>
                            </View>
                        ))}
                    </View>
                )}

                {data.commitments && data.commitments.length > 0 && (
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Clock color="#10B981" size={18} />
                            <Text style={styles.sectionTitle}>Commitments ({data.commitments.length})</Text>
                        </View>
                        {data.commitments.map((item, index) => (
                            <View key={index} style={styles.item}>
                                <View style={[styles.itemDot, { backgroundColor: '#10B981' }]} />
                                <View style={styles.itemContent}>
                                    <Text style={styles.itemName}>{item.name}</Text>
                                    <Text style={styles.itemDetail}>{item.time}</Text>
                                    {item.recurrence && (
                                        <Text style={[styles.itemExtra, { color: theme.textTertiary }]}>🔁 {item.recurrence}</Text>
                                    )}
                                    {item.category && (
                                        <Text style={[styles.itemExtra, { color: theme.textTertiary }]}>🏷️ {item.category}</Text>
                                    )}
                                </View>
                            </View>
                        ))}
                    </View>
                )}

                {data.modules && data.modules.length > 0 && (
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <BookOpen color={theme.primary} size={18} />
                            <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Modules ({data.modules.length})</Text>
                        </View>
                        {data.modules.map((item, index) => (
                            <View key={index} style={[styles.item, styles.moduleItem]}>
                                <View style={[styles.itemDot, { 
                                    backgroundColor: item.importance === 'high' ? '#EF4444' : 
                                                  item.importance === 'medium' ? '#F59E0B' : '#10B981' 
                                }]} />
                                <View style={styles.itemContent}>
                                    <Text style={styles.itemName}>{item.name} ({item.code})</Text>
                                    <Text style={[styles.itemDetail, { color: theme.textSecondary }]}>Importance: {item.importance}</Text>
                                    {item.credits && (
                                        <Text style={[styles.itemExtra, { color: theme.textTertiary }]}>🎓 {item.credits} credits</Text>
                                    )}
                                </View>
                            </View>
                        ))}
                    </View>
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        borderRadius: 24,
        padding: 20,
        maxHeight: 400,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
        paddingBottom: 16,
        borderBottomWidth: 1,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
    },
    uploadDate: {
        fontSize: 12,
        marginTop: 2,
    },
    badge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    badgeText: {
        fontSize: 13,
        fontWeight: '600',
    },
    content: {
        flex: 1,
    },
    section: {
        marginBottom: 20,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 15,
        fontWeight: '700',
    },
    item: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 12,
        gap: 12,
    },
    itemDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginTop: 6,
    },
    itemContent: {
        flex: 1,
    },
    itemName: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 2,
    },
    itemDetail: {
        fontSize: 13,
    },
    itemExtra: {
        fontSize: 12,
        marginTop: 2,
    },
    moduleItem: {
        paddingLeft: 8,
    },
    aiSummary: {
        padding: 16,
        marginBottom: 20,
        borderBottomWidth: 1,
        borderLeftWidth: 4,
    },
    aiSummaryHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    aiSummaryTitle: {
        fontSize: 16,
        fontWeight: '600',
    },
    aiRecommendation: {
        fontSize: 14,
        marginTop: 8,
    },
    aiMetrics: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 12,
    },
    metricItem: {
        flexDirection: 'column',
        gap: 4,
    },
    metricLabel: {
        fontSize: 12,
    },
    metricValue: {
        fontSize: 14,
        fontWeight: '600',
    },
});

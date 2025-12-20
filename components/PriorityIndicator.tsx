import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface PriorityIndicatorProps {
    level: 'high' | 'medium' | 'low';
    confidence?: number;
    moduleImportance?: 'high' | 'medium' | 'low';
}

export default function PriorityIndicator({ level, confidence, moduleImportance }: PriorityIndicatorProps) {
    const getPriorityColor = () => {
        switch (level) {
            case 'high':
                return '#9b87f5';
            case 'medium':
                return '#D6BCFA';
            case 'low':
                return '#E9D5FF';
            default:
                return '#D6BCFA';
        }
    };

    const getPriorityLabel = () => {
        switch (level) {
            case 'high':
                return 'High Priority';
            case 'medium':
                return 'Medium Priority';
            case 'low':
                return 'Low Priority';
            default:
                return 'Medium Priority';
        }
    };

    return (
        <View style={styles.container}>
            <View style={[styles.badge, { backgroundColor: getPriorityColor() }]}>
                <View style={styles.dot} />
                <Text style={styles.label}>{getPriorityLabel()}</Text>
            </View>
            
            {confidence !== undefined && (
                <View style={styles.confidenceBadge}>
                    <Text style={styles.confidenceText}>{Math.round(confidence * 100)}% confident</Text>
                </View>
            )}
            
            {moduleImportance && (
                <View style={[styles.moduleBadge, { 
                    backgroundColor: moduleImportance === 'high' ? '#FEF3C7' : 
                                   moduleImportance === 'medium' ? '#DBEAFE' : '#F3F4F6' 
                }]}>
                    <Text style={styles.moduleText}>
                        {moduleImportance === 'high' ? '⭐ Core Module' : 
                         moduleImportance === 'medium' ? '📚 Important' : '📖 Standard'}
                    </Text>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        flexWrap: 'wrap',
    },
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        gap: 6,
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#FFFFFF',
    },
    label: {
        fontSize: 13,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    confidenceBadge: {
        backgroundColor: '#F3F4F6',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 12,
    },
    confidenceText: {
        fontSize: 12,
        fontWeight: '500',
        color: '#6B7280',
    },
    moduleBadge: {
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 12,
    },
    moduleText: {
        fontSize: 12,
        fontWeight: '500',
        color: '#374151',
    },
});

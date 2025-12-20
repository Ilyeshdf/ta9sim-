import { LinearGradient } from 'expo-linear-gradient';
import { Brain, Check, FileText, Sparkles, Target, X } from 'lucide-react-native';
import React from 'react';
import { ActivityIndicator, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useApp } from '@/contexts/AppContext';

interface ProcessingStep {
    id: string;
    name: string;
    icon: 'pdf' | 'brain' | 'target' | 'sparkles';
    status: 'pending' | 'processing' | 'complete' | 'error';
}

interface DocumentProcessingModalProps {
    visible: boolean;
    onClose: () => void;
    steps: ProcessingStep[];
    currentStep?: string;
}

export default function DocumentProcessingModal({
    visible,
    onClose,
    steps,
    currentStep,
}: DocumentProcessingModalProps) {
    const { theme } = useApp();
    const getIcon = (type: string, color: string, isActive: boolean) => {
        const size = 24;
        const strokeWidth = isActive ? 2.5 : 2;
        
        switch (type) {
            case 'pdf':
                return <FileText color={color} size={size} strokeWidth={strokeWidth} />;
            case 'brain':
                return <Brain color={color} size={size} strokeWidth={strokeWidth} />;
            case 'target':
                return <Target color={color} size={size} strokeWidth={strokeWidth} />;
            case 'sparkles':
                return <Sparkles color={color} size={size} strokeWidth={strokeWidth} />;
            default:
                return <FileText color={color} size={size} strokeWidth={strokeWidth} />;
        }
    };

    const getStepColor = (status: string) => {
        switch (status) {
            case 'complete':
                return '#10B981';
            case 'processing':
                return '#9b87f5';
            case 'error':
                return '#EF4444';
            default:
                return '#D1D5DB';
        }
    };

    const allComplete = steps.every(step => step.status === 'complete');

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.modalContainer}>
                    <LinearGradient
                        colors={['#F3E8FF', '#FFFFFF']}
                        style={styles.gradient}
                    >
                        {/* Header */}
                        <View style={styles.header}>
                            <View style={[styles.headerIcon, { backgroundColor: theme.surface }]}>
                                <Brain color={theme.primary} size={32} strokeWidth={2.5} />
                            </View>
                            <Text style={[styles.title, { color: theme.textPrimary }]}>
                                {allComplete ? 'Processing Complete!' : 'AI Processing Document'}
                            </Text>
                            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                                {allComplete 
                                    ? 'Your planning has been extracted and analyzed'
                                    : 'Our AI agents are analyzing your academic planning'}
                            </Text>
                        </View>

                        {/* Processing Steps */}
                        <View style={styles.stepsContainer}>
                            {steps.map((step, index) => {
                                const isActive = step.id === currentStep;
                                const color = getStepColor(step.status);
                                
                                return (
                                    <View key={step.id}>
                                        <View style={styles.stepItem}>
                                            <View style={[
                                                styles.stepIconContainer,
                                                { 
                                                    backgroundColor: step.status === 'complete' ? '#D1FAE5' :
                                                                   step.status === 'processing' ? '#F3E8FF' :
                                                                   step.status === 'error' ? '#FEE2E2' : '#F9FAFB'
                                                }
                                            ]}>
                                                {step.status === 'processing' ? (
                                                    <ActivityIndicator color={theme.primary} size="small" />
                                                ) : step.status === 'complete' ? (
                                                    <Check color="#10B981" size={24} strokeWidth={3} />
                                                ) : step.status === 'error' ? (
                                                    <X color="#EF4444" size={24} strokeWidth={3} />
                                                ) : (
                                                    getIcon(step.icon, color, isActive)
                                                )}
                                            </View>
                                            <View style={styles.stepContent}>
                                                <Text style={[
                                                    styles.stepName,
                                                    { 
                                                        color: step.status === 'complete' || step.status === 'processing' 
                                                            ? '#1F2937' : '#9CA3AF'
                                                    }
                                                ]}>
                                                    {step.name}
                                                </Text>
                                                <Text style={[
                                                    styles.stepStatus,
                                                    { color }
                                                ]}>
                                                    {step.status === 'complete' ? 'Complete' :
                                                     step.status === 'processing' ? 'Processing...' :
                                                     step.status === 'error' ? 'Error' : 'Waiting'}
                                                </Text>
                                            </View>
                                        </View>
                                        {index < steps.length - 1 && (
                                            <View style={[
                                                styles.connector,
                                                { 
                                                    backgroundColor: step.status === 'complete' ? '#D1FAE5' : '#F3F4F6'
                                                }
                                            ]} />
                                        )}
                                    </View>
                                );
                            })}
                        </View>

                        {/* Close Button */}
                        {allComplete && (
                            <Pressable style={[styles.closeButton, { backgroundColor: theme.primary }]} onPress={onClose}>
                                <Text style={styles.closeButtonText}>Done</Text>
                            </Pressable>
                        )}
                    </LinearGradient>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContainer: {
        width: '100%',
        maxWidth: 400,
        borderRadius: 32,
        overflow: 'hidden',
        shadowColor: '#9b87f5',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.3,
        shadowRadius: 24,
        elevation: 12,
    },
    gradient: {
        padding: 32,
    },
    header: {
        alignItems: 'center',
        marginBottom: 32,
    },
    headerIcon: {
        width: 72,
        height: 72,
        borderRadius: 36,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 15,
        textAlign: 'center',
        lineHeight: 22,
    },
    stepsContainer: {
        marginBottom: 24,
    },
    stepItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    stepIconContainer: {
        width: 56,
        height: 56,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
    },
    stepContent: {
        flex: 1,
    },
    stepName: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    stepStatus: {
        fontSize: 13,
        fontWeight: '500',
    },
    connector: {
        width: 3,
        height: 20,
        marginLeft: 27,
        marginVertical: 4,
    },
    closeButton: {
        backgroundColor: '#9b87f5',
        paddingVertical: 16,
        borderRadius: 16,
        alignItems: 'center',
        shadowColor: '#9b87f5',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 4,
    },
    closeButtonText: {
        fontSize: 17,
        fontWeight: '700',
        color: '#FFFFFF',
    },
});

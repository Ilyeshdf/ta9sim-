import { StyleSheet, ScrollView, TouchableOpacity, TextInput, View as RNView, Modal } from 'react-native';
import { Text, View } from '@/components/Themed';
import { colors } from '@/constants/Colors';
import { X, Sparkles, GraduationCap, Briefcase, Activity, Calendar, Clock, Repeat, Users, Check } from 'lucide-react-native';
import { useState } from 'react';
import { useApp, Task } from '@/contexts/AppContext';

interface NewTaskModalProps {
    visible: boolean;
    onClose: () => void;
}

export default function NewTaskModal({ visible, onClose }: NewTaskModalProps) {
    const { addTask } = useApp();
    const [taskInput, setTaskInput] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<Task['category']>('Academics');
    const [deadline, setDeadline] = useState('Tomorrow');
    const [time, setTime] = useState('5:00 PM');
    const [duration, setDuration] = useState('2h');
    const [effortLevel, setEffortLevel] = useState(4);
    const [priority, setPriority] = useState<Task['priority']>('High');

    const handleSaveTask = () => {
        if (!taskInput.trim()) return;
        
        addTask({
            title: taskInput.trim(),
            category: selectedCategory,
            priority: priority,
            completed: false,
            dueDate: deadline,
            time: time,
            duration: duration,
            effortLevel: effortLevel,
        });
        
        setTaskInput('');
        setSelectedCategory('Academics');
        setPriority('High');
        setEffortLevel(4);
        onClose();
    };

    const categories: { name: Task['category']; icon: typeof GraduationCap; color: string; bg: string }[] = [
        { name: 'Academics', icon: GraduationCap, color: colors.blue, bg: colors.blueMuted },
        { name: 'Work', icon: Briefcase, color: colors.purple, bg: colors.purpleMuted },
        { name: 'Wellness', icon: Activity, color: colors.green, bg: colors.greenMuted },
        { name: 'Social', icon: Users, color: colors.orange, bg: colors.orangeMuted },
    ];

    const priorityConfig = {
        Low: { color: colors.green, bg: colors.greenMuted },
        Medium: { color: colors.orange, bg: colors.orangeMuted },
        High: { color: colors.error, bg: '#FEE2E2' },
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={onClose}
        >
            <View style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={onClose} style={styles.headerBtn}>
                        <X color={colors.textSecondary} size={22} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>New Task</Text>
                    <TouchableOpacity style={styles.headerBtn} onPress={handleSaveTask}>
                        <Check color={colors.primary} size={22} strokeWidth={2.5} />
                    </TouchableOpacity>
                </View>

                <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                    {/* Smart Input Card */}
                    <View style={styles.inputCard}>
                        <View style={styles.inputHeader}>
                            <View style={styles.sparkleIcon}>
                                <Sparkles color={colors.primary} size={14} />
                            </View>
                            <Text style={styles.inputLabel}>What needs to be done?</Text>
                        </View>
                        <TextInput
                            style={styles.taskInput}
                            placeholder="Draft chemistry lab report..."
                            placeholderTextColor={colors.textTertiary}
                            multiline
                            value={taskInput}
                            onChangeText={setTaskInput}
                        />
                    </View>

                    {/* Category Selection */}
                    <Text style={styles.sectionTitle}>Category</Text>
                    <View style={styles.categoryGrid}>
                        {categories.map((category) => {
                            const Icon = category.icon;
                            const isSelected = selectedCategory === category.name;
                            return (
                                <TouchableOpacity
                                    key={category.name}
                                    style={[
                                        styles.categoryCard,
                                        { backgroundColor: isSelected ? category.bg : colors.white },
                                        isSelected && { borderColor: category.color }
                                    ]}
                                    onPress={() => setSelectedCategory(category.name)}
                                >
                                    <View style={[styles.categoryIcon, { backgroundColor: category.color + '20' }]}>
                                        <Icon color={category.color} size={18} />
                                    </View>
                                    <Text style={[
                                        styles.categoryText, 
                                        isSelected && { color: category.color, fontWeight: '600' }
                                    ]}>
                                        {category.name}
                                    </Text>
                                    {isSelected && (
                                        <View style={[styles.categoryCheck, { backgroundColor: category.color }]}>
                                            <Check color={colors.white} size={10} strokeWidth={3} />
                                        </View>
                                    )}
                                </TouchableOpacity>
                            );
                        })}
                    </View>

                    {/* Details Row */}
                    <Text style={styles.sectionTitle}>Details</Text>
                    <View style={styles.detailsRow}>
                        <TouchableOpacity style={styles.detailItem}>
                            <View style={[styles.detailIcon, { backgroundColor: colors.primaryMuted }]}>
                                <Calendar color={colors.primary} size={16} />
                            </View>
                            <View style={styles.detailContent}>
                                <Text style={styles.detailLabel}>Date</Text>
                                <Text style={styles.detailValue}>{deadline}</Text>
                            </View>
                        </TouchableOpacity>
                        
                        <TouchableOpacity style={styles.detailItem}>
                            <View style={[styles.detailIcon, { backgroundColor: colors.orangeMuted }]}>
                                <Clock color={colors.orange} size={16} />
                            </View>
                            <View style={styles.detailContent}>
                                <Text style={styles.detailLabel}>Time</Text>
                                <Text style={styles.detailValue}>{time}</Text>
                            </View>
                        </TouchableOpacity>
                        
                        <TouchableOpacity style={styles.detailItem}>
                            <View style={[styles.detailIcon, { backgroundColor: colors.greenMuted }]}>
                                <Repeat color={colors.green} size={16} />
                            </View>
                            <View style={styles.detailContent}>
                                <Text style={styles.detailLabel}>Duration</Text>
                                <Text style={styles.detailValue}>{duration}</Text>
                            </View>
                        </TouchableOpacity>
                    </View>

                    {/* Priority Selection */}
                    <Text style={styles.sectionTitle}>Priority</Text>
                    <View style={styles.priorityRow}>
                        {(['Low', 'Medium', 'High'] as const).map((level) => {
                            const config = priorityConfig[level];
                            const isSelected = priority === level;
                            return (
                                <TouchableOpacity
                                    key={level}
                                    style={[
                                        styles.priorityBtn,
                                        { backgroundColor: isSelected ? config.bg : colors.white },
                                        isSelected && { borderColor: config.color }
                                    ]}
                                    onPress={() => setPriority(level)}
                                >
                                    <View style={[styles.priorityDot, { backgroundColor: config.color }]} />
                                    <Text style={[
                                        styles.priorityText,
                                        isSelected && { color: config.color, fontWeight: '600' }
                                    ]}>
                                        {level}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>

                    {/* Effort Level */}
                    <View style={styles.effortCard}>
                        <View style={styles.effortHeader}>
                            <Text style={styles.effortTitle}>Effort Level</Text>
                            <Text style={styles.effortValue}>{effortLevel}/5</Text>
                        </View>
                        <View style={styles.effortBar}>
                            {[1, 2, 3, 4, 5].map((level) => (
                                <TouchableOpacity
                                    key={level}
                                    style={[
                                        styles.effortDot,
                                        level <= effortLevel && { backgroundColor: colors.primary }
                                    ]}
                                    onPress={() => setEffortLevel(level)}
                                />
                            ))}
                        </View>
                    </View>

                    {/* Create Button */}
                    <TouchableOpacity style={styles.createBtn} onPress={handleSaveTask}>
                        <Sparkles color={colors.white} size={18} />
                        <Text style={styles.createBtnText}>Create Task</Text>
                    </TouchableOpacity>

                    <View style={{ height: 40 }} />
                </ScrollView>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 16,
        backgroundColor: colors.white,
        borderBottomWidth: 1,
        borderBottomColor: colors.gray100,
    },
    headerBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.gray50,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 17,
        fontWeight: '600',
        color: colors.textPrimary,
    },
    scrollView: {
        flex: 1,
        paddingHorizontal: 20,
    },
    inputCard: {
        backgroundColor: colors.white,
        borderRadius: 16,
        padding: 18,
        marginTop: 20,
        marginBottom: 24,
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.06,
        shadowRadius: 12,
        elevation: 3,
    },
    inputHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 14,
        backgroundColor: 'transparent',
    },
    sparkleIcon: {
        width: 26,
        height: 26,
        borderRadius: 8,
        backgroundColor: colors.primaryMuted,
        alignItems: 'center',
        justifyContent: 'center',
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.textSecondary,
    },
    taskInput: {
        fontSize: 16,
        color: colors.textPrimary,
        minHeight: 60,
        textAlignVertical: 'top',
        lineHeight: 24,
    },
    sectionTitle: {
        fontSize: 13,
        fontWeight: '600',
        color: colors.textTertiary,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 12,
    },
    categoryGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
        marginBottom: 24,
    },
    categoryCard: {
        width: '48%',
        flexDirection: 'row',
        alignItems: 'center',
        padding: 14,
        borderRadius: 14,
        borderWidth: 2,
        borderColor: colors.gray200,
    },
    categoryIcon: {
        width: 36,
        height: 36,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
    },
    categoryText: {
        flex: 1,
        fontSize: 14,
        color: colors.textSecondary,
    },
    categoryCheck: {
        width: 18,
        height: 18,
        borderRadius: 9,
        alignItems: 'center',
        justifyContent: 'center',
    },
    detailsRow: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 24,
    },
    detailItem: {
        flex: 1,
        backgroundColor: colors.white,
        padding: 14,
        borderRadius: 14,
        alignItems: 'center',
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
        elevation: 2,
    },
    detailIcon: {
        width: 36,
        height: 36,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
    },
    detailContent: {
        alignItems: 'center',
        backgroundColor: 'transparent',
    },
    detailLabel: {
        fontSize: 11,
        color: colors.textTertiary,
        marginBottom: 2,
    },
    detailValue: {
        fontSize: 13,
        fontWeight: '600',
        color: colors.textPrimary,
    },
    priorityRow: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 24,
    },
    priorityBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 14,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: colors.gray200,
    },
    priorityDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    priorityText: {
        fontSize: 14,
        color: colors.textSecondary,
    },
    effortCard: {
        backgroundColor: colors.white,
        padding: 18,
        borderRadius: 16,
        marginBottom: 24,
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
        elevation: 2,
    },
    effortHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
        backgroundColor: 'transparent',
    },
    effortTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: colors.textPrimary,
    },
    effortValue: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.primary,
    },
    effortBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 8,
    },
    effortDot: {
        flex: 1,
        height: 8,
        borderRadius: 4,
        backgroundColor: colors.gray200,
    },
    createBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        backgroundColor: colors.primary,
        paddingVertical: 18,
        borderRadius: 16,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.35,
        shadowRadius: 12,
        elevation: 6,
    },
    createBtnText: {
        fontSize: 16,
        fontWeight: '700',
        color: colors.white,
    },
});

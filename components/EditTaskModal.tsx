import { StyleSheet, ScrollView, TouchableOpacity, TextInput, View as RNView, Modal, Platform } from 'react-native';
import { Text, View } from '@/components/Themed';
import { X, Sparkles, GraduationCap, Briefcase, Activity, Calendar, Clock, Repeat, Users, Check, ChevronDown, Trash2 } from 'lucide-react-native';
import { useState, useEffect } from 'react';
import { useApp, Task } from '@/contexts/AppContext';

interface EditTaskModalProps {
    visible: boolean;
    onClose: () => void;
    task: Task | null;
}

const DEADLINES = ['Today', 'Tomorrow', 'This Week', 'Next Week', 'Custom'];
const TIMES = ['9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM', '6:00 PM', '7:00 PM', '8:00 PM'];
const DURATIONS = ['30m', '1h', '1.5h', '2h', '2.5h', '3h', '4h'];

export default function EditTaskModal({ visible, onClose, task }: EditTaskModalProps) {
    const { updateTask, deleteTask, theme } = useApp();
    const [taskInput, setTaskInput] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<Task['category']>('Academics');
    const [deadline, setDeadline] = useState('Tomorrow');
    const [time, setTime] = useState('5:00 PM');
    const [duration, setDuration] = useState('2h');
    const [effortLevel, setEffortLevel] = useState(4);
    const [priority, setPriority] = useState<Task['priority']>('High');
    const [showDeadlinePicker, setShowDeadlinePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [showDurationPicker, setShowDurationPicker] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    useEffect(() => {
        if (task) {
            setTaskInput(task.title);
            setSelectedCategory(task.category);
            setPriority(task.priority);
            setDeadline(task.dueDate || 'Tomorrow');
            setTime(task.time || '5:00 PM');
            setDuration(task.duration || '2h');
            setEffortLevel(task.effortLevel || 4);
        }
    }, [task]);

    const handleSaveTask = () => {
        if (!taskInput.trim() || !task) return;
        
        updateTask(task.id, {
            title: taskInput.trim(),
            category: selectedCategory,
            priority: priority,
            dueDate: deadline,
            time: time,
            duration: duration,
            effortLevel: effortLevel,
        });
        
        onClose();
    };

    const handleDelete = () => {
        if (task) {
            deleteTask(task.id);
            setShowDeleteConfirm(false);
            onClose();
        }
    };

    const categories: { name: Task['category']; icon: typeof GraduationCap; color: string; bg: string }[] = [
        { name: 'Academics', icon: GraduationCap, color: theme.blue, bg: theme.blueMuted },
        { name: 'Work', icon: Briefcase, color: theme.purple, bg: theme.purpleMuted },
        { name: 'Wellness', icon: Activity, color: theme.green, bg: theme.greenMuted },
        { name: 'Social', icon: Users, color: theme.orange, bg: theme.orangeMuted },
    ];

    const priorityConfig = {
        Low: { color: theme.green, bg: theme.greenMuted },
        Medium: { color: theme.orange, bg: theme.orangeMuted },
        High: { color: theme.error, bg: '#FEE2E2' },
    };

    if (!task) return null;

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={onClose}
        >
            <View style={[styles.container, { backgroundColor: theme.background }]}>
                {/* Header */}
                <View style={[styles.header, { backgroundColor: theme.card, borderBottomColor: theme.gray100 }]}>
                    <TouchableOpacity onPress={onClose} style={[styles.headerBtn, { backgroundColor: theme.backgroundTertiary }]}>
                        <X color={theme.textSecondary} size={22} />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>Edit Task</Text>
                    <TouchableOpacity style={[styles.headerBtn, { backgroundColor: theme.backgroundTertiary }]} onPress={handleSaveTask}>
                        <Check color={theme.primary} size={22} strokeWidth={2.5} />
                    </TouchableOpacity>
                </View>

                <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                    {/* Smart Input Card */}
                    <View style={[styles.inputCard, { backgroundColor: theme.card }]}>
                        <View style={[styles.inputHeader, { backgroundColor: 'transparent' }]}>
                            <View style={[styles.sparkleIcon, { backgroundColor: theme.primaryMuted }]}>
                                <Sparkles color={theme.primary} size={14} />
                            </View>
                            <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Task Title</Text>
                        </View>
                        <TextInput
                            style={[styles.taskInput, { color: theme.textPrimary }]}
                            placeholder="Enter task..."
                            placeholderTextColor={theme.textTertiary}
                            multiline
                            value={taskInput}
                            onChangeText={setTaskInput}
                        />
                    </View>

                    {/* Category Selection */}
                    <Text style={[styles.sectionTitle, { color: theme.textTertiary }]}>Category</Text>
                    <View style={styles.categoryGrid}>
                        {categories.map((category) => {
                            const Icon = category.icon;
                            const isSelected = selectedCategory === category.name;
                            return (
                                <TouchableOpacity
                                    key={category.name}
                                    style={[
                                        styles.categoryCard,
                                        { backgroundColor: isSelected ? category.bg : theme.card, borderColor: isSelected ? category.color : theme.gray200 }
                                    ]}
                                    onPress={() => setSelectedCategory(category.name)}
                                >
                                    <View style={[styles.categoryIcon, { backgroundColor: category.color + '20' }]}>
                                        <Icon color={category.color} size={18} />
                                    </View>
                                    <Text style={[
                                        styles.categoryText, 
                                        { color: isSelected ? category.color : theme.textSecondary },
                                        isSelected && { fontWeight: '600' }
                                    ]}>
                                        {category.name}
                                    </Text>
                                    {isSelected && (
                                        <View style={[styles.categoryCheck, { backgroundColor: category.color }]}>
                                            <Check color={theme.white} size={10} strokeWidth={3} />
                                        </View>
                                    )}
                                </TouchableOpacity>
                            );
                        })}
                    </View>

                    {/* Details Row */}
                    <Text style={[styles.sectionTitle, { color: theme.textTertiary }]}>Details</Text>
                    <View style={styles.detailsRow}>
                        <TouchableOpacity 
                            style={[styles.detailItem, { backgroundColor: theme.card }]}
                            onPress={() => setShowDeadlinePicker(true)}
                        >
                            <View style={[styles.detailIcon, { backgroundColor: theme.primaryMuted }]}>
                                <Calendar color={theme.primary} size={16} />
                            </View>
                            <View style={[styles.detailContent, { backgroundColor: 'transparent' }]}>
                                <Text style={[styles.detailLabel, { color: theme.textTertiary }]}>Date</Text>
                                <View style={styles.detailValueRow}>
                                    <Text style={[styles.detailValue, { color: theme.textPrimary }]}>{deadline}</Text>
                                    <ChevronDown color={theme.textTertiary} size={12} />
                                </View>
                            </View>
                        </TouchableOpacity>
                        
                        <TouchableOpacity 
                            style={[styles.detailItem, { backgroundColor: theme.card }]}
                            onPress={() => setShowTimePicker(true)}
                        >
                            <View style={[styles.detailIcon, { backgroundColor: theme.orangeMuted }]}>
                                <Clock color={theme.orange} size={16} />
                            </View>
                            <View style={[styles.detailContent, { backgroundColor: 'transparent' }]}>
                                <Text style={[styles.detailLabel, { color: theme.textTertiary }]}>Time</Text>
                                <View style={styles.detailValueRow}>
                                    <Text style={[styles.detailValue, { color: theme.textPrimary }]}>{time}</Text>
                                    <ChevronDown color={theme.textTertiary} size={12} />
                                </View>
                            </View>
                        </TouchableOpacity>
                        
                        <TouchableOpacity 
                            style={[styles.detailItem, { backgroundColor: theme.card }]}
                            onPress={() => setShowDurationPicker(true)}
                        >
                            <View style={[styles.detailIcon, { backgroundColor: theme.greenMuted }]}>
                                <Repeat color={theme.green} size={16} />
                            </View>
                            <View style={[styles.detailContent, { backgroundColor: 'transparent' }]}>
                                <Text style={[styles.detailLabel, { color: theme.textTertiary }]}>Duration</Text>
                                <View style={styles.detailValueRow}>
                                    <Text style={[styles.detailValue, { color: theme.textPrimary }]}>{duration}</Text>
                                    <ChevronDown color={theme.textTertiary} size={12} />
                                </View>
                            </View>
                        </TouchableOpacity>
                    </View>

                    {/* Priority Selection */}
                    <Text style={[styles.sectionTitle, { color: theme.textTertiary }]}>Priority</Text>
                    <View style={styles.priorityRow}>
                        {(['Low', 'Medium', 'High'] as const).map((level) => {
                            const config = priorityConfig[level];
                            const isSelected = priority === level;
                            return (
                                <TouchableOpacity
                                    key={level}
                                    style={[
                                        styles.priorityBtn,
                                        { backgroundColor: isSelected ? config.bg : theme.card, borderColor: isSelected ? config.color : theme.gray200 }
                                    ]}
                                    onPress={() => setPriority(level)}
                                >
                                    <View style={[styles.priorityDot, { backgroundColor: config.color }]} />
                                    <Text style={[
                                        styles.priorityText,
                                        { color: isSelected ? config.color : theme.textSecondary },
                                        isSelected && { fontWeight: '600' }
                                    ]}>
                                        {level}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>

                    {/* Effort Level */}
                    <View style={[styles.effortCard, { backgroundColor: theme.card }]}>
                        <View style={[styles.effortHeader, { backgroundColor: 'transparent' }]}>
                            <Text style={[styles.effortTitle, { color: theme.textPrimary }]}>Effort Level</Text>
                            <Text style={[styles.effortValue, { color: theme.primary }]}>{effortLevel}/5</Text>
                        </View>
                        <View style={styles.effortBar}>
                            {[1, 2, 3, 4, 5].map((level) => (
                                <TouchableOpacity
                                    key={level}
                                    style={[
                                        styles.effortDot,
                                        { backgroundColor: level <= effortLevel ? theme.primary : theme.gray200 }
                                    ]}
                                    onPress={() => setEffortLevel(level)}
                                />
                            ))}
                        </View>
                    </View>

                    {/* Save Button */}
                    <TouchableOpacity style={[styles.saveBtn, { backgroundColor: theme.primary }]} onPress={handleSaveTask}>
                        <Sparkles color={theme.white} size={18} />
                        <Text style={styles.saveBtnText}>Save Changes</Text>
                    </TouchableOpacity>

                    {/* Delete Button */}
                    <TouchableOpacity 
                        style={[styles.deleteBtn, { backgroundColor: theme.error + '10' }]} 
                        onPress={() => setShowDeleteConfirm(true)}
                    >
                        <Trash2 color={theme.error} size={18} />
                        <Text style={[styles.deleteBtnText, { color: theme.error }]}>Delete Task</Text>
                    </TouchableOpacity>

                    <View style={{ height: 40 }} />
                </ScrollView>

                {/* Delete Confirmation Modal */}
                <Modal visible={showDeleteConfirm} transparent animationType="fade">
                    <View style={styles.confirmOverlay}>
                        <View style={[styles.confirmContainer, { backgroundColor: theme.card }]}>
                            <Text style={[styles.confirmTitle, { color: theme.textPrimary }]}>Delete Task?</Text>
                            <Text style={[styles.confirmText, { color: theme.textSecondary }]}>
                                Are you sure you want to delete this task? This action cannot be undone.
                            </Text>
                            <View style={styles.confirmButtons}>
                                <TouchableOpacity 
                                    style={[styles.confirmBtn, { backgroundColor: theme.gray100 }]}
                                    onPress={() => setShowDeleteConfirm(false)}
                                >
                                    <Text style={[styles.confirmBtnText, { color: theme.textPrimary }]}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity 
                                    style={[styles.confirmBtn, { backgroundColor: theme.error }]}
                                    onPress={handleDelete}
                                >
                                    <Text style={[styles.confirmBtnText, { color: '#FFF' }]}>Delete</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>

                {/* Pickers - same as NewTaskModal */}
                <Modal visible={showDeadlinePicker} transparent animationType="fade">
                    <TouchableOpacity style={styles.pickerOverlay} activeOpacity={1} onPress={() => setShowDeadlinePicker(false)}>
                        <View style={[styles.pickerContainer, { backgroundColor: theme.card }]}>
                            <Text style={[styles.pickerTitle, { color: theme.textPrimary }]}>Select Date</Text>
                            {DEADLINES.map((item) => (
                                <TouchableOpacity
                                    key={item}
                                    style={[styles.pickerOption, deadline === item && { backgroundColor: theme.primaryMuted }]}
                                    onPress={() => { setDeadline(item); setShowDeadlinePicker(false); }}
                                >
                                    <Text style={[styles.pickerOptionText, { color: deadline === item ? theme.primary : theme.textPrimary }]}>{item}</Text>
                                    {deadline === item && <Check color={theme.primary} size={18} />}
                                </TouchableOpacity>
                            ))}
                        </View>
                    </TouchableOpacity>
                </Modal>

                <Modal visible={showTimePicker} transparent animationType="fade">
                    <TouchableOpacity style={styles.pickerOverlay} activeOpacity={1} onPress={() => setShowTimePicker(false)}>
                        <View style={[styles.pickerContainer, { backgroundColor: theme.card, maxHeight: 400 }]}>
                            <Text style={[styles.pickerTitle, { color: theme.textPrimary }]}>Select Time</Text>
                            <ScrollView showsVerticalScrollIndicator={false}>
                                {TIMES.map((item) => (
                                    <TouchableOpacity
                                        key={item}
                                        style={[styles.pickerOption, time === item && { backgroundColor: theme.primaryMuted }]}
                                        onPress={() => { setTime(item); setShowTimePicker(false); }}
                                    >
                                        <Text style={[styles.pickerOptionText, { color: time === item ? theme.primary : theme.textPrimary }]}>{item}</Text>
                                        {time === item && <Check color={theme.primary} size={18} />}
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>
                    </TouchableOpacity>
                </Modal>

                <Modal visible={showDurationPicker} transparent animationType="fade">
                    <TouchableOpacity style={styles.pickerOverlay} activeOpacity={1} onPress={() => setShowDurationPicker(false)}>
                        <View style={[styles.pickerContainer, { backgroundColor: theme.card }]}>
                            <Text style={[styles.pickerTitle, { color: theme.textPrimary }]}>Select Duration</Text>
                            {DURATIONS.map((item) => (
                                <TouchableOpacity
                                    key={item}
                                    style={[styles.pickerOption, duration === item && { backgroundColor: theme.primaryMuted }]}
                                    onPress={() => { setDuration(item); setShowDurationPicker(false); }}
                                >
                                    <Text style={[styles.pickerOptionText, { color: duration === item ? theme.primary : theme.textPrimary }]}>{item}</Text>
                                    {duration === item && <Check color={theme.primary} size={18} />}
                                </TouchableOpacity>
                            ))}
                        </View>
                    </TouchableOpacity>
                </Modal>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 16,
        borderBottomWidth: 1,
    },
    headerBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
    headerTitle: { fontSize: 17, fontWeight: '600' },
    scrollView: { flex: 1, paddingHorizontal: 20 },
    inputCard: {
        borderRadius: 16,
        padding: 18,
        marginTop: 20,
        marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.06,
        shadowRadius: 12,
        elevation: 3,
    },
    inputHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 },
    sparkleIcon: { width: 26, height: 26, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
    inputLabel: { fontSize: 14, fontWeight: '600' },
    taskInput: { fontSize: 16, minHeight: 60, textAlignVertical: 'top', lineHeight: 24 },
    sectionTitle: { fontSize: 13, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 },
    categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24 },
    categoryCard: { width: '48%', flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 14, borderWidth: 2 },
    categoryIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
    categoryText: { flex: 1, fontSize: 14 },
    categoryCheck: { width: 18, height: 18, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
    detailsRow: { flexDirection: 'row', gap: 10, marginBottom: 24 },
    detailItem: { flex: 1, padding: 14, borderRadius: 14, alignItems: 'center' },
    detailIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
    detailContent: { alignItems: 'center' },
    detailLabel: { fontSize: 11, marginBottom: 2 },
    detailValue: { fontSize: 13, fontWeight: '600' },
    detailValueRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    priorityRow: { flexDirection: 'row', gap: 10, marginBottom: 24 },
    priorityBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, borderRadius: 12, borderWidth: 2 },
    priorityDot: { width: 8, height: 8, borderRadius: 4 },
    priorityText: { fontSize: 14 },
    effortCard: { padding: 18, borderRadius: 16, marginBottom: 24 },
    effortHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    effortTitle: { fontSize: 15, fontWeight: '600' },
    effortValue: { fontSize: 14, fontWeight: '600' },
    effortBar: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
    effortDot: { flex: 1, height: 8, borderRadius: 4 },
    saveBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        paddingVertical: 18,
        borderRadius: 16,
        shadowColor: '#5B4BDB',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.35,
        shadowRadius: 12,
        elevation: 6,
    },
    saveBtnText: { fontSize: 16, fontWeight: '700', color: '#FFF' },
    deleteBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        paddingVertical: 16,
        borderRadius: 14,
        marginTop: 12,
    },
    deleteBtnText: { fontSize: 15, fontWeight: '600' },
    confirmOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 24 },
    confirmContainer: { width: '100%', borderRadius: 20, padding: 24 },
    confirmTitle: { fontSize: 20, fontWeight: '700', marginBottom: 12, textAlign: 'center' },
    confirmText: { fontSize: 15, lineHeight: 22, textAlign: 'center', marginBottom: 24 },
    confirmButtons: { flexDirection: 'row', gap: 12 },
    confirmBtn: { flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
    confirmBtnText: { fontSize: 15, fontWeight: '600' },
    pickerOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 24 },
    pickerContainer: { width: '100%', borderRadius: 20, padding: 20 },
    pickerTitle: { fontSize: 18, fontWeight: '700', marginBottom: 16, textAlign: 'center' },
    pickerOption: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14, paddingHorizontal: 16, borderRadius: 12, marginBottom: 4 },
    pickerOptionText: { fontSize: 16, fontWeight: '500' },
});

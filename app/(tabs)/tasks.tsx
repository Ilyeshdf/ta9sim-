import { StyleSheet, ScrollView, TouchableOpacity, View as RNView, RefreshControl } from 'react-native';
import { Text, View } from '@/components/Themed';
import { colors } from '@/constants/Colors';
import { 
  Plus, Check, Clock, GraduationCap, Activity, Briefcase, Users,
  Sparkles
} from 'lucide-react-native';
import { useState, useCallback } from 'react';
import NewTaskModal from '@/components/NewTaskModal';
import { useApp, Task } from '@/contexts/AppContext';
import Animated, { 
  FadeInDown, 
  FadeInRight,
  FadeInUp,
  FadeOut,
  Layout,
  useAnimatedStyle, 
  useSharedValue, 
  withSpring,
  withSequence,
  withTiming,
  runOnJS,
  ZoomIn,
  SlideOutRight,
} from 'react-native-reanimated';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

// Animated Checkbox Component
function AnimatedCheckbox({ 
  checked, 
  onToggle,
  color = colors.green 
}: { 
  checked: boolean; 
  onToggle: () => void;
  color?: string;
}) {
  const scale = useSharedValue(1);
  
  const handlePress = () => {
    scale.value = withSequence(
      withSpring(0.8, { damping: 10, stiffness: 400 }),
      withSpring(1.2, { damping: 10, stiffness: 400 }),
      withSpring(1, { damping: 15, stiffness: 200 })
    );
    onToggle();
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedTouchable
      style={[
        styles.checkbox,
        checked && [styles.checkboxChecked, { backgroundColor: color, borderColor: color }],
        animatedStyle
      ]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      {checked && (
        <Animated.View entering={ZoomIn.duration(200)}>
          <Check color={colors.white} size={14} strokeWidth={3} />
        </Animated.View>
      )}
    </AnimatedTouchable>
  );
}

export default function TasksScreen() {
  const [modalVisible, setModalVisible] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [refreshing, setRefreshing] = useState(false);
  const { tasks, toggleTaskCompletion, metrics } = useApp();
  
  const filteredTasks = tasks.filter(task => {
    if (activeFilter === 'pending') return !task.completed;
    if (activeFilter === 'completed') return task.completed;
    return true;
  });

  const pendingCount = tasks.filter(t => !t.completed).length;
  const completedCount = tasks.filter(t => t.completed).length;

  const getCategoryStyle = (category: Task['category']) => {
    switch (category) {
      case 'Academics': return { icon: GraduationCap, color: colors.blue, bg: colors.blueMuted };
      case 'Wellness': return { icon: Activity, color: colors.green, bg: colors.greenMuted };
      case 'Work': return { icon: Briefcase, color: colors.purple, bg: colors.purpleMuted };
      case 'Social': return { icon: Users, color: colors.orange, bg: colors.orangeMuted };
      default: return { icon: GraduationCap, color: colors.blue, bg: colors.blueMuted };
    }
  };

  const getPriorityStyle = (priority: Task['priority']) => {
    switch (priority) {
      case 'High': return { color: colors.error, label: 'High Priority' };
      case 'Medium': return { color: colors.orange, label: 'Medium' };
      case 'Low': return { color: colors.green, label: 'Low' };
      default: return { color: colors.gray400, label: '' };
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1500);
  }, []);

  // FAB Animation
  const fabScale = useSharedValue(1);
  const fabAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: fabScale.value }],
  }));

  const handleFabPress = () => {
    fabScale.value = withSequence(
      withSpring(0.9, { damping: 10 }),
      withSpring(1, { damping: 10 })
    );
    setModalVisible(true);
  };

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
      >
        {/* Header */}
        <Animated.View 
          style={styles.header}
          entering={FadeInDown.duration(500).springify()}
        >
          <Text style={styles.headerTitle}>My Tasks</Text>
          <Text style={styles.headerSubtitle}>
            {pendingCount} pending • {completedCount} completed
          </Text>
        </Animated.View>

        {/* Stats Cards */}
        <View style={styles.statsRow}>
          <Animated.View 
            style={styles.statCard}
            entering={FadeInDown.delay(100).duration(400).springify()}
          >
            <View style={[styles.statIcon, { backgroundColor: colors.primaryMuted }]}>
              <Sparkles color={colors.primary} size={20} />
            </View>
            <View style={styles.statContent}>
              <Text style={styles.statValue}>{metrics.energy}%</Text>
              <Text style={styles.statLabel}>Energy</Text>
            </View>
          </Animated.View>
          <Animated.View 
            style={styles.statCard}
            entering={FadeInDown.delay(200).duration(400).springify()}
          >
            <View style={[styles.statIcon, { backgroundColor: colors.greenMuted }]}>
              <Check color={colors.green} size={20} />
            </View>
            <View style={styles.statContent}>
              <Text style={styles.statValue}>{completedCount}</Text>
              <Text style={styles.statLabel}>Done Today</Text>
            </View>
          </Animated.View>
        </View>

        {/* Filter Tabs - Animated */}
        <Animated.View 
          style={styles.filterContainer}
          entering={FadeInDown.delay(300).duration(400)}
        >
          {(['all', 'pending', 'completed'] as const).map((filter, index) => (
            <AnimatedTouchable 
              key={filter}
              style={[styles.filterTab, activeFilter === filter && styles.filterTabActive]}
              onPress={() => setActiveFilter(filter)}
              entering={FadeInRight.delay(300 + index * 50).duration(300)}
            >
              <Text style={[styles.filterText, activeFilter === filter && styles.filterTextActive]}>
                {filter === 'all' ? `All (${tasks.length})` : 
                 filter === 'pending' ? `Pending (${pendingCount})` : 
                 `Done (${completedCount})`}
              </Text>
            </AnimatedTouchable>
          ))}
        </Animated.View>

        {/* Task List with Layout Animation */}
        <Animated.View style={styles.taskList} layout={Layout.springify()}>
          {filteredTasks.length === 0 ? (
            <Animated.View 
              style={styles.emptyState}
              entering={FadeInUp.delay(400).duration(400)}
            >
              <View style={styles.emptyIcon}>
                <Check color={colors.primary} size={32} />
              </View>
              <Text style={styles.emptyTitle}>
                {activeFilter === 'completed' ? 'No completed tasks yet' : 
                 activeFilter === 'pending' ? 'All caught up!' : 'No tasks yet'}
              </Text>
              <Text style={styles.emptySubtitle}>
                {activeFilter === 'pending' ? 'Great job! You have no pending tasks' : 
                 'Tap + to create your first task'}
              </Text>
            </Animated.View>
          ) : (
            filteredTasks.map((task, index) => {
              const categoryStyle = getCategoryStyle(task.category);
              const priorityStyle = getPriorityStyle(task.priority);
              const IconComponent = categoryStyle.icon;
              
              return (
                <Animated.View
                  key={task.id}
                  style={[styles.taskCard, task.completed && styles.taskCardCompleted]}
                  entering={FadeInRight.delay(400 + index * 80).duration(400).springify()}
                  exiting={SlideOutRight.duration(300)}
                  layout={Layout.springify()}
                >
                  <View style={styles.taskLeft}>
                    <AnimatedCheckbox 
                      checked={task.completed}
                      onToggle={() => toggleTaskCompletion(task.id)}
                      color={colors.green}
                    />
                  </View>
                  
                  <View style={styles.taskBody}>
                    <View style={styles.taskHeader}>
                      <View style={[styles.categoryBadge, { backgroundColor: categoryStyle.bg }]}>
                        <IconComponent color={categoryStyle.color} size={12} />
                        <Text style={[styles.categoryText, { color: categoryStyle.color }]}>
                          {task.category}
                        </Text>
                      </View>
                      {!task.completed && (
                        <View style={[styles.priorityBadge, { backgroundColor: priorityStyle.color + '15' }]}>
                          <Text style={[styles.priorityText, { color: priorityStyle.color }]}>
                            {task.priority}
                          </Text>
                        </View>
                      )}
                    </View>
                    
                    <Text style={[styles.taskTitle, task.completed && styles.taskTitleCompleted]}>
                      {task.title}
                    </Text>
                    
                    <View style={styles.taskMeta}>
                      {task.time && (
                        <View style={styles.taskMetaItem}>
                          <Clock color={colors.textTertiary} size={12} />
                          <Text style={styles.taskMetaText}>{task.time}</Text>
                        </View>
                      )}
                      {task.dueDate && (
                        <Text style={[styles.taskDue, task.completed && styles.taskMetaCompleted]}>
                          Due {task.dueDate}
                        </Text>
                      )}
                    </View>
                  </View>
                </Animated.View>
              );
            })
          )}
        </Animated.View>

        <View style={{ height: 140 }} />
      </ScrollView>

      {/* Animated Floating Action Button */}
      <AnimatedTouchable 
        style={[styles.fab, fabAnimatedStyle]} 
        onPress={handleFabPress}
        entering={FadeInUp.delay(600).duration(400).springify()}
      >
        <Plus color={colors.white} size={26} />
      </AnimatedTouchable>

      {/* New Task Modal */}
      <NewTaskModal visible={modalVisible} onClose={() => setModalVisible(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: 'transparent',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    padding: 16,
    borderRadius: 16,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  statIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  statContent: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginBottom: 20,
    gap: 8,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: colors.white,
  },
  filterTabActive: {
    backgroundColor: colors.primary,
  },
  filterText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  filterTextActive: {
    color: colors.white,
  },
  taskList: {
    paddingHorizontal: 24,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
    backgroundColor: 'transparent',
  },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.textTertiary,
    textAlign: 'center',
  },
  taskCard: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  taskCardCompleted: {
    opacity: 0.7,
    backgroundColor: colors.cardAlt,
  },
  taskLeft: {
    marginRight: 14,
    paddingTop: 2,
    backgroundColor: 'transparent',
  },
  checkbox: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: colors.gray300,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
  },
  checkboxChecked: {
    backgroundColor: colors.green,
    borderColor: colors.green,
  },
  taskBody: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  taskHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
    backgroundColor: 'transparent',
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '600',
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: '700',
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    lineHeight: 22,
  },
  taskTitleCompleted: {
    textDecorationLine: 'line-through',
    color: colors.textTertiary,
  },
  taskMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 8,
    backgroundColor: 'transparent',
  },
  taskMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'transparent',
  },
  taskMetaText: {
    fontSize: 12,
    color: colors.textTertiary,
  },
  taskDue: {
    fontSize: 12,
    color: colors.error,
    fontWeight: '500',
  },
  taskMetaCompleted: {
    color: colors.textTertiary,
  },
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 120,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
});

import { StyleSheet, ScrollView, TouchableOpacity, View as RNView, RefreshControl } from 'react-native';
import { Text, View } from '@/components/Themed';
import { 
  Plus, Check, Clock, GraduationCap, Activity, Briefcase, Users,
  Sparkles, Trash2, ChevronRight
} from 'lucide-react-native';
import { useState, useCallback } from 'react';
import NewTaskModal from '@/components/NewTaskModal';
import EditTaskModal from '@/components/EditTaskModal';
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
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

// Animated Checkbox Component
function AnimatedCheckbox({ 
  checked, 
  onToggle,
  color,
  theme,
}: { 
  checked: boolean; 
  onToggle: () => void;
  color: string;
  theme: any;
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
        { borderColor: theme.gray300, backgroundColor: theme.card },
        checked && { backgroundColor: color, borderColor: color },
        animatedStyle
      ]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      {checked && (
        <Animated.View entering={ZoomIn.duration(200)}>
          <Check color={theme.white} size={14} strokeWidth={3} />
        </Animated.View>
      )}
    </AnimatedTouchable>
  );
}

// Swipeable Task Card
function SwipeableTaskCard({ 
  task, 
  index,
  theme,
  onToggle,
  onDelete,
  onEdit,
}: { 
  task: Task;
  index: number;
  theme: any;
  onToggle: () => void;
  onDelete: () => void;
  onEdit: () => void;
}) {
  const translateX = useSharedValue(0);
  const deleteOpacity = useSharedValue(0);

  const getCategoryStyle = (category: Task['category']) => {
    switch (category) {
      case 'Academics': return { icon: GraduationCap, color: theme.blue, bg: theme.blueMuted };
      case 'Wellness': return { icon: Activity, color: theme.green, bg: theme.greenMuted };
      case 'Work': return { icon: Briefcase, color: theme.purple, bg: theme.purpleMuted };
      case 'Social': return { icon: Users, color: theme.orange, bg: theme.orangeMuted };
      default: return { icon: GraduationCap, color: theme.blue, bg: theme.blueMuted };
    }
  };

  const getPriorityStyle = (priority: Task['priority']) => {
    switch (priority) {
      case 'High': return { color: theme.error, label: 'High Priority' };
      case 'Medium': return { color: theme.orange, label: 'Medium' };
      case 'Low': return { color: theme.green, label: 'Low' };
      default: return { color: theme.gray400, label: '' };
    }
  };

  const categoryStyle = getCategoryStyle(task.category);
  const priorityStyle = getPriorityStyle(task.priority);
  const IconComponent = categoryStyle.icon;

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      if (event.translationX < 0) {
        translateX.value = Math.max(event.translationX, -100);
        deleteOpacity.value = Math.min(Math.abs(event.translationX) / 100, 1);
      }
    })
    .onEnd((event) => {
      if (event.translationX < -80) {
        translateX.value = withTiming(-100);
        deleteOpacity.value = withTiming(1);
      } else {
        translateX.value = withSpring(0);
        deleteOpacity.value = withTiming(0);
      }
    });

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const deleteStyle = useAnimatedStyle(() => ({
    opacity: deleteOpacity.value,
  }));

  const handleDeletePress = () => {
    translateX.value = withTiming(-400, { duration: 300 });
    setTimeout(onDelete, 300);
  };

  return (
    <Animated.View
      entering={FadeInRight.delay(400 + index * 80).duration(400).springify()}
      exiting={SlideOutRight.duration(300)}
      layout={Layout.springify()}
      style={styles.swipeContainer}
    >
      {/* Delete Action Background */}
      <Animated.View style={[styles.deleteAction, deleteStyle]}>
        <TouchableOpacity style={styles.deleteButton} onPress={handleDeletePress}>
          <Trash2 color="#FFF" size={22} />
        </TouchableOpacity>
      </Animated.View>

      {/* Task Card */}
      <GestureDetector gesture={panGesture}>
        <Animated.View
          style={[
            styles.taskCard,
            { backgroundColor: theme.card },
            task.completed && { opacity: 0.7, backgroundColor: theme.cardAlt },
            cardStyle
          ]}
        >
          <View style={[styles.taskLeft, { backgroundColor: 'transparent' }]}>
            <AnimatedCheckbox 
              checked={task.completed}
              onToggle={onToggle}
              color={theme.green}
              theme={theme}
            />
          </View>
          
          <TouchableOpacity 
            style={[styles.taskBody, { backgroundColor: 'transparent' }]}
            onPress={onEdit}
            activeOpacity={0.7}
          >
            <View style={[styles.taskHeader, { backgroundColor: 'transparent' }]}>
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
            
            <Text style={[
              styles.taskTitle, 
              { color: theme.textPrimary },
              task.completed && { textDecorationLine: 'line-through', color: theme.textTertiary }
            ]}>
              {task.title}
            </Text>
            
            <View style={[styles.taskMeta, { backgroundColor: 'transparent' }]}>
              {task.time && (
                <View style={[styles.taskMetaItem, { backgroundColor: 'transparent' }]}>
                  <Clock color={theme.textTertiary} size={12} />
                  <Text style={[styles.taskMetaText, { color: theme.textTertiary }]}>{task.time}</Text>
                </View>
              )}
              {task.dueDate && (
                <Text style={[
                  styles.taskDue, 
                  { color: theme.error },
                  task.completed && { color: theme.textTertiary }
                ]}>
                  Due {task.dueDate}
                </Text>
              )}
            </View>
          </TouchableOpacity>

          <ChevronRight color={theme.gray300} size={18} />
        </Animated.View>
      </GestureDetector>
    </Animated.View>
  );
}

export default function TasksScreen() {
  const [modalVisible, setModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [refreshing, setRefreshing] = useState(false);
  const { tasks, toggleTaskCompletion, deleteTask, metrics, theme, loadTasks } = useApp();
  
  const filteredTasks = tasks.filter(task => {
    if (activeFilter === 'pending') return !task.completed;
    if (activeFilter === 'completed') return task.completed;
    return true;
  });

  const pendingCount = tasks.filter(t => !t.completed).length;
  const completedCount = tasks.filter(t => t.completed).length;

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadTasks().finally(() => setRefreshing(false));
  }, [loadTasks]);

  const handleEditTask = (task: Task) => {
    setSelectedTask(task);
    setEditModalVisible(true);
  };

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
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <ScrollView 
          style={styles.scrollView} 
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={theme.primary}
            />
          }
        >
          {/* Header */}
          <Animated.View 
            style={styles.header}
            entering={FadeInDown.duration(500).springify()}
          >
            <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>My Tasks</Text>
            <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>
              {pendingCount} pending • {completedCount} completed
            </Text>
          </Animated.View>

          {/* Stats Cards */}
          <View style={[styles.statsRow, { backgroundColor: 'transparent' }]}>
            <Animated.View 
              style={[styles.statCard, { backgroundColor: theme.card }]}
              entering={FadeInDown.delay(100).duration(400).springify()}
            >
              <View style={[styles.statIcon, { backgroundColor: theme.primaryMuted }]}>
                <Sparkles color={theme.primary} size={20} />
              </View>
              <View style={[styles.statContent, { backgroundColor: 'transparent' }]}>
                <Text style={[styles.statValue, { color: theme.textPrimary }]}>{metrics.energy}%</Text>
                <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Energy</Text>
              </View>
            </Animated.View>
            <Animated.View 
              style={[styles.statCard, { backgroundColor: theme.card }]}
              entering={FadeInDown.delay(200).duration(400).springify()}
            >
              <View style={[styles.statIcon, { backgroundColor: theme.greenMuted }]}>
                <Check color={theme.green} size={20} />
              </View>
              <View style={[styles.statContent, { backgroundColor: 'transparent' }]}>
                <Text style={[styles.statValue, { color: theme.textPrimary }]}>{completedCount}</Text>
                <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Done Today</Text>
              </View>
            </Animated.View>
          </View>

          {/* Filter Tabs */}
          <Animated.View 
            style={styles.filterContainer}
            entering={FadeInDown.delay(300).duration(400)}
          >
            {(['all', 'pending', 'completed'] as const).map((filter, index) => (
              <AnimatedTouchable 
                key={filter}
                style={[
                  styles.filterTab, 
                  { backgroundColor: theme.card },
                  activeFilter === filter && { backgroundColor: theme.primary }
                ]}
                onPress={() => setActiveFilter(filter)}
                entering={FadeInRight.delay(300 + index * 50).duration(300)}
              >
                <Text style={[
                  styles.filterText, 
                  { color: theme.textSecondary },
                  activeFilter === filter && { color: '#FFF' }
                ]}>
                  {filter === 'all' ? `All (${tasks.length})` : 
                   filter === 'pending' ? `Pending (${pendingCount})` : 
                   `Done (${completedCount})`}
                </Text>
              </AnimatedTouchable>
            ))}
          </Animated.View>

          {/* Task List */}
          <Animated.View style={styles.taskList} layout={Layout.springify()}>
            {filteredTasks.length === 0 ? (
              <Animated.View 
                style={styles.emptyState}
                entering={FadeInUp.delay(400).duration(400)}
              >
                <View style={[styles.emptyIcon, { backgroundColor: theme.primaryMuted }]}>
                  <Check color={theme.primary} size={32} />
                </View>
                <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>
                  {activeFilter === 'completed' ? 'No completed tasks yet' : 
                   activeFilter === 'pending' ? 'All caught up!' : 'No tasks yet'}
                </Text>
                <Text style={[styles.emptySubtitle, { color: theme.textTertiary }]}>
                  {activeFilter === 'pending' ? 'Great job! You have no pending tasks' : 
                   'Tap + to create your first task'}
                </Text>
              </Animated.View>
            ) : (
              filteredTasks.map((task, index) => (
                <SwipeableTaskCard
                  key={task.id}
                  task={task}
                  index={index}
                  theme={theme}
                  onToggle={() => toggleTaskCompletion(task.id)}
                  onDelete={() => deleteTask(task.id)}
                  onEdit={() => handleEditTask(task)}
                />
              ))
            )}
          </Animated.View>

          <View style={{ height: 140 }} />
        </ScrollView>

        {/* Floating Action Button */}
        <AnimatedTouchable 
          style={[styles.fab, { backgroundColor: theme.primary }, fabAnimatedStyle]} 
          onPress={handleFabPress}
          entering={FadeInUp.delay(600).duration(400).springify()}
        >
          <Plus color="#FFF" size={26} />
        </AnimatedTouchable>

        {/* New Task Modal */}
        <NewTaskModal visible={modalVisible} onClose={() => setModalVisible(false)} />
        
        {/* Edit Task Modal */}
        <EditTaskModal 
          visible={editModalVisible} 
          onClose={() => {
            setEditModalVisible(false);
            setSelectedTask(null);
          }} 
          task={selectedTask}
        />
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  },
  headerSubtitle: {
    fontSize: 14,
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
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
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
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 12,
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
  },
  filterText: {
    fontSize: 13,
    fontWeight: '600',
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
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
  },
  swipeContainer: {
    marginBottom: 12,
    position: 'relative',
  },
  deleteAction: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 100,
    backgroundColor: '#FF5555',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingRight: 20,
  },
  deleteButton: {
    padding: 10,
  },
  taskCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  taskLeft: {
    marginRight: 14,
    paddingTop: 2,
  },
  checkbox: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  taskBody: {
    flex: 1,
  },
  taskHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
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
    lineHeight: 22,
  },
  taskMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 8,
  },
  taskMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  taskMetaText: {
    fontSize: 12,
  },
  taskDue: {
    fontSize: 12,
    fontWeight: '500',
  },
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 120,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#5B4BDB',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
});

import { StyleSheet, ScrollView, TouchableOpacity, View as RNView, RefreshControl } from 'react-native';
import { Text, View } from '@/components/Themed';
import { colors } from '@/constants/Colors';
import { 
  Sparkles, TrendingUp, GraduationCap, Activity, Briefcase, Users, 
  Clock, Plus, ChevronRight, Zap, Heart, Brain, MessageCircle
} from 'lucide-react-native';
import { useState, useCallback } from 'react';
import NewTaskModal from '@/components/NewTaskModal';
import { useApp, Task } from '@/contexts/AppContext';
import Animated, { 
  FadeInDown, 
  FadeInRight,
  FadeInUp,
  useAnimatedStyle, 
  useSharedValue, 
  withSpring,
  withDelay,
  withSequence,
  withTiming,
  interpolate,
  runOnJS,
} from 'react-native-reanimated';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export default function HubScreen() {
  const [modalVisible, setModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const { userName, tasks, metrics, schedule, balanceStatus, setAgentVisible } = useApp();
  
  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? 'Good Morning' : currentHour < 18 ? 'Good Afternoon' : 'Good Evening';
  
  const today = new Date();
  const dateString = today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  
  const topTasks = tasks
    .filter(t => !t.completed)
    .sort((a, b) => {
      const priorityOrder = { High: 0, Medium: 1, Low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    })
    .slice(0, 3);
  
  const getCategoryStyle = (category: Task['category']) => {
    switch (category) {
      case 'Academics': return { icon: GraduationCap, color: colors.blue, bg: colors.blueMuted };
      case 'Wellness': return { icon: Activity, color: colors.green, bg: colors.greenMuted };
      case 'Work': return { icon: Briefcase, color: colors.purple, bg: colors.purpleMuted };
      case 'Social': return { icon: Users, color: colors.orange, bg: colors.orangeMuted };
      default: return { icon: GraduationCap, color: colors.blue, bg: colors.blueMuted };
    }
  };
  
  const completedCount = tasks.filter(t => t.completed).length;
  const totalCount = tasks.length;
  const progressPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

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
            colors={[colors.primary]}
          />
        }
      >
        {/* Header Section - Animated */}
        <Animated.View 
          style={styles.header}
          entering={FadeInDown.duration(500).springify()}
        >
          <View style={styles.headerTop}>
            <View style={styles.headerText}>
              <Text style={styles.greeting}>{greeting}</Text>
              <Text style={styles.userName}>{userName}</Text>
            </View>
            <TouchableOpacity style={styles.profileButton}>
              <Text style={styles.profileEmoji}>👋</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.dateText}>{dateString}</Text>
        </Animated.View>

        {/* AI Coach Card - Animated */}
        <AnimatedTouchable 
          style={styles.aiCoachCard}
          activeOpacity={0.9}
          onPress={() => setAgentVisible(true)}
          entering={FadeInDown.delay(100).duration(500).springify()}
        >
          <RNView style={styles.aiCoachGradient}>
            <View style={styles.aiCoachContent}>
              <View style={styles.aiCoachLeft}>
                <Animated.View 
                  style={styles.aiCoachIcon}
                  entering={FadeInRight.delay(300).duration(400)}
                >
                  <Sparkles color={colors.white} size={20} />
                </Animated.View>
                <View style={styles.aiCoachTextContainer}>
                  <Text style={styles.aiCoachTitle}>AI Coach</Text>
                  <Text style={styles.aiCoachSubtitle}>
                    {balanceStatus === 'BALANCED' ? 'Your day looks balanced!' : 
                     balanceStatus === 'OVERLOADED' ? 'Let me help optimize your schedule' : 
                     'Ready to help you plan'}
                  </Text>
                </View>
              </View>
              <View style={styles.aiCoachAction}>
                <MessageCircle color={colors.white} size={18} />
              </View>
            </View>
          </RNView>
        </AnimatedTouchable>

        {/* Progress Overview - Animated */}
        <Animated.View 
          style={styles.progressCard}
          entering={FadeInDown.delay(200).duration(500).springify()}
        >
          <View style={styles.progressHeader}>
            <Text style={styles.progressTitle}>Today's Progress</Text>
            <Animated.Text 
              style={styles.progressPercent}
              entering={FadeInRight.delay(400).duration(300)}
            >
              {Math.round(progressPercent)}%
            </Animated.Text>
          </View>
          <View style={styles.progressBarContainer}>
            <Animated.View 
              style={[styles.progressBar, { width: `${progressPercent}%` }]}
              entering={FadeInRight.delay(500).duration(600)}
            />
          </View>
          <View style={styles.progressStats}>
            <Animated.View style={styles.progressStat} entering={FadeInUp.delay(300).duration(400)}>
              <Text style={styles.progressStatValue}>{completedCount}</Text>
              <Text style={styles.progressStatLabel}>Done</Text>
            </Animated.View>
            <View style={styles.progressDivider} />
            <Animated.View style={styles.progressStat} entering={FadeInUp.delay(400).duration(400)}>
              <Text style={styles.progressStatValue}>{totalCount - completedCount}</Text>
              <Text style={styles.progressStatLabel}>Remaining</Text>
            </Animated.View>
            <View style={styles.progressDivider} />
            <Animated.View style={styles.progressStat} entering={FadeInUp.delay(500).duration(400)}>
              <Text style={styles.progressStatValue}>{schedule.length}</Text>
              <Text style={styles.progressStatLabel}>Scheduled</Text>
            </Animated.View>
          </View>
        </Animated.View>

        {/* Wellness Metrics Row - Staggered Animation */}
        <View style={styles.metricsRow}>
          <Animated.View 
            style={[styles.metricCard, { backgroundColor: colors.greenMuted }]}
            entering={FadeInDown.delay(300).duration(400).springify()}
          >
            <View style={styles.metricIconContainer}>
              <Zap color={colors.green} size={18} />
            </View>
            <Text style={styles.metricValue}>{metrics.energy}%</Text>
            <Text style={styles.metricLabel}>Energy</Text>
          </Animated.View>
          
          <Animated.View 
            style={[styles.metricCard, { backgroundColor: colors.orangeMuted }]}
            entering={FadeInDown.delay(400).duration(400).springify()}
          >
            <View style={styles.metricIconContainer}>
              <Heart color={colors.orange} size={18} />
            </View>
            <Text style={styles.metricValue}>{metrics.stress}%</Text>
            <Text style={styles.metricLabel}>Stress</Text>
          </Animated.View>
          
          <Animated.View 
            style={[styles.metricCard, { backgroundColor: colors.purpleMuted }]}
            entering={FadeInDown.delay(500).duration(400).springify()}
          >
            <View style={styles.metricIconContainer}>
              <Brain color={colors.purple} size={18} />
            </View>
            <Text style={styles.metricValue}>{metrics.burnoutRisk}</Text>
            <Text style={styles.metricLabel}>Burnout</Text>
          </Animated.View>
        </View>

        {/* Focus Tasks Section - Animated */}
        <Animated.View 
          style={styles.section}
          entering={FadeInDown.delay(400).duration(500)}
        >
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Focus Tasks</Text>
            <TouchableOpacity style={styles.sectionAction}>
              <Text style={styles.sectionActionText}>See all</Text>
              <ChevronRight color={colors.primary} size={16} />
            </TouchableOpacity>
          </View>

          {topTasks.length === 0 ? (
            <AnimatedTouchable 
              style={styles.emptyTaskCard} 
              onPress={() => setModalVisible(true)}
              entering={FadeInUp.delay(500).duration(400)}
            >
              <View style={styles.emptyTaskIcon}>
                <Plus color={colors.primary} size={24} />
              </View>
              <Text style={styles.emptyTaskTitle}>Add your first task</Text>
              <Text style={styles.emptyTaskSubtitle}>Stay organized and productive</Text>
            </AnimatedTouchable>
          ) : (
            topTasks.map((task, index) => {
              const categoryStyle = getCategoryStyle(task.category);
              const IconComponent = categoryStyle.icon;
              return (
                <Animated.View 
                  key={task.id} 
                  style={styles.taskCard}
                  entering={FadeInRight.delay(500 + index * 100).duration(400).springify()}
                >
                  <View style={[styles.taskIcon, { backgroundColor: categoryStyle.bg }]}>
                    <IconComponent color={categoryStyle.color} size={18} />
                  </View>
                  <View style={styles.taskContent}>
                    <Text style={styles.taskCategory}>{task.category}</Text>
                    <Text style={styles.taskTitle}>{task.title}</Text>
                    {task.time && (
                      <View style={styles.taskMeta}>
                        <Clock color={colors.textTertiary} size={12} />
                        <Text style={styles.taskTime}>{task.time}</Text>
                      </View>
                    )}
                  </View>
                  <View style={[styles.priorityDot, { 
                    backgroundColor: task.priority === 'High' ? colors.error : 
                                     task.priority === 'Medium' ? colors.orange : colors.green 
                  }]} />
                </Animated.View>
              );
            })
          )}
        </Animated.View>

        {/* Today's Schedule Preview - Animated */}
        <Animated.View 
          style={styles.section}
          entering={FadeInDown.delay(600).duration(500)}
        >
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Upcoming</Text>
            <TouchableOpacity style={styles.sectionAction}>
              <Text style={styles.sectionActionText}>Calendar</Text>
              <ChevronRight color={colors.primary} size={16} />
            </TouchableOpacity>
          </View>

          {schedule.length === 0 ? (
            <Animated.View 
              style={styles.emptyScheduleCard}
              entering={FadeInUp.delay(700).duration(400)}
            >
              <Text style={styles.emptyScheduleText}>No events scheduled</Text>
              <Text style={styles.emptyScheduleSubtext}>Your AI Coach can help plan your day</Text>
            </Animated.View>
          ) : (
            <View style={styles.scheduleList}>
              {schedule.slice(0, 2).map((event, index) => (
                <Animated.View 
                  key={event.id} 
                  style={styles.scheduleCard}
                  entering={FadeInRight.delay(700 + index * 100).duration(400).springify()}
                >
                  <RNView style={[styles.scheduleIndicator, { backgroundColor: event.color }]} />
                  <View style={styles.scheduleContent}>
                    <Text style={styles.scheduleTime}>{event.time}</Text>
                    <Text style={styles.scheduleTitle}>{event.title}</Text>
                    {event.location && <Text style={styles.scheduleLocation}>{event.location}</Text>}
                  </View>
                </Animated.View>
              ))}
            </View>
          )}
        </Animated.View>

        <View style={{ height: 140 }} />
      </ScrollView>

      {/* Animated Floating Action Button */}
      <AnimatedTouchable 
        style={[styles.fab, fabAnimatedStyle]} 
        onPress={handleFabPress}
        entering={FadeInUp.delay(800).duration(400).springify()}
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
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
    backgroundColor: 'transparent',
  },
  headerText: {
    backgroundColor: 'transparent',
  },
  greeting: {
    fontSize: 15,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  userName: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 2,
  },
  profileButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileEmoji: {
    fontSize: 24,
  },
  dateText: {
    fontSize: 14,
    color: colors.textTertiary,
    marginTop: 4,
  },
  aiCoachCard: {
    marginHorizontal: 24,
    marginBottom: 20,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  aiCoachGradient: {
    backgroundColor: colors.primary,
    padding: 20,
  },
  aiCoachContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'transparent',
  },
  aiCoachLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    backgroundColor: 'transparent',
  },
  aiCoachIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiCoachTextContainer: {
    marginLeft: 14,
    flex: 1,
    backgroundColor: 'transparent',
  },
  aiCoachTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.white,
  },
  aiCoachSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  aiCoachAction: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressCard: {
    marginHorizontal: 24,
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
    backgroundColor: 'transparent',
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  progressPercent: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: colors.gray100,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 18,
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  progressStats: {
    flexDirection: 'row',
    backgroundColor: 'transparent',
  },
  progressStat: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  progressDivider: {
    width: 1,
    height: 30,
    backgroundColor: colors.gray200,
  },
  progressStatValue: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  progressStatLabel: {
    fontSize: 12,
    color: colors.textTertiary,
    marginTop: 2,
  },
  metricsRow: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    gap: 12,
    marginBottom: 24,
  },
  metricCard: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  metricIconContainer: {
    marginBottom: 8,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  metricLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
    fontWeight: '500',
  },
  section: {
    marginBottom: 24,
    backgroundColor: 'transparent',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 14,
    backgroundColor: 'transparent',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  sectionAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  sectionActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  emptyTaskCard: {
    marginHorizontal: 24,
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.gray200,
    borderStyle: 'dashed',
  },
  emptyTaskIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emptyTaskTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  emptyTaskSubtitle: {
    fontSize: 13,
    color: colors.textTertiary,
  },
  taskCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 24,
    backgroundColor: colors.white,
    padding: 16,
    borderRadius: 16,
    marginBottom: 10,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  taskIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  taskContent: {
    flex: 1,
    marginLeft: 14,
    backgroundColor: 'transparent',
  },
  taskCategory: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  taskTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  taskMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
    backgroundColor: 'transparent',
  },
  taskTime: {
    fontSize: 12,
    color: colors.textTertiary,
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  scheduleList: {
    paddingHorizontal: 24,
    gap: 10,
  },
  scheduleCard: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: 14,
    padding: 16,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  scheduleIndicator: {
    width: 4,
    borderRadius: 2,
    marginRight: 14,
  },
  scheduleContent: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  scheduleTime: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textTertiary,
    marginBottom: 2,
  },
  scheduleTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  scheduleLocation: {
    fontSize: 12,
    color: colors.textTertiary,
    marginTop: 4,
  },
  emptyScheduleCard: {
    marginHorizontal: 24,
    backgroundColor: colors.cardAlt,
    borderRadius: 14,
    padding: 24,
    alignItems: 'center',
  },
  emptyScheduleText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  emptyScheduleSubtext: {
    fontSize: 13,
    color: colors.textTertiary,
    marginTop: 4,
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

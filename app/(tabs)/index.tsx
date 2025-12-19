import { StyleSheet, ScrollView, TouchableOpacity, View as RNView, RefreshControl, TextInput } from 'react-native';
import { Text, View } from '@/components/Themed';
import { 
  Sparkles, TrendingUp, GraduationCap, Activity, Briefcase, Users, 
  Clock, Plus, ChevronRight, Zap, Heart, Brain, MessageCircle, Search, X
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
  withSequence,
} from 'react-native-reanimated';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export default function HubScreen() {
  const [modalVisible, setModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const { 
    userName, tasks, metrics, schedule, balanceStatus, setAgentVisible,
    theme, searchQuery, setSearchQuery, filteredTasks
  } = useApp();
  
  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? 'Good Morning' : currentHour < 18 ? 'Good Afternoon' : 'Good Evening';
  
  const today = new Date();
  const dateString = today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  
  const topTasks = (isSearching ? filteredTasks : tasks)
    .filter(t => !t.completed)
    .sort((a, b) => {
      const priorityOrder = { High: 0, Medium: 1, Low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    })
    .slice(0, 3);
  
  const getCategoryStyle = (category: Task['category']) => {
    switch (category) {
      case 'Academics': return { icon: GraduationCap, color: theme.blue, bg: theme.blueMuted };
      case 'Wellness': return { icon: Activity, color: theme.green, bg: theme.greenMuted };
      case 'Work': return { icon: Briefcase, color: theme.purple, bg: theme.purpleMuted };
      case 'Social': return { icon: Users, color: theme.orange, bg: theme.orangeMuted };
      default: return { icon: GraduationCap, color: theme.blue, bg: theme.blueMuted };
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
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.primary}
            colors={[theme.primary]}
          />
        }
      >
        {/* Header Section */}
        <Animated.View 
          style={styles.header}
          entering={FadeInDown.duration(500).springify()}
        >
          <View style={[styles.headerTop, { backgroundColor: 'transparent' }]}>
            <View style={[styles.headerText, { backgroundColor: 'transparent' }]}>
              <Text style={[styles.greeting, { color: theme.textSecondary }]}>{greeting}</Text>
              <Text style={[styles.userName, { color: theme.textPrimary }]}>{userName}</Text>
            </View>
            <TouchableOpacity style={[styles.profileButton, { backgroundColor: theme.primaryMuted }]}>
              <Text style={styles.profileEmoji}>👋</Text>
            </TouchableOpacity>
          </View>
          <Text style={[styles.dateText, { color: theme.textTertiary }]}>{dateString}</Text>
        </Animated.View>

        {/* Search Bar */}
        <Animated.View 
          style={[styles.searchContainer, { backgroundColor: theme.card }]}
          entering={FadeInDown.delay(50).duration(400)}
        >
          <Search color={theme.textTertiary} size={20} />
          <TextInput
            style={[styles.searchInput, { color: theme.textPrimary }]}
            placeholder="Search tasks..."
            placeholderTextColor={theme.textTertiary}
            value={searchQuery}
            onChangeText={(text) => {
              setSearchQuery(text);
              setIsSearching(text.length > 0);
            }}
            onFocus={() => setIsSearching(true)}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity 
              onPress={() => {
                setSearchQuery('');
                setIsSearching(false);
              }}
            >
              <X color={theme.textTertiary} size={18} />
            </TouchableOpacity>
          )}
        </Animated.View>

        {/* Search Results */}
        {isSearching && searchQuery.length > 0 && (
          <Animated.View 
            style={styles.searchResults}
            entering={FadeInDown.duration(300)}
          >
            <Text style={[styles.searchResultsTitle, { color: theme.textSecondary }]}>
              {filteredTasks.length} result{filteredTasks.length !== 1 ? 's' : ''} for "{searchQuery}"
            </Text>
          </Animated.View>
        )}

        {/* AI Coach Card */}
        <AnimatedTouchable 
          style={styles.aiCoachCard}
          activeOpacity={0.9}
          onPress={() => setAgentVisible(true)}
          entering={FadeInDown.delay(100).duration(500).springify()}
        >
          <RNView style={[styles.aiCoachGradient, { backgroundColor: theme.primary }]}>
            <View style={[styles.aiCoachContent, { backgroundColor: 'transparent' }]}>
              <View style={[styles.aiCoachLeft, { backgroundColor: 'transparent' }]}>
                <Animated.View 
                  style={styles.aiCoachIcon}
                  entering={FadeInRight.delay(300).duration(400)}
                >
                  <Sparkles color="#FFF" size={20} />
                </Animated.View>
                <View style={[styles.aiCoachTextContainer, { backgroundColor: 'transparent' }]}>
                  <Text style={styles.aiCoachTitle}>AI Coach</Text>
                  <Text style={styles.aiCoachSubtitle}>
                    {balanceStatus === 'BALANCED' ? 'Your day looks balanced!' : 
                     balanceStatus === 'OVERLOADED' ? 'Let me help optimize your schedule' : 
                     'Ready to help you plan'}
                  </Text>
                </View>
              </View>
              <View style={styles.aiCoachAction}>
                <MessageCircle color="#FFF" size={18} />
              </View>
            </View>
          </RNView>
        </AnimatedTouchable>

        {/* Progress Overview */}
        <Animated.View 
          style={[styles.progressCard, { backgroundColor: theme.card }]}
          entering={FadeInDown.delay(200).duration(500).springify()}
        >
          <View style={[styles.progressHeader, { backgroundColor: 'transparent' }]}>
            <Text style={[styles.progressTitle, { color: theme.textPrimary }]}>Today's Progress</Text>
            <Animated.Text 
              style={[styles.progressPercent, { color: theme.primary }]}
              entering={FadeInRight.delay(400).duration(300)}
            >
              {Math.round(progressPercent)}%
            </Animated.Text>
          </View>
          <View style={[styles.progressBarContainer, { backgroundColor: theme.gray100 }]}>
            <Animated.View 
              style={[styles.progressBar, { width: `${progressPercent}%`, backgroundColor: theme.primary }]}
              entering={FadeInRight.delay(500).duration(600)}
            />
          </View>
          <View style={[styles.progressStats, { backgroundColor: 'transparent' }]}>
            <Animated.View style={[styles.progressStat, { backgroundColor: 'transparent' }]} entering={FadeInUp.delay(300).duration(400)}>
              <Text style={[styles.progressStatValue, { color: theme.textPrimary }]}>{completedCount}</Text>
              <Text style={[styles.progressStatLabel, { color: theme.textTertiary }]}>Done</Text>
            </Animated.View>
            <View style={[styles.progressDivider, { backgroundColor: theme.gray200 }]} />
            <Animated.View style={[styles.progressStat, { backgroundColor: 'transparent' }]} entering={FadeInUp.delay(400).duration(400)}>
              <Text style={[styles.progressStatValue, { color: theme.textPrimary }]}>{totalCount - completedCount}</Text>
              <Text style={[styles.progressStatLabel, { color: theme.textTertiary }]}>Remaining</Text>
            </Animated.View>
            <View style={[styles.progressDivider, { backgroundColor: theme.gray200 }]} />
            <Animated.View style={[styles.progressStat, { backgroundColor: 'transparent' }]} entering={FadeInUp.delay(500).duration(400)}>
              <Text style={[styles.progressStatValue, { color: theme.textPrimary }]}>{schedule.length}</Text>
              <Text style={[styles.progressStatLabel, { color: theme.textTertiary }]}>Scheduled</Text>
            </Animated.View>
          </View>
        </Animated.View>

        {/* Wellness Metrics Row */}
        <View style={styles.metricsRow}>
          <Animated.View 
            style={[styles.metricCard, { backgroundColor: theme.greenMuted }]}
            entering={FadeInDown.delay(300).duration(400).springify()}
          >
            <View style={styles.metricIconContainer}>
              <Zap color={theme.green} size={18} />
            </View>
            <Text style={[styles.metricValue, { color: theme.textPrimary }]}>{metrics.energy}%</Text>
            <Text style={[styles.metricLabel, { color: theme.textSecondary }]}>Energy</Text>
          </Animated.View>
          
          <Animated.View 
            style={[styles.metricCard, { backgroundColor: theme.orangeMuted }]}
            entering={FadeInDown.delay(400).duration(400).springify()}
          >
            <View style={styles.metricIconContainer}>
              <Heart color={theme.orange} size={18} />
            </View>
            <Text style={[styles.metricValue, { color: theme.textPrimary }]}>{metrics.stress}%</Text>
            <Text style={[styles.metricLabel, { color: theme.textSecondary }]}>Stress</Text>
          </Animated.View>
          
          <Animated.View 
            style={[styles.metricCard, { backgroundColor: theme.purpleMuted }]}
            entering={FadeInDown.delay(500).duration(400).springify()}
          >
            <View style={styles.metricIconContainer}>
              <Brain color={theme.purple} size={18} />
            </View>
            <Text style={[styles.metricValue, { color: theme.textPrimary }]}>{metrics.burnoutRisk}</Text>
            <Text style={[styles.metricLabel, { color: theme.textSecondary }]}>Burnout</Text>
          </Animated.View>
        </View>

        {/* Focus Tasks Section */}
        <Animated.View 
          style={styles.section}
          entering={FadeInDown.delay(400).duration(500)}
        >
          <View style={[styles.sectionHeader, { backgroundColor: 'transparent' }]}>
            <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
              {isSearching ? 'Search Results' : 'Focus Tasks'}
            </Text>
            <TouchableOpacity style={styles.sectionAction}>
              <Text style={[styles.sectionActionText, { color: theme.primary }]}>See all</Text>
              <ChevronRight color={theme.primary} size={16} />
            </TouchableOpacity>
          </View>

          {topTasks.length === 0 ? (
            <AnimatedTouchable 
              style={[styles.emptyTaskCard, { backgroundColor: theme.card, borderColor: theme.gray200 }]} 
              onPress={() => setModalVisible(true)}
              entering={FadeInUp.delay(500).duration(400)}
            >
              <View style={[styles.emptyTaskIcon, { backgroundColor: theme.primaryMuted }]}>
                <Plus color={theme.primary} size={24} />
              </View>
              <Text style={[styles.emptyTaskTitle, { color: theme.textPrimary }]}>
                {isSearching ? 'No tasks found' : 'Add your first task'}
              </Text>
              <Text style={[styles.emptyTaskSubtitle, { color: theme.textTertiary }]}>
                {isSearching ? 'Try a different search term' : 'Stay organized and productive'}
              </Text>
            </AnimatedTouchable>
          ) : (
            topTasks.map((task, index) => {
              const categoryStyle = getCategoryStyle(task.category);
              const IconComponent = categoryStyle.icon;
              return (
                <Animated.View 
                  key={task.id} 
                  style={[styles.taskCard, { backgroundColor: theme.card }]}
                  entering={FadeInRight.delay(500 + index * 100).duration(400).springify()}
                >
                  <View style={[styles.taskIcon, { backgroundColor: categoryStyle.bg }]}>
                    <IconComponent color={categoryStyle.color} size={18} />
                  </View>
                  <View style={[styles.taskContent, { backgroundColor: 'transparent' }]}>
                    <Text style={[styles.taskCategory, { color: theme.textTertiary }]}>{task.category}</Text>
                    <Text style={[styles.taskTitle, { color: theme.textPrimary }]}>{task.title}</Text>
                    {task.time && (
                      <View style={[styles.taskMeta, { backgroundColor: 'transparent' }]}>
                        <Clock color={theme.textTertiary} size={12} />
                        <Text style={[styles.taskTime, { color: theme.textTertiary }]}>{task.time}</Text>
                      </View>
                    )}
                  </View>
                  <View style={[styles.priorityDot, { 
                    backgroundColor: task.priority === 'High' ? theme.error : 
                                     task.priority === 'Medium' ? theme.orange : theme.green 
                  }]} />
                </Animated.View>
              );
            })
          )}
        </Animated.View>

        {/* Today's Schedule Preview */}
        {!isSearching && (
          <Animated.View 
            style={styles.section}
            entering={FadeInDown.delay(600).duration(500)}
          >
            <View style={[styles.sectionHeader, { backgroundColor: 'transparent' }]}>
              <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Upcoming</Text>
              <TouchableOpacity style={styles.sectionAction}>
                <Text style={[styles.sectionActionText, { color: theme.primary }]}>Calendar</Text>
                <ChevronRight color={theme.primary} size={16} />
              </TouchableOpacity>
            </View>

            {schedule.length === 0 ? (
              <Animated.View 
                style={[styles.emptyScheduleCard, { backgroundColor: theme.cardAlt }]}
                entering={FadeInUp.delay(700).duration(400)}
              >
                <Text style={[styles.emptyScheduleText, { color: theme.textSecondary }]}>No events scheduled</Text>
                <Text style={[styles.emptyScheduleSubtext, { color: theme.textTertiary }]}>Your AI Coach can help plan your day</Text>
              </Animated.View>
            ) : (
              <View style={styles.scheduleList}>
                {schedule.slice(0, 2).map((event, index) => (
                  <Animated.View 
                    key={event.id} 
                    style={[styles.scheduleCard, { backgroundColor: theme.card }]}
                    entering={FadeInRight.delay(700 + index * 100).duration(400).springify()}
                  >
                    <RNView style={[styles.scheduleIndicator, { backgroundColor: event.color }]} />
                    <View style={[styles.scheduleContent, { backgroundColor: 'transparent' }]}>
                      <Text style={[styles.scheduleTime, { color: theme.textTertiary }]}>{event.time}</Text>
                      <Text style={[styles.scheduleTitle, { color: theme.textPrimary }]}>{event.title}</Text>
                      {event.location && <Text style={[styles.scheduleLocation, { color: theme.textTertiary }]}>{event.location}</Text>}
                    </View>
                  </Animated.View>
                ))}
              </View>
            )}
          </Animated.View>
        )}

        <View style={{ height: 140 }} />
      </ScrollView>

      {/* Floating Action Button */}
      <AnimatedTouchable 
        style={[styles.fab, { backgroundColor: theme.primary }, fabAnimatedStyle]} 
        onPress={handleFabPress}
        entering={FadeInUp.delay(800).duration(400).springify()}
      >
        <Plus color="#FFF" size={26} />
      </AnimatedTouchable>

      {/* New Task Modal */}
      <NewTaskModal visible={modalVisible} onClose={() => setModalVisible(false)} />
    </View>
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
    paddingBottom: 16,
    backgroundColor: 'transparent',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  headerText: {},
  greeting: {
    fontSize: 15,
    fontWeight: '500',
  },
  userName: {
    fontSize: 28,
    fontWeight: '700',
    marginTop: 2,
  },
  profileButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileEmoji: {
    fontSize: 24,
  },
  dateText: {
    fontSize: 14,
    marginTop: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 24,
    marginBottom: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 14,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  searchResults: {
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  searchResultsTitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  aiCoachCard: {
    marginHorizontal: 24,
    marginBottom: 20,
    borderRadius: 20,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  aiCoachGradient: {
    padding: 20,
  },
  aiCoachContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  aiCoachLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
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
  },
  aiCoachTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFF',
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
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
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
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  progressPercent: {
    fontSize: 16,
    fontWeight: '700',
  },
  progressBarContainer: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 18,
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  progressStats: {
    flexDirection: 'row',
  },
  progressStat: {
    flex: 1,
    alignItems: 'center',
  },
  progressDivider: {
    width: 1,
    height: 30,
  },
  progressStatValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  progressStatLabel: {
    fontSize: 12,
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
  },
  metricLabel: {
    fontSize: 11,
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
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  sectionAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  sectionActionText: {
    fontSize: 14,
    fontWeight: '600',
  },
  emptyTaskCard: {
    marginHorizontal: 24,
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    borderWidth: 2,
    borderStyle: 'dashed',
  },
  emptyTaskIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emptyTaskTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  emptyTaskSubtitle: {
    fontSize: 13,
  },
  taskCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 24,
    padding: 16,
    borderRadius: 16,
    marginBottom: 10,
    shadowColor: '#000',
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
  },
  taskCategory: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  taskTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  taskMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  taskTime: {
    fontSize: 12,
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
    borderRadius: 14,
    padding: 16,
    shadowColor: '#000',
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
  },
  scheduleTime: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 2,
  },
  scheduleTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  scheduleLocation: {
    fontSize: 12,
    marginTop: 4,
  },
  emptyScheduleCard: {
    marginHorizontal: 24,
    borderRadius: 14,
    padding: 24,
    alignItems: 'center',
  },
  emptyScheduleText: {
    fontSize: 14,
    fontWeight: '500',
  },
  emptyScheduleSubtext: {
    fontSize: 13,
    marginTop: 4,
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
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
});

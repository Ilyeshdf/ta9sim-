import { StyleSheet, ScrollView, View as RNView, TouchableOpacity, RefreshControl } from 'react-native';
import { Text, View } from '@/components/Themed';
import { colors } from '@/constants/Colors';
import { 
  Sparkles, MapPin, Play, Calendar as CalendarIcon, Plus, 
  ChevronLeft, ChevronRight, Clock, Zap
} from 'lucide-react-native';
import { useState, useCallback } from 'react';
import NewTaskModal from '@/components/NewTaskModal';
import { useApp } from '@/contexts/AppContext';
import Animated, { 
  FadeInDown, 
  FadeInRight,
  FadeInUp,
  FadeIn,
  useAnimatedStyle, 
  useSharedValue, 
  withSpring,
  withSequence,
  withDelay,
  Layout,
} from 'react-native-reanimated';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export default function CalendarScreen() {
  const [modalVisible, setModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const { schedule, generateSchedule, isProcessing, tasks } = useApp();
  
  const today = new Date();
  const monthName = today.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(today);
    date.setDate(today.getDate() - today.getDay() + i);
    const dayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    return {
      dayLetter: dayNames[i],
      date: date.getDate(),
      isToday: date.toDateString() === today.toDateString(),
      isPast: date < today && date.toDateString() !== today.toDateString(),
    };
  });
  
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Academics': return colors.blue;
      case 'Wellness': return colors.green;
      case 'Work': return colors.purple;
      case 'Social': return colors.orange;
      case 'Break': return colors.gray400;
      default: return colors.primary;
    }
  };

  const pendingTasks = tasks.filter(t => !t.completed).length;

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

  // Generate button animation
  const generateBtnScale = useSharedValue(1);
  const generateBtnStyle = useAnimatedStyle(() => ({
    transform: [{ scale: generateBtnScale.value }],
  }));

  const handleGenerate = () => {
    generateBtnScale.value = withSequence(
      withSpring(0.95, { damping: 10 }),
      withSpring(1, { damping: 10 })
    );
    generateSchedule();
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
          <View style={styles.headerTop}>
            <Text style={styles.headerTitle}>Schedule</Text>
            <AnimatedTouchable 
              style={[styles.generateBtn, generateBtnStyle]}
              onPress={handleGenerate}
              disabled={isProcessing}
            >
              <Sparkles color={colors.primary} size={16} />
              <Text style={styles.generateBtnText}>
                {isProcessing ? 'Working...' : 'AI Generate'}
              </Text>
            </AnimatedTouchable>
          </View>
        </Animated.View>

        {/* Month Navigator - Animated */}
        <Animated.View 
          style={styles.monthNav}
          entering={FadeInDown.delay(100).duration(400)}
        >
          <TouchableOpacity style={styles.monthNavBtn}>
            <ChevronLeft color={colors.textSecondary} size={20} />
          </TouchableOpacity>
          <Text style={styles.monthText}>{monthName}</Text>
          <TouchableOpacity style={styles.monthNavBtn}>
            <ChevronRight color={colors.textSecondary} size={20} />
          </TouchableOpacity>
        </Animated.View>

        {/* Week Days Strip - Staggered Animation */}
        <View style={styles.weekStrip}>
          {weekDays.map((day, index) => (
            <AnimatedTouchable
              key={index}
              style={[
                styles.dayItem,
                day.isToday && styles.dayItemToday,
              ]}
              entering={FadeInDown.delay(150 + index * 50).duration(400).springify()}
            >
              <Text style={[
                styles.dayLetter,
                day.isToday && styles.dayLetterToday,
                day.isPast && styles.dayLetterPast,
              ]}>
                {day.dayLetter}
              </Text>
              <Text style={[
                styles.dayNumber,
                day.isToday && styles.dayNumberToday,
                day.isPast && styles.dayNumberPast,
              ]}>
                {day.date}
              </Text>
              {day.isToday && (
                <Animated.View 
                  style={styles.todayDot}
                  entering={FadeIn.delay(400).duration(300)}
                />
              )}
            </AnimatedTouchable>
          ))}
        </View>

        {/* Today's Summary Card - Animated */}
        <Animated.View 
          style={styles.summaryCard}
          entering={FadeInDown.delay(300).duration(500).springify()}
        >
          <View style={styles.summaryLeft}>
            <View style={styles.summaryIcon}>
              <CalendarIcon color={colors.primary} size={20} />
            </View>
            <View style={styles.summaryContent}>
              <Text style={styles.summaryTitle}>Today's Overview</Text>
              <Text style={styles.summarySubtitle}>
                {schedule.length} events • {pendingTasks} tasks pending
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* Schedule Section - Animated */}
        <Animated.View 
          style={styles.section}
          entering={FadeInDown.delay(400).duration(500)}
        >
          <Text style={styles.sectionTitle}>Timeline</Text>
          
          {schedule.length === 0 ? (
            <Animated.View 
              style={styles.emptySchedule}
              entering={FadeInUp.delay(500).duration(400)}
            >
              <Animated.View 
                style={styles.emptyIcon}
                entering={FadeIn.delay(600).duration(300)}
              >
                <Sparkles color={colors.primary} size={28} />
              </Animated.View>
              <Text style={styles.emptyTitle}>No schedule yet</Text>
              <Text style={styles.emptySubtitle}>
                Let AI create an optimized schedule based on your tasks and energy patterns
              </Text>
              <AnimatedTouchable 
                style={styles.emptyButton}
                onPress={handleGenerate}
                disabled={isProcessing}
                entering={FadeInUp.delay(700).duration(300)}
              >
                <Zap color={colors.white} size={16} />
                <Text style={styles.emptyButtonText}>
                  {isProcessing ? 'Generating...' : 'Generate Schedule'}
                </Text>
              </AnimatedTouchable>
            </Animated.View>
          ) : (
            <Animated.View style={styles.timeline} layout={Layout.springify()}>
              {schedule.map((event, index) => {
                const categoryColor = getCategoryColor(event.category);
                const isLast = index === schedule.length - 1;
                
                return (
                  <Animated.View 
                    key={event.id} 
                    style={styles.timelineItem}
                    entering={FadeInRight.delay(500 + index * 100).duration(400).springify()}
                    layout={Layout.springify()}
                  >
                    {/* Timeline connector */}
                    <View style={styles.timelineConnector}>
                      <Animated.View 
                        style={[styles.timelineDot, { backgroundColor: categoryColor }]}
                        entering={FadeIn.delay(600 + index * 100).duration(200)}
                      />
                      {!isLast && <RNView style={styles.timelineLine} />}
                    </View>
                    
                    {/* Event Card */}
                    <View style={styles.eventCard}>
                      <View style={styles.eventHeader}>
                        <View style={styles.eventTime}>
                          <Clock color={colors.textTertiary} size={12} />
                          <Text style={styles.eventTimeText}>{event.time}</Text>
                        </View>
                        <View style={[styles.eventCategoryBadge, { backgroundColor: categoryColor + '15' }]}>
                          <Text style={[styles.eventCategoryText, { color: categoryColor }]}>
                            {event.category}
                          </Text>
                        </View>
                      </View>
                      
                      <Text style={styles.eventTitle}>{event.title}</Text>
                      
                      <View style={styles.eventFooter}>
                        {event.location && (
                          <View style={styles.eventLocation}>
                            <MapPin color={colors.textTertiary} size={12} />
                            <Text style={styles.eventLocationText}>{event.location}</Text>
                          </View>
                        )}
                        <Text style={styles.eventDuration}>{event.duration}</Text>
                      </View>
                      
                      {(event.category === 'Academics' || event.category === 'Work') && (
                        <TouchableOpacity style={[styles.startButton, { backgroundColor: categoryColor }]}>
                          <Play color={colors.white} size={14} fill={colors.white} />
                          <Text style={styles.startButtonText}>Start Focus</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </Animated.View>
                );
              })}
            </Animated.View>
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
    paddingBottom: 16,
    backgroundColor: 'transparent',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  generateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.primaryMuted,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
  },
  generateBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
  },
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
    paddingHorizontal: 24,
    marginBottom: 16,
    backgroundColor: 'transparent',
  },
  monthNavBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  weekStrip: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 20,
    backgroundColor: 'transparent',
  },
  dayItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 12,
  },
  dayItemToday: {
    backgroundColor: colors.primary,
  },
  dayLetter: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textTertiary,
    marginBottom: 6,
  },
  dayLetterToday: {
    color: 'rgba(255,255,255,0.8)',
  },
  dayLetterPast: {
    color: colors.gray300,
  },
  dayNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  dayNumberToday: {
    color: colors.white,
  },
  dayNumberPast: {
    color: colors.gray300,
  },
  todayDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.white,
    marginTop: 6,
  },
  summaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 24,
    backgroundColor: colors.white,
    padding: 16,
    borderRadius: 16,
    marginBottom: 24,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  summaryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    backgroundColor: 'transparent',
  },
  summaryIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  summaryContent: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  summaryTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  summarySubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  section: {
    paddingHorizontal: 24,
    backgroundColor: 'transparent',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 16,
  },
  emptySchedule: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 32,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 14,
  },
  emptyButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.white,
  },
  timeline: {
    backgroundColor: 'transparent',
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 16,
    backgroundColor: 'transparent',
  },
  timelineConnector: {
    width: 24,
    alignItems: 'center',
    marginRight: 14,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 6,
  },
  timelineLine: {
    flex: 1,
    width: 2,
    backgroundColor: colors.gray200,
    marginTop: 6,
  },
  eventCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  eventHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    backgroundColor: 'transparent',
  },
  eventTime: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'transparent',
  },
  eventTimeText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textTertiary,
  },
  eventCategoryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  eventCategoryText: {
    fontSize: 11,
    fontWeight: '600',
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 10,
  },
  eventFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'transparent',
  },
  eventLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'transparent',
  },
  eventLocationText: {
    fontSize: 12,
    color: colors.textTertiary,
  },
  eventDuration: {
    fontSize: 12,
    color: colors.textTertiary,
    fontWeight: '500',
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 14,
  },
  startButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.white,
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

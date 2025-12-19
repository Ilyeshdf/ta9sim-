import { StyleSheet, ScrollView, View as RNView, TouchableOpacity, RefreshControl } from 'react-native';
import { Text, View } from '@/components/Themed';
import { 
  Sparkles, MapPin, Play, Calendar as CalendarIcon, Plus, 
  ChevronLeft, ChevronRight, Clock, Zap
} from 'lucide-react-native';
import { useState, useCallback, useMemo } from 'react';
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
  Layout,
  SlideInRight,
  SlideInLeft,
} from 'react-native-reanimated';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

// Helper functions
const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

export default function CalendarScreen() {
  const [modalVisible, setModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [slideDirection, setSlideDirection] = useState<'left' | 'right'>('right');
  const { schedule, generateSchedule, isProcessing, tasks, theme, getEventsForDate } = useApp();

  const today = new Date();
  
  // Generate calendar grid for current month
  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const daysInPrevMonth = getDaysInMonth(year, month - 1);
    
    const days: Array<{
      date: Date;
      day: number;
      isCurrentMonth: boolean;
      isToday: boolean;
      isSelected: boolean;
      hasEvents: boolean;
    }> = [];
    
    // Previous month days
    for (let i = firstDay - 1; i >= 0; i--) {
      const day = daysInPrevMonth - i;
      const date = new Date(year, month - 1, day);
      days.push({
        date,
        day,
        isCurrentMonth: false,
        isToday: false,
        isSelected: false,
        hasEvents: false,
      });
    }
    
    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const isToday = date.toDateString() === today.toDateString();
      const isSelected = date.toDateString() === selectedDate.toDateString();
      const dateStr = date.toISOString().split('T')[0];
      const hasEvents = schedule.some(e => e.date === dateStr);
      
      days.push({
        date,
        day,
        isCurrentMonth: true,
        isToday,
        isSelected,
        hasEvents,
      });
    }
    
    // Next month days to fill 6 rows
    const remainingDays = 42 - days.length;
    for (let day = 1; day <= remainingDays; day++) {
      const date = new Date(year, month + 1, day);
      days.push({
        date,
        day,
        isCurrentMonth: false,
        isToday: false,
        isSelected: false,
        hasEvents: false,
      });
    }
    
    return days;
  }, [currentMonth, selectedDate, schedule]);

  const monthName = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const selectedDateStr = selectedDate.toLocaleDateString('en-US', { 
    weekday: 'long', 
    month: 'short', 
    day: 'numeric' 
  });

  const navigateMonth = (direction: 'prev' | 'next') => {
    setSlideDirection(direction === 'next' ? 'right' : 'left');
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(currentMonth.getMonth() + (direction === 'next' ? 1 : -1));
    setCurrentMonth(newMonth);
  };

  const goToToday = () => {
    setCurrentMonth(new Date());
    setSelectedDate(new Date());
  };
  
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Academics': return theme.blue;
      case 'Wellness': return theme.green;
      case 'Work': return theme.purple;
      case 'Social': return theme.orange;
      case 'Break': return theme.gray400;
      default: return theme.primary;
    }
  };

  // Get events for selected date
  const selectedDateEvents = useMemo(() => {
    return getEventsForDate(selectedDate);
  }, [selectedDate, schedule]);

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
    generateSchedule(selectedDate);
  };

  const weekDayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

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
          />
        }
      >
        {/* Header */}
        <Animated.View 
          style={styles.header}
          entering={FadeInDown.duration(500).springify()}
        >
          <View style={[styles.headerTop, { backgroundColor: 'transparent' }]}>
            <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>Calendar</Text>
            <AnimatedTouchable 
              style={[styles.generateBtn, { backgroundColor: theme.primaryMuted }, generateBtnStyle]}
              onPress={handleGenerate}
              disabled={isProcessing}
            >
              <Sparkles color={theme.primary} size={16} />
              <Text style={[styles.generateBtnText, { color: theme.primary }]}>
                {isProcessing ? 'Working...' : 'AI Generate'}
              </Text>
            </AnimatedTouchable>
          </View>
        </Animated.View>

        {/* Month Navigator */}
        <Animated.View 
          style={[styles.monthNav, { backgroundColor: 'transparent' }]}
          entering={FadeInDown.delay(100).duration(400)}
        >
          <TouchableOpacity 
            style={[styles.monthNavBtn, { backgroundColor: theme.card }]}
            onPress={() => navigateMonth('prev')}
          >
            <ChevronLeft color={theme.textSecondary} size={20} />
          </TouchableOpacity>
          
          <TouchableOpacity onPress={goToToday}>
            <Text style={[styles.monthText, { color: theme.textPrimary }]}>{monthName}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.monthNavBtn, { backgroundColor: theme.card }]}
            onPress={() => navigateMonth('next')}
          >
            <ChevronRight color={theme.textSecondary} size={20} />
          </TouchableOpacity>
        </Animated.View>

        {/* Calendar Grid */}
        <Animated.View 
          style={[styles.calendarContainer, { backgroundColor: theme.card }]}
          entering={FadeInDown.delay(200).duration(400)}
        >
          {/* Week Day Headers */}
          <View style={styles.weekHeaders}>
            {weekDayHeaders.map((day, index) => (
              <Text 
                key={day} 
                style={[
                  styles.weekHeader, 
                  { color: index === 0 || index === 6 ? theme.error : theme.textTertiary }
                ]}
              >
                {day}
              </Text>
            ))}
          </View>

          {/* Calendar Days Grid */}
          <Animated.View 
            key={currentMonth.toISOString()}
            style={styles.calendarGrid}
            entering={slideDirection === 'right' ? SlideInRight.duration(300) : SlideInLeft.duration(300)}
          >
            {calendarDays.map((dayInfo, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.calendarDay,
                  dayInfo.isSelected && [styles.selectedDay, { backgroundColor: theme.primary }],
                  dayInfo.isToday && !dayInfo.isSelected && [styles.todayDay, { borderColor: theme.primary }],
                ]}
                onPress={() => dayInfo.isCurrentMonth && setSelectedDate(dayInfo.date)}
                disabled={!dayInfo.isCurrentMonth}
              >
                <Text style={[
                  styles.calendarDayText,
                  { color: theme.textPrimary },
                  !dayInfo.isCurrentMonth && { color: theme.gray300 },
                  dayInfo.isSelected && { color: '#FFF' },
                  dayInfo.isToday && !dayInfo.isSelected && { color: theme.primary, fontWeight: '700' },
                ]}>
                  {dayInfo.day}
                </Text>
                {dayInfo.hasEvents && dayInfo.isCurrentMonth && !dayInfo.isSelected && (
                  <View style={[styles.eventDot, { backgroundColor: theme.primary }]} />
                )}
              </TouchableOpacity>
            ))}
          </Animated.View>
        </Animated.View>

        {/* Selected Date Info */}
        <Animated.View 
          style={[styles.selectedDateCard, { backgroundColor: theme.card }]}
          entering={FadeInDown.delay(300).duration(500).springify()}
        >
          <View style={[styles.summaryLeft, { backgroundColor: 'transparent' }]}>
            <View style={[styles.summaryIcon, { backgroundColor: theme.primaryMuted }]}>
              <CalendarIcon color={theme.primary} size={20} />
            </View>
            <View style={[styles.summaryContent, { backgroundColor: 'transparent' }]}>
              <Text style={[styles.summaryTitle, { color: theme.textPrimary }]}>{selectedDateStr}</Text>
              <Text style={[styles.summarySubtitle, { color: theme.textSecondary }]}>
                {selectedDateEvents.length} events • {pendingTasks} tasks pending
              </Text>
            </View>
          </View>
          {selectedDate.toDateString() !== today.toDateString() && (
            <TouchableOpacity 
              style={[styles.todayBtn, { backgroundColor: theme.primaryMuted }]}
              onPress={goToToday}
            >
              <Text style={[styles.todayBtnText, { color: theme.primary }]}>Today</Text>
            </TouchableOpacity>
          )}
        </Animated.View>

        {/* Schedule Section */}
        <Animated.View 
          style={styles.section}
          entering={FadeInDown.delay(400).duration(500)}
        >
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
            {selectedDate.toDateString() === today.toDateString() ? "Today's Timeline" : 'Schedule'}
          </Text>
          
          {selectedDateEvents.length === 0 ? (
            <Animated.View 
              style={[styles.emptySchedule, { backgroundColor: theme.card }]}
              entering={FadeInUp.delay(500).duration(400)}
            >
              <Animated.View 
                style={[styles.emptyIcon, { backgroundColor: theme.primaryMuted }]}
                entering={FadeIn.delay(600).duration(300)}
              >
                <Sparkles color={theme.primary} size={28} />
              </Animated.View>
              <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>No schedule yet</Text>
              <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
                Let AI create an optimized schedule based on your tasks and energy patterns
              </Text>
              <AnimatedTouchable 
                style={[styles.emptyButton, { backgroundColor: theme.primary }]}
                onPress={handleGenerate}
                disabled={isProcessing}
                entering={FadeInUp.delay(700).duration(300)}
              >
                <Zap color="#FFF" size={16} />
                <Text style={styles.emptyButtonText}>
                  {isProcessing ? 'Generating...' : 'Generate Schedule'}
                </Text>
              </AnimatedTouchable>
            </Animated.View>
          ) : (
            <Animated.View style={styles.timeline} layout={Layout.springify()}>
              {selectedDateEvents.map((event, index) => {
                const categoryColor = getCategoryColor(event.category);
                const isLast = index === selectedDateEvents.length - 1;
                
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
                      {!isLast && <RNView style={[styles.timelineLine, { backgroundColor: theme.gray200 }]} />}
                    </View>
                    
                    {/* Event Card */}
                    <View style={[styles.eventCard, { backgroundColor: theme.card }]}>
                      <View style={[styles.eventHeader, { backgroundColor: 'transparent' }]}>
                        <View style={[styles.eventTime, { backgroundColor: 'transparent' }]}>
                          <Clock color={theme.textTertiary} size={12} />
                          <Text style={[styles.eventTimeText, { color: theme.textTertiary }]}>{event.time}</Text>
                        </View>
                        <View style={[styles.eventCategoryBadge, { backgroundColor: categoryColor + '15' }]}>
                          <Text style={[styles.eventCategoryText, { color: categoryColor }]}>
                            {event.category}
                          </Text>
                        </View>
                      </View>
                      
                      <Text style={[styles.eventTitle, { color: theme.textPrimary }]}>{event.title}</Text>
                      
                      <View style={[styles.eventFooter, { backgroundColor: 'transparent' }]}>
                        {event.location && (
                          <View style={[styles.eventLocation, { backgroundColor: 'transparent' }]}>
                            <MapPin color={theme.textTertiary} size={12} />
                            <Text style={[styles.eventLocationText, { color: theme.textTertiary }]}>{event.location}</Text>
                          </View>
                        )}
                        <Text style={[styles.eventDuration, { color: theme.textTertiary }]}>{event.duration}</Text>
                      </View>
                      
                      {(event.category === 'Academics' || event.category === 'Work') && (
                        <TouchableOpacity style={[styles.startButton, { backgroundColor: categoryColor }]}>
                          <Play color="#FFF" size={14} fill="#FFF" />
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
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
  },
  generateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
  },
  generateBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  monthNavBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthText: {
    fontSize: 18,
    fontWeight: '700',
    minWidth: 160,
    textAlign: 'center',
  },
  calendarContainer: {
    marginHorizontal: 16,
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  weekHeaders: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  weekHeader: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  calendarDay: {
    width: '14.28%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    marginVertical: 2,
  },
  calendarDayText: {
    fontSize: 15,
    fontWeight: '500',
  },
  selectedDay: {
    borderRadius: 12,
  },
  todayDay: {
    borderWidth: 2,
    borderRadius: 12,
  },
  eventDot: {
    position: 'absolute',
    bottom: 4,
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  selectedDateCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 24,
    padding: 16,
    borderRadius: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  summaryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  summaryIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  summaryContent: {
    flex: 1,
  },
  summaryTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  summarySubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  todayBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  todayBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
  section: {
    paddingHorizontal: 24,
    backgroundColor: 'transparent',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  emptySchedule: {
    alignItems: 'center',
    borderRadius: 20,
    padding: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 14,
  },
  emptyButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFF',
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
    marginTop: 6,
  },
  eventCard: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
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
  },
  eventTime: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  eventTimeText: {
    fontSize: 12,
    fontWeight: '600',
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
    marginBottom: 10,
  },
  eventFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  eventLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  eventLocationText: {
    fontSize: 12,
  },
  eventDuration: {
    fontSize: 12,
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
    color: '#FFF',
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

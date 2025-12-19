import { StyleSheet, ScrollView, View as RNView, TouchableOpacity, RefreshControl } from 'react-native';
import { Text, View } from '@/components/Themed';
import { 
  TrendingUp, Target, Zap, Award, ChevronRight, 
  GraduationCap, Activity, Briefcase, Users, Flame
} from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';
import { useState, useCallback, useEffect } from 'react';
import Animated, { 
  FadeInDown, 
  FadeInRight,
  FadeInUp,
  FadeIn,
  useAnimatedStyle, 
  useSharedValue, 
  withSpring,
  withTiming,
  withDelay,
  interpolate,
  Easing,
} from 'react-native-reanimated';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

// Animated Progress Bar Component
function AnimatedProgressBar({ 
  progress, 
  color, 
  delay = 0 
}: { 
  progress: number; 
  color: string;
  delay?: number;
}) {
  const width = useSharedValue(0);
  
  useEffect(() => {
    width.value = withDelay(delay, withSpring(progress, {
      damping: 15,
      stiffness: 80,
    }));
  }, [progress]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${width.value}%`,
    backgroundColor: color,
  }));

  return (
    <View style={styles.progressBarBg}>
      <Animated.View style={[styles.progressBarFill, animatedStyle]} />
    </View>
  );
}

// Animated Counter Component
function AnimatedCounter({ 
  value, 
  suffix = '', 
  delay = 0 
}: { 
  value: number; 
  suffix?: string;
  delay?: number;
}) {
  const animatedValue = useSharedValue(0);
  
  useEffect(() => {
    animatedValue.value = withDelay(delay, withTiming(value, {
      duration: 800,
      easing: Easing.out(Easing.cubic),
    }));
  }, [value]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(animatedValue.value, [0, value], [0.5, 1]),
  }));

  return (
    <Animated.Text style={[styles.statValueLarge, animatedStyle]}>
      {Math.round(value)}{suffix}
    </Animated.Text>
  );
}

export default function AnalyticsScreen() {
  const { tasks, metrics, theme } = useApp();
  const [refreshing, setRefreshing] = useState(false);
  
  const completedTasks = tasks.filter(t => t.completed).length;
  const totalTasks = tasks.length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  
  const categoryCounts = {
    Academics: tasks.filter(t => t.category === 'Academics').length,
    Wellness: tasks.filter(t => t.category === 'Wellness').length,
    Work: tasks.filter(t => t.category === 'Work').length,
    Social: tasks.filter(t => t.category === 'Social').length,
  };
  const categoryTotal = totalTasks || 1;
  
  const weekDays = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const baseProductivity = metrics.energy;
  const productivity = weekDays.map((_, i) => {
    const variation = Math.floor(Math.random() * 20) - 10;
    return Math.min(100, Math.max(30, baseProductivity + variation));
  });
  const maxValue = Math.max(...productivity);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1500);
  }, []);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Academics': return GraduationCap;
      case 'Wellness': return Activity;
      case 'Work': return Briefcase;
      case 'Social': return Users;
      default: return GraduationCap;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Academics': return { main: theme.blue, bg: theme.blueMuted };
      case 'Wellness': return { main: theme.green, bg: theme.greenMuted };
      case 'Work': return { main: theme.purple, bg: theme.purpleMuted };
      case 'Social': return { main: theme.orange, bg: theme.orangeMuted };
      default: return { main: theme.primary, bg: theme.primaryMuted };
    }
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
          />
        }
      >
        {/* Header */}
        <Animated.View 
          style={styles.header}
          entering={FadeInDown.duration(500).springify()}
        >
          <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>Analytics</Text>
          <AnimatedTouchable 
            style={[styles.periodSelector, { backgroundColor: theme.card }]}
            entering={FadeInRight.delay(200).duration(400)}
          >
            <Text style={[styles.periodText, { color: theme.primary }]}>This Week</Text>
            <ChevronRight color={theme.primary} size={16} />
          </AnimatedTouchable>
        </Animated.View>

        {/* Main Stats Grid */}
        <View style={styles.statsGrid}>
          <Animated.View 
            style={[styles.statCardLarge, { backgroundColor: theme.primaryMuted }]}
            entering={FadeInDown.delay(100).duration(500).springify()}
          >
            <View style={[styles.statCardHeader, { backgroundColor: 'transparent' }]}>
              <Animated.View 
                style={[styles.statIconCircle, { backgroundColor: theme.primary + '20' }]}
                entering={FadeIn.delay(300).duration(300)}
              >
                <Target color={theme.primary} size={20} />
              </Animated.View>
              <TrendingUp color={theme.green} size={16} />
            </View>
            <Text style={[styles.statValueLarge, { color: theme.textPrimary }]}>{completionRate}%</Text>
            <Text style={[styles.statLabelLarge, { color: theme.textSecondary }]}>Completion Rate</Text>
            <View style={[styles.progressBarBg, { backgroundColor: 'rgba(0,0,0,0.08)' }]}>
              <Animated.View style={[styles.progressBarFill, { width: `${completionRate}%`, backgroundColor: theme.primary }]} />
            </View>
          </Animated.View>
          
          <View style={styles.statColRight}>
            <Animated.View 
              style={[styles.statCardSmall, { backgroundColor: theme.greenMuted }]}
              entering={FadeInRight.delay(200).duration(400).springify()}
            >
              <View style={[styles.statIconSmall, { backgroundColor: theme.green + '20' }]}>
                <Zap color={theme.green} size={16} />
              </View>
              <Text style={[styles.statValueSmall, { color: theme.textPrimary }]}>{completedTasks}</Text>
              <Text style={[styles.statLabelSmall, { color: theme.textSecondary }]}>Completed</Text>
            </Animated.View>
            <Animated.View 
              style={[styles.statCardSmall, { backgroundColor: theme.orangeMuted }]}
              entering={FadeInRight.delay(300).duration(400).springify()}
            >
              <View style={[styles.statIconSmall, { backgroundColor: theme.orange + '20' }]}>
                <Flame color={theme.orange} size={16} />
              </View>
              <Text style={[styles.statValueSmall, { color: theme.textPrimary }]}>{metrics.energy}%</Text>
              <Text style={[styles.statLabelSmall, { color: theme.textSecondary }]}>Energy</Text>
            </Animated.View>
          </View>
        </View>

        {/* Productivity Chart */}
        <Animated.View 
          style={[styles.chartCard, { backgroundColor: theme.card }]}
          entering={FadeInDown.delay(300).duration(500).springify()}
        >
          <View style={[styles.chartHeader, { backgroundColor: 'transparent' }]}>
            <Text style={[styles.chartTitle, { color: theme.textPrimary }]}>Weekly Trend</Text>
            <Animated.View 
              style={[styles.chartBadge, { backgroundColor: theme.greenMuted }]}
              entering={FadeIn.delay(500).duration(300)}
            >
              <TrendingUp color={theme.green} size={12} />
              <Text style={[styles.chartBadgeText, { color: theme.green }]}>+12%</Text>
            </Animated.View>
          </View>
          
          <View style={styles.chartContainer}>
            {weekDays.map((day, index) => {
              const height = (productivity[index] / maxValue) * 100;
              const isHigh = productivity[index] >= 80;
              const isMedium = productivity[index] >= 60 && productivity[index] < 80;
              
              return (
                <Animated.View 
                  key={index} 
                  style={styles.chartBarWrapper}
                  entering={FadeInUp.delay(400 + index * 80).duration(400).springify()}
                >
                  <View style={[styles.chartBarBg, { backgroundColor: theme.gray100 }]}>
                    <Animated.View 
                      style={[
                        styles.chartBarFill, 
                        { 
                          height: `${height}%`,
                          backgroundColor: isHigh ? theme.green : isMedium ? theme.orange : theme.gray300,
                        }
                      ]} 
                    />
                  </View>
                  <Text style={[styles.chartBarLabel, { color: theme.textTertiary }]}>{day}</Text>
                </Animated.View>
              );
            })}
          </View>
        </Animated.View>

        {/* Category Breakdown */}
        <Animated.View 
          style={styles.section}
          entering={FadeInDown.delay(500).duration(500)}
        >
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Category Balance</Text>
          
          <View style={styles.categoryGrid}>
            {Object.entries(categoryCounts).map(([category, count], index) => {
              const Icon = getCategoryIcon(category);
              const colorSet = getCategoryColor(category);
              const percentage = Math.round((count / categoryTotal) * 100);
              
              return (
                <Animated.View 
                  key={category} 
                  style={[styles.categoryCard, { backgroundColor: colorSet.bg }]}
                  entering={FadeInUp.delay(600 + index * 100).duration(400).springify()}
                >
                  <View style={[styles.categoryIconCircle, { backgroundColor: colorSet.main + '20' }]}>
                    <Icon color={colorSet.main} size={18} />
                  </View>
                  <Text style={[styles.categoryValue, { color: theme.textPrimary }]}>{count}</Text>
                  <Text style={[styles.categoryLabel, { color: theme.textSecondary }]}>{category}</Text>
                  <View style={[styles.progressBarBg, { backgroundColor: 'rgba(0,0,0,0.08)' }]}>
                    <Animated.View style={[styles.progressBarFill, { width: `${percentage}%`, backgroundColor: colorSet.main }]} />
                  </View>
                </Animated.View>
              );
            })}
          </View>
        </Animated.View>

        {/* Insights Section */}
        <Animated.View 
          style={[styles.insightsCard, { backgroundColor: theme.card }]}
          entering={FadeInDown.delay(800).duration(500).springify()}
        >
          <View style={[styles.insightsHeader, { backgroundColor: 'transparent' }]}>
            <Animated.View 
              style={[styles.insightsIconCircle, { backgroundColor: theme.primaryMuted }]}
              entering={FadeIn.delay(900).duration(300)}
            >
              <Award color={theme.primary} size={20} />
            </Animated.View>
            <View style={[styles.insightsHeaderText, { backgroundColor: 'transparent' }]}>
              <Text style={[styles.insightsTitle, { color: theme.textPrimary }]}>AI Insights</Text>
              <Text style={[styles.insightsSubtitle, { color: theme.textSecondary }]}>Based on your patterns</Text>
            </View>
          </View>
          
          <View style={[styles.insightsList, { backgroundColor: 'transparent' }]}>
            {[
              { 
                emoji: '🔥', 
                text: completedTasks > 0 
                  ? `Great momentum! You've completed ${completedTasks} tasks.`
                  : 'Start completing tasks to build momentum!'
              },
              { 
                emoji: '⚡', 
                text: `Your energy is at ${metrics.energy}% — ${metrics.energy >= 70 ? 'perfect for deep work!' : 'consider taking a break soon.'}`
              },
              { 
                emoji: '🎯', 
                text: `Burnout risk: ${metrics.burnoutRisk} — ${metrics.burnoutRisk === 'Low' ? "You're in a healthy zone!" : 'Try balancing your workload.'}`
              },
            ].map((insight, index) => (
              <Animated.View 
                key={index}
                style={[styles.insightItem, { backgroundColor: 'transparent' }]}
                entering={FadeInRight.delay(1000 + index * 100).duration(400)}
              >
                <Text style={styles.insightEmoji}>{insight.emoji}</Text>
                <Text style={[styles.insightText, { color: theme.textSecondary }]}>{insight.text}</Text>
              </Animated.View>
            ))}
          </View>
        </Animated.View>

        <View style={{ height: 140 }} />
      </ScrollView>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: 'transparent',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
  },
  periodSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  periodText: {
    fontSize: 13,
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    gap: 12,
    marginBottom: 20,
  },
  statCardLarge: {
    flex: 1.2,
    padding: 20,
    borderRadius: 20,
  },
  statCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  statIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValueLarge: {
    fontSize: 36,
    fontWeight: '700',
  },
  statLabelLarge: {
    fontSize: 13,
    marginTop: 4,
    marginBottom: 16,
  },
  progressBarBg: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  statColRight: {
    flex: 1,
    gap: 12,
  },
  statCardSmall: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statIconSmall: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statValueSmall: {
    fontSize: 22,
    fontWeight: '700',
  },
  statLabelSmall: {
    fontSize: 11,
    marginTop: 2,
  },
  chartCard: {
    marginHorizontal: 24,
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  chartBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  chartBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  chartContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 140,
    gap: 8,
  },
  chartBarWrapper: {
    flex: 1,
    alignItems: 'center',
  },
  chartBarBg: {
    flex: 1,
    width: '100%',
    borderRadius: 8,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  chartBarFill: {
    width: '100%',
    borderRadius: 8,
  },
  chartBarLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 8,
  },
  section: {
    paddingHorizontal: 24,
    marginBottom: 24,
    backgroundColor: 'transparent',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryCard: {
    width: '47%',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  categoryIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  categoryValue: {
    fontSize: 24,
    fontWeight: '700',
  },
  categoryLabel: {
    fontSize: 12,
    marginTop: 2,
    marginBottom: 12,
  },
  insightsCard: {
    marginHorizontal: 24,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  insightsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  insightsIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  insightsHeaderText: {
    flex: 1,
  },
  insightsTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  insightsSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  insightsList: {
    gap: 16,
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  insightEmoji: {
    fontSize: 18,
    marginTop: 2,
  },
  insightText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
});

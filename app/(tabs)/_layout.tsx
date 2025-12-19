import React from 'react';
import { View, StyleSheet, TouchableOpacity, Platform, Pressable } from 'react-native';
import { Tabs } from 'expo-router';
import { Home, Calendar, CheckSquare, BarChart3, User, Plus, Sparkles } from 'lucide-react-native';
import { colors } from '@/constants/Colors';
import AIAgent from '@/components/AIAgent';
import Animated, { 
  useAnimatedStyle, 
  withSpring, 
  withTiming,
  useSharedValue,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function AnimatedTabIcon({ 
  name, 
  color, 
  focused 
}: { 
  name: string; 
  color: string; 
  focused: boolean;
}) {
  const scale = useSharedValue(focused ? 1 : 0.9);
  const opacity = useSharedValue(focused ? 1 : 0.7);
  
  React.useEffect(() => {
    scale.value = withSpring(focused ? 1.1 : 1, {
      damping: 15,
      stiffness: 150,
    });
    opacity.value = withTiming(focused ? 1 : 0.6, { duration: 200 });
  }, [focused]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const iconSize = 22;
  const iconProps = { color, size: iconSize, strokeWidth: focused ? 2.5 : 2 };
  
  const IconComponent = () => {
    switch (name) {
      case 'home':
        return <Home {...iconProps} />;
      case 'calendar':
        return <Calendar {...iconProps} />;
      case 'tasks':
        return <CheckSquare {...iconProps} />;
      case 'analytics':
        return <BarChart3 {...iconProps} />;
      case 'profile':
        return <User {...iconProps} />;
      default:
        return <Home {...iconProps} />;
    }
  };

  return (
    <Animated.View style={[styles.tabIconContainer, animatedStyle]}>
      <IconComponent />
      {focused && (
        <Animated.View 
          style={styles.activeIndicator}
          entering={require('react-native-reanimated').FadeIn.duration(200)}
        />
      )}
    </Animated.View>
  );
}

function TabBarBackground() {
  return (
    <Animated.View 
      style={styles.tabBarBackground}
      entering={require('react-native-reanimated').FadeInUp.delay(100).springify()}
    />
  );
}

export default function TabLayout() {
  return (
    <View style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.gray400,
          tabBarShowLabel: false,
          tabBarStyle: {
            position: 'absolute',
            bottom: 24,
            left: 20,
            right: 20,
            height: 70,
            backgroundColor: Platform.OS === 'ios' ? 'rgba(255,255,255,0.95)' : colors.white,
            borderRadius: 35,
            borderTopWidth: 0,
            shadowColor: colors.black,
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.15,
            shadowRadius: 30,
            elevation: 25,
            paddingHorizontal: 8,
          },
          tabBarItemStyle: {
            paddingVertical: 10,
          },
          headerShown: false,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Hub',
            tabBarIcon: ({ color, focused }) => (
              <AnimatedTabIcon name="home" color={color} focused={focused} />
            ),
          }}
        />
        <Tabs.Screen
          name="calendar"
          options={{
            title: 'Calendar',
            tabBarIcon: ({ color, focused }) => (
              <AnimatedTabIcon name="calendar" color={color} focused={focused} />
            ),
          }}
        />
        <Tabs.Screen
          name="tasks"
          options={{
            title: 'Tasks',
            tabBarIcon: ({ color, focused }) => (
              <AnimatedTabIcon name="tasks" color={color} focused={focused} />
            ),
          }}
        />
        <Tabs.Screen
          name="analytics"
          options={{
            title: 'Analytics',
            tabBarIcon: ({ color, focused }) => (
              <AnimatedTabIcon name="analytics" color={color} focused={focused} />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color, focused }) => (
              <AnimatedTabIcon name="profile" color={color} focused={focused} />
            ),
          }}
        />
      </Tabs>
      
      {/* AI Agent Overlay */}
      <AIAgent />
    </View>
  );
}

const styles = StyleSheet.create({
  tabIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  activeIndicator: {
    position: 'absolute',
    bottom: 0,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.primary,
  },
  tabBarBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.white,
    borderRadius: 35,
  },
});

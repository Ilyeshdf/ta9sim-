import { Text, View } from '@/components/Themed';
import { useApp } from '@/contexts/AppContext';
import { useAuth } from '@/contexts/AuthContext';
import { router } from 'expo-router';
import {
    Award,
    Bell,
    ChevronRight,
    Edit3,
    HelpCircle, LogOut,
    Moon,
    Settings, Shield,
    Target,
    User,
    Zap
} from 'lucide-react-native';
import { useState } from 'react';
import { ScrollView, StyleSheet, Switch, TouchableOpacity } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

export default function ProfileScreen() {
  const [notifications, setNotifications] = useState(true);
  const { tasks, userName, metrics, theme, themeMode, setThemeMode } = useApp();
  const { logout } = useAuth();
  
  const completedTasks = tasks.filter(t => t.completed).length;
  const totalTasks = tasks.length;
  const successRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/login');
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <Animated.View style={styles.header} entering={FadeInDown.duration(500)}>
          <View style={[styles.profileImageContainer, { backgroundColor: 'transparent' }]}>
            <View style={[styles.profileImage, { backgroundColor: theme.primaryMuted, borderColor: theme.card }]}>
              <Text style={styles.profileEmoji}>👨‍💼</Text>
            </View>
            <TouchableOpacity style={[styles.editImageBtn, { backgroundColor: theme.primary, borderColor: theme.background }]}>
              <Edit3 color={theme.white} size={12} />
            </TouchableOpacity>
          </View>
          <Text style={[styles.userName, { color: theme.textPrimary }]}>{userName}</Text>
          <Text style={[styles.userEmail, { color: theme.textSecondary }]}>alex.johnson@student.edu</Text>
          <TouchableOpacity style={[styles.editProfileBtn, { borderColor: theme.primary }]}>
            <Text style={[styles.editProfileText, { color: theme.primary }]}>Edit Profile</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Stats Row */}
        <Animated.View style={[styles.statsCard, { backgroundColor: theme.card }]} entering={FadeInUp.delay(100).duration(400)}>
          <View style={[styles.statItem, { backgroundColor: 'transparent' }]}>
            <View style={[styles.statIcon, { backgroundColor: theme.blueMuted }]}>
              <Target color={theme.blue} size={18} />
            </View>
            <Text style={[styles.statValue, { color: theme.textPrimary }]}>{completedTasks}</Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Tasks Done</Text>
          </View>
          
          <View style={[styles.statDivider, { backgroundColor: theme.gray200 }]} />
          
          <View style={[styles.statItem, { backgroundColor: 'transparent' }]}>
            <View style={[styles.statIcon, { backgroundColor: theme.orangeMuted }]}>
              <Zap color={theme.orange} size={18} />
            </View>
            <Text style={[styles.statValue, { color: theme.textPrimary }]}>{metrics.energy}%</Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Energy</Text>
          </View>
          
          <View style={[styles.statDivider, { backgroundColor: theme.gray200 }]} />
          
          <View style={[styles.statItem, { backgroundColor: 'transparent' }]}>
            <View style={[styles.statIcon, { backgroundColor: theme.greenMuted }]}>
              <Award color={theme.green} size={18} />
            </View>
            <Text style={[styles.statValue, { color: theme.textPrimary }]}>{successRate}%</Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Success</Text>
          </View>
        </Animated.View>

        {/* Settings Sections */}
        <Animated.View style={[styles.section, { backgroundColor: 'transparent' }]} entering={FadeInUp.delay(200).duration(400)}>
          <Text style={[styles.sectionTitle, { color: theme.textTertiary }]}>Preferences</Text>
          
          <View style={[styles.settingsCard, { backgroundColor: theme.card }]}>
            <View style={[styles.settingItem, { backgroundColor: 'transparent' }]}>
              <View style={[styles.settingLeft, { backgroundColor: 'transparent' }]}>
                <View style={[styles.settingIcon, { backgroundColor: theme.primaryMuted }]}>
                  <Bell color={theme.primary} size={18} />
                </View>
                <View style={[styles.settingText, { backgroundColor: 'transparent' }]}>
                  <Text style={[styles.settingTitle, { color: theme.textPrimary }]}>Notifications</Text>
                  <Text style={[styles.settingDesc, { color: theme.textTertiary }]}>Push and in-app alerts</Text>
                </View>
              </View>
              <Switch
                value={notifications}
                onValueChange={setNotifications}
                trackColor={{ false: theme.gray200, true: theme.primary }}
                thumbColor={theme.white}
              />
            </View>
            
            <View style={[styles.settingDivider, { backgroundColor: theme.gray100 }]} />
            
            <View style={[styles.settingItem, { backgroundColor: 'transparent' }]}>  
              <View style={[styles.settingLeft, { backgroundColor: 'transparent' }]}>  
                <View style={[styles.settingIcon, { backgroundColor: theme.purpleMuted }]}>  
                  <Moon color={theme.purple} size={18} />  
                </View>  
                <View style={[styles.settingText, { backgroundColor: 'transparent' }]}>  
                  <Text style={[styles.settingTitle, { color: theme.textPrimary }]}>Dark Mode</Text>  
                  <Text style={[styles.settingDesc, { color: theme.textTertiary }]}>Enable dark theme</Text>  
                </View>  
              </View>  
              <Switch  
                value={themeMode === 'dark'}  
                onValueChange={(value) => setThemeMode(value ? 'dark' : 'light')}  
                trackColor={{ false: theme.gray200, true: theme.primary }}  
                thumbColor={theme.white}  
              />  
            </View>

          </View>
        </Animated.View>

        <Animated.View style={[styles.section, { backgroundColor: 'transparent' }]} entering={FadeInUp.delay(300).duration(400)}>
          <Text style={[styles.sectionTitle, { color: theme.textTertiary }]}>Account</Text>
          
          <TouchableOpacity style={[styles.menuItem, { backgroundColor: theme.card }]}>
            <View style={[styles.menuLeft, { backgroundColor: 'transparent' }]}>
              <View style={[styles.menuIcon, { backgroundColor: theme.blueMuted }]}>
                <User color={theme.blue} size={18} />
              </View>
              <Text style={[styles.menuText, { color: theme.textPrimary }]}>Personal Information</Text>
            </View>
            <ChevronRight color={theme.gray400} size={18} />
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.menuItem, { backgroundColor: theme.card }]}>
            <View style={[styles.menuLeft, { backgroundColor: 'transparent' }]}>
              <View style={[styles.menuIcon, { backgroundColor: theme.greenMuted }]}>
                <Shield color={theme.green} size={18} />
              </View>
              <Text style={[styles.menuText, { color: theme.textPrimary }]}>Privacy & Security</Text>
            </View>
            <ChevronRight color={theme.gray400} size={18} />
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.menuItem, { backgroundColor: theme.card }]}>
            <View style={[styles.menuLeft, { backgroundColor: 'transparent' }]}>
              <View style={[styles.menuIcon, { backgroundColor: theme.gray100 }]}>
                <Settings color={theme.textSecondary} size={18} />
              </View>
              <Text style={[styles.menuText, { color: theme.textPrimary }]}>App Settings</Text>
            </View>
            <ChevronRight color={theme.gray400} size={18} />
          </TouchableOpacity>
        </Animated.View>

        <Animated.View style={[styles.section, { backgroundColor: 'transparent' }]} entering={FadeInUp.delay(400).duration(400)}>
          <Text style={[styles.sectionTitle, { color: theme.textTertiary }]}>Support</Text>
          
          <TouchableOpacity style={[styles.menuItem, { backgroundColor: theme.card }]}>
            <View style={[styles.menuLeft, { backgroundColor: 'transparent' }]}>
              <View style={[styles.menuIcon, { backgroundColor: theme.orangeMuted }]}>
                <HelpCircle color={theme.orange} size={18} />
              </View>
              <Text style={[styles.menuText, { color: theme.textPrimary }]}>Help & Support</Text>
            </View>
            <ChevronRight color={theme.gray400} size={18} />
          </TouchableOpacity>
        </Animated.View>

        {/* Logout Button */}
        <TouchableOpacity style={[styles.logoutBtn, { backgroundColor: theme.error + '10' }]} onPress={handleLogout}>
          <LogOut color={theme.error} size={18} />
          <Text style={[styles.logoutText, { color: theme.error }]}>Log Out</Text>
        </TouchableOpacity>

        <View style={[styles.footer, { backgroundColor: 'transparent' }]}>
          <Text style={[styles.versionText, { color: theme.textTertiary }]}>Version 1.0.0</Text>
          <Text style={[styles.copyrightText, { color: theme.gray400 }]}>Made with care for productivity</Text>
        </View>

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
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 24,
    backgroundColor: 'transparent',
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  profileEmoji: {
    fontSize: 44,
  },
  editImageBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    marginBottom: 16,
  },
  editProfileBtn: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 2,
  },
  editProfileText: {
    fontSize: 14,
    fontWeight: '600',
  },
  statsCard: {
    flexDirection: 'row',
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
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 60,
    alignSelf: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
    paddingHorizontal: 24,
  },
  settingsCard: {
    marginHorizontal: 24,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  settingDesc: {
    fontSize: 13,
    marginTop: 2,
  },
  settingDivider: {
    height: 1,
    marginLeft: 70,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 24,
    padding: 16,
    borderRadius: 14,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  menuText: {
    fontSize: 15,
    fontWeight: '600',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 14,
    marginBottom: 24,
  },
  logoutText: {
    fontSize: 15,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  versionText: {
    fontSize: 13,
    marginBottom: 4,
  },
  copyrightText: {
    fontSize: 12,
  },
});

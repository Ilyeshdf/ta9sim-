import AsyncStorage from '@react-native-async-storage/async-storage';
import { Bell, BellOff, Check, ChevronRight, Database, Globe, HelpCircle, Info, Palette, Shield, Sun, Trash2, X } from 'lucide-react-native';
import React, { useState } from 'react';
import {
    Alert,
    Linking,
    Modal,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemeMode, useApp } from '../../contexts/AppContext';

const LANGUAGES = [
    { code: 'en', label: 'English', native: 'English' },
    { code: 'ar', label: 'Arabic', native: 'العربية' },
    { code: 'fr', label: 'French', native: 'Français' },
    { code: 'es', label: 'Spanish', native: 'Español' },
];

export default function SettingsScreen() {
    const { theme, isDark, themeMode, setThemeMode, tasks } = useApp();
    
    // Settings state
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const [taskReminders, setTaskReminders] = useState(true);
    const [dailySummary, setDailySummary] = useState(true);
    const [language, setLanguage] = useState('en');
    
    // Modal visibility
    const [showNotificationsModal, setShowNotificationsModal] = useState(false);
    const [showLanguageModal, setShowLanguageModal] = useState(false);
    const [showDataModal, setShowDataModal] = useState(false);
    const [showPrivacyModal, setShowPrivacyModal] = useState(false);
    const [showAboutModal, setShowAboutModal] = useState(false);
    
    const handleSettingPress = (label: string) => {
        switch (label) {
            case 'Notifications':
                setShowNotificationsModal(true);
                break;
            case 'Language':
                setShowLanguageModal(true);
                break;
            case 'Data & Storage':
                setShowDataModal(true);
                break;
            case 'Privacy Settings':
                setShowPrivacyModal(true);
                break;
            case 'Help Center':
                Linking.openURL('https://github.com');
                break;
            case 'About':
                setShowAboutModal(true);
                break;
        }
    };
    
    const handleClearCache = async () => {
        Alert.alert(
            'Clear Cache',
            'This will clear temporary data. Your tasks and settings will be preserved.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Clear',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await AsyncStorage.removeItem('app_cache');
                            Alert.alert('Success', 'Cache cleared successfully');
                        } catch (error) {
                            Alert.alert('Error', 'Failed to clear cache');
                        }
                    },
                },
            ]
        );
    };
    
    const getStorageInfo = () => {
        const taskCount = tasks?.length || 0;
        const estimatedSize = (taskCount * 0.5).toFixed(1); // Rough estimate in KB
        return { taskCount, estimatedSize };
    };
    
    const storageInfo = getStorageInfo();

    const themeOptions: { mode: ThemeMode; icon: any; label: string }[] = [
        { mode: 'light', icon: Sun, label: 'Light' },
    ];

    const settingsSections = [
        {
            title: 'Preferences',
            items: [
                { icon: Bell, label: 'Notifications', value: 'On', type: 'navigate' },
                { icon: Globe, label: 'Language', value: 'English', type: 'navigate' },
                { icon: Database, label: 'Data & Storage', value: '', type: 'navigate' },
            ],
        },
        {
            title: 'Privacy & Security',
            items: [
                { icon: Shield, label: 'Privacy Settings', value: '', type: 'navigate' },
            ],
        },
        {
            title: 'Support',
            items: [
                { icon: HelpCircle, label: 'Help Center', value: '', type: 'navigate' },
                { icon: Info, label: 'About', value: 'v1.0.0', type: 'navigate' },
            ],
        },
    ];

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Header */}
                <Animated.View 
                    style={styles.header}
                    entering={FadeInDown.duration(400)}
                >
                    <Text style={[styles.title, { color: theme.textPrimary }]}>Settings</Text>
                    <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                        Customize your experience
                    </Text>
                </Animated.View>

                {/* Theme Section */}
                <Animated.View 
                    style={[styles.section, { backgroundColor: theme.card }]}
                    entering={FadeInDown.delay(100).duration(400)}
                >
                    <View style={styles.sectionHeader}>
                        <Palette size={20} color={theme.primary} />
                        <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
                            Appearance
                        </Text>
                    </View>
                    
                    <View style={styles.themeSelector}>
                        {themeOptions.map((option, index) => {
                            const Icon = option.icon;
                            const isSelected = themeMode === option.mode;
                            return (
                                <TouchableOpacity
                                    key={option.mode}
                                    style={[
                                        styles.themeOption,
                                        { 
                                            backgroundColor: isSelected ? theme.primary : theme.backgroundTertiary,
                                            borderColor: isSelected ? theme.primary : theme.gray200,
                                        },
                                    ]}
                                    onPress={() => setThemeMode(option.mode)}
                                >
                                    <Icon 
                                        size={22} 
                                        color={isSelected ? '#FFFFFF' : theme.textSecondary} 
                                    />
                                    <Text style={[
                                        styles.themeLabel,
                                        { color: isSelected ? '#FFFFFF' : theme.textSecondary }
                                    ]}>
                                        {option.label}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>

                    <View style={[styles.divider, { backgroundColor: theme.gray200 }]} />

                    <View style={styles.settingRow}>
                        <View style={styles.settingInfo}>
                            <Text style={[styles.settingLabel, { color: theme.textPrimary }]}>
                                Current Theme
                            </Text>
                            <Text style={[styles.settingValue, { color: theme.textSecondary }]}>Light Mode</Text>
                        </View>
                        <View style={[
                            styles.themeIndicator, 
                            { backgroundColor: theme.primary }
                        ]}>
                            <Sun size={14} color="#FFFFFF" />
                        </View>
                    </View>
                </Animated.View>

                {/* Other Settings */}
                {settingsSections.map((section, sectionIndex) => (
                    <Animated.View 
                        key={section.title}
                        style={[styles.section, { backgroundColor: theme.card }]}
                        entering={FadeInDown.delay(200 + sectionIndex * 100).duration(400)}
                    >
                        <Text style={[styles.sectionTitle, { color: theme.textPrimary, marginBottom: 12 }]}>
                            {section.title}
                        </Text>
                        
                        {section.items.map((item, itemIndex) => {
                            const Icon = item.icon;
                            return (
                                <TouchableOpacity 
                                    key={item.label}
                                    style={[
                                        styles.settingItem,
                                        itemIndex !== section.items.length - 1 && {
                                            borderBottomWidth: 1,
                                            borderBottomColor: theme.gray100,
                                        }
                                    ]}
                                    onPress={() => handleSettingPress(item.label)}
                                >
                                    <View style={styles.settingLeft}>
                                        <View style={[styles.iconContainer, { backgroundColor: theme.primaryMuted }]}>
                                            <Icon size={18} color={theme.primary} />
                                        </View>
                                        <Text style={[styles.settingLabel, { color: theme.textPrimary }]}>
                                            {item.label}
                                        </Text>
                                    </View>
                                    <View style={styles.settingRight}>
                                        {item.value && (
                                            <Text style={[styles.settingValue, { color: theme.textTertiary }]}>
                                                {item.value}
                                            </Text>
                                        )}
                                        <ChevronRight size={18} color={theme.gray400} />
                                    </View>
                                </TouchableOpacity>
                            );
                        })}
                    </Animated.View>
                ))}

                {/* App Info */}
                <Animated.View 
                    style={styles.footer}
                    entering={FadeInDown.delay(500).duration(400)}
                >
                    <Text style={[styles.footerText, { color: theme.textTertiary }]}>
                        Ta9sim v1.0.0
                    </Text>
                    <Text style={[styles.footerText, { color: theme.textTertiary }]}>
                        Made with ❤️ for productivity
                    </Text>
                </Animated.View>
            </ScrollView>
            
            {/* Notifications Modal */}
            <Modal
                visible={showNotificationsModal}
                animationType="slide"
                presentationStyle="pageSheet"
                onRequestClose={() => setShowNotificationsModal(false)}
            >
                <View style={[styles.modalContainer, { backgroundColor: theme.background }]}>
                    <View style={styles.modalHeader}>
                        <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>Notifications</Text>
                        <TouchableOpacity onPress={() => setShowNotificationsModal(false)}>
                            <X size={24} color={theme.textPrimary} />
                        </TouchableOpacity>
                    </View>
                    
                    <View style={[styles.modalSection, { backgroundColor: theme.card }]}>
                        <View style={styles.toggleRow}>
                            <View style={styles.toggleInfo}>
                                <Bell size={20} color={theme.primary} />
                                <View>
                                    <Text style={[styles.toggleLabel, { color: theme.textPrimary }]}>Push Notifications</Text>
                                    <Text style={[styles.toggleDesc, { color: theme.textSecondary }]}>Receive all notifications</Text>
                                </View>
                            </View>
                            <Switch
                                value={notificationsEnabled}
                                onValueChange={setNotificationsEnabled}
                                trackColor={{ false: theme.gray300, true: theme.primary }}
                                thumbColor="#FFFFFF"
                            />
                        </View>
                        
                        <View style={[styles.divider, { backgroundColor: theme.gray200 }]} />
                        
                        <View style={styles.toggleRow}>
                            <View style={styles.toggleInfo}>
                                <BellOff size={20} color={notificationsEnabled ? theme.primary : theme.gray400} />
                                <View>
                                    <Text style={[styles.toggleLabel, { color: notificationsEnabled ? theme.textPrimary : theme.textTertiary }]}>Task Reminders</Text>
                                    <Text style={[styles.toggleDesc, { color: theme.textSecondary }]}>Get reminded before deadlines</Text>
                                </View>
                            </View>
                            <Switch
                                value={taskReminders && notificationsEnabled}
                                onValueChange={setTaskReminders}
                                disabled={!notificationsEnabled}
                                trackColor={{ false: theme.gray300, true: theme.primary }}
                                thumbColor="#FFFFFF"
                            />
                        </View>
                        
                        <View style={[styles.divider, { backgroundColor: theme.gray200 }]} />
                        
                        <View style={styles.toggleRow}>
                            <View style={styles.toggleInfo}>
                                <Info size={20} color={notificationsEnabled ? theme.primary : theme.gray400} />
                                <View>
                                    <Text style={[styles.toggleLabel, { color: notificationsEnabled ? theme.textPrimary : theme.textTertiary }]}>Daily Summary</Text>
                                    <Text style={[styles.toggleDesc, { color: theme.textSecondary }]}>Get a daily progress report</Text>
                                </View>
                            </View>
                            <Switch
                                value={dailySummary && notificationsEnabled}
                                onValueChange={setDailySummary}
                                disabled={!notificationsEnabled}
                                trackColor={{ false: theme.gray300, true: theme.primary }}
                                thumbColor="#FFFFFF"
                            />
                        </View>
                    </View>
                </View>
            </Modal>
            
            {/* Language Modal */}
            <Modal
                visible={showLanguageModal}
                animationType="slide"
                presentationStyle="pageSheet"
                onRequestClose={() => setShowLanguageModal(false)}
            >
                <View style={[styles.modalContainer, { backgroundColor: theme.background }]}>
                    <View style={styles.modalHeader}>
                        <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>Language</Text>
                        <TouchableOpacity onPress={() => setShowLanguageModal(false)}>
                            <X size={24} color={theme.textPrimary} />
                        </TouchableOpacity>
                    </View>
                    
                    <View style={[styles.modalSection, { backgroundColor: theme.card }]}>
                        {LANGUAGES.map((lang, index) => (
                            <TouchableOpacity
                                key={lang.code}
                                style={[
                                    styles.languageOption,
                                    index !== LANGUAGES.length - 1 && { borderBottomWidth: 1, borderBottomColor: theme.gray200 }
                                ]}
                                onPress={() => {
                                    setLanguage(lang.code);
                                    setShowLanguageModal(false);
                                }}
                            >
                                <View>
                                    <Text style={[styles.languageLabel, { color: theme.textPrimary }]}>{lang.label}</Text>
                                    <Text style={[styles.languageNative, { color: theme.textSecondary }]}>{lang.native}</Text>
                                </View>
                                {language === lang.code && <Check size={20} color={theme.primary} />}
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </Modal>
            
            {/* Data & Storage Modal */}
            <Modal
                visible={showDataModal}
                animationType="slide"
                presentationStyle="pageSheet"
                onRequestClose={() => setShowDataModal(false)}
            >
                <View style={[styles.modalContainer, { backgroundColor: theme.background }]}>
                    <View style={styles.modalHeader}>
                        <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>Data & Storage</Text>
                        <TouchableOpacity onPress={() => setShowDataModal(false)}>
                            <X size={24} color={theme.textPrimary} />
                        </TouchableOpacity>
                    </View>
                    
                    <View style={[styles.modalSection, { backgroundColor: theme.card }]}>
                        <View style={styles.dataRow}>
                            <Text style={[styles.dataLabel, { color: theme.textPrimary }]}>Total Tasks</Text>
                            <Text style={[styles.dataValue, { color: theme.primary }]}>{storageInfo.taskCount}</Text>
                        </View>
                        
                        <View style={[styles.divider, { backgroundColor: theme.gray200 }]} />
                        
                        <View style={styles.dataRow}>
                            <Text style={[styles.dataLabel, { color: theme.textPrimary }]}>Estimated Storage</Text>
                            <Text style={[styles.dataValue, { color: theme.textSecondary }]}>{storageInfo.estimatedSize} KB</Text>
                        </View>
                        
                        <View style={[styles.divider, { backgroundColor: theme.gray200 }]} />
                        
                        <TouchableOpacity style={styles.dataRow} onPress={handleClearCache}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                                <Trash2 size={18} color="#FF5555" />
                                <Text style={[styles.dataLabel, { color: '#FF5555' }]}>Clear Cache</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
            
            {/* Privacy Modal */}
            <Modal
                visible={showPrivacyModal}
                animationType="slide"
                presentationStyle="pageSheet"
                onRequestClose={() => setShowPrivacyModal(false)}
            >
                <View style={[styles.modalContainer, { backgroundColor: theme.background }]}>
                    <View style={styles.modalHeader}>
                        <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>Privacy Settings</Text>
                        <TouchableOpacity onPress={() => setShowPrivacyModal(false)}>
                            <X size={24} color={theme.textPrimary} />
                        </TouchableOpacity>
                    </View>
                    
                    <View style={[styles.modalSection, { backgroundColor: theme.card }]}>
                        <Text style={[styles.privacyText, { color: theme.textPrimary }]}>
                            Your data stays on your device and is synced securely with your account.
                        </Text>
                        <Text style={[styles.privacyText, { color: theme.textSecondary, marginTop: 12 }]}>
                            We do not sell or share your personal information with third parties.
                        </Text>
                        
                        <TouchableOpacity 
                            style={[styles.privacyLink, { borderTopColor: theme.gray200 }]}
                            onPress={() => Linking.openURL('https://example.com/privacy')}
                        >
                            <Text style={[styles.linkText, { color: theme.primary }]}>Read Privacy Policy</Text>
                            <ChevronRight size={18} color={theme.primary} />
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
            
            {/* About Modal */}
            <Modal
                visible={showAboutModal}
                animationType="slide"
                presentationStyle="pageSheet"
                onRequestClose={() => setShowAboutModal(false)}
            >
                <View style={[styles.modalContainer, { backgroundColor: theme.background }]}>
                    <View style={styles.modalHeader}>
                        <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>About</Text>
                        <TouchableOpacity onPress={() => setShowAboutModal(false)}>
                            <X size={24} color={theme.textPrimary} />
                        </TouchableOpacity>
                    </View>
                    
                    <View style={[styles.aboutContent, { backgroundColor: theme.card }]}>
                        <View style={[styles.appIcon, { backgroundColor: theme.primary }]}>
                            <Text style={styles.appIconText}>📱</Text>
                        </View>
                        <Text style={[styles.appName, { color: theme.textPrimary }]}>Ta9sim</Text>
                        <Text style={[styles.appVersion, { color: theme.textSecondary }]}>Version 1.0.0</Text>
                        
                        <View style={styles.aboutDivider} />
                        
                        <Text style={[styles.aboutDesc, { color: theme.textSecondary }]}>
                            Ta9sim helps you organize your tasks, manage your schedule, and boost your productivity with AI-powered suggestions.
                        </Text>
                        
                        <View style={styles.aboutInfo}>
                            <View style={styles.aboutRow}>
                                <Text style={[styles.aboutLabel, { color: theme.textTertiary }]}>Developer</Text>
                                <Text style={[styles.aboutValue, { color: theme.textPrimary }]}>DevFest Team</Text>
                            </View>
                            <View style={styles.aboutRow}>
                                <Text style={[styles.aboutLabel, { color: theme.textTertiary }]}>Framework</Text>
                                <Text style={[styles.aboutValue, { color: theme.textPrimary }]}>React Native + Expo</Text>
                            </View>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 24,
    },
    title: {
        fontSize: 32,
        fontWeight: '700',
        letterSpacing: -0.5,
    },
    subtitle: {
        fontSize: 16,
        marginTop: 4,
    },
    section: {
        marginHorizontal: 20,
        marginBottom: 16,
        padding: 16,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 8,
        elevation: 2,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
    },
    themeSelector: {
        flexDirection: 'row',
        gap: 10,
    },
    themeOption: {
        flex: 1,
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        borderRadius: 12,
        borderWidth: 1.5,
        gap: 8,
    },
    themeLabel: {
        fontSize: 13,
        fontWeight: '600',
    },
    divider: {
        height: 1,
        marginVertical: 16,
    },
    settingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    settingInfo: {},
    settingLabel: {
        fontSize: 15,
        fontWeight: '500',
    },
    settingValue: {
        fontSize: 13,
        marginTop: 2,
    },
    themeIndicator: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
    },
    settingLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    iconContainer: {
        width: 36,
        height: 36,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    settingRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    footer: {
        alignItems: 'center',
        paddingVertical: 32,
        gap: 4,
    },
    footerText: {
        fontSize: 13,
    },
    // Modal styles
    modalContainer: {
        flex: 1,
        paddingTop: 20,
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: '700',
    },
    modalSection: {
        marginHorizontal: 20,
        borderRadius: 16,
        padding: 16,
    },
    toggleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 8,
    },
    toggleInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        flex: 1,
    },
    toggleLabel: {
        fontSize: 15,
        fontWeight: '500',
    },
    toggleDesc: {
        fontSize: 12,
        marginTop: 2,
    },
    languageOption: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 14,
    },
    languageLabel: {
        fontSize: 16,
        fontWeight: '500',
    },
    languageNative: {
        fontSize: 13,
        marginTop: 2,
    },
    dataRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
    },
    dataLabel: {
        fontSize: 15,
        fontWeight: '500',
    },
    dataValue: {
        fontSize: 15,
        fontWeight: '600',
    },
    privacyText: {
        fontSize: 15,
        lineHeight: 22,
    },
    privacyLink: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 16,
        marginTop: 16,
        borderTopWidth: 1,
    },
    linkText: {
        fontSize: 15,
        fontWeight: '600',
    },
    aboutContent: {
        marginHorizontal: 20,
        borderRadius: 16,
        padding: 24,
        alignItems: 'center',
    },
    appIcon: {
        width: 80,
        height: 80,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    appIconText: {
        fontSize: 40,
    },
    appName: {
        fontSize: 24,
        fontWeight: '700',
    },
    appVersion: {
        fontSize: 14,
        marginTop: 4,
    },
    aboutDivider: {
        width: 60,
        height: 3,
        backgroundColor: '#6C63FF',
        borderRadius: 2,
        marginVertical: 20,
    },
    aboutDesc: {
        fontSize: 14,
        lineHeight: 22,
        textAlign: 'center',
        marginBottom: 20,
    },
    aboutInfo: {
        width: '100%',
        gap: 12,
    },
    aboutRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    aboutLabel: {
        fontSize: 13,
    },
    aboutValue: {
        fontSize: 13,
        fontWeight: '600',
    },
});

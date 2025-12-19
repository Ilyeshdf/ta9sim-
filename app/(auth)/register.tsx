import React, { useState } from 'react';
import {
    StyleSheet,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Mail, Lock, Eye, EyeOff, User, ArrowRight, ArrowLeft, Sparkles } from 'lucide-react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useAuth } from '@/contexts/AuthContext';
import { useApp } from '@/contexts/AppContext';

export default function RegisterScreen() {
    const { theme } = useApp();
    const { register, isLoading, error, clearError } = useAuth();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [localError, setLocalError] = useState('');

    const handleRegister = async () => {
        clearError();
        setLocalError('');

        if (!name.trim()) {
            setLocalError('Please enter your name');
            return;
        }
        if (!email.trim()) {
            setLocalError('Please enter your email');
            return;
        }
        if (!password.trim()) {
            setLocalError('Please enter a password');
            return;
        }
        if (password.length < 6) {
            setLocalError('Password must be at least 6 characters');
            return;
        }
        if (password !== confirmPassword) {
            setLocalError('Passwords do not match');
            return;
        }

        const success = await register({ 
            email: email.trim(), 
            password,
            name: name.trim(),
        });
        if (success) {
            router.replace('/(tabs)');
        }
    };

    const displayError = localError || error;

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <ScrollView 
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Back Button */}
                    <Animated.View entering={FadeInDown.duration(400)}>
                        <TouchableOpacity 
                            style={[styles.backButton, { backgroundColor: theme.card }]}
                            onPress={() => router.back()}
                        >
                            <ArrowLeft color={theme.textPrimary} size={20} />
                        </TouchableOpacity>
                    </Animated.View>

                    {/* Header Section */}
                    <Animated.View 
                        style={styles.headerSection}
                        entering={FadeInDown.delay(100).duration(600).springify()}
                    >
                        <View style={[styles.iconContainer, { backgroundColor: theme.primaryMuted }]}>
                            <Sparkles color={theme.primary} size={28} />
                        </View>
                        <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>
                            Create Account
                        </Text>
                        <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>
                            Start your balanced productivity journey
                        </Text>
                    </Animated.View>

                    {/* Form Section */}
                    <Animated.View 
                        style={styles.formSection}
                        entering={FadeInUp.delay(200).duration(600).springify()}
                    >
                        {/* Error Message */}
                        {displayError && (
                            <Animated.View 
                                style={[styles.errorContainer, { backgroundColor: theme.error + '15' }]}
                                entering={FadeInDown.duration(300)}
                            >
                                <Text style={[styles.errorText, { color: theme.error }]}>
                                    {displayError}
                                </Text>
                            </Animated.View>
                        )}

                        {/* Name Input */}
                        <View style={styles.inputContainer}>
                            <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Name</Text>
                            <View style={[styles.inputWrapper, { backgroundColor: theme.card, borderColor: theme.gray200 }]}>
                                <User color={theme.textTertiary} size={20} />
                                <TextInput
                                    style={[styles.input, { color: theme.textPrimary }]}
                                    placeholder="Your full name"
                                    placeholderTextColor={theme.textTertiary}
                                    value={name}
                                    onChangeText={setName}
                                    autoCapitalize="words"
                                />
                            </View>
                        </View>

                        {/* Email Input */}
                        <View style={styles.inputContainer}>
                            <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Email</Text>
                            <View style={[styles.inputWrapper, { backgroundColor: theme.card, borderColor: theme.gray200 }]}>
                                <Mail color={theme.textTertiary} size={20} />
                                <TextInput
                                    style={[styles.input, { color: theme.textPrimary }]}
                                    placeholder="your@email.com"
                                    placeholderTextColor={theme.textTertiary}
                                    value={email}
                                    onChangeText={setEmail}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                />
                            </View>
                        </View>

                        {/* Password Input */}
                        <View style={styles.inputContainer}>
                            <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Password</Text>
                            <View style={[styles.inputWrapper, { backgroundColor: theme.card, borderColor: theme.gray200 }]}>
                                <Lock color={theme.textTertiary} size={20} />
                                <TextInput
                                    style={[styles.input, { color: theme.textPrimary }]}
                                    placeholder="Minimum 6 characters"
                                    placeholderTextColor={theme.textTertiary}
                                    value={password}
                                    onChangeText={setPassword}
                                    secureTextEntry={!showPassword}
                                />
                                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                    {showPassword ? (
                                        <EyeOff color={theme.textTertiary} size={20} />
                                    ) : (
                                        <Eye color={theme.textTertiary} size={20} />
                                    )}
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Confirm Password Input */}
                        <View style={styles.inputContainer}>
                            <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Confirm Password</Text>
                            <View style={[styles.inputWrapper, { backgroundColor: theme.card, borderColor: theme.gray200 }]}>
                                <Lock color={theme.textTertiary} size={20} />
                                <TextInput
                                    style={[styles.input, { color: theme.textPrimary }]}
                                    placeholder="Re-enter password"
                                    placeholderTextColor={theme.textTertiary}
                                    value={confirmPassword}
                                    onChangeText={setConfirmPassword}
                                    secureTextEntry={!showPassword}
                                />
                            </View>
                        </View>

                        {/* Register Button */}
                        <TouchableOpacity
                            style={[styles.registerButton, { backgroundColor: theme.primary }]}
                            onPress={handleRegister}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <ActivityIndicator color="#FFF" />
                            ) : (
                                <>
                                    <Text style={styles.registerButtonText}>Create Account</Text>
                                    <ArrowRight color="#FFF" size={20} />
                                </>
                            )}
                        </TouchableOpacity>

                        {/* Login Link */}
                        <View style={styles.loginContainer}>
                            <Text style={[styles.loginText, { color: theme.textSecondary }]}>
                                Already have an account?{' '}
                            </Text>
                            <TouchableOpacity onPress={() => router.back()}>
                                <Text style={[styles.loginLink, { color: theme.primary }]}>
                                    Sign In
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {/* Terms */}
                        <Text style={[styles.termsText, { color: theme.textTertiary }]}>
                            By creating an account, you agree to our Terms of Service and Privacy Policy
                        </Text>
                    </Animated.View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    keyboardView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 24,
        paddingTop: 16,
        paddingBottom: 40,
    },
    backButton: {
        width: 44,
        height: 44,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
    },
    headerSection: {
        alignItems: 'center',
        marginBottom: 36,
    },
    iconContainer: {
        width: 64,
        height: 64,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: '700',
        marginBottom: 8,
    },
    headerSubtitle: {
        fontSize: 16,
        textAlign: 'center',
    },
    formSection: {
        flex: 1,
    },
    errorContainer: {
        padding: 14,
        borderRadius: 12,
        marginBottom: 20,
    },
    errorText: {
        fontSize: 14,
        fontWeight: '500',
    },
    inputContainer: {
        marginBottom: 18,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderRadius: 14,
        borderWidth: 1.5,
        gap: 12,
    },
    input: {
        flex: 1,
        fontSize: 16,
    },
    registerButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        borderRadius: 14,
        gap: 8,
        marginTop: 8,
        shadowColor: '#5B4BDB',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 6,
    },
    registerButtonText: {
        fontSize: 17,
        fontWeight: '700',
        color: '#FFF',
    },
    loginContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 24,
    },
    loginText: {
        fontSize: 15,
    },
    loginLink: {
        fontSize: 15,
        fontWeight: '600',
    },
    termsText: {
        fontSize: 12,
        textAlign: 'center',
        marginTop: 24,
        lineHeight: 18,
    },
});

import { useApp } from '@/contexts/AppContext';
import { useAuth } from '@/contexts/AuthContext';
import { router } from 'expo-router';
import { ArrowRight, Eye, EyeOff, Lock, Mail, Sparkles } from 'lucide-react-native';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LoginScreen() {
    const { theme } = useApp();
    const { login, isLoading, error, clearError } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [localError, setLocalError] = useState('');

    const handleLogin = async () => {
        clearError();
        setLocalError('');

        if (!email.trim()) {
            setLocalError('Please enter your email');
            return;
        }
        if (!password.trim()) {
            setLocalError('Please enter your password');
            return;
        }

        const success = await login({ email: email.trim(), password });
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
                    {/* Logo/Brand Section */}
                    <Animated.View 
                        style={styles.brandSection}
                        entering={FadeInDown.duration(600).springify()}
                    >
                        <View style={styles.logoContainer}>
                            <Image
                                source={require('@/assets/images/logo-taqsim.png')}
                                style={styles.logo}
                                resizeMode="contain"
                            />
                        </View>
                        <Text style={[styles.appName, { color: theme.textPrimary }]}>Ta9sim</Text>
                        <Text style={[styles.tagline, { color: theme.textSecondary }]}>
                            Balance your life with AI
                        </Text>
                    </Animated.View>

                    {/* Form Section */}
                    <Animated.View 
                        style={styles.formSection}
                        entering={FadeInUp.delay(200).duration(600).springify()}
                    >
                        <Text style={[styles.welcomeText, { color: theme.textPrimary }]}>
                            Welcome back
                        </Text>
                        <Text style={[styles.subtitleText, { color: theme.textSecondary }]}>
                            Sign in to continue your productivity journey
                        </Text>

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

                        {/* Email Input */}
                        <View style={styles.inputContainer}>
                            <View style={[styles.inputWrapper, { backgroundColor: theme.card, borderColor: theme.gray200 }]}>
                                <Mail color={theme.textTertiary} size={20} />
                                <TextInput
                                    style={[styles.input, { color: theme.textPrimary }]}
                                    placeholder="Email address"
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
                            <View style={[styles.inputWrapper, { backgroundColor: theme.card, borderColor: theme.gray200 }]}>
                                <Lock color={theme.textTertiary} size={20} />
                                <TextInput
                                    style={[styles.input, { color: theme.textPrimary }]}
                                    placeholder="Password"
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

                        {/* Forgot Password */}
                        <TouchableOpacity style={styles.forgotPassword}>
                            <Text style={[styles.forgotPasswordText, { color: theme.primary }]}>
                                Forgot password?
                            </Text>
                        </TouchableOpacity>

                        {/* Login Button */}
                        <TouchableOpacity
                            style={[styles.loginButton, { backgroundColor: theme.primary }]}
                            onPress={handleLogin}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <ActivityIndicator color="#FFF" />
                            ) : (
                                <>
                                    <Text style={styles.loginButtonText}>Sign In</Text>
                                    <ArrowRight color="#FFF" size={20} />
                                </>
                            )}
                        </TouchableOpacity>

                        {/* Register Link */}
                        <View style={styles.registerContainer}>
                            <Text style={[styles.registerText, { color: theme.textSecondary }]}>
                                Don't have an account?{' '}
                            </Text>
                            <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
                                <Text style={[styles.registerLink, { color: theme.primary }]}>
                                    Sign Up
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {/* Demo Mode */}
                        <TouchableOpacity 
                            style={[styles.demoButton, { borderColor: theme.gray300 }]}
                            onPress={() => router.replace('/(tabs)')}
                        >
                            <Sparkles color={theme.primary} size={18} />
                            <Text style={[styles.demoButtonText, { color: theme.textSecondary }]}>
                                Continue in Demo Mode
                            </Text>
                        </TouchableOpacity>
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
        paddingTop: 40,
        paddingBottom: 40,
    },
    brandSection: {
        alignItems: 'center',
        marginBottom: 48,
    },
    logoContainer: {
        width: 120,
        height: 120,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    logo: {
        width: '100%',
        height: '100%',
    },
    appName: {
        fontSize: 32,
        fontWeight: '700',
        letterSpacing: -0.5,
    },
    tagline: {
        fontSize: 16,
        marginTop: 4,
    },
    formSection: {
        flex: 1,
    },
    welcomeText: {
        fontSize: 28,
        fontWeight: '700',
        marginBottom: 8,
    },
    subtitleText: {
        fontSize: 16,
        marginBottom: 32,
        lineHeight: 22,
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
        marginBottom: 16,
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
    forgotPassword: {
        alignSelf: 'flex-end',
        marginBottom: 24,
    },
    forgotPasswordText: {
        fontSize: 14,
        fontWeight: '600',
    },
    loginButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        borderRadius: 14,
        gap: 8,
        shadowColor: '#5B4BDB',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 6,
    },
    loginButtonText: {
        fontSize: 17,
        fontWeight: '700',
        color: '#FFF',
    },
    registerContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 24,
    },
    registerText: {
        fontSize: 15,
    },
    registerLink: {
        fontSize: 15,
        fontWeight: '600',
    },
    demoButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        borderRadius: 12,
        borderWidth: 1.5,
        gap: 8,
        marginTop: 24,
    },
    demoButtonText: {
        fontSize: 15,
        fontWeight: '500',
    },
});

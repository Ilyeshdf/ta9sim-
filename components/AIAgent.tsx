import React, { useState, useRef, useEffect } from 'react';
import {
    StyleSheet,
    View,
    TouchableOpacity,
    ScrollView,
    TextInput,
    Keyboard,
    Animated,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { Text } from './Themed';
import { MessageCircle, X, Send, Sparkles, Bot } from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';

export default function AIAgent() {
    const { aiMessages, addAIMessage, agentVisible, setAgentVisible, theme } = useApp();
    const [inputText, setInputText] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const scrollViewRef = useRef<ScrollView>(null);
    const slideAnim = useRef(new Animated.Value(500)).current;

    useEffect(() => {
        Animated.spring(slideAnim, {
            toValue: agentVisible ? 0 : 500,
            useNativeDriver: true,
            tension: 65,
            friction: 11,
        }).start();
    }, [agentVisible]);

    useEffect(() => {
        if (aiMessages.length > 0) {
            setTimeout(() => {
                scrollViewRef.current?.scrollToEnd({ animated: true });
            }, 100);
        }
    }, [aiMessages]);

    const handleSend = () => {
        if (!inputText.trim()) return;

        addAIMessage({
            role: 'user',
            content: inputText,
        });

        setInputText('');
        Keyboard.dismiss();

        setIsTyping(true);
        setTimeout(() => {
            const response = generateAIResponse(inputText);
            addAIMessage({
                role: 'agent',
                content: response,
            });
            setIsTyping(false);
        }, 1500);
    };

    const generateAIResponse = (userMessage: string): string => {
        const msg = userMessage.toLowerCase();

        if (msg.includes('help') || msg.includes('assist')) {
            return "I'm here to help! I can create balanced schedules, prioritize tasks, and ensure you're not overworking. What would you like help with?";
        }

        if (msg.includes('schedule') || msg.includes('plan')) {
            return "I'll create an optimized schedule that balances your academics, wellness, and personal life. Would you like me to generate one now?";
        }

        if (msg.includes('stress') || msg.includes('overwhelm')) {
            return "I understand feeling stressed. Let's look at your task list and see what we can redistribute or postpone. Your well-being comes first!";
        }

        if (msg.includes('balance')) {
            return "Balance is key! I analyze your tasks across categories and ensure you're not neglecting any area of your life - academics, wellness, work, or social connections.";
        }

        return "I understand. I'm analyzing your schedule to find ways to optimize your productivity while maintaining balance. Feel free to ask me anything!";
    };

    if (!agentVisible) {
        return (
            <TouchableOpacity
                style={[styles.fab, { backgroundColor: theme.primary, shadowColor: theme.primary }]}
                onPress={() => setAgentVisible(true)}
                activeOpacity={0.9}
            >
                <View style={styles.fabInner}>
                    <Sparkles color={theme.white} size={22} />
                </View>
            </TouchableOpacity>
        );
    }

    return (
        <Animated.View
            style={[
                styles.container,
                { backgroundColor: theme.background },
                {
                    transform: [{ translateY: slideAnim }],
                },
            ]}
        >
            {/* Header */}
            <View style={[styles.header, { backgroundColor: theme.card, borderBottomColor: theme.gray100 }]}>
                <View style={styles.headerLeft}>
                    <View style={[styles.avatar, { backgroundColor: theme.primaryMuted }]}>
                        <Sparkles color={theme.primary} size={18} />
                    </View>
                    <View style={styles.headerInfo}>
                        <Text style={[styles.agentName, { color: theme.textPrimary }]}>AI Coach</Text>
                        <View style={styles.statusRow}>
                            <View style={[styles.statusDot, { backgroundColor: theme.green }]} />
                            <Text style={[styles.statusText, { color: theme.green }]}>Online</Text>
                        </View>
                    </View>
                </View>
                <TouchableOpacity style={[styles.closeBtn, { backgroundColor: theme.gray100 }]} onPress={() => setAgentVisible(false)}>
                    <X color={theme.textSecondary} size={20} />
                </TouchableOpacity>
            </View>

            {/* Messages */}
            <ScrollView
                ref={scrollViewRef}
                style={[styles.messagesContainer, { backgroundColor: theme.background }]}
                contentContainerStyle={styles.messagesContent}
                showsVerticalScrollIndicator={false}
            >
                {aiMessages.length === 0 && (
                    <View style={styles.welcomeState}>
                        <View style={[styles.welcomeIcon, { backgroundColor: theme.primaryMuted }]}>
                            <Bot color={theme.primary} size={32} />
                        </View>
                        <Text style={[styles.welcomeTitle, { color: theme.textPrimary }]}>Hey there!</Text>
                        <Text style={[styles.welcomeText, { color: theme.textSecondary }]}>
                            I'm your personal productivity coach. I can help you plan your day, manage stress, and stay balanced.
                        </Text>
                        <View style={styles.suggestions}>
                            {['Plan my day', 'I feel stressed', 'Help me balance'].map((suggestion) => (
                                <TouchableOpacity
                                    key={suggestion}
                                    style={[styles.suggestionPill, { backgroundColor: theme.card, borderColor: theme.gray200 }]}
                                    onPress={() => {
                                        setInputText(suggestion);
                                    }}
                                >
                                    <Text style={[styles.suggestionText, { color: theme.primary }]}>{suggestion}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                )}

                {aiMessages.map((message) => (
                    <View
                        key={message.id}
                        style={[
                            styles.messageRow,
                            message.role === 'user' ? styles.userRow : styles.agentRow,
                        ]}
                    >
                        {message.role === 'agent' && (
                            <View style={[styles.messageMiniAvatar, { backgroundColor: theme.primaryMuted }]}>
                                <Sparkles color={theme.primary} size={10} />
                            </View>
                        )}
                        <View
                            style={[
                                styles.messageBubble,
                                message.role === 'user' 
                                    ? [styles.userBubble, { backgroundColor: theme.primary }] 
                                    : [styles.agentBubble, { backgroundColor: theme.card }],
                            ]}
                        >
                            <Text
                                style={[
                                    styles.messageText,
                                    { color: theme.textPrimary },
                                    message.role === 'user' && styles.userMessageText,
                                ]}
                            >
                                {message.content}
                            </Text>
                        </View>
                    </View>
                ))}

                {isTyping && (
                    <View style={[styles.messageRow, styles.agentRow]}>
                        <View style={[styles.messageMiniAvatar, { backgroundColor: theme.primaryMuted }]}>
                            <Sparkles color={theme.primary} size={10} />
                        </View>
                        <View style={[styles.messageBubble, styles.agentBubble, { backgroundColor: theme.card }]}>
                            <View style={styles.typingIndicator}>
                                <View style={[styles.typingDot, { backgroundColor: theme.gray300 }]} />
                                <View style={[styles.typingDot, { backgroundColor: theme.gray300 }]} />
                                <View style={[styles.typingDot, { backgroundColor: theme.gray300 }]} />
                            </View>
                        </View>
                    </View>
                )}
            </ScrollView>

            {/* Input */}
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={20}
            >
                <View style={[styles.inputContainer, { backgroundColor: theme.card, borderTopColor: theme.gray100 }]}>
                    <TextInput
                        style={[styles.input, { backgroundColor: theme.backgroundTertiary, color: theme.textPrimary }]}
                        placeholder="Ask me anything..."
                        placeholderTextColor={theme.textTertiary}
                        value={inputText}
                        onChangeText={setInputText}
                        onSubmitEditing={handleSend}
                        multiline
                        maxLength={500}
                    />
                    <TouchableOpacity
                        style={[
                            styles.sendBtn, 
                            { backgroundColor: inputText.trim() ? theme.primary : theme.gray200 }
                        ]}
                        onPress={handleSend}
                        disabled={!inputText.trim()}
                    >
                        <Send
                            color={inputText.trim() ? theme.white : theme.textTertiary}
                            size={18}
                        />
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    fab: {
        position: 'absolute',
        right: 24,
        bottom: 120,
        zIndex: 999,
        width: 56,
        height: 56,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
        elevation: 8,
    },
    fabInner: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    container: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '75%',
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -8 },
        shadowOpacity: 0.12,
        shadowRadius: 24,
        elevation: 20,
        zIndex: 1000,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 16,
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        borderBottomWidth: 1,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    avatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerInfo: {},
    agentName: {
        fontSize: 16,
        fontWeight: '700',
    },
    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        marginTop: 2,
    },
    statusDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '500',
    },
    closeBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },
    messagesContainer: {
        flex: 1,
    },
    messagesContent: {
        padding: 20,
        paddingBottom: 10,
    },
    welcomeState: {
        alignItems: 'center',
        paddingVertical: 40,
        paddingHorizontal: 20,
    },
    welcomeIcon: {
        width: 72,
        height: 72,
        borderRadius: 36,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
    },
    welcomeTitle: {
        fontSize: 22,
        fontWeight: '700',
        marginBottom: 10,
    },
    welcomeText: {
        fontSize: 15,
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 24,
    },
    suggestions: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 10,
    },
    suggestionPill: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        borderWidth: 1,
    },
    suggestionText: {
        fontSize: 13,
        fontWeight: '500',
    },
    messageRow: {
        flexDirection: 'row',
        marginBottom: 16,
    },
    userRow: {
        justifyContent: 'flex-end',
    },
    agentRow: {
        justifyContent: 'flex-start',
    },
    messageMiniAvatar: {
        width: 24,
        height: 24,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
        marginTop: 4,
    },
    messageBubble: {
        maxWidth: '78%',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 18,
    },
    userBubble: {
        borderBottomRightRadius: 6,
    },
    agentBubble: {
        borderBottomLeftRadius: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 6,
        elevation: 2,
    },
    messageText: {
        fontSize: 15,
        lineHeight: 21,
    },
    userMessageText: {
        color: '#FFF',
    },
    typingIndicator: {
        flexDirection: 'row',
        gap: 5,
        paddingVertical: 6,
    },
    typingDot: {
        width: 7,
        height: 7,
        borderRadius: 3.5,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        padding: 16,
        paddingBottom: Platform.OS === 'ios' ? 34 : 16,
        borderTopWidth: 1,
        gap: 12,
    },
    input: {
        flex: 1,
        borderRadius: 24,
        paddingHorizontal: 18,
        paddingVertical: 12,
        fontSize: 15,
        maxHeight: 100,
    },
    sendBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
    },
});

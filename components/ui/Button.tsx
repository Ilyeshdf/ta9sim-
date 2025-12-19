import React from 'react';
import {
    Pressable,
    StyleSheet,
    Text,
    ActivityIndicator,
    View,
    ViewStyle,
    TextStyle,
} from 'react-native';
import theme from '@/constants/theme';

interface ButtonProps {
    title: string;
    onPress: () => void;
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    disabled?: boolean;
    loading?: boolean;
    icon?: React.ReactNode;
    style?: ViewStyle;
    textStyle?: TextStyle;
}

export default function Button({
    title,
    onPress,
    variant = 'primary',
    size = 'md',
    disabled = false,
    loading = false,
    icon,
    style,
    textStyle,
}: ButtonProps) {
    const buttonStyles = [
        styles.base,
        styles[variant],
        styles[size],
        disabled && styles.disabled,
        style,
    ];

    const textStyles = [
        styles.text,
        styles[`text_${variant}`],
        styles[`text_${size}`],
        disabled && styles.textDisabled,
        textStyle,
    ];

    return (
        <Pressable
            onPress={onPress}
            disabled={disabled || loading}
            style={({ pressed }) => [
                ...buttonStyles,
                pressed && !disabled && styles.pressed,
            ]}
        >
            {loading ? (
                <ActivityIndicator
                    color={variant === 'primary' ? theme.colors.neutral.white : theme.colors.primary.main}
                />
            ) : (
                <View style={styles.content}>
                    {icon && <View style={styles.iconContainer}>{icon}</View>}
                    <Text style={textStyles}>{title}</Text>
                </View>
            )}
        </Pressable>
    );
}

const styles = StyleSheet.create({
    base: {
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        borderRadius: theme.borderRadius.md,
    },

    // Variants
    primary: {
        backgroundColor: theme.colors.primary.main,
    },
    secondary: {
        backgroundColor: theme.colors.neutral[100],
    },
    outline: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: theme.colors.border.medium,
    },
    ghost: {
        backgroundColor: 'transparent',
    },

    // Sizes
    sm: {
        height: theme.components.button.height.sm,
        paddingHorizontal: theme.components.button.paddingHorizontal.sm,
    },
    md: {
        height: theme.components.button.height.md,
        paddingHorizontal: theme.components.button.paddingHorizontal.md,
    },
    lg: {
        height: theme.components.button.height.lg,
        paddingHorizontal: theme.components.button.paddingHorizontal.lg,
    },

    // States
    disabled: {
        opacity: 0.5,
    },
    pressed: {
        opacity: 0.7,
        transform: [{ scale: 0.98 }],
    },

    // Text
    text: {
        fontWeight: theme.typography.fontWeight.semibold,
    },
    text_primary: {
        color: theme.colors.neutral.white,
    },
    text_secondary: {
        color: theme.colors.text.primary,
    },
    text_outline: {
        color: theme.colors.text.primary,
    },
    text_ghost: {
        color: theme.colors.primary.main,
    },
    text_sm: {
        fontSize: theme.typography.fontSize.sm,
    },
    text_md: {
        fontSize: theme.typography.fontSize.base,
    },
    text_lg: {
        fontSize: theme.typography.fontSize.md,
    },
    textDisabled: {
        opacity: 1,
    },

    // Content
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.xs,
    },
    iconContainer: {
        marginRight: theme.spacing.xxs,
    },
});

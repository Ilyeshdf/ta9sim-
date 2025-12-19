import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Text } from '@/components/Themed';
import theme from '@/constants/theme';

interface BadgeProps {
    label: string;
    variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'neutral';
    size?: 'sm' | 'md';
    style?: ViewStyle;
}

export default function Badge({ label, variant = 'primary', size = 'md', style }: BadgeProps) {
    return (
        <View style={[styles.base, styles[variant], styles[size], style]}>
            <Text style={[styles.text, styles[`text_${variant}`], styles[`text_${size}`]]}>
                {label}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    base: {
        paddingHorizontal: theme.spacing.sm,
        paddingVertical: theme.spacing.xxs,
        borderRadius: theme.borderRadius.md,
        alignSelf: 'flex-start',
    },

    // Variants
    primary: {
        backgroundColor: theme.colors.primary.bg,
    },
    secondary: {
        backgroundColor: theme.colors.neutral[100],
    },
    success: {
        backgroundColor: theme.colors.success + '15',
    },
    warning: {
        backgroundColor: theme.colors.warning + '15',
    },
    error: {
        backgroundColor: theme.colors.error + '15',
    },
    neutral: {
        backgroundColor: theme.colors.neutral[100],
    },

    // Sizes
    sm: {
        paddingHorizontal: theme.spacing.xs,
        paddingVertical: 2,
    },
    md: {
        paddingHorizontal: theme.spacing.sm,
        paddingVertical: theme.spacing.xxs,
    },

    // Text
    text: {
        fontWeight: theme.typography.fontWeight.semibold,
    },
    text_primary: {
        color: theme.colors.primary.main,
    },
    text_secondary: {
        color: theme.colors.text.secondary,
    },
    text_success: {
        color: theme.colors.success,
    },
    text_warning: {
        color: theme.colors.warning,
    },
    text_error: {
        color: theme.colors.error,
    },
    text_neutral: {
        color: theme.colors.text.secondary,
    },
    text_sm: {
        fontSize: theme.typography.fontSize.xs,
    },
    text_md: {
        fontSize: theme.typography.fontSize.sm,
    },
});

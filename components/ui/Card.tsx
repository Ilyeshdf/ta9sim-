import React from 'react';
import { View, StyleSheet, ViewStyle, Pressable } from 'react-native';
import theme from '@/constants/theme';

interface CardProps {
    children: React.ReactNode;
    elevation?: 'sm' | 'md' | 'lg' | 'xl';
    padding?: number;
    style?: ViewStyle;
    onPress?: () => void;
}

export default function Card({
    children,
    elevation = 'md',
    padding = theme.spacing.md,
    style,
    onPress,
}: CardProps) {
    const cardStyles = [
        styles.base,
        theme.shadows[elevation],
        { padding },
        style,
    ];

    if (onPress) {
        return (
            <Pressable
                onPress={onPress}
                style={({ pressed }) => [
                    ...cardStyles,
                    pressed && styles.pressed,
                ]}
            >
                {children}
            </Pressable>
        );
    }

    return <View style={cardStyles}>{children}</View>;
}

const styles = StyleSheet.create({
    base: {
        backgroundColor: theme.colors.background.primary,
        borderRadius: theme.borderRadius.lg,
    },
    pressed: {
        opacity: 0.9,
        transform: [{ scale: 0.99 }],
    },
});

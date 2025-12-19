// Design System Theme
// Professional mobile app design system with consistent spacing, colors, and typography

export const theme = {
    // Color Palette
    colors: {
        // Primary - Purple brand color
        primary: {
            main: '#7C3AED',
            light: '#A78BFA',
            dark: '#6D28D9',
            bg: '#F5F3FF', // Very light purple for backgrounds
        },

        // Secondary - Accent colors
        secondary: {
            blue: '#3B82F6',
            green: '#10B981',
            orange: '#F97316',
            pink: '#EC4899',
            yellow: '#F59E0B',
        },

        // Neutrals - Grayscale palette
        neutral: {
            50: '#FAFAFA',
            100: '#F5F5F5',
            200: '#E5E5E5',
            300: '#D4D4D4',
            400: '#A3A3A3',
            500: '#737373',
            600: '#525252',
            700: '#404040',
            800: '#262626',
            900: '#171717',
            black: '#000000',
            white: '#FFFFFF',
        },

        // Semantic colors
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
        info: '#3B82F6',

        // Text colors
        text: {
            primary: '#171717',
            secondary: '#525252',
            tertiary: '#A3A3A3',
            inverse: '#FFFFFF',
        },

        // Background colors
        background: {
            primary: '#FFFFFF',
            secondary: '#FAFAFA',
            tertiary: '#F5F5F5',
        },

        // Border colors
        border: {
            light: '#E5E5E5',
            medium: '#D4D4D4',
            dark: '#A3A3A3',
        },
    },

    // Spacing Scale (4px base)
    spacing: {
        xxs: 4,
        xs: 8,
        sm: 12,
        md: 16,
        lg: 24,
        xl: 32,
        xxl: 40,
        xxxl: 48,
    },

    // Border Radius
    borderRadius: {
        sm: 8,
        md: 12,
        lg: 16,
        xl: 20,
        xxl: 24,
        full: 9999,
    },

    // Typography
    typography: {
        // Font family (using system fonts for best performance)
        fontFamily: {
            regular: 'System',
            medium: 'System',
            semibold: 'System',
            bold: 'System',
        },

        // Font sizes
        fontSize: {
            xs: 11,
            sm: 13,
            base: 15,
            md: 17,
            lg: 20,
            xl: 24,
            xxl: 28,
            xxxl: 34,
        },

        // Font weights
        fontWeight: {
            regular: '400' as '400',
            medium: '500' as '500',
            semibold: '600' as '600',
            bold: '700' as '700',
        },

        // Line heights
        lineHeight: {
            tight: 1.2,
            normal: 1.5,
            relaxed: 1.75,
        },
    },

    // Shadows (elevation system)
    shadows: {
        sm: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 2,
            elevation: 1,
        },
        md: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.08,
            shadowRadius: 4,
            elevation: 2,
        },
        lg: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.12,
            shadowRadius: 8,
            elevation: 4,
        },
        xl: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.16,
            shadowRadius: 16,
            elevation: 8,
        },
    },

    // Component-specific styles
    components: {
        // Button
        button: {
            height: {
                sm: 36,
                md: 44,
                lg: 52,
            },
            paddingHorizontal: {
                sm: 16,
                md: 20,
                lg: 24,
            },
        },

        // Input
        input: {
            height: 48,
            borderWidth: 1,
            paddingHorizontal: 16,
        },

        // Card
        card: {
            padding: 16,
            borderRadius: 16,
        },

        // Icon sizes
        icon: {
            xs: 16,
            sm: 20,
            md: 24,
            lg: 32,
            xl: 40,
        },
    },
};

// Helper function to get consistent styles
export const getCardStyle = () => ({
    backgroundColor: theme.colors.background.primary,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    ...theme.shadows.md,
});

export const getButtonStyle = (variant: 'primary' | 'secondary' | 'outline' = 'primary') => {
    const baseStyle = {
        height: theme.components.button.height.md,
        paddingHorizontal: theme.components.button.paddingHorizontal.md,
        borderRadius: theme.borderRadius.md,
        alignItems: 'center' as const,
        justifyContent: 'center' as const,
        flexDirection: 'row' as const,
    };

    switch (variant) {
        case 'primary':
            return {
                ...baseStyle,
                backgroundColor: theme.colors.primary.main,
            };
        case 'secondary':
            return {
                ...baseStyle,
                backgroundColor: theme.colors.neutral[100],
            };
        case 'outline':
            return {
                ...baseStyle,
                backgroundColor: 'transparent',
                borderWidth: 1,
                borderColor: theme.colors.border.medium,
            };
        default:
            return baseStyle;
    }
};

export const getTextStyle = (variant: 'h1' | 'h2' | 'h3' | 'body' | 'caption' = 'body') => {
    switch (variant) {
        case 'h1':
            return {
                fontSize: theme.typography.fontSize.xxxl,
                fontWeight: theme.typography.fontWeight.bold,
                color: theme.colors.text.primary,
                lineHeight: theme.typography.fontSize.xxxl * theme.typography.lineHeight.tight,
            };
        case 'h2':
            return {
                fontSize: theme.typography.fontSize.xxl,
                fontWeight: theme.typography.fontWeight.bold,
                color: theme.colors.text.primary,
                lineHeight: theme.typography.fontSize.xxl * theme.typography.lineHeight.tight,
            };
        case 'h3':
            return {
                fontSize: theme.typography.fontSize.lg,
                fontWeight: theme.typography.fontWeight.semibold,
                color: theme.colors.text.primary,
                lineHeight: theme.typography.fontSize.lg * theme.typography.lineHeight.normal,
            };
        case 'body':
            return {
                fontSize: theme.typography.fontSize.base,
                fontWeight: theme.typography.fontWeight.regular,
                color: theme.colors.text.primary,
                lineHeight: theme.typography.fontSize.base * theme.typography.lineHeight.normal,
            };
        case 'caption':
            return {
                fontSize: theme.typography.fontSize.sm,
                fontWeight: theme.typography.fontWeight.regular,
                color: theme.colors.text.secondary,
                lineHeight: theme.typography.fontSize.sm * theme.typography.lineHeight.normal,
            };
        default:
            return {};
    }
};

export default theme;

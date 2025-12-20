// Design System Theme
// Semantic theme tokens with proper light/dark mode support

export interface ThemeColors {
    black: string | OpaqueColorValue | Value | AnimatedInterpolation<string | number> | undefined;
    // Surface colors
    background: string;
    surface: string;
    card: string;
    
    // Text colors
    textPrimary: string;
    textSecondary: string;
    textTertiary: string;
    
    // Brand colors
    primary: string;
    primaryMuted: string;
    
    // Semantic colors
    success: string;
    warning: string;
    error: string;
    info: string;
    
    // Border & divider
    border: string;
    divider: string;
    
    // Grays
    gray50: string;
    gray100: string;
    gray200: string;
    gray300: string;
    gray400: string;
    gray500: string;
    gray600: string;
    gray700: string;
    gray800: string;
    gray900: string;
}

export const lightTheme: ThemeColors = {
    // Surfaces - Light Mode
    background: '#FAF5FF',      // Very light purple tint
    surface: '#FFFFFF',          // Pure white for cards
    card: '#FFFFFF',             // Same as surface
    
    // Text - Light Mode
    textPrimary: '#1F2937',      // Dark gray (not pure black)
    textSecondary: '#6B7280',    // Medium gray
    textTertiary: '#9CA3AF',     // Light gray
    
    // Brand
    primary: '#9b87f5',          // Purple
    primaryMuted: '#F3E8FF',     // Very light purple
    
    // Semantic
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
    
    // Borders
    border: '#E5E7EB',
    divider: '#F3F4F6',
    
    // Grays
    gray50: '#F9FAFB',
    gray100: '#F3F4F6',
    gray200: '#E5E7EB',
    gray300: '#D1D5DB',
    gray400: '#9CA3AF',
    gray500: '#6B7280',
    gray600: '#4B5563',
    gray700: '#374151',
    gray800: '#1F2937',
    gray900: '#111827',
};

export const darkTheme: ThemeColors = {
    // Surfaces - Light Mode (forcing light mode only)
    background: '#FAF5FF',       // Very light purple tint
    surface: '#FFFFFF',          // Pure white
    card: '#FFFFFF',             // Same as surface
    
    // Text - Light Mode
    textPrimary: '#1F2937',      // Dark gray (not black)
    textSecondary: '#6B7280',    // Medium gray
    textTertiary: '#9CA3AF',     // Light gray
    
    // Brand
    primary: '#9b87f5',          // Purple
    primaryMuted: '#F3E8FF',     // Light purple
    
    // Semantic
    success: '#10B981',          // Green
    warning: '#F59E0B',          // Amber
    error: '#EF4444',            // Red
    info: '#3B82F6',             // Blue
    
    // Category Colors
    academics: '#3B82F6',        // Blue
    wellness: '#10B981',         // Green
    work: '#8B5CF6',             // Violet
    social: '#F59E0B',           // Amber
    
    // Borders
    border: '#E5E7EB',
    divider: '#F3F4F6',
    
    // Grays (warmer tones)
    gray50: '#FAFAFC',
    gray100: '#F4F5F7',
    gray200: '#E8EAED',
    gray300: '#D3D6DB',
    gray400: '#9AA1B0',
    gray500: '#6B7489',
    gray600: '#4A5568',
    gray700: '#2D3748',
    gray800: '#1A202C',
    gray900: '#0F1419',
    
    // Additional colors
    purple: '#9b87f5',
    purpleMuted: '#F3E8FF',
    blue: '#3B82F6',
    green: '#10B981',
    orange: '#F59E0B',
    red: '#EF4444',
    yellow: '#FBBF24',
    indigo: '#6366F1',
    pink: '#EC4899',
    teal: '#14B8A6',
    
    // Status indicators
    online: '#10B981',
    away: '#F59E0B',
    busy: '#EF4444',
};

export const theme = {
    // Spacing Scale (8px base)
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

    // Shadows (light mode only)
    getShadow: () => ({
        sm: {
            shadowColor: '#9b87f5',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 2,
            elevation: 1,
        },
        md: {
            shadowColor: '#9b87f5',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.08,
            shadowRadius: 4,
            elevation: 2,
        },
        lg: {
            shadowColor: '#9b87f5',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.12,
            shadowRadius: 8,
            elevation: 4,
        },
        xl: {
            shadowColor: '#9b87f5',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.16,
            shadowRadius: 16,
            elevation: 8,
        },
    }),

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

// Helper to get theme-aware card style
export const getCardStyle = (colors: ThemeColors) => ({
    backgroundColor: colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    ...theme.getShadow().md,
});

export const getButtonStyle = (colors: ThemeColors, variant: 'primary' | 'secondary' | 'outline' = 'primary') => {
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
                backgroundColor: colors.primary,
            };
        case 'secondary':
            return {
                ...baseStyle,
                backgroundColor: colors.surface,
            };
        case 'outline':
            return {
                ...baseStyle,
                backgroundColor: 'transparent',
                borderWidth: 1,
                borderColor: colors.border,
            };
        default:
            return baseStyle;
    }
};

export const getTextStyle = (colors: ThemeColors, variant: 'h1' | 'h2' | 'h3' | 'body' | 'caption' = 'body') => {
    switch (variant) {
        case 'h1':
            return {
                fontSize: theme.typography.fontSize.xxxl,
                fontWeight: theme.typography.fontWeight.bold,
                color: colors.textPrimary,
                lineHeight: theme.typography.fontSize.xxxl * theme.typography.lineHeight.tight,
            };
        case 'h2':
            return {
                fontSize: theme.typography.fontSize.xxl,
                fontWeight: theme.typography.fontWeight.bold,
                color: colors.textPrimary,
                lineHeight: theme.typography.fontSize.xxl * theme.typography.lineHeight.tight,
            };
        case 'h3':
            return {
                fontSize: theme.typography.fontSize.lg,
                fontWeight: theme.typography.fontWeight.semibold,
                color: colors.textPrimary,
                lineHeight: theme.typography.fontSize.lg * theme.typography.lineHeight.normal,
            };
        case 'body':
            return {
                fontSize: theme.typography.fontSize.base,
                fontWeight: theme.typography.fontWeight.regular,
                color: colors.textPrimary,
                lineHeight: theme.typography.fontSize.base * theme.typography.lineHeight.normal,
            };
        case 'caption':
            return {
                fontSize: theme.typography.fontSize.sm,
                fontWeight: theme.typography.fontWeight.regular,
                color: colors.textSecondary,
                lineHeight: theme.typography.fontSize.sm * theme.typography.lineHeight.normal,
            };
        default:
            return {};
    }
};

export default theme;

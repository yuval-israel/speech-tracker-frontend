import React from 'react';
import { Text as RNText, StyleSheet, I18nManager } from 'react-native';
import { useTheme, getTypography } from '../theme';

const Text = ({
    style,
    variant = 'body',
    color,
    align,
    children,
    ...props
}) => {
    const { colors } = useTheme();
    const Typography = getTypography(colors);

    const textStyle = [
        styles.base,
        Typography[variant],
        color && { color },
        align && { textAlign: align },
        // Force RTL alignment if not explicitly overridden
        !align && { textAlign: I18nManager.isRTL ? 'right' : 'left' },
        style
    ];

    return (
        <RNText style={textStyle} {...props}>
            {children}
        </RNText>
    );
};

const styles = StyleSheet.create({
    base: {
        writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr',
    },
});

export default Text;

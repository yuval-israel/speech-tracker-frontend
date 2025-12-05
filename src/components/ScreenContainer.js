import React from 'react';
import { View, StyleSheet, StatusBar, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Layout, useTheme } from '../theme';

const ScreenContainer = ({
    children,
    style,
    noPadding = false,
}) => {
    const { isDark, colors } = useTheme();

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar
                barStyle={isDark ? 'light-content' : 'dark-content'}
                backgroundColor={colors.background}
            />
            <View style={[
                styles.content,
                !noPadding && styles.padding,
                style
            ]}>
                {children}
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: Platform.OS === 'android' ? Layout.STATUS_BAR_HEIGHT : 0,
    },
    content: {
        flex: 1,
    },
    padding: {
        paddingHorizontal: Layout.SECTION_PADDING,
        paddingBottom: Layout.SECTION_PADDING,
    }
});

export default ScreenContainer;

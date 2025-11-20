import React from 'react';
import { View, StyleSheet, StatusBar, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Layout, Spacing } from '../theme';

const ScreenContainer = ({
    children,
    style,
    noPadding = false,
    backgroundColor = Colors.background
}) => {
    return (
        <SafeAreaView style={[styles.container, { backgroundColor }]}>
            <StatusBar
                barStyle={Platform.OS === 'ios' ? 'dark-content' : 'dark-content'}
                backgroundColor={backgroundColor}
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

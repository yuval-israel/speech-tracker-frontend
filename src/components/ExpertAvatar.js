import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import Text from './Text';
import { useTheme, Spacing } from '../theme';

// Require the asset - ensure it exists in src/assets/
const AvatarImage = require('../assets/expert_avatar.png');

export default function ExpertAvatar({ message, mood = 'neutral', compact = false, style }) {
    const { colors } = useTheme();

    return (
        <View style={[styles.container, style]}>
            <View style={styles.avatarContainer}>
                <Image
                    source={AvatarImage}
                    style={[
                        styles.avatar,
                        compact ? styles.avatarSmall : styles.avatarRegular,
                        { borderColor: colors.primary }
                    ]}
                />
            </View>
            <View style={[
                styles.bubble,
                compact ? styles.bubbleSmall : styles.bubbleRegular,
                { backgroundColor: colors.surface, borderColor: colors.border }
            ]}>
                <View style={[styles.arrow, { borderRightColor: colors.border }]} />
                <View style={[styles.arrowInner, { borderRightColor: colors.surface }]} />
                <Text style={[styles.message, { color: colors.text }]}>
                    {message}
                </Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'flex-start', // Align top so bubble aligns with face
        marginVertical: Spacing.md,
        paddingHorizontal: Spacing.sm,
    },
    avatarContainer: {
        marginRight: Spacing.md,
    },
    avatar: {
        borderWidth: 2,
        borderRadius: 40,
    },
    avatarRegular: {
        width: 64,
        height: 64,
        borderRadius: 32,
    },
    avatarSmall: {
        width: 48,
        height: 48,
        borderRadius: 24,
    },
    bubble: {
        flex: 1,
        borderRadius: 16,
        padding: Spacing.md,
        borderWidth: 1,
        position: 'relative',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.10,
        shadowRadius: 2.22,
        elevation: 2,
    },
    bubbleRegular: {
        minHeight: 64, // Match avatar height roughly
        justifyContent: 'center',
    },
    bubbleSmall: {
        padding: Spacing.sm,
        minHeight: 48,
    },
    message: {
        fontSize: 16,
        lineHeight: 22,
    },
    // Triangle arrow for speech bubble
    arrow: {
        position: 'absolute',
        left: -10,
        top: 20,
        backgroundColor: 'transparent',
        borderStyle: 'solid',
        borderTopWidth: 8,
        borderRightWidth: 10, // Pointing left? Wait. Right width creates left point? No.
        // CSS triangles:
        // Pointing Left: BorderRight colored, Top/Bottom transparent.
        borderBottomWidth: 8,
        borderLeftWidth: 0,
        borderTopColor: 'transparent',
        borderBottomColor: 'transparent',
        // borderRightColor set in component
    },
    arrowInner: {
        position: 'absolute',
        left: -8, // Slightly right of outer arrow to create border effect
        top: 20,
        backgroundColor: 'transparent',
        borderStyle: 'solid',
        borderTopWidth: 8,
        borderRightWidth: 10,
        borderBottomWidth: 8,
        borderLeftWidth: 0,
        borderTopColor: 'transparent',
        borderBottomColor: 'transparent',
        // borderRightColor set in component
    }
});

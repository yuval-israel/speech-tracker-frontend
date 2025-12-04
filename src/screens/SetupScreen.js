import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import ScreenContainer from '../components/ScreenContainer';
import Text from '../components/Text';
import { Colors, Spacing, Layout } from '../theme';

const SetupCard = ({ title, description, onPress, isCompleted }) => (
    <TouchableOpacity style={styles.card} onPress={onPress}>
        <View style={styles.cardContent}>
            <Text variant="h3" style={styles.cardTitle}>{title}</Text>
            <Text variant="body" style={styles.cardDescription}>{description}</Text>
        </View>
        {isCompleted && (
            <View style={styles.checkMark}>
                <Text color={Colors.success}>✓</Text>
            </View>
        )}
    </TouchableOpacity>
);

export default function SetupScreen() {
    const navigation = useNavigation();

    // TODO: Check actual completion status from API/Context
    const hasFamilyMembers = false;
    const hasDefinedVoice = false;

    return (
        <ScreenContainer>
            <View style={styles.header}>
                <Text variant="h1">Let's Get to Know You</Text>
                <Text variant="body" color={Colors.textLight} style={styles.subtitle}>
                    Complete these steps to personalize your experience.
                </Text>
            </View>

            <View style={styles.cards}>
                <SetupCard
                    title="Add Family Members"
                    description="Create profiles for your children and family members."
                    onPress={() => navigation.navigate('AddChild')}
                    isCompleted={hasFamilyMembers}
                />

                <SetupCard
                    title="Define Voices"
                    description="Help us recognize who is speaking during sessions."
                    onPress={() => navigation.navigate('VoiceCalibration')}
                    isCompleted={hasDefinedVoice}
                />
            </View>

            {hasFamilyMembers && (
                <TouchableOpacity
                    style={styles.skipButton}
                    onPress={() => navigation.navigate('MainTabs')}
                >
                    <Text color={Colors.primary} align="center">Go to Dashboard</Text>
                </TouchableOpacity>
            )}
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    header: {
        marginBottom: Spacing.xl,
        marginTop: Spacing.lg,
    },
    subtitle: {
        marginTop: Spacing.sm,
    },
    cards: {
        gap: Spacing.md,
    },
    card: {
        backgroundColor: Colors.surface,
        padding: Spacing.lg,
        borderRadius: Layout.borderRadius ? Layout.borderRadius.lg : 16,
        flexDirection: 'row',
        alignItems: 'center',
    },
    cardContent: {
        flex: 1,
    },
    cardTitle: {
        marginBottom: Spacing.xs,
    },
    cardDescription: {
        color: Colors.textLight,
        fontSize: 14,
    },
    checkMark: {
        marginLeft: Spacing.md,
    },
    skipButton: {
        marginTop: Spacing.xl,
        padding: Spacing.md,
    }
});

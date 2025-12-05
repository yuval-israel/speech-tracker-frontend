import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import ScreenContainer from '../components/ScreenContainer';
import Text from '../components/Text';
import PrimaryButton from '../components/PrimaryButton';
import { Colors, Spacing, Layout } from '../theme';
import { apiJson } from '../api';
import { useAuth } from '../context/AuthContext';

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
    const { token, setSelectedChild, setHasConfiguredFamily } = useAuth();
    const [children, setChildren] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fetch children when screen comes into focus
    useFocusEffect(
        useCallback(() => {
            const fetchChildren = async () => {
                if (!token) return;
                try {
                    const data = await apiJson('/children/', token);
                    setChildren(data || []);
                } catch (err) {
                    console.error('Failed to fetch children:', err);
                } finally {
                    setLoading(false);
                }
            };
            fetchChildren();
        }, [token])
    );

    const hasFamilyMembers = children.length > 0;
    const firstChild = children[0];
    // TODO: Check if voice stamps exist for completion status
    const hasDefinedVoice = false;

    const handleContinue = async () => {
        // Set the first child as selected
        if (firstChild) {
            await setSelectedChild(firstChild);
        }
        // Mark family as configured - this triggers App.js to switch to MainNavigator
        await setHasConfiguredFamily(true);
    };

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
                    description={hasFamilyMembers
                        ? `${children.length} child${children.length > 1 ? 'ren' : ''} added (${children.map(c => c.name).join(', ')})`
                        : "Create profiles for your children and family members."}
                    onPress={() => navigation.navigate('AddChild')}
                    isCompleted={hasFamilyMembers}
                />

                <SetupCard
                    title="Define Voices"
                    description="Help us recognize who is speaking during sessions."
                    onPress={() => {
                        if (firstChild) {
                            navigation.navigate('VoiceCalibration', { childId: firstChild.id });
                        } else {
                            navigation.navigate('AddChild');
                        }
                    }}
                    isCompleted={hasDefinedVoice}
                />
            </View>

            {hasFamilyMembers && (
                <PrimaryButton
                    title="Continue to Dashboard"
                    onPress={handleContinue}
                    style={styles.continueButton}
                />
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
    continueButton: {
        marginTop: Spacing.xl,
    }
});

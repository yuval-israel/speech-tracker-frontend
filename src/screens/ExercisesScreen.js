import React, { useState } from 'react';
<<<<<<< Updated upstream
import { View, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import ScreenContainer from '../components/ScreenContainer';
import Text from '../components/Text';
import { Spacing, Layout, useTheme } from '../theme';
=======
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import ScreenContainer from '../components/ScreenContainer';
import Text from '../components/Text';
import PrimaryButton from '../components/PrimaryButton';
import { Colors, Spacing, Layout } from '../theme';
>>>>>>> Stashed changes

export default function ExercisesScreen() {
<<<<<<< Updated upstream
    const [selectedCategory, setSelectedCategory] = useState('All');
    const { colors } = useTheme();
    const { selectedChild } = useAuth();
    const navigation = useNavigation();

    const filteredExercises = selectedCategory === 'All'
        ? EXERCISES
        : EXERCISES.filter(e => e.category === selectedCategory);

    const renderItem = ({ item }) => (
        <TouchableOpacity style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.cardContent}>
                <Text variant="h3" style={styles.cardTitle}>{item.title}</Text>
                <View style={styles.cardMeta}>
                    <View style={[styles.badge, { backgroundColor: colors.background, borderColor: colors.border }]}>
                        <Text style={[styles.badgeText, { color: colors.textLight }]}>{item.category}</Text>
                    </View>
                    <Text variant="small">{item.duration}</Text>
                </View>
            </View>
            <View style={[styles.playButton, { backgroundColor: colors.primary }]}>
                <Text color="#FFFFFF">▶</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <ScreenContainer>
            <View style={styles.header}>
                {/* Child Switcher Component */}
                <View style={[styles.childHeader, { borderColor: colors.border }]}>
                    <View>
                        <Text variant="label" style={{ color: colors.muted, marginBottom: 4 }}>Current Profile</Text>
                        <Text variant="h2" style={{ color: colors.primary }}>
                            {selectedChild?.name || 'Select Child'}
                        </Text>
                    </View>
                    <TouchableOpacity
                        style={[styles.switchButton, { backgroundColor: colors.surface, borderColor: colors.primary }]}
                        onPress={() => navigation.navigate('MyFamily', { screen: 'ChildList' })}
                    >
                        <Text style={{ color: colors.primary, fontWeight: '500', marginRight: 4 }}>Switch</Text>
                        <Text style={{ color: colors.primary }}>→</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.sectionHeader}>
                <Text variant="h1">Exercises</Text>
                <Text variant="small" style={{ color: colors.muted }}>Daily practices for {selectedChild?.name || 'your child'}</Text>
            </View>

            <View style={styles.filterContainer}>
                <FlatList
                    horizontal
                    data={CATEGORIES}
                    showsHorizontalScrollIndicator={false}
                    keyExtractor={item => item}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={[
                                styles.filterChip,
                                { backgroundColor: colors.background, borderColor: colors.border },
                                selectedCategory === item && { backgroundColor: colors.primary, borderColor: colors.primary }
                            ]}
                            onPress={() => setSelectedCategory(item)}
                        >
                            <Text
                                style={[
                                    styles.filterText,
                                    { color: colors.text },
                                    selectedCategory === item && styles.filterTextSelected
                                ]}
                            >
                                {item}
                            </Text>
                        </TouchableOpacity>
                    )}
                    contentContainerStyle={styles.filterList}
                />
            </View>
=======
    const navigation = useNavigation();
    const [isListening, setIsListening] = useState(false);

    return (
        <ScreenContainer>
            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.header}>
                    <Text variant="h1">Home</Text>
                    <Text variant="body" color={Colors.textLight} style={styles.subtitle}>
                        Your daily speech development companion
                    </Text>
                </View>

                {/* Expert Persona Card */}
                <View style={styles.expertCard}>
                    <View style={styles.avatarContainer}>
                        <View style={styles.avatar}>
                            <Text style={styles.avatarText}>👂</Text>
                        </View>
                        {isListening && <View style={styles.listeningIndicator} />}
                    </View>
>>>>>>> Stashed changes

                    <View style={styles.expertContent}>
                        <Text variant="h2" style={styles.expertTitle}>
                            I'm listening...
                        </Text>
                        <Text variant="body" color={Colors.textLight} style={styles.expertMessage}>
                            Hi there! I'm here to help track your child's speech development.
                            Start a recording session whenever you're ready, and I'll analyze
                            the conversation to provide insights on language growth.
                        </Text>

                        <PrimaryButton
                            title="Start Recording Session"
                            onPress={() => navigation.navigate('Record')}
                            style={styles.startButton}
                        />
                    </View>
                </View>

                {/* Daily Routine Prompt */}
                <View style={styles.routineCard}>
                    <View style={styles.routineHeader}>
                        <Text variant="h3">📅 Daily Routine</Text>
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>Recommended</Text>
                        </View>
                    </View>

                    <Text variant="body" color={Colors.textLight} style={styles.routineDescription}>
                        Consistency is key to speech development. We recommend recording at least
                        one 10-15 minute conversation each day during natural activities like:
                    </Text>

                    <View style={styles.activityList}>
                        <ActivityItem emoji="🍽️" title="Mealtime conversations" />
                        <ActivityItem emoji="📖" title="Story time" />
                        <ActivityItem emoji="🎨" title="Creative play" />
                        <ActivityItem emoji="🚗" title="Car rides" />
                    </View>

                    <TouchableOpacity
                        style={styles.tipCard}
                        onPress={() => {/* Could navigate to tips screen */ }}
                    >
                        <Text variant="small" style={styles.tipIcon}>💡</Text>
                        <Text variant="small" color={Colors.primary} style={styles.tipText}>
                            Tap for more tips on encouraging speech development
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Quick Stats Card */}
                <View style={styles.statsCard}>
                    <Text variant="h3" style={styles.statsTitle}>This Week</Text>
                    <View style={styles.statsRow}>
                        <StatItem label="Sessions" value="3" />
                        <StatItem label="Minutes" value="42" />
                        <StatItem label="New Words" value="12" />
                    </View>
                    <TouchableOpacity
                        style={styles.viewDataButton}
                        onPress={() => navigation.navigate('Data')}
                    >
                        <Text color={Colors.primary}>View Detailed Progress →</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </ScreenContainer>
    );
}

const ActivityItem = ({ emoji, title }) => (
    <View style={styles.activityItem}>
        <Text style={styles.activityEmoji}>{emoji}</Text>
        <Text variant="body">{title}</Text>
    </View>
);

const StatItem = ({ label, value }) => (
    <View style={styles.statItem}>
        <Text variant="h2" style={styles.statValue}>{value}</Text>
        <Text variant="small" color={Colors.textLight}>{label}</Text>
    </View>
);

const styles = StyleSheet.create({
    header: {
<<<<<<< Updated upstream
        marginBottom: Spacing.sm,
        marginTop: Spacing.sm,
    },
    childHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: Spacing.md,
        paddingHorizontal: Spacing.sm,
        marginBottom: Spacing.md,
        borderBottomWidth: 1,
        borderStyle: 'dashed',
    },
    switchButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.xs,
        borderRadius: 20,
        borderWidth: 1,
    },
    sectionHeader: {
        marginBottom: Spacing.lg,
=======
        marginBottom: Spacing.xl,
        marginTop: Spacing.md,
>>>>>>> Stashed changes
    },
    subtitle: {
        marginTop: Spacing.xs,
    },
    expertCard: {
        backgroundColor: Colors.primary,
        borderRadius: 16,
        padding: Spacing.lg,
        marginBottom: Spacing.lg,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
<<<<<<< Updated upstream
    filterList: {
        gap: Spacing.sm,
        paddingRight: Spacing.md,
    },
    filterChip: {
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.xs,
        borderRadius: 16,
        borderWidth: 1,
    },
    filterText: {
    },
    filterTextSelected: {
        color: '#FFFFFF',
        fontWeight: 'bold',
    },
    list: {
        gap: Spacing.md,
        paddingBottom: Spacing.xl,
    },
    card: {
        padding: Spacing.md,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
    },
    cardContent: {
        flex: 1,
    },
    cardTitle: {
        marginBottom: Spacing.xs,
    },
    cardMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.md,
    },
    badge: {
        paddingHorizontal: Spacing.xs,
        paddingVertical: 2,
        borderRadius: 4,
        borderWidth: 1,
    },
    badgeText: {
        fontSize: 10,
    },
    playButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
=======
    avatarContainer: {
        alignItems: 'center',
        marginBottom: Spacing.md,
        position: 'relative',
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: Colors.white,
>>>>>>> Stashed changes
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    avatarText: {
        fontSize: 40,
    },
    listeningIndicator: {
        position: 'absolute',
        top: 0,
        right: '35%',
        width: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: '#4CAF50',
        borderWidth: 2,
        borderColor: Colors.white,
    },
    expertContent: {
        alignItems: 'center',
    },
    expertTitle: {
        color: Colors.white,
        marginBottom: Spacing.sm,
        textAlign: 'center',
    },
    expertMessage: {
        color: 'rgba(255, 255, 255, 0.9)',
        textAlign: 'center',
        marginBottom: Spacing.lg,
        lineHeight: 22,
    },
    startButton: {
        backgroundColor: Colors.white,
        width: '100%',
    },
    routineCard: {
        backgroundColor: Colors.surface,
        borderRadius: 12,
        padding: Spacing.lg,
        marginBottom: Spacing.lg,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    routineHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.sm,
    },
    badge: {
        backgroundColor: Colors.primary,
        paddingHorizontal: Spacing.sm,
        paddingVertical: 4,
        borderRadius: 12,
    },
    badgeText: {
        color: Colors.white,
        fontSize: 11,
        fontWeight: 'bold',
    },
    routineDescription: {
        marginBottom: Spacing.md,
        lineHeight: 20,
    },
    activityList: {
        marginBottom: Spacing.md,
    },
    activityItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: Spacing.xs,
    },
    activityEmoji: {
        fontSize: 20,
        marginRight: Spacing.sm,
    },
    tipCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.background,
        padding: Spacing.md,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: Colors.primary,
        borderStyle: 'dashed',
    },
    tipIcon: {
        fontSize: 20,
        marginRight: Spacing.sm,
    },
    tipText: {
        flex: 1,
        fontWeight: '600',
    },
    statsCard: {
        backgroundColor: Colors.surface,
        borderRadius: 12,
        padding: Spacing.lg,
        marginBottom: Spacing.xl,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    statsTitle: {
        marginBottom: Spacing.md,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: Spacing.md,
    },
    statItem: {
        alignItems: 'center',
    },
    statValue: {
        color: Colors.primary,
        marginBottom: Spacing.xs,
    },
    viewDataButton: {
        alignItems: 'center',
        paddingVertical: Spacing.sm,
    },
});

import React, { useState } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import ScreenContainer from '../components/ScreenContainer';
import Text from '../components/Text';
import { Spacing, Layout, useTheme } from '../theme';

const EXERCISES = [
    { id: '1', title: 'Vowel Sounds', category: 'Basics', duration: '5 min' },
    { id: '2', title: 'Animal Noises', category: 'Fun', duration: '10 min' },
    { id: '3', title: 'Counting 1-10', category: 'Numbers', duration: '5 min' },
    { id: '4', title: 'Colors Identification', category: 'Basics', duration: '8 min' },
    { id: '5', title: 'Story Time', category: 'Listening', duration: '15 min' },
];

const CATEGORIES = ['All', 'Basics', 'Fun', 'Numbers', 'Listening'];

export default function ExercisesScreen() {
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

            <FlatList
                data={filteredExercises}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.list}
            />
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    header: {
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
    },
    filterContainer: {
        marginBottom: Spacing.lg,
    },
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
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: Spacing.md,
    }
});

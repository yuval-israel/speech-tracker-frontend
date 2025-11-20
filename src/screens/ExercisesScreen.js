import React, { useState } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import ScreenContainer from '../components/ScreenContainer';
import Text from '../components/Text';
import { Colors, Spacing, Layout } from '../theme';

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

    const filteredExercises = selectedCategory === 'All'
        ? EXERCISES
        : EXERCISES.filter(e => e.category === selectedCategory);

    const renderItem = ({ item }) => (
        <TouchableOpacity style={styles.card}>
            <View style={styles.cardContent}>
                <Text variant="h3" style={styles.cardTitle}>{item.title}</Text>
                <View style={styles.cardMeta}>
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>{item.category}</Text>
                    </View>
                    <Text variant="small" color={Colors.textLight}>{item.duration}</Text>
                </View>
            </View>
            <View style={styles.playButton}>
                <Text color={Colors.white}>▶</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <ScreenContainer>
            <View style={styles.header}>
                <Text variant="h1">Exercises</Text>
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
                                selectedCategory === item && styles.filterChipSelected
                            ]}
                            onPress={() => setSelectedCategory(item)}
                        >
                            <Text
                                style={[
                                    styles.filterText,
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
        marginBottom: Spacing.md,
        marginTop: Spacing.md,
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
        borderColor: Colors.border,
        backgroundColor: Colors.background,
    },
    filterChipSelected: {
        backgroundColor: Colors.primary,
        borderColor: Colors.primary,
    },
    filterText: {
        color: Colors.text,
    },
    filterTextSelected: {
        color: Colors.white,
        fontWeight: 'bold',
    },
    list: {
        gap: Spacing.md,
        paddingBottom: Spacing.xl,
    },
    card: {
        backgroundColor: Colors.surface,
        padding: Spacing.md,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Colors.border,
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
        backgroundColor: Colors.background,
        paddingHorizontal: Spacing.xs,
        paddingVertical: 2,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    badgeText: {
        fontSize: 10,
        color: Colors.textLight,
    },
    playButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: Colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: Spacing.md,
    }
});

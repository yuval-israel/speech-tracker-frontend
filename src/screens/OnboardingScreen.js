import React, { useState } from 'react';
import { View, StyleSheet, Dimensions, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import ScreenContainer from '../components/ScreenContainer';
import Text from '../components/Text';
import PrimaryButton from '../components/PrimaryButton';
import { Colors, Spacing, Layout } from '../theme';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

const SLIDES = [
    {
        id: 1,
        title: 'Welcome to Speech Tracker',
        description: 'Track your child\'s speech development with ease.',
        // image: require('../assets/onboarding1.png'),
    },
    {
        id: 2,
        title: 'Record & Analyze',
        description: 'Record daily sessions and get instant feedback on progress.',
        // image: require('../assets/onboarding2.png'),
    },
    {
        id: 3,
        title: 'Personalized Insights',
        description: 'Get tailored exercises and milestones for your child.',
        // image: require('../assets/onboarding3.png'),
    }
];

export default function OnboardingScreen() {
    const navigation = useNavigation();
    const [currentPage, setCurrentPage] = useState(0);

    const handleNext = async () => {
        if (currentPage < SLIDES.length - 1) {
            setCurrentPage(currentPage + 1);
        } else {
            // Finish onboarding
            await AsyncStorage.setItem('HAS_SEEN_ONBOARDING', 'true');
            navigation.navigate('Setup');
        }
    };

    return (
        <ScreenContainer>
            <View style={styles.container}>
                <View style={styles.slideContainer}>
                    <Text variant="h1" align="center" style={styles.title}>
                        {SLIDES[currentPage].title}
                    </Text>
                    <Text variant="body" align="center" style={styles.description}>
                        {SLIDES[currentPage].description}
                    </Text>
                </View>

                <View style={styles.footer}>
                    <View style={styles.dots}>
                        {SLIDES.map((_, index) => (
                            <View
                                key={index}
                                style={[
                                    styles.dot,
                                    index === currentPage && styles.activeDot
                                ]}
                            />
                        ))}
                    </View>

                    <PrimaryButton
                        title={currentPage === SLIDES.length - 1 ? "Get Started" : "Next"}
                        onPress={handleNext}
                    />
                </View>
            </View>
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'space-between',
        paddingVertical: Spacing.xl,
    },
    slideContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: Spacing.lg,
    },
    title: {
        marginBottom: Spacing.md,
    },
    description: {
        color: Colors.textLight,
    },
    footer: {
        gap: Spacing.lg,
    },
    dots: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: Spacing.sm,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: Colors.border,
    },
    activeDot: {
        backgroundColor: Colors.primary,
        width: 24,
    }
});

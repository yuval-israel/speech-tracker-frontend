import React from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import ScreenContainer from '../components/ScreenContainer';
import Text from '../components/Text';
import PrimaryButton from '../components/PrimaryButton';
import { Colors, Spacing, Layout } from '../theme';

export default function PaywallScreen() {
    const navigation = useNavigation();

    const handlePurchase = () => {
        // Placeholder for purchase logic
        alert('Purchase successful! (Placeholder)');
        navigation.goBack();
    };

    return (
        <ScreenContainer>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeButton}>
                    <Text color={Colors.textLight}>✕</Text>
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <Text variant="h1" align="center" style={styles.title}>Unlock Premium</Text>
                <Text variant="body" align="center" style={styles.subtitle}>
                    Get unlimited access to all exercises, advanced data insights, and family management features.
                </Text>

                <View style={styles.features}>
                    <FeatureItem text="Unlimited Exercises" />
                    <FeatureItem text="Advanced Progress Charts" />
                    <FeatureItem text="Multiple Child Profiles" />
                    <FeatureItem text="Priority Support" />
                </View>

                <View style={styles.planCard}>
                    <Text variant="h3" align="center">Pro Plan</Text>
                    <Text variant="h1" align="center" color={Colors.primary} style={styles.price}>$9.99</Text>
                    <Text variant="small" align="center" color={Colors.textLight}>per month</Text>
                </View>

                <PrimaryButton title="Subscribe Now" onPress={handlePurchase} style={styles.subscribeButton} />

                <TouchableOpacity onPress={() => alert('Restore purchases placeholder')} style={styles.restoreButton}>
                    <Text variant="small" color={Colors.textLight} align="center">Restore Purchases</Text>
                </TouchableOpacity>
            </ScrollView>
        </ScreenContainer>
    );
}

const FeatureItem = ({ text }) => (
    <View style={styles.featureItem}>
        <Text color={Colors.success} style={{ marginRight: Spacing.sm }}>✓</Text>
        <Text>{text}</Text>
    </View>
);

const styles = StyleSheet.create({
    header: {
        alignItems: 'flex-end',
        marginBottom: Spacing.md,
    },
    closeButton: {
        padding: Spacing.sm,
    },
    content: {
        paddingBottom: Spacing.xl,
    },
    title: {
        marginBottom: Spacing.sm,
    },
    subtitle: {
        marginBottom: Spacing.xl,
        color: Colors.textLight,
    },
    features: {
        marginBottom: Spacing.xl,
        paddingHorizontal: Spacing.lg,
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Spacing.sm,
    },
    planCard: {
        backgroundColor: Colors.surface,
        padding: Spacing.xl,
        borderRadius: 16,
        borderWidth: 2,
        borderColor: Colors.primary,
        marginBottom: Spacing.xl,
    },
    price: {
        marginVertical: Spacing.sm,
    },
    subscribeButton: {
        marginBottom: Spacing.md,
    },
    restoreButton: {
        padding: Spacing.sm,
    }
});

import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Svg, { Rect, Text as SvgText } from 'react-native-svg';
import ScreenContainer from '../components/ScreenContainer';
import Text from '../components/Text';
import { Colors, Spacing, Layout } from '../theme';
import { apiJson } from '../api';
import { useAuth } from '../context/AuthContext';

const screenWidth = Dimensions.get('window').width;

const RADIUS = 70;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const LanguageUnitsRing = ({ percent }) => {
    const clamped = Math.max(0, Math.min(100, percent || 0));
    const strokeDashoffset = CIRCUMFERENCE - (CIRCUMFERENCE * clamped) / 100;

    return (
        <View style={styles.ringContainer}>
            <Svg height={RADIUS * 2 + 20} width={RADIUS * 2 + 20}>
                <Rect
                    x={0}
                    y={0}
                    width={RADIUS * 2 + 20}
                    height={RADIUS * 2 + 20}
                    fill="transparent"
                />
                {/* Background circle */}
                <SvgText
                    x="50%"
                    y="50%"
                    fontSize="32"
                    fill={Colors.text}
                    textAnchor="middle"
                    alignmentBaseline="central"
                >
                    {`${clamped}%`}
                </SvgText>
            </Svg>
        </View>
    );
};

const VocabularyBars = ({ vocabulary }) => {
    const entries = vocabulary || [];
    if (!entries.length) return <Text variant="small" color={Colors.textLight}>No vocabulary data yet.</Text>;

    const maxValue = Math.max(...entries.map(e => e.value || 0), 1);

    return (
        <View style={{ gap: Spacing.sm }}>
            {entries.map((item) => {
                const width = (item.value / maxValue) * (screenWidth - Spacing.xl * 2);
                return (
                    <View key={item.label} style={styles.vocabRow}>
                        <Text style={styles.vocabLabel}>{item.label}</Text>
                        <View style={styles.vocabBarBackground}>
                            <View style={[styles.vocabBarFill, { width }]} />
                        </View>
                        <Text variant="small" color={Colors.textLight}>{item.value}</Text>
                    </View>
                );
            })}
        </View>
    );
};

const InteractionMeter = ({ score }) => {
    const clamped = Math.max(0, Math.min(100, score || 0));

    return (
        <View>
            <View style={styles.meterTrack}>
                <View style={[styles.meterFill, { width: `${clamped}%` }]} />
            </View>
            <View style={styles.meterLabels}>
                <Text variant="small" color={Colors.textLight}>Calm</Text>
                <Text variant="small" color={Colors.textLight}>Engaged</Text>
                <Text variant="small" color={Colors.textLight}>Overloaded</Text>
            </View>
        </View>
    );
};

export default function DataScreen() {
    const { token, selectedChild } = useAuth();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            if (!token || !selectedChild) return;
            setLoading(true);
            setError('');
            const cacheKey = `ANALYSIS_CACHE_${selectedChild.id}`;

            try {
                // Fetch from global_child_summed.json endpoint
                const result = await apiJson(`/global_child_summed.json?child_id=${selectedChild.id}`, token);
                setData(result);
                // Cache the result
                await AsyncStorage.setItem(cacheKey, JSON.stringify(result));
            } catch (err) {
                console.error('Failed to load analysis dashboard', err);

                // Try to load from cache
                try {
                    const cached = await AsyncStorage.getItem(cacheKey);
                    if (cached) {
                        setData(JSON.parse(cached));
                        // Optional: Set a specific error or info message that we are offline
                        // setError('Showing offline data'); 
                    } else {
                        setError(err.message || 'Failed to load analysis.');
                    }
                } catch (cacheErr) {
                    setError(err.message || 'Failed to load analysis.');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [token, selectedChild]);

    const languagePercent = data?.language_units_percent ?? 0;
    const vocabEntries = data?.vocabulary_breakdown ?? [];
    const interactionScore = data?.interaction_meter ?? 0;

    return (
        <ScreenContainer>
            <View style={styles.header}>
                <Text variant="h1">Progress</Text>
            </View>

            <ScrollView>
                <View style={styles.section}>
                    <Text variant="h3" style={{ marginBottom: Spacing.md }}>Language Units</Text>
                    <View style={styles.card}>
                        <LanguageUnitsRing percent={languagePercent} />
                        <Text variant="body" align="center" style={{ marginTop: Spacing.md }}>
                            Daily target completion
                        </Text>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text variant="h3" style={{ marginBottom: Spacing.md }}>Vocabulary Breakdown</Text>
                    <View style={styles.card}>
                        <VocabularyBars vocabulary={vocabEntries} />
                    </View>
                </View>

                <View style={styles.section}>
                    <Text variant="h3" style={{ marginBottom: Spacing.md }}>Interaction Meter</Text>
                    <View style={styles.card}>
                        <InteractionMeter score={interactionScore} />
                    </View>
                </View>

                {loading && (
                    <View style={styles.section}>
                        <Text variant="small" color={Colors.textLight}>Loading latest data…</Text>
                    </View>
                )}

                {error ? (
                    <View style={styles.section}>
                        <Text style={{ color: Colors.danger }}>{error}</Text>
                    </View>
                ) : null}
            </ScrollView>
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    header: {
        marginBottom: Spacing.xl,
        marginTop: Spacing.md,
    },
    section: {
        marginBottom: Spacing.xxl,
    },
    card: {
        backgroundColor: Colors.surface,
        padding: Spacing.md,
        borderRadius: 8,
        marginBottom: Spacing.sm,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    ringContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    vocabRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
    },
    vocabLabel: {
        width: 80,
    },
    vocabBarBackground: {
        flex: 1,
        height: 10,
        borderRadius: 5,
        backgroundColor: Colors.background,
        overflow: 'hidden',
    },
    vocabBarFill: {
        height: 10,
        borderRadius: 5,
        backgroundColor: Colors.primary,
    },
    meterTrack: {
        width: '100%',
        height: 12,
        borderRadius: 6,
        backgroundColor: Colors.background,
        overflow: 'hidden',
        marginBottom: Spacing.sm,
    },
    meterFill: {
        height: 12,
        borderRadius: 6,
        backgroundColor: Colors.primary,
    },
    meterLabels: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
});


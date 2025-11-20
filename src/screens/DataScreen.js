import React from 'react';
import { View, StyleSheet, ScrollView, Dimensions } from 'react-native';
import Svg, { Rect, Text as SvgText } from 'react-native-svg';
import ScreenContainer from '../components/ScreenContainer';
import Text from '../components/Text';
import { Colors, Spacing, Layout } from '../theme';

const screenWidth = Dimensions.get('window').width;

const DATA = [
    { day: 'Mon', count: 12 },
    { day: 'Tue', count: 19 },
    { day: 'Wed', count: 8 },
    { day: 'Thu', count: 24 },
    { day: 'Fri', count: 15 },
    { day: 'Sat', count: 30 },
    { day: 'Sun', count: 20 },
];

const Chart = () => {
    const maxCount = Math.max(...DATA.map(d => d.count));
    const barWidth = 30;
    const chartHeight = 200;
    const spacing = (screenWidth - (Layout.SECTION_PADDING * 2) - (barWidth * DATA.length)) / (DATA.length - 1);

    return (
        <View style={styles.chartContainer}>
            <Svg height={chartHeight + 40} width={screenWidth - (Layout.SECTION_PADDING * 2)}>
                {DATA.map((item, index) => {
                    const barHeight = (item.count / maxCount) * chartHeight;
                    const x = index * (barWidth + spacing);
                    const y = chartHeight - barHeight;

                    return (
                        <React.Fragment key={index}>
                            <Rect
                                x={x}
                                y={y}
                                width={barWidth}
                                height={barHeight}
                                fill={Colors.primary}
                                rx={4}
                            />
                            <SvgText
                                x={x + barWidth / 2}
                                y={chartHeight + 20}
                                fontSize="12"
                                fill={Colors.textLight}
                                textAnchor="middle"
                            >
                                {item.day}
                            </SvgText>
                            <SvgText
                                x={x + barWidth / 2}
                                y={y - 5}
                                fontSize="10"
                                fill={Colors.text}
                                textAnchor="middle"
                            >
                                {item.count}
                            </SvgText>
                        </React.Fragment>
                    );
                })}
            </Svg>
        </View>
    );
};

export default function DataScreen() {
    return (
        <ScreenContainer>
            <View style={styles.header}>
                <Text variant="h1">Progress</Text>
            </View>

            <ScrollView>
                <View style={styles.section}>
                    <Text variant="h3" style={{ marginBottom: Spacing.lg }}>Weekly Activity</Text>
                    <Chart />
                </View>

                <View style={styles.section}>
                    <Text variant="h3" style={{ marginBottom: Spacing.md }}>Insights</Text>
                    <View style={styles.card}>
                        <Text variant="body">
                            Great job! You've practiced for <Text style={{ fontWeight: 'bold' }}>3 days</Text> in a row.
                        </Text>
                    </View>
                    <View style={styles.card}>
                        <Text variant="body">
                            Most active time: <Text style={{ fontWeight: 'bold' }}>Morning (8-10 AM)</Text>
                        </Text>
                    </View>
                </View>
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
    chartContainer: {
        alignItems: 'center',
        paddingVertical: Spacing.md,
    },
    card: {
        backgroundColor: Colors.surface,
        padding: Spacing.md,
        borderRadius: 8,
        marginBottom: Spacing.sm,
        borderWidth: 1,
        borderColor: Colors.border,
    }
});

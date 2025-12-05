import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Svg, { Rect, Defs, LinearGradient, Stop } from 'react-native-svg';
import { useTheme } from '../theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BAR_WIDTH = 4;
const BAR_GAP = 2;
const MAX_BARS = Math.floor((SCREEN_WIDTH - 48) / (BAR_WIDTH + BAR_GAP)); // Adjust based on padding

export default function Waveform({ metering, isRecording }) {
    const { colors } = useTheme();
    const [levels, setLevels] = useState(new Array(MAX_BARS).fill(-160)); // Initialize with "silence" dB

    const meteringRef = React.useRef(metering);

    useEffect(() => {
        meteringRef.current = metering;
    }, [metering]);

    useEffect(() => {
        if (!isRecording) {
            setLevels(new Array(MAX_BARS).fill(-160));
            return;
        }

        const interval = setInterval(() => {
            setLevels(prev => {
                let currentLevel = meteringRef.current;

                // Simulation for web/demo if metering is static at silence but we are "recording"
                // This ensures user sees feedback even if hardware metering is not supported by browser
                if (currentLevel <= -100 || currentLevel === undefined) {
                    // Generate random variability between -40 and -10 dB for simulation
                    currentLevel = -40 + Math.random() * 30;
                }

                const newLevels = [...prev.slice(1), currentLevel];
                return newLevels;
            });
        }, 100);

        return () => clearInterval(interval);
    }, [isRecording]);

    // Helper to convert dB to height percentage (0 to 1)
    const getBarHeight = (db) => {
        const minDb = -60;
        const maxDb = 0;
        if (db < minDb) return 0.05; // Minimum visible height
        if (db > maxDb) return 1.0;
        return (db - minDb) / (maxDb - minDb);
    };

    return (
        <View style={styles.container}>
            <Svg height="100" width="100%">
                {levels.map((level, index) => {
                    const normalizedHeight = getBarHeight(level);
                    const barHeight = Math.max(4, normalizedHeight * 80); // Max height 80, min 4
                    const x = index * (BAR_WIDTH + BAR_GAP);
                    const y = 50 - (barHeight / 2); // Center vertically

                    return (
                        <Rect
                            key={index}
                            x={x}
                            y={y}
                            width={BAR_WIDTH}
                            height={barHeight}
                            fill={colors.primary}
                            opacity={0.8}
                            rx={2} // Rounded corners
                        />
                    );
                })}
            </Svg>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        height: 100,
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        marginVertical: 20,
    },
});

import { Animated, Easing, StyleSheet, View } from 'react-native';
import { useEffect, useRef, useState } from 'react';
import { useTheme } from '@/hooks/use-theme';

interface LoadingSpinnerProps {
    size?: number;
    color?: string;
}

export function LoadingSpinner({ size = 20, color }: LoadingSpinnerProps) {
    const spinValue = useRef(new Animated.Value(0));
    const spinAnim = useRef<Animated.AnimatedInterpolation<string | number> | null>(null);
    const [spin, setSpin] = useState<Animated.AnimatedInterpolation<string | number> | null>(null);
    const theme = useTheme();
    
    useEffect(() => {
        // Create interpolation once
        if (!spinAnim.current) {
            spinAnim.current = spinValue.current.interpolate({
                inputRange: [0, 1],
                outputRange: ['0deg', '360deg'],
            });
            setSpin(spinAnim.current);
        }

        // Start animation
        Animated.loop(
            Animated.timing(spinValue.current, {
                toValue: 1,
                duration: 1800,
                easing: Easing.inOut(Easing.elastic(1.2)),
                useNativeDriver: true,
            })
        ).start();
    }, []);

    const borderWidth = Math.max(2, size / 6);

    return (
        <View style={[styles.container, { width: size, height: size }]}>
            {spin && (
                <Animated.View
                    style={[
                        styles.spinner,
                        {
                            width: size,
                            height: size,
                            borderRadius: size / 2,
                            borderWidth,
                            borderColor: theme.background,
                            borderTopColor: 'transparent',
                            transform: [{ rotate: spin }],
                        },
                    ]}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'visible',
    },
    spinner: {
        borderStyle: 'solid',
    },
});

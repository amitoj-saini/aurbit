import { ThemedView } from "@/components/themed-view";
import React, { useEffect, useMemo, useState } from "react";
import { useTheme } from "@/hooks/use-theme";
import {
    Animated,
    PanResponder,
    ScrollView,
    StyleSheet,
    useWindowDimensions,
    StyleProp,
    ViewStyle,
} from "react-native";

type ExpandableSheetProps = {
    children?: React.ReactNode;
    style?: StyleProp<ViewStyle>;
    disableExpand?: boolean;
    visible?: boolean;
};

export default function ExpandableSheet({
    children,
    style,
    disableExpand = false,
    visible = true,
}: ExpandableSheetProps) {
    const theme = useTheme();
    const { height } = useWindowDimensions();

    const SHEET_HEIGHT = height * 0.7;
    const COLLAPSED_Y = height * 0.45;
    const EXPANDED_Y = 0;
    const HIDDEN_Y = SHEET_HEIGHT;

    const styles = StyleSheet.create({
        sheet: {
            position: "absolute",

            left: 0,
            right: 0,
            bottom: 0,

            height: SHEET_HEIGHT,

            backgroundColor: theme.background,

            borderTopLeftRadius: 35,
            borderTopRightRadius: 35,

            overflow: "hidden",

            elevation: 10,

            shadowColor: "#000",
            shadowOffset: {
                width: 0,
                height: -3,
            },
            shadowOpacity: 0.15,
            shadowRadius: 10,

            zIndex: 100,
        },

        handleArea: {
            width: "100%",
            height: 45,

            alignItems: "center",
            justifyContent: "center",
        },

        handle: {
            width: 45,
            height: 5,

            borderRadius: 5,

            backgroundColor: "#999",
        },

        scrollView: {
            flex: 1,
        },

        content: {
            paddingHorizontal: 20,
            paddingBottom: 40,
        },
    });

    const [translateY] = useState(
        () => new Animated.Value(
            visible
                ? COLLAPSED_Y
                : HIDDEN_Y
        )
    );

    /**
     * Handle opening / closing the sheet.
     *
     * visible = true:
     *      hidden -> collapsed
     *
     * visible = false:
     *      collapsed/expanded -> hidden
     */
    useEffect(() => {
        Animated.spring(translateY, {
            toValue: visible
                ? COLLAPSED_Y
                : HIDDEN_Y,
            useNativeDriver: true,
            damping: 20,
            stiffness: 200,
            mass: 0.8,
        }).start();
    }, [
        visible,
        COLLAPSED_Y,
        HIDDEN_Y,
        translateY,
    ]);

    const panResponder = useMemo(() => {
        let startY = COLLAPSED_Y;

        return PanResponder.create({
            onStartShouldSetPanResponder: () => {
                return visible && !disableExpand;
            },

            onMoveShouldSetPanResponder: (_, gesture) => {
                if (!visible || disableExpand) {
                    return false;
                }

                return Math.abs(gesture.dy) > 5;
            },

            onPanResponderGrant: () => {
                translateY.stopAnimation((value) => {
                    startY = value;
                });
            },

            onPanResponderMove: (_, gesture) => {
                let nextY = startY + gesture.dy;

                nextY = Math.max(
                    EXPANDED_Y,
                    nextY
                );

                nextY = Math.min(
                    COLLAPSED_Y,
                    nextY
                );

                translateY.setValue(nextY);
            },

            onPanResponderRelease: (_, gesture) => {
                let nextY = startY + gesture.dy;

                nextY = Math.max(
                    EXPANDED_Y,
                    nextY
                );

                nextY = Math.min(
                    COLLAPSED_Y,
                    nextY
                );

                const midpoint = COLLAPSED_Y / 2;

                const destination =
                    nextY < midpoint
                        ? EXPANDED_Y
                        : COLLAPSED_Y;

                Animated.spring(translateY, {
                    toValue: destination,
                    useNativeDriver: true,
                    damping: 20,
                    stiffness: 200,
                    mass: 0.8,
                }).start();
            },
        });
    }, [
        COLLAPSED_Y,
        EXPANDED_Y,
        translateY,
        disableExpand,
        visible,
    ]);

    return (
        <Animated.View
            style={[
                styles.sheet,
                {
                    transform: [{ translateY }],
                },
            ]}
        >
            <ThemedView
                {...panResponder.panHandlers}
                style={styles.handleArea}
            >
                <ThemedView style={styles.handle} />
            </ThemedView>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={[
                    styles.content,
                    style,
                    {
                        height:
                            (disableExpand
                                ? SHEET_HEIGHT - COLLAPSED_Y
                                : SHEET_HEIGHT) - 45,
                    },
                ]}
                showsVerticalScrollIndicator={false}
            >
                {children}
            </ScrollView>
        </Animated.View>
    );
}
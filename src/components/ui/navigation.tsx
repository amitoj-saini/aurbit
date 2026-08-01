
import { StyleSheet, StyleProp, ViewStyle, Pressable } from 'react-native';
import { useTheme } from '@/hooks/use-theme';
import { ThemedView } from '../themed-view';
import { Settings } from 'lucide-react-native';
import { ReactNode, useState } from "react"
import { ExternalPathString, RelativePathString, router } from 'expo-router';
import Logo from './logo';

type NavigationItemProps = {
    style?: StyleProp<ViewStyle>;
    children: ReactNode,
    onPress?: () => void
}

function NavigationItem({ style, children, onPress }: NavigationItemProps) {
    const styles = StyleSheet.create({
        navItem: {
            borderRadius: 50,
            width: 75,
            height: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            marginVertical: 2,
            backgroundColor: "transparent",
        }
    })

    return (
        <Pressable onPress={onPress} style={[styles.navItem, style]}>{children}</Pressable>
    )
}

export default function Navigation({selected = "aurbit"}) {
    const theme = useTheme();
    const [selectedNavigationItem] = useState(selected);

    const styles = StyleSheet.create({
        centerNavigation: {
            width: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            position: "absolute",
            bottom: 50,
            backgroundColor: "transparent"
        },

        navigationContainer: {
            flex: 1,
            height: 60,
            borderRadius: 50,
            padding: 7,
            boxShadow: theme.boxShadow,
            backgroundColor: `${theme.backgroundSecondary}E6`,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "row"
        },

        navigationText: {
            fontSize: 11,
            fontWeight: 400
        },

        selected: {
            backgroundColor: `${theme.backgroundTertiary}`,
            boxShadow: theme.boxShadow
        }
    })

    return (
        <ThemedView style={styles.centerNavigation}>
            <ThemedView style={styles.navigationContainer}>
                
                <NavigationItem onPress={() => { if (selectedNavigationItem !== "aurbit") router.push("/aurbit"); }} style={(selectedNavigationItem === "aurbit") ? styles.selected : {}}>
                    <Logo width={36} height={36}/>
                    
                </NavigationItem>

                <NavigationItem onPress={() => { if (selectedNavigationItem !== "settings") router.push("/settings"); }} style={(selectedNavigationItem === "settings") ? styles.selected : {}}>
                    <Settings color={theme.text} size={18}/>
                    
                </NavigationItem>
            </ThemedView>
        </ThemedView>
    )
}

import { useTheme } from '@/hooks/use-theme';
import { ThemedView } from '../themed-view';
import { StyleSheet } from 'react-native';
import { Map, Settings } from 'lucide-react-native';
import { ReactNode } from "react"
import { ThemedText } from "../themed-text";

type NavigationItemProps = {
    children: ReactNode
}

function NavigationItem({ children }: NavigationItemProps) {
    const theme = useTheme();

    const styles = StyleSheet.create({
        navItem: {
            borderRadius: 50,
            padding: 10,
            width: 85,
            height: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            marginVertical: 2,
            backgroundColor: theme.backgroundSecondary
        }
    })

    return (
        <ThemedView style={styles.navItem}>{children}</ThemedView>
    )
}

export default function Navigation() {
    const theme = useTheme();

    const styles = StyleSheet.create({
        centerNavigation: {
            width: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            position: "absolute",
            bottom: 50,
        },

        navigationContainer: {
            flex: 1,
            height: 60,
            borderRadius: 50,
            padding: 7,
            boxShadow: theme.boxShadow,
            backgroundColor: theme.backgroundSecondary,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "row"
        },

        navigationText: {
            fontSize: 11,
            fontWeight: 400
        }
    })

    return (
        <ThemedView style={styles.centerNavigation}>
            <ThemedView style={styles.navigationContainer}>
                
                <NavigationItem>
                    <Map size={16}/>
                    <ThemedText style={styles.navigationText}>Map</ThemedText>
                </NavigationItem>

                <NavigationItem>
                    <Settings size={16}/>
                    <ThemedText style={styles.navigationText}>Settings</ThemedText>
                </NavigationItem>
            </ThemedView>
        </ThemedView>
    )
}

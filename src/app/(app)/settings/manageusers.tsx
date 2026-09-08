import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useTheme } from "@/hooks/use-theme";
import { ChevronLeft } from "lucide-react-native";
import { Pressable, StyleSheet } from "react-native";
import { router } from 'expo-router';


export default function ManageUsers() {
    const theme = useTheme();

    const styles = StyleSheet.create({
        page: {
            width: '100%',
            height: '100%',
        },

        pageTitle: {
            width: '100%',
            display: 'flex',
            textAlign: 'center',
            justifyContent: 'center',
            alignItems: 'center',
            marginTop: 80,
        },

        pageTitleText: {
            fontSize: 20,
            fontWeight: 500,
            padding: 10,
        },

        settingContainer: {
            width: '100%',
            display: 'flex',
            paddingHorizontal: 15,
        },

        backButton: {
            position: 'absolute',
            left: 30,
            borderStyle: 'solid',
            borderRadius: 20,
            width: 60,
            height: 40,
            borderColor: theme.backgroundTertiary,
            boxShadow: theme.boxShadow,
            borderWidth: 1,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            marginTop: -10,
        },
    });

    return (
        <ThemedView style={styles.page}>
            
            <ThemedView style={styles.pageTitle}>
                <Pressable
                    onPress={() =>
                        router.push('/settings')
                    }
                    style={styles.backButton}
                >
                    <ChevronLeft
                        size={28}
                        color={theme.textSecondary}
                    />
                </Pressable>

                <ThemedText
                    style={styles.pageTitleText}>
                    Manage Users
                </ThemedText>
                
            </ThemedView>
        </ThemedView>
    );
}
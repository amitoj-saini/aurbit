import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import Navigation from '@/components/ui/navigation';
import { useTheme } from '@/hooks/use-theme';
import { Pressable, StyleSheet } from 'react-native';
import { User } from 'lucide-react-native';
import { router } from 'expo-router';

export default function Settings() {
    const theme = useTheme();
    

    const styles = StyleSheet.create({
        page: {
            width: "100%",
            height: "100%"
        },
        pageTitle: {
            width: "100%",
            
            display: "flex",
            textAlign: "center",
            justifyContent: "center",
            alignItems: "center",
            marginTop: 80
        },
        pageTitleText: {
            fontSize: 28,
            fontWeight: 500,
            padding: 20
        },
        settingContainer: {
            width: "100%",
            display: "flex",
            paddingHorizontal: 15
        },
        setting: {
            paddingVertical: 15,
            display: "flex",
            flexDirection: "row",
            alignItems: "center"
        },
        settingText: {
            marginLeft: 10
        }
    });

    return (
        <ThemedView style={styles.page}>
            <ThemedView style={styles.pageTitle}>
                <ThemedText style={styles.pageTitleText}>Settings</ThemedText>
            </ThemedView>
            
            <ThemedView style={{paddingHorizontal: 15, marginTop: 15}}>
                <ThemedText style={{color: theme.textSecondary, fontSize: 14, fontWeight: 500}}>General</ThemedText>
            </ThemedView>

            <ThemedView style={styles.settingContainer}>
                <Pressable onPress={() => {router.push("/settings/myaccount")}} style={styles.setting}>
                    <User color={theme.text} size={24}></User>
                    <ThemedText style={styles.settingText}>My Account</ThemedText>
                </Pressable>
            </ThemedView>

            <Navigation selected="settings"></Navigation>
        </ThemedView>
        
    );
}
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import Loader from '@/components/ui/loader';
import Navigation from '@/components/ui/navigation';
import { useTheme } from '@/hooks/use-theme';
import { usersApi } from '@/lib/api';
import appLog from '@/lib/logger';
import { router } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';

export default function MyAccount() {
    const [isLoading, setIsLoading] = useState(false);
    const theme = useTheme();

    useEffect(() => {
        const fetchUserDetails = async () => {
            setIsLoading(true)
            let response = await usersApi.userDetails();
            
            if (response.err || !response.data) 
                return appLog("auth", response.err ? response.err.message : "User detail err");

            setIsLoading(false);
        }

        fetchUserDetails();
    }, [])

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
        backButton: {
            position: "absolute",
            left: 30,
            borderStyle: "solid",
            borderRadius: 20,
            width: 60,
            height: 40,
            borderColor: theme.backgroundTertiary,
            boxShadow: theme.boxShadow,
            borderWidth: 1,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            marginTop: -10
        }
    });

    if (isLoading) {
        return (
            <Loader></Loader>
        )
    } else {
        return (
            <ThemedView style={styles.page}>
                <ThemedView style={styles.pageTitle}>
                    <Pressable onPress={() => router.push("/settings")} style={styles.backButton}>
                        <ChevronLeft size={28} color={theme.textSecondary}></ChevronLeft>
                    </Pressable>
                    <ThemedText style={styles.pageTitleText}>My Account</ThemedText>
                </ThemedView>
                
                <ThemedView style={styles.settingContainer}>

                </ThemedView>
                
                <Navigation selected="settings"></Navigation>
            </ThemedView>
        );
    }
}
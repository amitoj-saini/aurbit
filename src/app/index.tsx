import { StyleSheet } from 'react-native';
import { useEffect } from 'react';
import { router } from 'expo-router';
import { ThemedView } from '@/components/themed-view';
import { appStateApi } from '@/lib/api';
import { LogoAnimation } from '@/components/ui/logo';

export default function HomeScreen() {
    useEffect(() => {
        async function aurbitPathIdentifier() {
            let response = await appStateApi.getAppState();
            
            if (response.err || !response.data) return router.replace('/setup');
            else if (!response.data.initialized && !response.data.loggedin) {
                router.replace('/initialize');
            }
            else if (response.data.authenticated && !response.data.loggedin) {
            } else if (response.data.loggedin) {
                router.replace('/aurbit');
            }

        }

        void aurbitPathIdentifier();
    }, []);

    return (
        <ThemedView style={styles.loadingContainer}>
            <LogoAnimation width={100} height={100}></LogoAnimation>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    loadingContainer: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100%",
        width: "100%"
    },
});
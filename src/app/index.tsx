import { ActivityIndicator, StyleSheet } from 'react-native';
import { useEffect, useState } from 'react';
import { router } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { appStateApi } from '@/lib/api';

export default function HomeScreen() {
    const [isCheckingEndpoint, setIsCheckingEndpoint] = useState(true);

    useEffect(() => {
        async function aurbitPathIdentifier() {
            setIsCheckingEndpoint(true)
            let response = await appStateApi.getAppState();
            console.log(response.err)
            if (response.err) router.replace('/setup');

            else if (response.data?.authenticated && !response.data?.loggedin) {
                //router.replace('/login');
            } else if (response.data?.loggedin) {
                //router.replace('/login');
            }

            setIsCheckingEndpoint(false);
        }

        void aurbitPathIdentifier();
    }, []);

    if (isCheckingEndpoint) {
        return (
            <ThemedView style={styles.loadingContainer}>
                <ActivityIndicator />
                <ThemedText type="small">Checking settings…</ThemedText>
            </ThemedView>
        );
    }

    return <ThemedText>Hello world</ThemedText>;
}

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
});
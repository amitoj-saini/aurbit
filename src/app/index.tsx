import { ActivityIndicator, StyleSheet } from 'react-native';
import { useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import { router } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { clearSecureStore } from '@/lib/api';
clearSecureStore();

const AURBIT_ENDPOINT_STORAGE_KEY = 'aurbit-endpoint';

export default function HomeScreen() {
    const [isCheckingEndpoint, setIsCheckingEndpoint] = useState(true);

    useEffect(() => {
        async function checkAurbitEndpoint() {
            try {
                const endpoint = await SecureStore.getItemAsync(AURBIT_ENDPOINT_STORAGE_KEY);
                
                // run setup
                if (!endpoint) {
                    router.replace('/setup');
                }
            } catch (error) {
                console.error('Failed to read Aurbit endpoint from secure storage', error);
            } finally {
                setIsCheckingEndpoint(false);
            }
        }

        void checkAurbitEndpoint();
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
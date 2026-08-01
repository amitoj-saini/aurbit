import { StyleSheet } from 'react-native';
import { useEffect } from 'react';
import { router } from 'expo-router';
import { ThemedView } from '@/components/themed-view';
import { appStateApi } from '@/lib/api';
import { LogoAnimation } from '@/components/ui/logo';
import Loader from '@/components/ui/loader';

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
        <Loader></Loader>
    );
}
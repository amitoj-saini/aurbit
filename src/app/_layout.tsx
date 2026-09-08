import { initializeLocationUpdater } from '@/services/locationUpdater';
import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { AuthProvider } from '@/context/auth-context';

export default function Layout() {
    useEffect(() => {
        initializeLocationUpdater();
    }, []);

    return (
        <AuthProvider>
            <Stack
                screenOptions={{
                    headerBackVisible: false,
                    headerShown: false,
                    animation: "fade"
                }}>
                <Stack.Screen name="index"/>
                <Stack.Screen name="setup"/>
                <Stack.Screen name="initialize"/>
                <Stack.Screen name="login"/>
                <Stack.Screen name="(app)" />
            </Stack>
        </AuthProvider>
    );
}

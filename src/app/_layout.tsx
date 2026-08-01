import { initializeLocationUpdater } from '@/services/locationUpdater';
import { Stack } from 'expo-router';
import { useEffect } from 'react';

export default function Layout() {
    useEffect(() => {
        initializeLocationUpdater();
    }, []);

    return (
        <Stack
            screenOptions={{
                headerBackVisible: false,
                headerShown: false,
                animation: "fade"
            }}>
            <Stack.Screen name="index"/>
            <Stack.Screen name="setup"/>
            <Stack.Screen name="initialize"/>
            <Stack.Screen name="(app)" />
        </Stack>
        
    );
}

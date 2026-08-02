import { ThemedView } from '@/components/themed-view';
import Loader from '@/components/ui/loader';
import Navigation from '@/components/ui/navigation';
import { useEffect, useState } from 'react';
import { StyleSheet, useColorScheme } from 'react-native';
import MapView, { MapViewProps, Marker } from 'react-native-maps';
import { locationApi } from '@/lib/api';
import type { UserLocation } from '@/lib/api';
import appLog from '@/lib/logger';

export default function App() {
    const scheme = useColorScheme();
    const mapTheme: MapViewProps["userInterfaceStyle"] = scheme === 'light' || scheme === 'dark' ? scheme : undefined;
    const [isLoading, setIsLoading] = useState(false);
    const [users, setUsers] = useState<UserLocation[]>([]);

    useEffect(() => {
        let connection: { close: () => void } | null = null;

        async function aurbitConnectLocations() {
            setIsLoading(true);

            try {
                connection = await locationApi.stream(
                    (users: UserLocation[]) => {
                        setUsers(users);
                        setIsLoading(false);
                    },
                    (error: Error) => {
                        appLog("location", "Location websocket error", error.message);
                        setIsLoading(false);
                    }
                );
            } catch (error) {
                appLog("location", "Location websocket failed to connect", error instanceof Error ? error.message : String(error));
                setIsLoading(false);
            }
        }

        void aurbitConnectLocations();

        return () => {
            connection?.close();
        };
    }, []);

    // if is loading
    if (isLoading) {
        return (
            <Loader></Loader>
        )
    }

    return (
        <ThemedView style={styles.page}>
            <MapView userInterfaceStyle={mapTheme} style={styles.map}>
                {users.map((user) => (
                    <Marker style={styles.marker} key={user.userid} coordinate={{
                        longitude: user.longitude,
                        latitude: user.latitude
                    }}>
                        
                    </Marker>
                ))}
            </MapView>
            <Navigation></Navigation>
        </ThemedView>  
    );
}


const styles = StyleSheet.create({
    page: {
        width: "100%",
        height: "100%"
    },
    map: {
        width: '100%',
        height: '100%',
    },
    marker: {

    }
});
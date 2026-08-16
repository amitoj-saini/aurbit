import { ThemedView } from '@/components/themed-view';
import Loader from '@/components/ui/loader';
import Navigation from '@/components/ui/navigation';
import { useEffect, useState } from 'react';
import { StyleSheet, useColorScheme, Image } from 'react-native';
import MapView, { MapViewProps, Marker } from 'react-native-maps';
import { locationApi } from '@/lib/api';
import type { UserLocation } from '@/lib/api';
import appLog from '@/lib/logger';
import { useTheme } from '@/hooks/use-theme';
import { ThemedText } from '@/components/themed-text';

export default function App() {
    const scheme = useColorScheme();
    const theme = useTheme();
    const mapTheme: MapViewProps["userInterfaceStyle"] = scheme === 'light' || scheme === 'dark' ? scheme : undefined;
    const [isLoading, setIsLoading] = useState(false);
    const [users, setUsers] = useState<UserLocation[]>([]);
    

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

        },
        markerContainer: {
            padding: 2,
            borderStyle: 'solid',
            borderWidth: 1,
            borderColor: theme.text,
            backgroundColor: `${theme.backgroundSecondary}D9`,
            borderRadius: 55,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
        }
    });

    useEffect(() => {
        let connection: { close: () => void } | null = null;

        async function aurbitConnectLocations() {
            setIsLoading(true);

            try {
                connection = await locationApi.stream(
                    (users: UserLocation[]) => {
                        appLog("location", "Fetched user locations", users);
                        console.log(users)
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
                        
                        {user.image ? (
                            <ThemedView style={[styles.markerContainer]}>
                                <Image
                                    source={{
                                        uri: `data:image/jpeg;base64,${user.image}`,
                                    }}
                                    style={{
                                        width: 50,
                                        height: 50,
                                        borderRadius: 55,
                                        margin: 0,
                                    }}
                                />
                            </ThemedView>
                        ) : (
                            <ThemedView style={[styles.markerContainer, {height: 50, width: 50}]}>
                                <ThemedText>{user.user.trim().split(/\s+/).map(n => n[0]).slice(0, 2).join("").toUpperCase()}</ThemedText>
                            </ThemedView>
                        )}
                    </Marker>
                ))}
            </MapView>
            <Navigation></Navigation>
        </ThemedView>  
    );
}



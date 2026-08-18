import { ThemedView } from '@/components/themed-view';
import Loader from '@/components/ui/loader';
import Navigation from '@/components/ui/navigation';
import { useEffect, useState } from 'react';
import { StyleSheet, useColorScheme, Image, useWindowDimensions, TouchableWithoutFeedback } from 'react-native';
import MapView, { MapViewProps, Marker } from 'react-native-maps';
import { locationApi } from '@/lib/api';
import type { HistoryResponse, UserLocation } from '@/lib/api';
import appLog from '@/lib/logger';
import { useTheme } from '@/hooks/use-theme';
import { ThemedText } from '@/components/themed-text';
import ExpandableSheet from '@/components/ui/expandableSheet';
import { LogoAnimation } from '@/components/ui/logo';


export default function App() {
    // TODO: do not refresh user history on click, allow for closing history tab on outside click, refresh tab on location broadcast
    const scheme = useColorScheme();
    const theme = useTheme();
    const mapTheme: MapViewProps["userInterfaceStyle"] = scheme === 'light' || scheme === 'dark' ? scheme : undefined;
    const [isLoading, setIsLoading] = useState(false); // for loader
    const [isFetchingHistory, setFetchingHistory] = useState(false); // for data
    const [userHistory, setUserHistory] = useState<null | HistoryResponse>(null); // for dispaly
    const [showUserHisotry, setShowUserHistory] = useState(false);
    const [users, setUsers] = useState<UserLocation[]>([]);
    
    const { height } = useWindowDimensions();

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
        },
        userHistory: {
            position: "absolute",
            backgroundColor: theme.background,

            width: "100%",
            height: height * 0.70,

            bottom: 0,

            borderTopStartRadius: 35,
            borderTopEndRadius: 35,

            boxShadow: theme.boxShadow,

            // Start with roughly 25% of the screen visible
            transform: [
                {
                    translateY: height * 0.45,
                },
            ],

            zIndex: 100,
        },

        userHistoryHandle: {
            width: 45,
            height: 5,

            alignSelf: "center",

            marginTop: 10,
            marginBottom: 10,

            borderRadius: 5,

            backgroundColor: theme.textSecondary,
        },

        userHistoryContent: {
            flex: 1,
        },

        userHistoryScrollContent: {
            paddingHorizontal: 20,
            paddingBottom: 30,
        },
    });

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

    const fetchUserHistory = async (user: UserLocation) => {
        setFetchingHistory(true);
        setShowUserHistory(true);

        let response = await locationApi.fetchHistory(user.userid)
        if (response.err || !response.data) {
            appLog("location", `Unable to pull location history for ${user.user}`, response.err);
            return;
        }

        setUserHistory(response.data)
        setFetchingHistory(false);
    }

    return (
        
        <ThemedView>
            <TouchableWithoutFeedback onPress={() => setShowUserHistory(false)}>
                <ThemedView style={styles.page}>
                    <MapView userInterfaceStyle={mapTheme} style={styles.map}>
                        {users.map((user) => (
                            <Marker onPress={() => { fetchUserHistory(user) }} style={styles.marker} key={user.userid} coordinate={{
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
            </TouchableWithoutFeedback>

            <ExpandableSheet visible={showUserHisotry} disableExpand={isFetchingHistory} style={{ justifyContent: "center" }}>
                {isFetchingHistory && (
                    <ThemedView
                        style={{
                            width: "100%",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                        }}
                    >
                        <LogoAnimation height={45} width={45} />
                    </ThemedView>
                )}

                {userHistory && (
                    <ThemedView></ThemedView>
                )}
            </ExpandableSheet>
        </ThemedView>

    );
}


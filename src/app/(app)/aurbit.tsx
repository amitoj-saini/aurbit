import { formattedLocationName, humanReadable, formatSince, timeAgo } from '@/lib/functions';
import { StyleSheet, useColorScheme, Image, TouchableWithoutFeedback } from 'react-native';
import MapView, { MapViewProps, Marker } from 'react-native-maps';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { HistoryResponse, UserLocation } from '@/lib/api';
import ExpandableSheet from '@/components/ui/expandableSheet';
import HorizontalLine from '@/components/ui/horizontalLine';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { LogoAnimation } from '@/components/ui/logo';
import Navigation from '@/components/ui/navigation';
import { useTheme } from '@/hooks/use-theme';
import { MapPin } from 'lucide-react-native';
import Loader from '@/components/ui/loader';
import { locationApi } from '@/lib/api';
import appLog from '@/lib/logger';

export default function App() {
    const scheme = useColorScheme();
    const theme = useTheme();
    const mapTheme: MapViewProps["userInterfaceStyle"] = scheme === 'light' || scheme === 'dark' ? scheme : undefined;
    const [isLoading, setIsLoading] = useState(false); // for loader
    const [isFetchingHistory, setFetchingHistory] = useState(false); // for data
    const [userHistory, setUserHistory] = useState<null | HistoryResponse & { user: UserLocation }>(null); // for dispaly
    const [showUserHisotry, setShowUserHistory] = useState(false);
    const [users, setUsers] = useState<UserLocation[]>([]);
    const userHistoryRef = useRef<null | HistoryResponse & { user: UserLocation }>(null);
    const showUserHistoryRef = useRef(false);

    useEffect(() => {
        userHistoryRef.current = userHistory;
    }, [userHistory]);

    useEffect(() => {
        showUserHistoryRef.current = showUserHisotry;
    }, [showUserHisotry]);

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
        historyContainer: {
            width: "100%",
            display: "flex",
            justifyContent: "center",
            padding: 10
        },
        historyImageContainer: {
            width: 50,
            height: 50,
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
        historyUserStatus: {
            width: 13,
            height: 13,
            padding: 2,
            position: 'absolute',
            marginTop: 36,
            marginLeft: 32,
            borderRadius: 50,
            borderStyle: "solid",
            borderColor: theme.background,
            borderWidth: 2
        },
        historyListContainer: {

        },
        historyRecord: {
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 22
        },
        historyIcon: {
            borderRadius: 50,
            justifyContent: "center",
            alignItems: "center",
            display: 'flex',
            width: 32,
            height: 32,
            padding: 10,
            backgroundColor: theme.accentTertiary,
            marginHorizontal: 9
        },
        historyTextContainer: {
            marginHorizontal: 4
        },
        historyRecordText: {
            fontSize: 14,
            margin: 0,
            marginBottom: -2.5
        },
        historyRecordDetails: {
            color: theme.textSecondary,
            fontSize: 12,
            marginTop: -2.5
        }
    });

    const fetchUserHistory = useCallback(async (user: UserLocation, refresh = false) => {
        const activeHistory = userHistoryRef.current;
        const shouldKeepOpen = showUserHistoryRef.current;

        // already open
        if (!refresh && shouldKeepOpen && activeHistory && activeHistory.user.userid === user.userid) return;

        // reset user history
        setUserHistory(null);
        userHistoryRef.current = null;

        setFetchingHistory(true);
        setShowUserHistory(true);

        const response = await locationApi.fetchHistory(user.userid);
        if (response.err || !response.data) {
            appLog("location", `Unable to pull location history for ${user.user}`, response.err);
            setFetchingHistory(false);
            return;
        }

        const nextUserHistory = { ...response.data, user };
        userHistoryRef.current = nextUserHistory;
        setUserHistory(nextUserHistory);
        setFetchingHistory(false);
    }, []);

    useEffect(() => {
        let connection: { close: () => void } | null = null;
        let isMounted = true;
        let reconnectTimeout: ReturnType<typeof setTimeout> | null = null;

        async function aurbitConnectLocations() {
            setIsLoading(true);

            try {
                connection = await locationApi.stream(
                    (users: UserLocation[]) => {
                        setUsers(users);
                        setIsLoading(false);
                        const currentHistory = userHistoryRef.current;
                        if (currentHistory) {
                            void fetchUserHistory(currentHistory.user, true);
                        }
                    },
                    (error: Error) => {
                        appLog("location", "Location websocket error", error.message);
                        setIsLoading(false);
                    },
                    (event: { wasClean: boolean; code: number }) => {
                        appLog("location", "Location websocket error", event.code);

                        reconnectTimeout = setTimeout(() => {
                            if (isMounted) {
                                void aurbitConnectLocations();
                            }
                        }, 5000);
                    }
                );
            } catch (error) {
                appLog("location", "Location websocket failed to connect", error instanceof Error ? error.message : String(error));
                setIsLoading(false);
            }
        }

        void aurbitConnectLocations();

        return () => {
            isMounted = false;

            if (reconnectTimeout) {
                clearTimeout(reconnectTimeout);
            }

            connection?.close();
        };
    }, [fetchUserHistory]);

    // if is loading
    if (isLoading) {
        return (
            <Loader></Loader>
        )
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
                                    <ThemedView style={[styles.markerContainer, { height: 50, width: 50 }]}>
                                        <ThemedText>{user.user.trim().split(/\s+/).map(n => n[0]).slice(0, 2).join("").toUpperCase()}</ThemedText>
                                    </ThemedView>
                                )}
                            </Marker>
                        ))}
                    </MapView>
                    <Navigation></Navigation>



                </ThemedView>
            </TouchableWithoutFeedback>

            <ExpandableSheet visible={showUserHisotry} disableExpand={isFetchingHistory} style={isFetchingHistory ? { justifyContent: "center" } : {}}>
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
                    <ThemedView style={styles.historyContainer}>
                        <ThemedView style={{ display: "flex", flexDirection: "row" }}>
                            <ThemedView style={[styles.historyImageContainer]}>
                                <Image
                                    source={{
                                        uri: `data:image/jpeg;base64,${userHistory.user.image}`,
                                    }}
                                    style={{
                                        width: 45,
                                        height: 45,
                                        borderRadius: 55,
                                        margin: 0,
                                    }}
                                />

                                <ThemedView style={[styles.historyUserStatus,
                                {
                                    backgroundColor: userHistory.records[0] &&
                                        timeAgo(userHistory.records[0].last_timestamp) / (1000 * 60 * 60) < 5 ? theme.success : theme.fail
                                }]}
                                ></ThemedView>
                            </ThemedView>
                            <ThemedView style={{ paddingLeft: 15, height: 50, display: "flex", justifyContent: "center" }}>
                                <ThemedText style={{ marginBottom: -2, fontSize: 16 }}>
                                    {userHistory.user.user}
                                </ThemedText>
                                <ThemedText style={{ fontWeight: 400, fontSize: 13, color: theme.textSecondary }}>
                                    {userHistory.records[0] && formattedLocationName(userHistory.records[0])}
                                </ThemedText>
                                <ThemedText style={{ marginTop: -5, fontWeight: 400, fontSize: 13, color: theme.textSecondary }}>
                                    Since {formatSince(userHistory.records[0].timestamp)}
                                </ThemedText>
                                
                            </ThemedView>

                        </ThemedView>

                        <HorizontalLine />

                        <ThemedView style={styles.historyListContainer}>
                            {userHistory.records.map((record, index: number) => (
                                
                                <ThemedView key={record.id}>
                                    <ThemedView style={styles.historyRecord}>
                                        <ThemedView style={styles.historyIcon}>
                                            <MapPin size={18} color={theme.text}></MapPin>
                                        </ThemedView>
                                        <ThemedView style={styles.historyTextContainer}>
                                            <ThemedText style={styles.historyRecordText}>{formattedLocationName(record)}</ThemedText>
                                            <ThemedText style={styles.historyRecordDetails}>
                                                {humanReadable(record.timestamp)}
                                                {record.recorded > 1 && (
                                                    <>
                                                        {" - "}
                                                        {humanReadable(record.last_timestamp)}

                                                    </>
                                                )}

                                            </ThemedText>
                                        </ThemedView>
                                    </ThemedView>
                                    {index !== (userHistory.records.length-1) && (<ThemedView style={{zIndex: 4, position: "absolute", marginTop: 40, left: 24.5, height: 29, borderLeftWidth: 1, borderStyle: "dashed", borderColor: theme.backgroundTertiary}}></ThemedView>)}
                                </ThemedView>
                            ))}
                        </ThemedView>

                    </ThemedView>
                )}
            </ExpandableSheet>
        </ThemedView>

    );
}


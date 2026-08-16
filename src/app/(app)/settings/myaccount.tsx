import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Input, Button } from '@/components/ui/elements';
import Loader from '@/components/ui/loader';
import Navigation from '@/components/ui/navigation';
import { useTheme } from '@/hooks/use-theme';
import { usersApi, UserDetails } from '@/lib/api';
import appLog from '@/lib/logger';
import { router } from 'expo-router';
import { ChevronLeft, Pencil } from 'lucide-react-native';
import { useEffect, useState, useMemo } from 'react';
import {
    Keyboard,
    Pressable,
    StyleSheet,
    TouchableWithoutFeedback,
    Image,
    Platform,
    Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { File as ExpoFile } from 'expo-file-system';

type SelectedImageFile = ExpoFile | globalThis.File;

export default function MyAccount() {
    const [isLoading, setIsLoading] = useState(false);
    const theme = useTheme();

    const [accountDetails, setAccountDetails] =
        useState<UserDetails | null>(null);

    const [editedDisplayName, setEditedDisplayName] = useState('');
    const [editedEmail, setEditedEmail] = useState('');

    const [isSaving, setIsSaving] = useState(false);
    const [editSuccess, setEditSuccess] = useState(false);

    const [selectedImageUri, setSelectedImageUri] =
        useState<string | null>(null);

    const [selectedImageFile, setSelectedImageFile] =
        useState<SelectedImageFile | null>(null);

    useEffect(() => {
        const fetchUserDetails = async () => {
            setIsLoading(true);

            const response = await usersApi.userDetails();

            if (response.err || !response.data) {
                appLog(
                    'auth',
                    response.err
                        ? response.err.message
                        : 'User detail err'
                );

                setIsLoading(false);
                return;
            }

            setAccountDetails(response.data);
            setEditedDisplayName(
                response.data.displayName ?? ''
            );
            setEditedEmail(response.data.email ?? '');

            setSelectedImageUri(
                response.data.image
                    ? `data:image/jpeg;base64,${response.data.image}`
                    : null
            );

            setIsLoading(false);
        };

        fetchUserDetails();
    }, []);

    const styles = StyleSheet.create({
        page: {
            width: '100%',
            height: '100%',
        },

        pageTitle: {
            width: '100%',
            display: 'flex',
            textAlign: 'center',
            justifyContent: 'center',
            alignItems: 'center',
            marginTop: 80,
        },

        pageTitleText: {
            fontSize: 20,
            fontWeight: 500,
            padding: 10,
        },

        settingContainer: {
            width: '100%',
            display: 'flex',
            paddingHorizontal: 15,
        },

        backButton: {
            position: 'absolute',
            left: 30,
            borderStyle: 'solid',
            borderRadius: 20,
            width: 60,
            height: 40,
            borderColor: theme.backgroundTertiary,
            boxShadow: theme.boxShadow,
            borderWidth: 1,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            marginTop: -10,
        },

        profilePicture: {
            minWidth: 65,
            minHeight: 65,
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

        editContainer: {
            width: 22,
            height: 22,
            backgroundColor: theme.text,
            borderRadius: 35,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            boxShadow: theme.boxShadow,
            position: 'absolute',
            top: 0,
            marginLeft: 48,
        },

        inputLabel: {
            marginTop: 15,
            fontSize: 12,
        },
    });

    const isDirty = useMemo(() => {
        if (!accountDetails) return false;

        return (
            (editedDisplayName ?? '') !==
            (accountDetails.displayName ?? '') ||
            (editedEmail ?? '') !==
            (accountDetails.email ?? '') ||
            !!selectedImageFile
        );
    }, [
        editedDisplayName,
        editedEmail,
        accountDetails,
        selectedImageFile,
    ]);

    const pickImage = async () => {
        try {
            const hasRequestPermission =
                ImagePicker &&
                typeof ImagePicker.requestMediaLibraryPermissionsAsync ===
                'function';

            if (!hasRequestPermission) {
                if (Platform.OS === 'web') {
                    appLog(
                        'ui',
                        'Image picker not available on web in this build'
                    );

                    Alert.alert(
                        'Image upload unavailable',
                        'This build does not include the image picker.'
                    );

                    return;
                }

                Alert.alert(
                    'Image picker not available',
                    'The native image picker module is not available in this build. Please install expo-image-picker and rebuild the app.'
                );

                return;
            }

            const { status } =
                await ImagePicker.requestMediaLibraryPermissionsAsync();

            if (status !== 'granted') {
                appLog(
                    'ui',
                    'Image picker permission not granted'
                );

                return;
            }

            const result =
                await ImagePicker.launchImageLibraryAsync({
                    mediaTypes: ['images'],
                    allowsEditing: true,
                    quality: 0.8,
                });

            if (result.canceled) {
                return;
            }

            const asset = result.assets?.[0];

            if (!asset?.uri) {
                appLog(
                    'ui',
                    'Image picker returned no asset URI'
                );

                return;
            }

            setSelectedImageUri(asset.uri);

            if (Platform.OS === 'web') {
                const response = await fetch(asset.uri);
                const blob = await response.blob();

                const extension =
                    blob.type.split('/').pop() ?? 'jpg';

                const name =
                    asset.fileName ??
                    `photo.${extension}`;

                const file = new globalThis.File(
                    [blob],
                    name,
                    {
                        type:
                            blob.type ||
                            asset.mimeType ||
                            'image/jpeg',
                    }
                );

                setSelectedImageFile(file);
            } else {
                const file = new ExpoFile(asset.uri);

                setSelectedImageFile(file);
            }
        } catch (e) {
            appLog('ui', 'Error picking image', {
                error: String(e),
            });
        }
    };

    const saveChanges = async () => {
        setIsSaving(true);

        try {
            const res = await usersApi.editDetails(
                selectedImageFile ?? undefined,
                {
                    displayName: editedDisplayName,
                    email: editedEmail,
                }
            );

            if (res.err) {
                appLog(
                    'auth',
                    'Failed to edit details',
                    {
                        error: res.err.message,
                    }
                );

                return;
            }

            setEditSuccess(true);

            setTimeout(() => {
                setEditSuccess(false);
            }, 2000);

            setAccountDetails((prev) =>
                prev
                    ? {
                        ...prev,
                        displayName: editedDisplayName,
                        email: editedEmail,
                    }
                    : prev
            );

            setSelectedImageFile(null);

            const refreshed =
                await usersApi.userDetails();

            if (!refreshed.err && refreshed.data) {
                setAccountDetails(refreshed.data);

                setEditedDisplayName(
                    refreshed.data.displayName ?? ''
                );

                setEditedEmail(
                    refreshed.data.email ?? ''
                );

                setSelectedImageUri(
                    refreshed.data.image
                        ? `data:image/jpeg;base64,${refreshed.data.image}`
                        : null
                );
            }
        } catch (e) {
            appLog(
                'auth',
                'Unexpected error editing details',
                {
                    error: String(e),
                }
            );
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading || !accountDetails) {
        return <Loader />;
    }

    return (
        <TouchableWithoutFeedback
            onPress={Keyboard.dismiss}
            accessible={false}
        >
            <ThemedView style={styles.page}>
                <ThemedView style={styles.pageTitle}>
                    <Pressable
                        onPress={() =>
                            router.push('/settings')
                        }
                        style={styles.backButton}
                    >
                        <ChevronLeft
                            size={28}
                            color={theme.textSecondary}
                        />
                    </Pressable>

                    <ThemedText
                        style={styles.pageTitleText}
                    >
                        My Account
                    </ThemedText>
                </ThemedView>

                <ThemedView
                    style={styles.settingContainer}
                >
                    {/* Profile picture */}
                    <ThemedView
                        style={{
                            width: '100%',
                            marginTop: 40,
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                        }}
                    >
                        <Pressable
                            onPress={pickImage}
                            style={styles.profilePicture}
                        >
                            {selectedImageUri ? (
                                <Image
                                    source={{
                                        uri: selectedImageUri,
                                    }}
                                    style={{
                                        width: 65,
                                        height: 65,
                                        borderRadius: 55,
                                        margin: 0,
                                    }}
                                />
                            ) : accountDetails.image ? (
                                <Image
                                    source={{
                                        uri: `data:image/jpeg;base64,${accountDetails.image}`,
                                    }}
                                    style={{
                                        width: 65,
                                        height: 65,
                                        borderRadius: 55,
                                        margin: 0,
                                    }}
                                />
                            ) : (
                                <ThemedView
                                    style={[styles.profilePicture, {height: 65, width: 65}]}
                                >
                                    <ThemedText>
                                        {accountDetails.displayName
                                            .trim()
                                            .split(/\s+/)
                                            .map(
                                                (n) => n[0]
                                            )
                                            .slice(0, 2)
                                            .join('')
                                            .toUpperCase()}
                                    </ThemedText>
                                </ThemedView>
                            )}
                        </Pressable>

                        <ThemedView
                            style={styles.editContainer}
                        >
                            <Pencil
                                size={14}
                                color={theme.background}
                            />
                        </ThemedView>
                    </ThemedView>

                    {/* Display Name */}
                    <ThemedText
                        type="small"
                        themeColor="textSecondary"
                        style={[
                            styles.inputLabel,
                            { marginTop: 20 },
                        ]}
                    >
                        Display Name
                    </ThemedText>

                    <Input
                        style={{ marginTop: 4 }}
                        autoCapitalize="none"
                        autoCorrect={false}
                        placeholder="Edit your display name"
                        returnKeyType="done"
                        value={editedDisplayName}
                        onChangeText={setEditedDisplayName}
                    />

                    {/* Email */}
                    <ThemedText
                        type="small"
                        themeColor="textSecondary"
                        style={styles.inputLabel}
                    >
                        Email
                    </ThemedText>

                    <Input
                        style={{ marginTop: 4 }}
                        autoCapitalize="none"
                        autoCorrect={false}
                        placeholder="Edit your email"
                        returnKeyType="done"
                        keyboardType="email-address"
                        value={editedEmail}
                        onChangeText={setEditedEmail}
                    />

                    {/* Save */}
                    <Button
                        style={{
                            marginTop: 20,
                            opacity: isDirty ? 1 : 0.3,
                        }}
                        disabled={!isDirty || isSaving}
                        onPress={saveChanges}
                    >
                        {isSaving ? (
                            <LoadingSpinner size={18} />
                        ) : (
                            'Save Changes'
                        )}
                    </Button>
                </ThemedView>

                {editSuccess ? (
                    <Navigation
                        selected="settings"
                        notification="success"
                    />
                ) : (
                    <Navigation selected="settings" />
                )}
            </ThemedView>
        </TouchableWithoutFeedback>
    );
}
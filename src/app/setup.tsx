import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, TextInput, View } from 'react-native';

import { Button, Input } from '@/components/ui/elements';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import * as SecureStore from 'expo-secure-store';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';
import { useRouter } from 'expo-router';
import Logo, { LogoText } from '@/components/ui/logo';
import { useState, useRef, useEffect } from 'react';


const AURBIT_ENDPOINT_STORAGE_KEY = 'aurbit-endpoint';

function isValidUrl(value: string) {
    try {
        new URL(value);
        return true;
    } catch {
        return false;
    }
}

export default function SetupScreen() {
    const theme = useTheme();
    const router = useRouter();
    const [endpoint, setEndpoint] = useState('');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isURLValid, setURLValid] = useState(false);

    const inputRef = useRef<TextInput | null>(null);

    useEffect(() => {
        // Slight delay helps ensure focus on mount across platforms and that the keyboard appears
        const t = setTimeout(() => inputRef.current?.focus(), 250);
        return () => clearTimeout(t);
    }, []);

    const saveEndpoint = async () => {
        const trimmedEndpoint = endpoint.trim();

        if (!trimmedEndpoint) {
            setErrorMessage('Please enter the Aurbit endpoint URL.');
            return;
        }

        if (!isValidUrl(trimmedEndpoint)) {
            setErrorMessage('Please enter a valid URL.');
            return;
        }

        setIsSaving(true);
        setErrorMessage(null);

        try {
            await SecureStore.setItemAsync(AURBIT_ENDPOINT_STORAGE_KEY, trimmedEndpoint);
            router.replace('/');
        } catch (error) {
            console.error('Failed to save Aurbit endpoint to secure storage', error);
            setErrorMessage('Unable to save settings. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <ThemedView style={styles.page}>
            <View style={styles.logoContainer}><Logo/></View>

            <KeyboardAvoidingView
                behavior={Platform.select({ ios: 'padding', android: 'height', web: 'padding' })}
                style={styles.container}>

                <ThemedText type="title" style={styles.title}>
                    Welcome to <LogoText style={{fontWeight: 600, fontSize: 36}}/>
                </ThemedText>

                <ThemedText type="small" themeColor="textSecondary" style={styles.subtitle}>
                    Enter the URL for your Aurbit server so the app can connect securely.
                </ThemedText>

                <Input
                    autoCapitalize="none"
                    autoCorrect={false}
                    keyboardType="url"
                    placeholder="https://aurbit.example.com"
                    onChangeText={(value) => {
                        setURLValid(isValidUrl(value));
                        setEndpoint(value);
                        if (errorMessage) {
                            setErrorMessage(null);
                        }
                    }}
                    value={endpoint}
                    editable={!isSaving}
                    autoFocus
                    returnKeyType="done"
                    onSubmitEditing={saveEndpoint}
                />

                {errorMessage ? (
                    <ThemedText type="small" style={styles.errorText}>
                        {errorMessage}
                    </ThemedText>
                ) : null}
                
                <Button
                    style={{opacity: isURLValid ? 1 : 0.3}}
                    onPress={saveEndpoint}
                    disabled={!isURLValid}>
                    Next
                </Button>
            </KeyboardAvoidingView>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    page: {
        flex: 1,
        justifyContent: 'flex-start',
        padding: Spacing.four,
        paddingTop: 100,
    },
    container: {
        width: '100%',
        maxWidth: 560,
        alignSelf: 'center',
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: Spacing.four,
    },
    title: {
        marginBottom: Spacing.two,
        fontSize: 36,
        textAlign: 'center',
        fontWeight: 600
    },
    subtitle: {
        marginBottom: Spacing.four,
        textAlign: 'center',
        fontWeight: 400
    },
    input: {
        height: 52,
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: Spacing.three,
        fontSize: 16,
        marginBottom: Spacing.two,
    },
    errorText: {
        color: '#ee5253',
        marginBottom: Spacing.two,
    },
    button: {
        height: 52,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonDisabled: {
        opacity: 0.75,
    },
    buttonText: {
        color: '#ffffff',
        fontWeight: '700',
    },
});

import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, TextInput } from 'react-native';
import { useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import Logo from '@/components/ui/logo';


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
            <Logo/>

            <KeyboardAvoidingView
                behavior={Platform.select({ ios: 'padding', android: 'height', web: 'padding' })}
                style={styles.container}>

                <ThemedText type="title" style={styles.title}>
                    Aurbit Endpoint
                </ThemedText>

                <ThemedText type="small" themeColor="textSecondary" style={styles.subtitle}>
                    Enter the URL for your Aurbit server so the app can connect securely.
                </ThemedText>

                <TextInput
                    style={[styles.input, { borderColor: theme.text, color: theme.text }]}
                    autoCapitalize="none"
                    autoCorrect={false}
                    keyboardType="url"
                    placeholder="https://aurbit.example.com"
                    placeholderTextColor={theme.textSecondary}
                    onChangeText={(value) => {
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

                <Pressable
                    style={({ pressed }) => [
                        styles.button,
                        { backgroundColor: pressed ? '#4b73f2' : '#3c87f7' },
                        isSaving && styles.buttonDisabled,
                    ]}
                    onPress={saveEndpoint}
                    disabled={isSaving}
                >
                    <ThemedText style={styles.buttonText}>
                        {isSaving ? 'Saving…' : 'Save endpoint'}
                    </ThemedText>
                </Pressable>
            </KeyboardAvoidingView>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    page: {
        flex: 1,
        justifyContent: 'center',
        padding: Spacing.four,
    },
    container: {
        width: '100%',
        maxWidth: 560,
        alignSelf: 'center',
    },
    title: {
        marginBottom: Spacing.two,
    },
    subtitle: {
        marginBottom: Spacing.four,
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

import { Animated, Easing, KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';
import { Button, Input } from '@/components/ui/elements';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import Logo, { LogoText } from '@/components/ui/logo';
import { useState, useEffect } from 'react';
import { isValidUrl } from '@/lib/functions';



export default function SetupScreen() {
    const [endpoint, setEndpoint] = useState('');
    const [authorization, setAuthorization] = useState('');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isURLValid, setURLValid] = useState(false);
    const [revealAnimation] = useState(() => new Animated.Value(0));

    useEffect(() => {
        Animated.timing(revealAnimation, {
            toValue: isURLValid ? 1 : 0,
            duration: 450,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: false,
        }).start();
    }, [isURLValid, revealAnimation]);

    const saveAurbitData = async () => {
        /*const trimmedEndpoint = endpoint.trim();
        const trimmedAuth = authorization.trim();

        if (!trimmedEndpoint || !trimmedEndpoint) {
            setErrorMessage('Please enter the aurbit endpoint URL and Auth.');
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
            await SecureStore.setItemAsync(AURBIT_ENDPOINT_STORAGE_KEY, trimmedEndpoint);
            router.replace('/');
        } catch (error) {
            console.error('Failed to save Aurbit endpoint to secure storage', error);
            setErrorMessage('Unable to save settings. Please try again.');
        } finally {
            setIsSaving(false);
        }*/
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
                    Enter your aurbit′ server URL and authentication details so the app can establish a secure connection.
                </ThemedText>
 
                <ThemedText type="small" themeColor="textSecondary" style={styles.inputLabel}>
                    Aurbit endpoint URL
                </ThemedText>
                <Input
                    style={{marginTop: 4}}
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
                />
 
                <Animated.View
                    pointerEvents={isURLValid ? 'auto' : 'none'}
                    style={[
                        styles.tokenRevealContainer,
                        {
                            maxHeight: revealAnimation.interpolate({
                                inputRange: [0, 1],
                                outputRange: [0, 84],
                            }),
                            opacity: revealAnimation,
                            transform: [
                                {
                                    translateY: revealAnimation.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [-8, 0],
                                    }),
                                },
                            ],
                        },
                    ]}>
                    <View style={styles.tokenContent}>
                        <ThemedText type="small" themeColor="textSecondary" style={styles.inputLabel}>
                            Bearer token
                        </ThemedText>
                        <Input
                            style={{marginTop: 4}}
                            autoCapitalize="none"
                            autoCorrect={false}
                            keyboardType="url"
                            placeholder="Bearer token"
                            value={authorization}
                            onChangeText={setAuthorization}
                            editable={!isSaving}
                            returnKeyType="done"
                            onSubmitEditing={saveAurbitData}
                        />
                    </View>
                </Animated.View>

                {errorMessage ? (
                    <ThemedText type="small" style={styles.errorText}>
                        {errorMessage}
                    </ThemedText>
                ) : null}
                
                <Button
                    style={{marginTop: 20, opacity: isURLValid ? 1 : 0.3}}
                    onPress={saveAurbitData}
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
        marginBottom: Spacing.three,
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
    inputLabel: {
        marginTop: 5,
        fontSize: 12
    },
    tokenRevealContainer: {
        overflow: 'hidden',
    },
    tokenContent: {
        marginTop: 6,
    },
    buttonText: {
        color: '#ffffff',
        fontWeight: '700',
    },
});

import { KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { LogoAnimation, LogoText } from '@/components/ui/logo';
import { Input, Button } from '@/components/ui/elements';
import { useTheme } from '@/hooks/use-theme';
import { useState } from 'react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { usersApi } from '@/lib/api';
import { storeAurbitAccessToken } from '@/lib/storage';
import { router } from 'expo-router';
import appLog from '@/lib/logger';
import { initializeLocationUpdater } from '@/services/locationUpdater';

// TODO: First time login/creation for users still required

export default function InitializeScreen() {
    const theme = useTheme();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const [errorMessage, setErrorMessage] = useState('');

    // email
    const [email, setEmail] = useState('');
    const [emailValid, setEmailValid] = useState(false);
    const [emailFound, setEmailFound] = useState(false);
    const [emailError, setEmailError] = useState('');

    // user initialized
    const [isUserInitialized, setUserInitialized] = useState(false);

    const [pwdSymbols, setPwdSymbols] = useState(false);
    const [pwdNumbers, setPwdNumbers] = useState(false);
    const [pwdCharacters, setPwdCharacters] = useState(false);
    const [pwdMixLetters, setPwdMixLetters] = useState(false);
    const [pwdMatch, setPwdMatch] = useState(false);
    const [password, setPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchUserStatus = async () => {
        setIsSubmitting(true);

        let response = await usersApi.userStatus({
            email: email
        });
        
        if (response.err || !response.data) {
            if (response.err) {
                setEmailError(response.err.message);
            } else {
                setEmailError("Something went wrong...");
            }
            setEmailFound(false);
        }

        if (response.data) {
            setUserInitialized(response.data.initialized);
            setEmailFound(true);
        }

        setIsSubmitting(false);
    }

    const loginIntoAurbit = async () => {
        setIsSubmitting(true);

        let response = await usersApi.login({
            email: email,
            password: password
        });
        
        if (response.err || !response.data) {
            if (response.err)
                setErrorMessage(response.err.message);
        }

        if (response.data?.access_token){
            storeAurbitAccessToken(response.data?.access_token);
            appLog("auth", "Logged in user", {"email": email})
            initializeLocationUpdater();
            router.replace('/');
        } else {
            appLog("auth", "Login failed", {"error": response.err})
            setErrorMessage("Something went wrong");
        }

        setIsSubmitting(false);
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
            fontWeight: 600,
        },
        subtitle: {
            marginBottom: Spacing.two,
            textAlign: 'center',
            fontWeight: 400
        },
        inputLabel: {
            marginTop: 10,
            fontSize: 12
        },
        instructionsText: {
            fontSize: 12,
            color: theme.textSecondary,
            fontWeight: 400,
            lineHeight: 15,
            marginTop: 4,
            paddingHorizontal: 3
        },
        successText: {
            color: theme.success
        },
        failText: {
            color: theme.fail
        }
    });


    return (
        <ThemedView style={styles.page}>
            <View style={styles.logoContainer}><LogoAnimation/></View>

            <KeyboardAvoidingView
                behavior={Platform.select({ ios: 'padding', android: 'height', web: 'padding' })}
                style={styles.container}>

                <ThemedText type="title" style={styles.title}>
                    Login into <LogoText style={{fontWeight: 600, fontSize: 36}}/>
                </ThemedText>

                <ThemedText type="small" themeColor="textSecondary" style={styles.subtitle}>
                    You&apos;ve succesfully connected to your aurbit′ server! Login with your account and get started!
                </ThemedText>
 
                <ThemedText type="small" themeColor="textSecondary" style={styles.inputLabel}>
                    Email Address
                </ThemedText>
                <Input
                    style={{marginTop: 4}}
                    autoCapitalize="none"
                    autoCorrect={false}
                    keyboardType="email-address"
                    placeholder="e.g. email@example.com"
                    value={email}
                    onChangeText={(value) => {
                        setEmail(value);
                        setEmailValid(emailRegex.test(value));
                        setEmailError('');
                        setEmailFound(false);
                    }}             
                    autoFocus
                    returnKeyType="done"
                />

                {(emailError !== "" || (!emailValid && email !== "")) && (
                    <ThemedText style={[styles.instructionsText, styles.failText]}>
                        {emailError ? emailError : "Please enter a valid email address."}
                    </ThemedText>
                )}
                
                {emailFound && (
                <>
                    <ThemedText type="small" themeColor="textSecondary" style={styles.inputLabel}>
                        {isUserInitialized ? "Enter your password" : "Create a password"}
                    </ThemedText>
                    <Input
                        style={{marginTop: 4}}
                        autoCapitalize="none"
                        autoCorrect={false}
                        secureTextEntry={true}
                        placeholder={isUserInitialized ? "Enter your secure password" : "Enter a secure password"}
                        autoFocus
                        returnKeyType="done"
                        value={password}
                        onChangeText={(value) => {
                            if (!isUserInitialized) {
                                setPwdCharacters(value.length >= 8)
                                setPwdSymbols(/[!@#$%^&*(),.?":{}|<>]/.test(value))
                                setPwdNumbers(/[0-9]/.test(value))
                                setPwdMixLetters(!(/(.)\1{2,}/.test(value)) && value.length > 3)
                                setPwdMatch(false);
                            }
                            setPassword(value);
                            
                        }}
                    />

                    {!isUserInitialized && (
                        <ThemedText style={styles.instructionsText}>
                            Create a secure password with at least <ThemedText style={[styles.instructionsText, pwdCharacters ? styles.successText : styles.failText ]}>8 characters</ThemedText>, using a <ThemedText style={[styles.instructionsText, pwdMixLetters ? styles.successText : styles.failText ]}>mix of letters</ThemedText>, <ThemedText style={[styles.instructionsText, pwdNumbers ? styles.successText : styles.failText]}>numbers</ThemedText>, and <ThemedText style={[styles.instructionsText, pwdSymbols ? styles.successText : styles.failText]}>symbols</ThemedText>.
                        </ThemedText>
                    )}
                    
                </>
                )}

                
               
                <Button
                    style={{marginTop: 20, opacity: emailValid ? 1 : 0.3}}
                    disabled={!emailValid}
                    onPress={() => {
                        if (!emailFound) {
                            fetchUserStatus();
                        } else if (emailFound && isUserInitialized) {
                            loginIntoAurbit();
                        }
                    }}
                    >
                    
                    {isSubmitting ? <LoadingSpinner size={18} /> : 'Next'}
                </Button>

                {errorMessage !== "" && (
                    <ThemedText style={[styles.instructionsText, styles.failText, {marginTop: 15}]}>{errorMessage}</ThemedText>
                )}
            </KeyboardAvoidingView>
        </ThemedView>
    );
}
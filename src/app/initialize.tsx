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

export default function InitializeScreen() {
    const theme = useTheme();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const [password, setPassword] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [email, setEmail] = useState('');
    const [emailValid, setEmailValid] = useState(false);
    const [pwdSymbols, setPwdSymbols] = useState(false);
    const [pwdNumbers, setPwdNumbers] = useState(false);
    const [pwdCharacters, setPwdCharacters] = useState(false);
    const [pwdMixLetters, setPwdMixLetters] = useState(false);
    const [pwdMatch, setPwdMatch] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const isFormValid = displayName.trim().length > 0 && emailValid && pwdCharacters && pwdSymbols && pwdNumbers && pwdMixLetters && pwdMatch;

    const createAccount = async () => {
        setIsSubmitting(true);

        const response = await usersApi.register({
            displayName: displayName,
            email: email,
            password: password,
        });
        console.log(response.data?.access_token)
        if (response.data?.access_token){
            storeAurbitAccessToken(response.data?.access_token);
            router.replace('/');
        } else {
            console.error('Registration error:', response.err);
            setErrorMessage("Something went wrong");
            return;
        } 
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
                    Setup your <LogoText style={{fontWeight: 600, fontSize: 36}}/>
                </ThemedText>

                <ThemedText type="small" themeColor="textSecondary" style={styles.subtitle}>
                    You&apos;ve succesfully connected to your aurbit′ server! Create an admin account and Get Started.
                </ThemedText>
 
                <ThemedText type="small" themeColor="textSecondary" style={styles.inputLabel}>
                    Display Name
                </ThemedText>
                <Input
                    style={{marginTop: 4}}
                    autoCapitalize="none"
                    autoCorrect={false}
                    keyboardType="url"
                    placeholder="e.g. John Doe"      
                    value={displayName}
                    onChangeText={setDisplayName}
                    autoFocus
                    returnKeyType="done"
                />

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
                    }}             
                    autoFocus
                    returnKeyType="done"
                />

                {!emailValid && email !== "" && (
                    <ThemedText style={[styles.instructionsText, styles.failText]}>
                        Please enter a valid email address.
                    </ThemedText>
                )}
                

                <ThemedText type="small" themeColor="textSecondary" style={styles.inputLabel}>
                    Create a password
                </ThemedText>
                <Input
                    style={{marginTop: 4}}
                    autoCapitalize="none"
                    autoCorrect={false}
                    secureTextEntry={true}
                    placeholder="Enter a secure password"
                    autoFocus
                    returnKeyType="done"
                    value={password}
                    onChangeText={(value) => {
                        setPwdCharacters(value.length >= 8)
                        setPwdSymbols(/[!@#$%^&*(),.?":{}|<>]/.test(value))
                        setPwdNumbers(/[0-9]/.test(value))
                        setPwdMixLetters(!(/(.)\1{2,}/.test(value)) && value.length > 3)
                        setPassword(value);
                        setPwdMatch(false);
                    }}
                />

                <ThemedText style={styles.instructionsText}>
                    Create a secure password with at least <ThemedText style={[styles.instructionsText, pwdCharacters ? styles.successText : styles.failText ]}>8 characters</ThemedText>, using a <ThemedText style={[styles.instructionsText, pwdMixLetters ? styles.successText : styles.failText ]}>mix of letters</ThemedText>, <ThemedText style={[styles.instructionsText, pwdNumbers ? styles.successText : styles.failText]}>numbers</ThemedText>, and <ThemedText style={[styles.instructionsText, pwdSymbols ? styles.successText : styles.failText]}>symbols</ThemedText>.
                </ThemedText>

                {pwdCharacters && pwdSymbols && pwdNumbers && pwdMixLetters && (
                    <>
                        <ThemedText type="small" themeColor="textSecondary" style={styles.inputLabel}>
                            Confirm your password
                        </ThemedText>
                        <Input
                            style={{marginTop: 4}}
                            autoCapitalize="none"
                            autoCorrect={false}
                            secureTextEntry={true}
                            placeholder="Confirm your password"
                            autoFocus
                            returnKeyType="done"
                            onChangeText={(value) => {
                                setPwdMatch(value === password)
                            }}
                        />

                        {!pwdMatch && (
                            <ThemedText style={[styles.instructionsText, styles.failText]}>
                                Passwords don&apos;t match
                            </ThemedText>
                        )}
                        
                    </>

                )}
                
                {errorMessage !== "" && (
                    <ThemedText style={[styles.instructionsText, styles.failText, {marginTop: 15}]}>{errorMessage}</ThemedText>
                )}

                <Button
                    style={{marginTop: 20, opacity: isFormValid ? 1 : 0.3}}
                    disabled={!isFormValid || isSubmitting}
                    onPress={createAccount}>
                    
                    {isSubmitting ? <LoadingSpinner size={18} /> : 'Next'}
                </Button>

                
            </KeyboardAvoidingView>
        </ThemedView>
    );
}
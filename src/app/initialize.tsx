import { KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import Logo, { LogoText } from '@/components/ui/logo';



export default function InitializeScreen() {
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
    }
});

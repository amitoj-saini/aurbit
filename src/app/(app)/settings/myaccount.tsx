import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Input } from '@/components/ui/elements';
import Loader from '@/components/ui/loader';
import Navigation from '@/components/ui/navigation';
import { useTheme } from '@/hooks/use-theme';
import { usersApi, UserDetails } from '@/lib/api';
import appLog from '@/lib/logger';
import { router } from 'expo-router';
import { ChevronLeft, Pencil } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Keyboard, Pressable, StyleSheet, TouchableWithoutFeedback } from 'react-native';

export default function MyAccount() {
    const [isLoading, setIsLoading] = useState(false);
    const theme = useTheme();
    const [accountDetails, setAccountDetails] = useState<UserDetails | null>(null);

    useEffect(() => {
        const fetchUserDetails = async () => {
            setIsLoading(true)
            let response = await usersApi.userDetails();
            
            if (response.err || !response.data) 
                return appLog("auth", response.err ? response.err.message : "User detail err");
            console.log(response.data)
            setAccountDetails(response.data);

            setIsLoading(false);
        }

        fetchUserDetails();
    }, [])

    const styles = StyleSheet.create({
        page: {
            width: "100%",
            height: "100%"
        },
        pageTitle: {
            width: "100%",
            
            display: "flex",
            textAlign: "center",
            justifyContent: "center",
            alignItems: "center",
            marginTop: 80
        },
        pageTitleText: {
            fontSize: 20,
            fontWeight: 500,
            padding: 10
        },
        settingContainer: {
            width: "100%",
            display: "flex",
            paddingHorizontal: 15
        },
        backButton: {
            position: "absolute",
            left: 30,
            borderStyle: "solid",
            borderRadius: 20,
            width: 60,
            height: 40,
            borderColor: theme.backgroundTertiary,
            boxShadow: theme.boxShadow,
            borderWidth: 1,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            marginTop: -10
        },
        profilePicture: {
            width: 65,
            height: 65,
            borderStyle: "solid",
            borderWidth: 1,
            borderColor: theme.text,
            backgroundColor: `${theme.backgroundSecondary}D9`,
            borderRadius: 55,
            display: "flex",
            justifyContent: "center",
            alignItems: "center"
        },
        editContainer: {
            width: 22, 
            height: 22, 
            backgroundColor: theme.text, 
            borderRadius: 35,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            boxShadow: theme.boxShadow,
            position: "absolute",
            top: 0,
            marginLeft: 48
        },
        inputLabel: {
            marginTop: 15,
            fontSize: 12
        },
    });

    if (isLoading || !accountDetails) {
        return (
            <Loader></Loader>
        )
    } else {
        return (
            <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
                <ThemedView style={styles.page}>
                    <ThemedView style={styles.pageTitle}>
                        <Pressable onPress={() => router.push("/settings")} style={styles.backButton}>
                            <ChevronLeft size={28} color={theme.textSecondary}></ChevronLeft>
                        </Pressable>
                        <ThemedText style={styles.pageTitleText}>My Account</ThemedText>
                    </ThemedView>
                
                <ThemedView style={styles.settingContainer}>
                    <ThemedView style={{width: "100%", marginTop: 40, display: "flex", justifyContent: "center", alignItems: "center"}}>
                        {accountDetails.image ? <></> : (
                            <ThemedView style={styles.profilePicture}>
                                <ThemedText>{accountDetails.displayName.trim().split(/\s+/).map(n => n[0]).slice(0, 2).join("").toUpperCase()}</ThemedText>
                            </ThemedView>
                        )}
                        <ThemedView style={styles.editContainer}>
                            <Pencil size={14} color={theme.background}></Pencil>
                        </ThemedView>
                        
                    </ThemedView>

                    <ThemedText type="small" themeColor="textSecondary" style={[styles.inputLabel, {marginTop: 20}]}>
                        Display Name
                    </ThemedText>
                    <Input
                        style={{marginTop: 4}}
                        autoCapitalize="none"
                        autoCorrect={false}
                        placeholder="Edit your display name"
                        returnKeyType="done"
                        value={accountDetails.displayName}
                    />

                    <ThemedText type="small" themeColor="textSecondary" style={styles.inputLabel}>
                        Email
                    </ThemedText>
                    <Input
                        style={{marginTop: 4}}
                        autoCapitalize="none"
                        autoCorrect={false}
                        placeholder="Edit your email"
                        returnKeyType="done"
                        keyboardType="email-address"
                        value={accountDetails.email}
                    />
                    
                </ThemedView>
                
                <Navigation selected="settings"></Navigation>
            </ThemedView>
        </TouchableWithoutFeedback>
        );
    }
}
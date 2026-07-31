import { ThemedView } from '@/components/themed-view';
import Navigation from '@/components/ui/navigation';
import { StyleSheet } from 'react-native';

export default function Settings() {
    return (
        <ThemedView style={styles.page}>
            <Navigation selected="settings"></Navigation>
        </ThemedView>
        
    );
}


const styles = StyleSheet.create({
    page: {
        width: "100%",
        height: "100%"
    }
});
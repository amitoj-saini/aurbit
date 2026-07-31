import { ThemedView } from '@/components/themed-view';
import Navigation from '@/components/ui/navigation';
import { StyleSheet } from 'react-native';

export default function App() {
    return (
        <ThemedView style={styles.page}>
            <Navigation></Navigation>
        </ThemedView>
        
    );
}


const styles = StyleSheet.create({
    page: {
        width: "100%",
        height: "100%"
    }
});
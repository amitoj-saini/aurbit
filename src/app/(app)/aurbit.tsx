import { ThemedView } from '@/components/themed-view';
import Navigation from '@/components/ui/navigation';
import { StyleSheet, useColorScheme } from 'react-native';
import MapView, { MapViewProps } from 'react-native-maps';

export default function App() {
    const colorScheme: MapViewProps["userInterfaceStyle"] = useColorScheme();
    
    return (
        <ThemedView style={styles.page}>
            <MapView userInterfaceStyle={colorScheme} style={styles.map} />
            <Navigation></Navigation>
        </ThemedView>
        
    );
}


const styles = StyleSheet.create({
    page: {
        width: "100%",
        height: "100%"
    },
    map: {
        width: '100%',
        height: '100%',
    },
});
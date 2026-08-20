import { useTheme } from "@/hooks/use-theme"
import { ThemedText } from "../themed-text";
import { ThemedView } from "../themed-view";

export default function HorizontalLine() {
    const theme = useTheme();

    return (
        <ThemedView style={{ marginVertical: 20, flexDirection: 'row', alignItems: 'center' }}>
            <ThemedView style={{ flex: 1, height: 1, backgroundColor: theme.backgroundSecondary }} />
            
            <ThemedText style={{ fontSize: 11, fontWeight: 500, marginHorizontal: 10, color: theme.textSecondary }}>
                History
            </ThemedText>
            
            <ThemedView style={{ flex: 1, height: 1, backgroundColor: theme.backgroundSecondary }} />
        </ThemedView>
    )
}
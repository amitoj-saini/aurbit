import { StyleSheet } from "react-native";
import { LogoAnimation } from "@/components/ui/logo";
import { ThemedView } from "@/components/themed-view";

export default function Loader() {
    return (
        <ThemedView style={styles.loadingContainer}>
            <LogoAnimation width={100} height={100}></LogoAnimation>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    loadingContainer: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100%",
        width: "100%"
    },
});
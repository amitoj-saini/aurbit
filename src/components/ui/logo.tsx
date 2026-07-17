import { Image, Text, StyleSheet, StyleProp, TextStyle } from "react-native";
import { ThemedText } from "../themed-text";
import { useTheme } from "@/hooks/use-theme";

export default function Logo() {
    return (
        <Image
            source={require("../../../assets/logo/aurbit.png")}
            style={{ width: 120, height: 120 }}
        />
    );
}

export function LogoText({ style }: { style?: StyleProp<TextStyle> }) {
    const theme = useTheme();
    
    const styles = StyleSheet.create({
        LogoText: {
            fontSize: 24,
            fontWeight: "bold"
        }
    })

    return (
        <ThemedText style={[style, styles.LogoText]}>aurbit<Text style={{color: theme.accentPrimary}}>′</Text></ThemedText>
    )
}
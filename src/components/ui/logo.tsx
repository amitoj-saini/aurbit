import { Image, Text, StyleSheet, StyleProp, TextStyle } from "react-native";
import { ThemedText } from "../themed-text";
import { useTheme } from "@/hooks/use-theme";
import { Fonts } from '@/constants/theme';

export default function Logo({ width=120, height=120 }) {
    return (
        <Image
            source={require("../../../assets/logo/aurbit.png")}
            style={{ width: width, height: height }}
        />
    );
}

export function LogoAnimation({width=120, height=120}) {
    return (
        <Image
            source={require("../../../assets/logo/animation.gif")}
            style={{ width: width, height: height }}
        />
    );
}

export function LogoText({ style }: { style?: StyleProp<TextStyle> }) {
    const theme = useTheme();
    
    const styles = StyleSheet.create({
        LogoText: {
            fontSize: 24,
            fontWeight: 600,
            // use the app display/sans font so the logo text matches app typography
            fontFamily: (Fonts as any)?.sans,
        }
    })

    return (
        <ThemedText style={[styles.LogoText, style]}>aurbit<Text style={{color: theme.accentPrimary}}>′</Text></ThemedText>
    )
}
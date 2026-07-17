import { StyleProp, ViewStyle, Pressable, PressableProps, StyleSheet, TextInput, TextInputProps } from "react-native";
import { useTheme } from '@/hooks/use-theme';
import { ThemedView } from "../themed-view";

type ButtonProps = PressableProps & {
    style?: StyleProp<ViewStyle>;
};

export function Input(props: TextInputProps) {
    const theme = useTheme();

    const styles = StyleSheet.create({
        input: {
            width: "100%",
            height: 36,
            marginVertical: 20,
            borderStyle: "solid",
            borderWidth: 0.5,
            borderColor: theme.textSecondary,
            borderRadius: 10,
            paddingHorizontal: 10,
            paddingVertical: 5
        }
    })

    return (
        <ThemedView style={{marginBottom: 0}}>
            <TextInput
                style={[styles.input, { borderColor: theme.text, color: theme.text }]}
                autoCapitalize="none"
                autoCorrect={false}                
                placeholderTextColor={theme.textSecondary}
                {...props}    
            />
        </ThemedView>
    );
}


export function Button({ style, ...props }: ButtonProps ) {
    const theme = useTheme();

    const styles = StyleSheet.create({
        button: {
            height: 36,
            borderRadius: 12,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: theme.accentPrimary
        }
    })

    return (
        <Pressable
            style={[
                styles.button,
                style
            ]}
            {...props}
            >
            
        </Pressable>
    )
}
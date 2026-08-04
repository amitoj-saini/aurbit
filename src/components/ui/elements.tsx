import { Platform, StyleProp, ViewStyle, Pressable, PressableProps, StyleSheet, TextInput, TextInputProps } from "react-native";
import { useTheme } from '@/hooks/use-theme';
import { ThemedView } from "../themed-view";
import { ThemedText } from "../themed-text";
import { ReactNode, useEffect, useRef, useState } from "react";
import {
  useFonts,
  OpenSans_300Light,
  OpenSans_400Regular,
  OpenSans_500Medium,
  OpenSans_600SemiBold,
  OpenSans_700Bold,
  OpenSans_800ExtraBold,
} from '@expo-google-fonts/open-sans';

type ButtonProps = PressableProps & {
    children: ReactNode;
    style?: StyleProp<ViewStyle>;
};

export function 
Input({style, ...props}: TextInputProps) {
    const theme = useTheme();
    const inputRef = useRef<TextInput>(null);
    const [isFocussed, setIsFocussed] = useState(false)

    useEffect(() => {
        if (Platform.OS !== 'web') return;

        const handleMouseDown = (event: MouseEvent) => {
            const activeElement = document.activeElement as HTMLElement | null;
            if (!activeElement || typeof activeElement.blur !== 'function') return;
            if (!(event.target instanceof Node) || activeElement.contains(event.target)) return;
            activeElement.blur();
        };

        document.addEventListener('mousedown', handleMouseDown);
        return () => document.removeEventListener('mousedown', handleMouseDown);
    }, []);

    useFonts({
        OpenSans_300Light,
        OpenSans_400Regular,
        OpenSans_500Medium,
        OpenSans_600SemiBold,
        OpenSans_700Bold,
        OpenSans_800ExtraBold,
    });

    const styles = StyleSheet.create({
        input: {
            width: "100%",
            height: 36,
            borderStyle: "solid",
            borderWidth: 0.5,
            borderColor: theme.backgroundTertiary,
            borderRadius: 10,
            paddingHorizontal: 10,
            paddingVertical: 5,
            fontFamily: "OpenSans_400Regular"
        },
        blurred: {
            boxShadow: "0px 0px 2px 4px transparent"
        },
        focussed: {
            boxShadow: `0px 0px 0px 3px ${theme.backgroundSelected}99`,
            borderColor: `transparent`,
        }
        
    })

    return (
        <ThemedView style={{marginBottom: 0}}>
            <TextInput
                ref={inputRef}
                style={[styles.input, isFocussed ? styles.focussed : styles.blurred, { color: theme.text }, style]}
                autoCapitalize="none"
                autoCorrect={false}                
                placeholderTextColor={theme.textSecondary}
                onFocus={() => setIsFocussed(true)}
                onBlur={() => setIsFocussed(false)}
                {...props}    
            />
        </ThemedView>
    );
}


export function Button({ children, style, ...props }: ButtonProps ) {
    const theme = useTheme();

    const styles = StyleSheet.create({
        button: {
            height: 36,
            borderRadius: 12,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: theme.accentPrimary,
            textAlign: 'center',
        },
        text: {
            color: theme.textOpposite,
            fontWeight: 400,
            fontSize: 14
        }
    })

    const isString = typeof children === 'string';

    return (
        <Pressable
            style={[
                styles.button,
                style
            ]}
            {...props}
            >
            {isString ? (
                <ThemedText style={[styles.text]}>
                    { children }
                </ThemedText>
            ) : (
                children
            )}
        </Pressable>
    )
}
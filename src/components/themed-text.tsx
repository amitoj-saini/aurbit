import { Platform, StyleSheet, Text, type TextProps, type TextStyle } from 'react-native';
import {
  useFonts,
  OpenSans_300Light,
  OpenSans_400Regular,
  OpenSans_500Medium,
  OpenSans_600SemiBold,
  OpenSans_700Bold,
  OpenSans_800ExtraBold,
} from '@expo-google-fonts/open-sans';
import { ThemeColor } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type ThemedTextProps = TextProps & {
  type?: 'default' | 'title' | 'small' | 'smallBold' | 'subtitle' | 'link' | 'linkPrimary' | 'code';
  themeColor?: ThemeColor;
};

const typeDefaultWeights: Record<NonNullable<ThemedTextProps['type']>, number> = {
  default: 500,
  title: 600,
  small: 500,
  smallBold: 700,
  subtitle: 600,
  link: 500,
  linkPrimary: 500,
  code: 500,
};

function normalizeFontWeight(value: TextStyle['fontWeight'] | undefined) {
  if (typeof value === 'number') {
    return value;
  }

  if (typeof value === 'string') {
    if (value === 'normal') {
      return 400;
    }

    if (value === 'bold') {
      return 700;
    }

    const parsed = Number.parseInt(value, 10);
    if (!Number.isNaN(parsed)) {
      return parsed;
    }
  }

  return undefined;
}

function getOpenSansFontFamily(fontWeight: number | undefined) {
  if (fontWeight == null) {
    return undefined;
  }

  if (fontWeight <= 300) {
    return 'OpenSans_300Light';
  }

  if (fontWeight <= 400) {
    return 'OpenSans_400Regular';
  }

  if (fontWeight <= 500) {
    return 'OpenSans_500Medium';
  }

  if (fontWeight <= 600) {
    return 'OpenSans_600SemiBold';
  }

  if (fontWeight <= 700) {
    return 'OpenSans_700Bold';
  }

  return 'OpenSans_800ExtraBold';
}

export function ThemedText({ style, type = 'default', themeColor, ...rest }: ThemedTextProps) {
  const theme = useTheme();

  const [fontsLoaded] = useFonts({
    OpenSans_300Light,
    OpenSans_400Regular,
    OpenSans_500Medium,
    OpenSans_600SemiBold,
    OpenSans_700Bold,
    OpenSans_800ExtraBold,
  });

  const flattenedStyle = StyleSheet.flatten(style);
  const resolvedFontWeight = normalizeFontWeight(flattenedStyle?.fontWeight) ?? typeDefaultWeights[type];
  const fontFamily = fontsLoaded && flattenedStyle?.fontFamily == null
    ? getOpenSansFontFamily(resolvedFontWeight)
    : flattenedStyle?.fontFamily;

  const typeStyle = (() => {
    switch (type) {
      case 'title':
        return styles.title;
      case 'small':
        return styles.small;
      case 'smallBold':
        return styles.smallBold;
      case 'subtitle':
        return styles.subtitle;
      case 'link':
        return styles.link;
      case 'linkPrimary':
        return styles.linkPrimary;
      case 'code':
        return styles.code;
      case 'default':
      default:
        return styles.default;
    }
  })();

  return (
    <Text
      style={[
        { color: theme[themeColor ?? 'text'] },
        typeStyle,
        fontFamily ? { fontFamily } : null,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  small: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: 500,
  },
  smallBold: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: 700,
  },
  default: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: 500,
  },
  title: {
    fontSize: 48,
    fontWeight: 600,
    lineHeight: 52,
  },
  subtitle: {
    fontSize: 32,
    lineHeight: 44,
    fontWeight: 600,
  },
  link: {
    lineHeight: 30,
    fontSize: 14,
  },
  linkPrimary: {
    lineHeight: 30,
    fontSize: 14,
    color: '#00b6fe',
  },
  code: {
    fontWeight: Platform.select({ android: 700 }) ?? 500,
    fontSize: 12,
  },
});

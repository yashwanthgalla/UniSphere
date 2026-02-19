import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { FONTS, SPACING } from '../theme';

const SplashScreen = ({ navigation }) => {
  const { colors, isDark } = useTheme();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace('Login');
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.bg}
      />

      {/* Big brutalist logo */}
      <View style={styles.logoContainer}>
        <Text style={[styles.logoTop, { color: colors.textMuted }]}>
          the app for
        </Text>
        <Text style={[styles.logoMain, { color: colors.text }]}>
          UNI
        </Text>
        <Text style={[styles.logoMain, { color: colors.accent }]}>
          SPHERE
        </Text>
        <Text style={[styles.logoSub, { color: colors.textMuted }]}>
          anonymous · verified · unfiltered
        </Text>
      </View>

      <ActivityIndicator
        size="large"
        color={colors.accent}
        style={styles.loader}
      />

      <Text style={[styles.footer, { color: colors.textMuted }]}>
        exclusively for university students
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  logoContainer: {
    alignItems: 'center',
  },
  logoTop: {
    fontSize: FONTS.captionSize,
    fontWeight: FONTS.medium,
    textTransform: 'uppercase',
    letterSpacing: 4,
    marginBottom: SPACING.xs,
  },
  logoMain: {
    fontSize: FONTS.heroSize + 10,
    fontWeight: FONTS.black,
    letterSpacing: -3,
    lineHeight: 56,
  },
  logoSub: {
    fontSize: FONTS.tinySize,
    fontWeight: FONTS.medium,
    textTransform: 'uppercase',
    letterSpacing: 3,
    marginTop: SPACING.md,
  },
  loader: {
    marginTop: SPACING.xxl,
  },
  footer: {
    position: 'absolute',
    bottom: 60,
    fontSize: FONTS.tinySize,
    fontWeight: FONTS.bold,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
});

export default SplashScreen;

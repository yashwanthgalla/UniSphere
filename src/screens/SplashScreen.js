import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  StatusBar,
  Animated,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { FONTS, SPACING } from '../theme';

const SplashScreen = ({ navigation }) => {
  const { colors, isDark } = useTheme();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const pulseAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Logo entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();

    // Pulse loading indicator
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 0.3, duration: 600, useNativeDriver: true }),
      ])
    ).start();

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

      {/* App Logo */}
      <Animated.View
        style={[
          styles.logoContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <Image
          source={require('../../assets/main_logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={[styles.appName, { color: colors.text }]}>
          UNI<Text style={{ color: colors.accent }}>SPHERE</Text>
        </Text>
        <Text style={[styles.tagline, { color: colors.textMuted }]}>
          anonymous · verified · unfiltered
        </Text>
      </Animated.View>

      {/* Loading dots */}
      <Animated.View style={[styles.loader, { opacity: pulseAnim }]}>
        <View style={[styles.dot, { backgroundColor: colors.accent }]} />
        <View style={[styles.dot, { backgroundColor: colors.accentAlt }]} />
        <View style={[styles.dot, { backgroundColor: colors.accentYellow }]} />
      </Animated.View>

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
  logo: {
    width: 140,
    height: 140,
    marginBottom: SPACING.lg,
  },
  appName: {
    fontSize: FONTS.heroSize,
    fontWeight: FONTS.black,
    letterSpacing: -2,
  },
  tagline: {
    fontSize: FONTS.tinySize,
    fontWeight: FONTS.medium,
    textTransform: 'uppercase',
    letterSpacing: 3,
    marginTop: SPACING.sm,
  },
  loader: {
    flexDirection: 'row',
    marginTop: SPACING.xxl,
    gap: 8,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
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

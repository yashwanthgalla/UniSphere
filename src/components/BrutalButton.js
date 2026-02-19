import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { FONTS, SPACING, RADIUS } from '../theme';

const BrutalButton = ({
  title,
  onPress,
  variant = 'primary', // primary | secondary | danger | accent
  loading = false,
  disabled = false,
  style,
  textStyle,
}) => {
  const { colors } = useTheme();

  const bgMap = {
    primary: colors.text,
    secondary: colors.card,
    danger: colors.danger,
    accent: colors.accent,
    yellow: colors.accentYellow,
  };

  const textMap = {
    primary: colors.card,
    secondary: colors.text,
    danger: '#FFF',
    accent: '#FFF',
    yellow: '#000',
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.85}
      style={[
        styles.button,
        {
          backgroundColor: bgMap[variant],
          borderColor: colors.border,
          opacity: disabled ? 0.5 : 1,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={textMap[variant]} size="small" />
      ) : (
        <Text style={[styles.text, { color: textMap[variant] }, textStyle]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderWidth: 2.5,
    borderRadius: RADIUS.sm,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 6,
  },
  text: {
    fontSize: FONTS.bodySize,
    fontWeight: FONTS.black,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
});

export default BrutalButton;

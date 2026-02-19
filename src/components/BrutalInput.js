import React from 'react';
import { TextInput, View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { FONTS, SPACING, RADIUS } from '../theme';

const BrutalInput = ({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  multiline,
  numberOfLines,
  style,
  inputStyle,
  ...props
}) => {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, style]}>
      {label && (
        <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
      )}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        secureTextEntry={secureTextEntry}
        multiline={multiline}
        numberOfLines={numberOfLines}
        style={[
          styles.input,
          {
            color: colors.text,
            backgroundColor: colors.inputBg,
            borderColor: colors.border,
          },
          multiline && styles.multiline,
          inputStyle,
        ]}
        {...props}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.md,
  },
  label: {
    fontSize: FONTS.tinySize,
    fontWeight: FONTS.black,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: SPACING.xs,
  },
  input: {
    borderWidth: 2.5,
    borderRadius: RADIUS.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    fontSize: FONTS.bodySize,
    fontWeight: FONTS.medium,
  },
  multiline: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
});

export default BrutalInput;

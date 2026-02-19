import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  Alert,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { FONTS, SPACING, RADIUS } from '../theme';
import BrutalButton from '../components/BrutalButton';
import BrutalInput from '../components/BrutalInput';

const VerificationScreen = ({ navigation }) => {
  const { colors, isDark } = useTheme();
  const [universityEmail, setUniversityEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async () => {
    if (!universityEmail.trim()) {
      Alert.alert('REQUIRED', 'Enter your university email.');
      return;
    }
    setLoading(true);
    // In production, call Firebase Cloud Function to send OTP
    setTimeout(() => {
      setOtpSent(true);
      setLoading(false);
      Alert.alert('OTP SENT', 'Check your university email inbox.');
    }, 1500);
  };

  const handleVerify = async () => {
    if (!otp.trim() || otp.length < 4) {
      Alert.alert('INVALID', 'Enter a valid OTP.');
      return;
    }
    setLoading(true);
    // In production, verify OTP via Firebase Cloud Function
    setTimeout(() => {
      setLoading(false);
      Alert.alert('VERIFIED ✓', 'Welcome to UniSphere!');
      // Auth state change would auto-navigate
    }, 1500);
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.bg }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.bg}
      />
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.preTitle, { color: colors.textMuted }]}>
            one last step
          </Text>
          <Text style={[styles.title, { color: colors.text }]}>
            VERIFY
          </Text>
          <Text style={[styles.title, { color: colors.accentAlt }]}>
            YOUR UNI
          </Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>
            we need to confirm you're a real student.
            {'\n'}no personal data is stored.
          </Text>
        </View>

        {/* Step indicator */}
        <View style={styles.steps}>
          <View
            style={[
              styles.step,
              {
                backgroundColor: colors.accent,
                borderColor: colors.border,
              },
            ]}
          >
            <Text style={styles.stepText}>1</Text>
          </View>
          <View
            style={[
              styles.stepLine,
              {
                backgroundColor: otpSent ? colors.accent : colors.textMuted,
              },
            ]}
          />
          <View
            style={[
              styles.step,
              {
                backgroundColor: otpSent ? colors.accentGreen : colors.inputBg,
                borderColor: colors.border,
              },
            ]}
          >
            <Text style={[styles.stepText, !otpSent && { color: colors.textMuted }]}>
              2
            </Text>
          </View>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <BrutalInput
            label="University Email"
            value={universityEmail}
            onChangeText={setUniversityEmail}
            placeholder="you@iitd.ac.in"
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!otpSent}
          />

          {!otpSent ? (
            <BrutalButton
              title="Send OTP →"
              onPress={handleSendOtp}
              loading={loading}
              variant="primary"
              style={{ marginTop: SPACING.sm }}
            />
          ) : (
            <>
              <BrutalInput
                label="Enter OTP"
                value={otp}
                onChangeText={setOtp}
                placeholder="6-digit code"
                keyboardType="number-pad"
                maxLength={6}
              />
              <BrutalButton
                title="Verify ✓"
                onPress={handleVerify}
                loading={loading}
                variant="accent"
                style={{ marginTop: SPACING.sm }}
              />
            </>
          )}
        </View>

        {/* Info box */}
        <View
          style={[
            styles.infoBox,
            { borderColor: colors.accentAlt, backgroundColor: colors.inputBg },
          ]}
        >
          <Text style={[styles.infoTitle, { color: colors.accentAlt }]}>
            WHY VERIFY?
          </Text>
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>
            UniSphere is exclusively for university students. We verify your
            .edu email to keep the community safe and authentic. Your email is
            never shown to others.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xxl,
  },
  header: {
    marginBottom: SPACING.lg,
  },
  preTitle: {
    fontSize: FONTS.captionSize,
    fontWeight: FONTS.medium,
    textTransform: 'uppercase',
    letterSpacing: 3,
    marginBottom: SPACING.xs,
  },
  title: {
    fontSize: FONTS.heroSize,
    fontWeight: FONTS.black,
    letterSpacing: -2,
    lineHeight: 48,
  },
  subtitle: {
    fontSize: FONTS.captionSize,
    fontWeight: FONTS.medium,
    textTransform: 'lowercase',
    letterSpacing: 0.5,
    marginTop: SPACING.sm,
    lineHeight: 18,
  },
  steps: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xl,
  },
  step: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.sm,
    borderWidth: 2.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepText: {
    color: '#FFF',
    fontSize: FONTS.bodySize,
    fontWeight: FONTS.black,
  },
  stepLine: {
    width: 60,
    height: 3,
    marginHorizontal: SPACING.sm,
  },
  form: {
    marginBottom: SPACING.xl,
  },
  infoBox: {
    borderWidth: 2,
    borderRadius: RADIUS.sm,
    padding: SPACING.md,
  },
  infoTitle: {
    fontSize: FONTS.tinySize,
    fontWeight: FONTS.black,
    letterSpacing: 2,
    marginBottom: SPACING.xs,
  },
  infoText: {
    fontSize: FONTS.captionSize,
    lineHeight: 18,
  },
});

export default VerificationScreen;

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  Alert,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { FONTS, SPACING } from '../theme';
import BrutalButton from '../components/BrutalButton';
import BrutalInput from '../components/BrutalInput';
import BrutalDropdown from '../components/BrutalDropdown';
import { INDIAN_UNIVERSITIES } from '../utils/universities';

const EXTRA_UNIVERSITIES = [
  "Netaji Subhash Chandra Bose Institute of Higher Learning",
  "NITTE",
  "Noorul Islam Centre for Higher Education",
  "North Eastern Regional Institute of Science & Technology",
  "Periyar Maniammai Institute of Science & Technology",
  "Punjab Engineering College",
  "S.R.M. Institute of Science and Technology",
  "Sathyabama Institute of Science and Technology",
  "Saveetha Institute of Medical and Technical Sciences",
  "Shanmugha Arts, Science, Technology & Research Academy (SASTRA)",
  "Symbiosis International",
  "Tata Institute of Fundamental Research",
  "Tata Institute of Social Sciences",
  "Manipal Academy of Higher Education",
  "Narsee Monjee Institute of Management Studies",
  "National Institute of Ayurveda",
];

const ALL_UNIVERSITIES = Array.from(
  new Set([...INDIAN_UNIVERSITIES, ...EXTRA_UNIVERSITIES])
).sort();

const SignupScreen = ({ navigation }) => {
  const { colors, isDark } = useTheme();
  const { signup } = useAuth();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [university, setUniversity] = useState('');

  const handleSignup = async () => {
    if (!username.trim() || !email.trim() || !password.trim() || !university) {
      Alert.alert(
        'HOLD UP',
        'Fill in all fields, select your university, and choose a username.'
      );
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('MISMATCH', "Passwords don't match.");
      return;
    }

    if (password.length < 6) {
      Alert.alert('TOO SHORT', 'Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      await signup(email.trim(), password, university, username.trim());
      navigation.navigate('Verification');
    } catch (err) {
      Alert.alert('ERROR', err.message || 'Signup failed.');
    } finally {
      setLoading(false);
    }
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

      <View style={styles.scroll}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.preTitle, { color: colors.textMuted }]}>
            join the network
          </Text>
          <Text style={[styles.title, { color: colors.text }]}>
            CREATE
          </Text>
          <Text style={[styles.title, { color: colors.accent }]}>
            ACCOUNT
          </Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>
            your identity stays anonymous, always.
          </Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <BrutalInput
            label="Username"
            value={username}
            onChangeText={setUsername}
            placeholder="choose a username"
            autoCapitalize="none"
          />

          <BrutalInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="your@university.edu"
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <BrutalInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            placeholder="min 6 characters"
            secureTextEntry
          />

          <BrutalInput
            label="Confirm Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="repeat password"
            secureTextEntry
          />

          <BrutalDropdown
            label="University (India)"
            value={university}
            options={ALL_UNIVERSITIES}
            onSelect={setUniversity}
          />

          <BrutalButton
            title="Continue →"
            onPress={handleSignup}
            loading={loading}
            variant="accent"
            style={{ marginTop: SPACING.md }}
          />
        </View>

        {/* Footer */}
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.footerBtn}
        >
          <Text style={[styles.footerText, { color: colors.textMuted }]}>
            already have an account?{' '}
            <Text
              style={{
                color: colors.accent,
                fontWeight: FONTS.black,
                textTransform: 'uppercase',
              }}
            >
              Sign in ←
            </Text>
          </Text>
        </TouchableOpacity>
      </View>
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
    marginBottom: SPACING.xl,
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
    letterSpacing: 1,
    marginTop: SPACING.sm,
  },
  form: {
    marginBottom: SPACING.xl,
  },
  footerBtn: {
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  footerText: {
    fontSize: FONTS.captionSize,
    letterSpacing: 0.5,
  },
});

export default SignupScreen;

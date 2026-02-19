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
import { FONTS, SPACING, RADIUS } from '../theme';
import BrutalButton from '../components/BrutalButton';
import BrutalInput from '../components/BrutalInput';

const LoginScreen = ({ navigation }) => {
  const { colors, isDark } = useTheme();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('HOLD UP', 'Fill in all fields.');
      return;
    }
    setLoading(true);
    try {
      await login(email.trim(), password);
    } catch (err) {
      Alert.alert('ERROR', err.message || 'Login failed.');
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
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.preTitle, { color: colors.textMuted }]}>
            welcome back to
          </Text>
          <Text style={[styles.title, { color: colors.text }]}>
            UNI
            <Text style={{ color: colors.accent }}>SPHERE</Text>
          </Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>
            sign in to your anonymous identity
          </Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
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
            placeholder="••••••••"
            secureTextEntry
          />

          <BrutalButton
            title="Enter"
            onPress={handleLogin}
            loading={loading}
            variant="primary"
            style={{ marginTop: SPACING.md }}
          />
        </View>

        {/* Footer */}
        <TouchableOpacity
          onPress={() => navigation.navigate('Signup')}
          style={styles.footerBtn}
        >
          <Text style={[styles.footerText, { color: colors.textMuted }]}>
            no account?{' '}
            <Text
              style={{
                color: colors.accent,
                fontWeight: FONTS.black,
                textTransform: 'uppercase',
              }}
            >
              Create one →
            </Text>
          </Text>
        </TouchableOpacity>
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

export default LoginScreen;

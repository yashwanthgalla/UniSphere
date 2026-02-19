import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { FONTS, SPACING, RADIUS } from '../theme';
import BrutalButton from '../components/BrutalButton';

const SettingsScreen = ({ navigation }) => {
  const { colors, isDark, toggleTheme } = useTheme();
  const { logout } = useAuth();

  const handleLogout = () => {
    Alert.alert('LEAVING?', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          try {
            await logout();
          } catch (e) {
            console.log(e);
          }
        },
      },
    ]);
  };

  const SettingRow = ({ label, value, onPress, icon }) => (
    <TouchableOpacity
      onPress={onPress}
      disabled={!onPress}
      style={[styles.row, { borderBottomColor: colors.border }]}
    >
      <View style={styles.rowLeft}>
        {icon && <Ionicons name={icon} size={18} color={colors.textMuted} style={{ marginRight: SPACING.sm }} />}
        <Text style={[styles.rowLabel, { color: colors.text }]}>{label}</Text>
      </View>
      {value && (
        <View style={styles.rowRight}>
          <Text style={[styles.rowValue, { color: colors.textMuted }]}>{value}</Text>
          {onPress && <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />}
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.bg}
      />

      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          SET<Text style={{ color: colors.accent }}>TINGS</Text>
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Appearance */}
        <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>
          APPEARANCE
        </Text>
        <TouchableOpacity
          onPress={toggleTheme}
          style={[
            styles.themeToggle,
            { backgroundColor: colors.inputBg, borderColor: colors.border },
          ]}
        >
          <View style={styles.themeLeft}>
            <Ionicons
              name={isDark ? 'moon' : 'sunny'}
              size={20}
              color={isDark ? colors.accentYellow : colors.accent}
            />
            <Text style={[styles.themeLabel, { color: colors.text }]}>
              {isDark ? 'DARK MODE' : 'LIGHT MODE'}
            </Text>
          </View>
          <Text style={[styles.themeHint, { color: colors.textMuted }]}>
            tap to switch
          </Text>
        </TouchableOpacity>

        {/* App info */}
        <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>
          ABOUT
        </Text>
        <SettingRow label="VERSION" value="1.0.0 — MVP" icon="information-circle-outline" />
        <SettingRow label="BUILD" value="2026.02.19" icon="code-slash-outline" />
        <SettingRow label="PLATFORM" value="Expo / React Native" icon="phone-portrait-outline" />

        {/* Privacy */}
        <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>
          PRIVACY
        </Text>
        <SettingRow label="DATA POLICY" onPress={() => {}} icon="shield-outline" />
        <SettingRow label="TERMS OF SERVICE" onPress={() => {}} icon="document-text-outline" />

        {/* Info Box */}
        <View
          style={[
            styles.infoBox,
            { borderColor: colors.accentAlt, backgroundColor: colors.inputBg },
          ]}
        >
          <Text style={[styles.infoTitle, { color: colors.accentAlt }]}>
            YOUR PRIVACY MATTERS
          </Text>
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>
            UniSphere never stores personal information. Your university email
            is only used for verification and is never visible to other users.
            All posts are fully anonymous.
          </Text>
        </View>

        {/* Logout */}
        <BrutalButton
          title="Logout"
          onPress={handleLogout}
          variant="danger"
          style={{ marginTop: SPACING.xl }}
        />

        <Text style={[styles.footer, { color: colors.textMuted }]}>
          made with frustration & caffeine{'\n'}© 2026 UniSphere
        </Text>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingTop: 56,
    paddingBottom: SPACING.md,
    borderBottomWidth: 2.5,
  },
  headerTitle: {
    fontSize: FONTS.headingSize,
    fontWeight: FONTS.black,
    letterSpacing: -1,
  },
  scroll: {
    padding: SPACING.md,
    paddingBottom: 100,
  },
  sectionTitle: {
    fontSize: FONTS.tinySize,
    fontWeight: FONTS.black,
    letterSpacing: 2,
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  themeToggle: {
    borderWidth: 2.5,
    borderRadius: RADIUS.sm,
    padding: SPACING.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  themeLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  themeLabel: {
    fontSize: FONTS.bodySize,
    fontWeight: FONTS.black,
    letterSpacing: 0.5,
  },
  themeHint: {
    fontSize: FONTS.tinySize,
    fontWeight: FONTS.medium,
    textTransform: 'lowercase',
    letterSpacing: 1,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rowLabel: {
    fontSize: FONTS.captionSize,
    fontWeight: FONTS.black,
    letterSpacing: 1,
  },
  rowValue: {
    fontSize: FONTS.captionSize,
    fontWeight: FONTS.medium,
  },
  infoBox: {
    borderWidth: 2,
    borderRadius: RADIUS.sm,
    padding: SPACING.md,
    marginTop: SPACING.lg,
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
  footer: {
    textAlign: 'center',
    fontSize: FONTS.tinySize,
    fontWeight: FONTS.medium,
    textTransform: 'lowercase',
    letterSpacing: 1,
    marginTop: SPACING.xl,
    lineHeight: 18,
  },
});

export default SettingsScreen;

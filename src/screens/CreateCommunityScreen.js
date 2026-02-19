import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  StatusBar,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { FONTS, SPACING, RADIUS, SHADOWS } from '../theme';
import BrutalButton from '../components/BrutalButton';
import { communityService } from '../services/firestore';
import { useAuth } from '../context/AuthContext';

const ICONS = ['🌐', '💻', '🎓', '🔬', '📚', '🎨', '🎮', '⚽', '🎵', '🧠', '🚀', '💡', '🔥', '⭐', '💬', '🏆'];
const ACCENT_COLORS = ['#FF4500', '#1A1AFF', '#FFD600', '#00E676', '#FF1744', '#9C27B0', '#00BCD4', '#FF9800'];

const CreateCommunityScreen = ({ navigation }) => {
  const { colors, isDark } = useTheme();
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('🌐');
  const [selectedColor, setSelectedColor] = useState('#FF4500');
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) {
      Alert.alert('Name required', 'Please enter a community name.');
      return;
    }
    if (name.trim().length < 3) {
      Alert.alert('Too short', 'Community name must be at least 3 characters.');
      return;
    }
    setLoading(true);
    try {
      await communityService.create({
        name: name.trim(),
        description: description.trim(),
        icon: selectedIcon,
        color: selectedColor,
        createdBy: user?.uid,
        createdByName: user?.displayName || user?.email?.split('@')[0] || 'Anonymous',
        members: [user?.uid],
      });
      setLoading(false);
      Alert.alert('Community Created!', `"${name.trim()}" is now live.`, [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (e) {
      setLoading(false);
      Alert.alert('Error', 'Failed to create community. Try again.');
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={[styles.container, { backgroundColor: colors.bg }]}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.bg} />

        {/* Header */}
        <View style={styles.headerWrap}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={[styles.backBtn, { color: colors.text }]}>← BACK</Text>
          </TouchableOpacity>
          <Text style={[styles.headerSmall, { color: colors.textMuted }]}>new</Text>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            CREATE{' '}
            <Text style={{ color: colors.accentAlt }}>COMMUNITY</Text>
          </Text>
        </View>

        {/* Preview Card */}
        <View style={[styles.previewCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={[styles.previewIcon, { backgroundColor: selectedColor, borderColor: colors.border }]}>
            <Text style={styles.previewIconText}>{selectedIcon}</Text>
          </View>
          <Text style={[styles.previewName, { color: colors.text }]}>
            {name.trim() || 'Community Name'}
          </Text>
          <Text style={[styles.previewDesc, { color: colors.textMuted }]}>
            {description.trim() || 'description...'}
          </Text>
          <Text style={[styles.previewMeta, { color: colors.textSecondary }]}>1 member · just now</Text>
        </View>

        {/* Name Input */}
        <Text style={[styles.label, { color: colors.text }]}>NAME</Text>
        <TextInput
          style={[styles.input, { color: colors.text, backgroundColor: colors.inputBg, borderColor: colors.border }]}
          placeholder="e.g. CS Study Group"
          placeholderTextColor={colors.textMuted}
          value={name}
          onChangeText={(t) => t.length <= 40 && setName(t)}
          maxLength={40}
        />
        <Text style={[styles.charCount, { color: colors.textMuted }]}>{name.length}/40</Text>

        {/* Description Input */}
        <Text style={[styles.label, { color: colors.text }]}>DESCRIPTION</Text>
        <TextInput
          style={[styles.input, styles.textArea, { color: colors.text, backgroundColor: colors.inputBg, borderColor: colors.border }]}
          placeholder="What's this community about?"
          placeholderTextColor={colors.textMuted}
          value={description}
          onChangeText={(t) => t.length <= 200 && setDescription(t)}
          multiline
          maxLength={200}
        />
        <Text style={[styles.charCount, { color: colors.textMuted }]}>{description.length}/200</Text>

        {/* Icon Picker */}
        <Text style={[styles.label, { color: colors.text }]}>ICON</Text>
        <View style={styles.pickerGrid}>
          {ICONS.map((icon) => (
            <TouchableOpacity
              key={icon}
              onPress={() => setSelectedIcon(icon)}
              style={[
                styles.iconOption,
                {
                  borderColor: selectedIcon === icon ? colors.accent : colors.border,
                  backgroundColor: selectedIcon === icon ? colors.accent + '20' : colors.inputBg,
                },
              ]}
            >
              <Text style={styles.iconOptionText}>{icon}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Color Picker */}
        <Text style={[styles.label, { color: colors.text }]}>COLOR</Text>
        <View style={styles.colorGrid}>
          {ACCENT_COLORS.map((color) => (
            <TouchableOpacity
              key={color}
              onPress={() => setSelectedColor(color)}
              style={[
                styles.colorOption,
                {
                  backgroundColor: color,
                  borderColor: selectedColor === color ? colors.text : 'transparent',
                  borderWidth: selectedColor === color ? 3 : 0,
                },
              ]}
            >
              {selectedColor === color && (
                <Text style={styles.colorCheck}>✓</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Create Button */}
        <BrutalButton
          title={loading ? 'CREATING...' : 'CREATE COMMUNITY'}
          onPress={handleCreate}
          loading={loading}
          variant="accent"
          style={{ marginTop: SPACING.lg }}
        />

        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: SPACING.md,
    paddingTop: 56,
  },
  headerWrap: {
    marginBottom: SPACING.lg,
  },
  backBtn: {
    fontSize: FONTS.captionSize,
    fontWeight: FONTS.black,
    letterSpacing: 1,
    marginBottom: SPACING.sm,
  },
  headerSmall: {
    fontSize: FONTS.tinySize,
    fontWeight: FONTS.medium,
    textTransform: 'uppercase',
    letterSpacing: 3,
  },
  headerTitle: {
    fontSize: FONTS.titleSize,
    fontWeight: FONTS.black,
    letterSpacing: -1.5,
  },
  previewCard: {
    borderWidth: 2.5,
    borderRadius: RADIUS.sm,
    padding: SPACING.md,
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  previewIcon: {
    width: 56,
    height: 56,
    borderRadius: RADIUS.sm,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  previewIconText: {
    fontSize: 28,
  },
  previewName: {
    fontSize: FONTS.subheadingSize,
    fontWeight: FONTS.black,
    textTransform: 'uppercase',
    letterSpacing: -0.5,
  },
  previewDesc: {
    fontSize: FONTS.captionSize,
    marginTop: 4,
    textAlign: 'center',
  },
  previewMeta: {
    fontSize: FONTS.tinySize,
    fontWeight: FONTS.bold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 6,
  },
  label: {
    fontSize: FONTS.captionSize,
    fontWeight: FONTS.black,
    letterSpacing: 1.5,
    marginBottom: SPACING.xs,
    marginTop: SPACING.md,
  },
  input: {
    borderWidth: 2.5,
    borderRadius: RADIUS.sm,
    padding: SPACING.sm + 4,
    fontSize: FONTS.bodySize,
  },
  textArea: {
    height: 90,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: FONTS.tinySize,
    textAlign: 'right',
    marginTop: 4,
  },
  pickerGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  iconOption: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.sm,
    borderWidth: 2.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconOptionText: {
    fontSize: 22,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  colorCheck: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '900',
  },
});

export default CreateCommunityScreen;

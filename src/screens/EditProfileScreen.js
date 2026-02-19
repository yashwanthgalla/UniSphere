import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
  Image,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { FONTS, SPACING, RADIUS, SHADOWS } from '../theme';
import { userService } from '../services/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../services/firebase';
import { updateProfile } from 'firebase/auth';

const EditProfileScreen = ({ navigation }) => {
  const { colors, isDark } = useTheme();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [avatar, setAvatar] = useState(null);
  const [newAvatarUri, setNewAvatarUri] = useState(null);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const profile = await userService.getProfile(user.uid);
        if (profile) {
          setUsername(profile.username || user.displayName || '');
          setBio(profile.bio || '');
          setAvatar(profile.avatar || null);
        }
      } catch (e) {
        console.error('Load profile error:', e);
      }
      setLoading(false);
    };
    loadProfile();
  }, [user?.uid]);

  const pickAvatar = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled) {
      setNewAvatarUri(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (!username.trim()) {
      Alert.alert('ERROR', 'Username cannot be empty.');
      return;
    }
    setSaving(true);
    try {
      let avatarUrl = avatar;

      // Upload new avatar if selected
      if (newAvatarUri) {
        const response = await fetch(newAvatarUri);
        const blob = await response.blob();
        const avatarRef = ref(storage, `avatars/${user.uid}`);
        await uploadBytes(avatarRef, blob);
        avatarUrl = await getDownloadURL(avatarRef);
      }

      // Update Firestore profile
      await userService.updateProfile(user.uid, {
        username: username.trim(),
        bio: bio.trim(),
        avatar: avatarUrl,
      });

      // Update Firebase Auth display name
      await updateProfile(user, {
        displayName: username.trim(),
        photoURL: avatarUrl,
      });

      Alert.alert('SAVED ✓', 'Profile updated successfully.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (e) {
      console.error('Save profile error:', e);
      Alert.alert('ERROR', 'Failed to save profile. Try again.');
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center, { backgroundColor: colors.bg }]}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  const displayAvatar = newAvatarUri || avatar;

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.bg}
      />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={[styles.cancelText, { color: colors.textMuted }]}>CANCEL</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          EDIT <Text style={{ color: colors.accent }}>PROFILE</Text>
        </Text>
        <TouchableOpacity onPress={handleSave} disabled={saving}>
          {saving ? (
            <ActivityIndicator size="small" color={colors.accent} />
          ) : (
            <Text style={[styles.saveText, { color: colors.accent }]}>SAVE</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        {/* Avatar */}
        <View style={styles.avatarSection}>
          <TouchableOpacity onPress={pickAvatar}>
            <View
              style={[
                styles.avatarContainer,
                { borderColor: colors.border, backgroundColor: colors.accent },
              ]}
            >
              {displayAvatar ? (
                <Image source={{ uri: displayAvatar }} style={styles.avatarImage} />
              ) : (
                <Text style={styles.avatarText}>
                  {(username || 'U').charAt(0).toUpperCase()}
                </Text>
              )}
              <View style={[styles.editBadge, { backgroundColor: colors.accentAlt, borderColor: colors.border }]}>
                <Text style={styles.editBadgeText}>✎</Text>
              </View>
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={pickAvatar}>
            <Text style={[styles.changePhotoText, { color: colors.accentAlt }]}>
              CHANGE PHOTO
            </Text>
          </TouchableOpacity>
        </View>

        {/* Username Field */}
        <View style={styles.fieldGroup}>
          <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>USERNAME</Text>
          <View style={[styles.inputContainer, { borderColor: colors.border, backgroundColor: colors.inputBg }]}>
            <Text style={[styles.inputPrefix, { color: colors.textMuted }]}>@</Text>
            <TextInput
              value={username}
              onChangeText={setUsername}
              placeholder="username"
              placeholderTextColor={colors.textMuted}
              style={[styles.input, { color: colors.text }]}
              autoCapitalize="none"
              maxLength={30}
            />
          </View>
          <Text style={[styles.charCount, { color: colors.textMuted }]}>
            {username.length}/30
          </Text>
        </View>

        {/* Bio Field */}
        <View style={styles.fieldGroup}>
          <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>BIO</Text>
          <View style={[styles.inputContainer, styles.bioInput, { borderColor: colors.border, backgroundColor: colors.inputBg }]}>
            <TextInput
              value={bio}
              onChangeText={setBio}
              placeholder="Tell us about yourself..."
              placeholderTextColor={colors.textMuted}
              style={[styles.input, styles.bioTextInput, { color: colors.text }]}
              multiline
              maxLength={160}
              numberOfLines={4}
            />
          </View>
          <Text style={[styles.charCount, { color: colors.textMuted }]}>
            {bio.length}/160
          </Text>
        </View>

        {/* Info Section */}
        <View style={[styles.infoSection, { borderColor: colors.border, backgroundColor: colors.inputBg }]}>
          <Text style={[styles.infoTitle, { color: colors.textMuted }]}>ACCOUNT INFO</Text>

          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>EMAIL</Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>{user?.email || '—'}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>UNIVERSITY</Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>{user?.university || '—'}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>JOINED</Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>
              {user?.metadata?.creationTime
                ? new Date(user.metadata.creationTime).toLocaleDateString()
                : '—'}
            </Text>
          </View>
        </View>

        {/* Remove Avatar */}
        {displayAvatar && (
          <TouchableOpacity
            onPress={() => {
              setAvatar(null);
              setNewAvatarUri(null);
            }}
            style={[styles.removeAvatarBtn, { borderColor: colors.danger }]}
          >
            <Text style={[styles.removeAvatarText, { color: colors.danger }]}>
              REMOVE PROFILE PHOTO
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { justifyContent: 'center', alignItems: 'center' },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 52,
    paddingBottom: SPACING.md,
    paddingHorizontal: SPACING.md,
    borderBottomWidth: 2.5,
  },
  cancelText: {
    fontSize: FONTS.captionSize,
    fontWeight: FONTS.black,
    letterSpacing: 1,
  },
  headerTitle: {
    fontSize: FONTS.subheadingSize,
    fontWeight: FONTS.black,
    letterSpacing: -0.5,
  },
  saveText: {
    fontSize: FONTS.captionSize,
    fontWeight: FONTS.black,
    letterSpacing: 1,
  },

  scroll: {
    padding: SPACING.md,
    paddingBottom: 100,
  },

  // Avatar
  avatarSection: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
    marginTop: SPACING.md,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: RADIUS.full,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    marginBottom: SPACING.sm,
  },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: RADIUS.full,
  },
  avatarText: {
    color: '#FFF',
    fontSize: 42,
    fontWeight: '900',
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 30,
    height: 30,
    borderRadius: RADIUS.full,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editBadgeText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: FONTS.black,
  },
  changePhotoText: {
    fontSize: FONTS.captionSize,
    fontWeight: FONTS.black,
    letterSpacing: 1,
  },

  // Fields
  fieldGroup: {
    marginBottom: SPACING.lg,
  },
  fieldLabel: {
    fontSize: FONTS.tinySize,
    fontWeight: FONTS.black,
    letterSpacing: 2,
    marginBottom: SPACING.sm,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2.5,
    borderRadius: RADIUS.sm,
    paddingHorizontal: SPACING.md,
    minHeight: 48,
  },
  inputPrefix: {
    fontSize: FONTS.bodySize,
    fontWeight: FONTS.black,
    marginRight: 4,
  },
  input: {
    flex: 1,
    fontSize: FONTS.bodySize,
    fontWeight: FONTS.medium,
    paddingVertical: SPACING.sm,
  },
  bioInput: {
    alignItems: 'flex-start',
    minHeight: 100,
  },
  bioTextInput: {
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: FONTS.tinySize,
    fontWeight: FONTS.bold,
    textAlign: 'right',
    marginTop: 4,
    letterSpacing: 0.5,
  },

  // Info
  infoSection: {
    borderWidth: 2.5,
    borderRadius: RADIUS.sm,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  infoTitle: {
    fontSize: FONTS.tinySize,
    fontWeight: FONTS.black,
    letterSpacing: 2,
    marginBottom: SPACING.md,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  infoLabel: {
    fontSize: FONTS.captionSize,
    fontWeight: FONTS.bold,
    letterSpacing: 1,
  },
  infoValue: {
    fontSize: FONTS.captionSize,
    fontWeight: FONTS.medium,
  },

  // Remove Avatar
  removeAvatarBtn: {
    borderWidth: 2,
    borderRadius: RADIUS.sm,
    padding: SPACING.md,
    alignItems: 'center',
  },
  removeAvatarText: {
    fontSize: FONTS.captionSize,
    fontWeight: FONTS.black,
    letterSpacing: 1,
  },
});

export default EditProfileScreen;

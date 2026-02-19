import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  StatusBar,
  Alert,
  TextInput,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { FONTS, SPACING, RADIUS, POST_TYPES } from '../theme';
import BrutalButton from '../components/BrutalButton';
import BrutalInput from '../components/BrutalInput';
import { useFocusEffect } from '@react-navigation/native';
import { collection, addDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';
import { db, storage } from '../services/firebase';
import { useAuth } from '../context/AuthContext';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const POST_TYPE_KEYS = ['text', 'image', 'poll', 'confession'];

const CreatePostScreen = ({ navigation, route }) => {
  const { colors, isDark } = useTheme();
  const [text, setText] = useState('');
  const [image, setImage] = useState(null);
  const [selectedCommunity, setSelectedCommunity] = useState(null);
  const [loading, setLoading] = useState(false);
  const [communities, setCommunities] = useState([]);
  const [postType, setPostType] = useState('text');
  const [pollOptions, setPollOptions] = useState(['', '']);
  const { user } = useAuth();

  const isConfession = postType === 'confession';
  const isPoll = postType === 'poll';
  const isImage = postType === 'image';

  // Pre-select community if coming from CommunityFeedScreen
  React.useEffect(() => {
    if (route.params?.communityId && route.params?.communityName) {
      setSelectedCommunity({ id: route.params.communityId, name: route.params.communityName });
    }
  }, [route.params]);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });
    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const addPollOption = () => {
    if (pollOptions.length < 6) {
      setPollOptions([...pollOptions, '']);
    }
  };

  const removePollOption = (index) => {
    if (pollOptions.length > 2) {
      setPollOptions(pollOptions.filter((_, i) => i !== index));
    }
  };

  const updatePollOption = (index, value) => {
    const updated = [...pollOptions];
    updated[index] = value;
    setPollOptions(updated);
  };

  const handlePost = async () => {
    if (!text.trim()) {
      Alert.alert('EMPTY', 'Write something first.');
      return;
    }
    if (!selectedCommunity) {
      Alert.alert('NO COMMUNITY', 'Select a community to post in.');
      return;
    }
    if (isPoll) {
      const validOptions = pollOptions.filter((o) => o.trim());
      if (validOptions.length < 2) {
        Alert.alert('POLL ERROR', 'Add at least 2 poll options.');
        return;
      }
    }
    setLoading(true);
    let imageUrl = null;
    try {
      if (image && (isImage || postType === 'text')) {
        const response = await fetch(image);
        const blob = await response.blob();
        const imageRef = ref(storage, `posts/${user?.uid}/${Date.now()}`);
        await uploadBytes(imageRef, blob);
        imageUrl = await getDownloadURL(imageRef);
      }

      const postData = {
        text: text.trim(),
        image: imageUrl,
        communityId: selectedCommunity.id,
        communityName: selectedCommunity.name,
        userId: isConfession ? 'anonymous' : user?.uid,
        username: isConfession ? 'Anonymous' : (user?.displayName || 'anon'),
        university: isConfession ? '' : (user?.university || ''),
        postType,
        isAnonymous: isConfession,
        createdAt: serverTimestamp(),
        upvotes: 0,
        downvotes: 0,
        upvotedBy: [],
        downvotedBy: [],
        bookmarkedBy: [],
        commentsCount: 0,
      };

      if (isPoll) {
        postData.pollOptions = pollOptions
          .filter((o) => o.trim())
          .map((text) => ({ text: text.trim(), votes: 0 }));
        postData.pollVotedBy = {};
      }

      await addDoc(collection(db, 'posts'), postData);
      setLoading(false);
      Alert.alert('POSTED ✓', isConfession ? 'Your confession is live anonymously.' : 'Your post is live.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (e) {
      setLoading(false);
      Alert.alert('ERROR', 'Failed to post. Try again.');
    }
  };

  // Listen to Firestore communities collection
  useFocusEffect(
    React.useCallback(() => {
      const unsubscribe = onSnapshot(collection(db, 'communities'), (snapshot) => {
        const comms = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setCommunities(comms);
      });
      return () => unsubscribe();
    }, [])
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
          NEW{' '}
          <Text style={{ color: colors.accent }}>POST</Text>
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        {/* Post Type Selector */}
        <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>
          POST TYPE
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.typeScroll}
          contentContainerStyle={styles.typeScrollContent}
        >
          {POST_TYPE_KEYS.map((type) => {
            const config = POST_TYPES[type];
            const isActive = postType === type;
            return (
              <TouchableOpacity
                key={type}
                onPress={() => {
                  setPostType(type);
                  if (type !== 'image') setImage(null);
                  if (type !== 'poll') setPollOptions(['', '']);
                }}
                style={[
                  styles.typeChip,
                  {
                    backgroundColor: isActive ? config.color : colors.inputBg,
                    borderColor: isActive ? config.color : colors.border,
                  },
                ]}
              >
                <Ionicons
                  name={config.icon}
                  size={16}
                  color={isActive ? '#FFF' : colors.textMuted}
                />
                <Text
                  style={[
                    styles.typeChipText,
                    { color: isActive ? '#FFF' : colors.textMuted },
                  ]}
                >
                  {config.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Confession disclaimer */}
        {isConfession && (
          <View style={[styles.confessionBanner, { backgroundColor: colors.accentPink + '15', borderColor: colors.accentPink }]}>
            <Ionicons name="eye-off" size={18} color={colors.accentPink} />
            <Text style={[styles.confessionText, { color: colors.accentPink }]}>
              Your identity will be completely hidden. Post anonymously.
            </Text>
          </View>
        )}

        {/* Community Selector */}
        <Text style={[styles.sectionLabel, { color: colors.textMuted, marginTop: SPACING.md }]}>
          POST IN
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.communityScroll}
          contentContainerStyle={styles.communityScrollContent}
        >
          {communities.map((comm) => (
            <TouchableOpacity
              key={comm.id}
              onPress={() => setSelectedCommunity(comm)}
              style={[
                styles.communityChip,
                {
                  backgroundColor:
                    selectedCommunity?.id === comm.id
                      ? comm.color || colors.accent
                      : colors.inputBg,
                  borderColor: colors.border,
                },
              ]}
            >
              <Text style={styles.chipIcon}>{comm.icon}</Text>
              <Text
                style={[
                  styles.chipText,
                  {
                    color:
                      selectedCommunity?.id === comm.id
                        ? '#FFF'
                        : colors.text,
                  },
                ]}
              >
                {comm.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Text input */}
        <BrutalInput
          label={isConfession ? "What's your confession?" : isPoll ? "Poll question" : "What's on your mind?"}
          value={text}
          onChangeText={setText}
          placeholder={isConfession ? "share your secret..." : isPoll ? "ask a question..." : "type your thoughts..."}
          multiline
          numberOfLines={isPoll ? 3 : 6}
          style={{ marginTop: SPACING.md }}
        />

        {/* Poll Options */}
        {isPoll && (
          <View style={styles.pollSection}>
            <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>
              OPTIONS ({pollOptions.length}/6)
            </Text>
            {pollOptions.map((option, idx) => (
              <View key={idx} style={[styles.pollOptionRow, { borderColor: colors.border, backgroundColor: colors.inputBg }]}>
                <View style={[styles.pollOptionNum, { backgroundColor: colors.accentPurple }]}>
                  <Text style={styles.pollOptionNumText}>{idx + 1}</Text>
                </View>
                <TextInput
                  value={option}
                  onChangeText={(val) => updatePollOption(idx, val)}
                  placeholder={`Option ${idx + 1}`}
                  placeholderTextColor={colors.textMuted}
                  style={[styles.pollInput, { color: colors.text }]}
                  maxLength={80}
                />
                {pollOptions.length > 2 && (
                  <TouchableOpacity onPress={() => removePollOption(idx)} style={styles.pollRemoveBtn}>
                    <Ionicons name="close-circle" size={20} color={colors.danger} />
                  </TouchableOpacity>
                )}
              </View>
            ))}
            {pollOptions.length < 6 && (
              <TouchableOpacity
                onPress={addPollOption}
                style={[styles.addOptionBtn, { borderColor: colors.accentPurple }]}
              >
                <Ionicons name="add-circle-outline" size={18} color={colors.accentPurple} />
                <Text style={[styles.addOptionText, { color: colors.accentPurple }]}>
                  ADD OPTION
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Image (only for image/text types) */}
        {(isImage || postType === 'text') && (
          <>
            {image ? (
              <View style={[styles.imagePreview, { borderColor: colors.border }]}>
                <Image source={{ uri: image }} style={styles.previewImg} />
                <TouchableOpacity
                  onPress={() => setImage(null)}
                  style={[styles.removeBtn, { backgroundColor: colors.danger }]}
                >
                  <Ionicons name="close" size={18} color="#FFF" />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                onPress={pickImage}
                style={[
                  styles.addImageBtn,
                  { borderColor: colors.border, backgroundColor: colors.inputBg },
                ]}
              >
                <Ionicons name="image-outline" size={28} color={colors.textMuted} />
                <Text style={[styles.addImageText, { color: colors.textMuted }]}>
                  {isImage ? 'ADD IMAGE (REQUIRED)' : 'ADD IMAGE (OPTIONAL)'}
                </Text>
              </TouchableOpacity>
            )}
          </>
        )}

        {/* Post button */}
        <BrutalButton
          title={isConfession ? 'Confess Anonymously →' : isPoll ? 'Create Poll →' : 'Post It →'}
          onPress={handlePost}
          loading={loading}
          variant="accent"
          style={{ marginTop: SPACING.lg }}
        />

        {/* Info */}
        <Text style={[styles.disclaimer, { color: colors.textMuted }]}>
          {isConfession
            ? '🔒 posting anonymously · your identity is hidden'
            : `posting as ${user?.displayName || 'anonymous'}`}
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
    paddingBottom: 120,
  },
  sectionLabel: {
    fontSize: FONTS.tinySize,
    fontWeight: FONTS.black,
    letterSpacing: 2,
    marginBottom: SPACING.sm,
  },

  // Post type selector
  typeScroll: {
    marginBottom: SPACING.sm,
  },
  typeScrollContent: {
    gap: SPACING.sm,
  },
  typeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2.5,
    borderRadius: RADIUS.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 2,
    gap: 6,
  },
  typeChipText: {
    fontSize: FONTS.tinySize,
    fontWeight: FONTS.black,
    letterSpacing: 1.5,
  },

  // Confession banner
  confessionBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: RADIUS.sm,
    padding: SPACING.md,
    marginTop: SPACING.sm,
    gap: SPACING.sm,
  },
  confessionText: {
    flex: 1,
    fontSize: FONTS.captionSize,
    fontWeight: FONTS.semiBold,
    lineHeight: 18,
  },

  // Community selector
  communityScroll: {
    marginBottom: SPACING.sm,
  },
  communityScrollContent: {
    gap: SPACING.sm,
  },
  communityChip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2.5,
    borderRadius: RADIUS.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    gap: 6,
  },
  chipIcon: {
    fontSize: 16,
  },
  chipText: {
    fontSize: FONTS.captionSize,
    fontWeight: FONTS.black,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // Poll options
  pollSection: {
    marginTop: SPACING.md,
  },
  pollOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderRadius: RADIUS.sm,
    marginBottom: SPACING.sm,
    overflow: 'hidden',
  },
  pollOptionNum: {
    width: 32,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.sm + 4,
  },
  pollOptionNumText: {
    color: '#FFF',
    fontSize: FONTS.captionSize,
    fontWeight: FONTS.black,
  },
  pollInput: {
    flex: 1,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 2,
    fontSize: FONTS.bodySize,
  },
  pollRemoveBtn: {
    paddingHorizontal: SPACING.sm,
  },
  addOptionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: RADIUS.sm,
    paddingVertical: SPACING.sm + 2,
    gap: 6,
  },
  addOptionText: {
    fontSize: FONTS.tinySize,
    fontWeight: FONTS.black,
    letterSpacing: 1.5,
  },

  // Image
  imagePreview: {
    borderWidth: 2.5,
    borderRadius: RADIUS.sm,
    overflow: 'hidden',
    marginTop: SPACING.sm,
    position: 'relative',
  },
  previewImg: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  removeBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addImageBtn: {
    borderWidth: 2.5,
    borderStyle: 'dashed',
    borderRadius: RADIUS.sm,
    padding: SPACING.lg,
    alignItems: 'center',
    marginTop: SPACING.sm,
    gap: SPACING.xs,
  },
  addImageText: {
    fontSize: FONTS.tinySize,
    fontWeight: FONTS.black,
    letterSpacing: 2,
  },
  disclaimer: {
    fontSize: FONTS.tinySize,
    textAlign: 'center',
    marginTop: SPACING.lg,
    textTransform: 'lowercase',
    letterSpacing: 1,
  },
});

export default CreatePostScreen;

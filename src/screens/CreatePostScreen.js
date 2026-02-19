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
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '../context/ThemeContext';
import { FONTS, SPACING, RADIUS } from '../theme';
import BrutalButton from '../components/BrutalButton';
import BrutalInput from '../components/BrutalInput';
import { useFocusEffect } from '@react-navigation/native';
import { collection, addDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';
import { db, storage } from '../services/firebase';
import { useAuth } from '../context/AuthContext';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const CreatePostScreen = ({ navigation }) => {
  const { colors, isDark } = useTheme();
  const [text, setText] = useState('');
  const [image, setImage] = useState(null);
  const [selectedCommunity, setSelectedCommunity] = useState(null);
  const [loading, setLoading] = useState(false);
  const [communities, setCommunities] = useState([]);
  const { user } = useAuth();

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });
    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
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
    setLoading(true);
    let imageUrl = null;
    try {
      if (image) {
        // Upload image to Firebase Storage
        const response = await fetch(image);
        const blob = await response.blob();
        const imageRef = ref(storage, `posts/${user?.uid}/${Date.now()}`);
        await uploadBytes(imageRef, blob);
        imageUrl = await getDownloadURL(imageRef);
      }
      await addDoc(collection(db, 'posts'), {
        text: text.trim(),
        image: imageUrl,
        communityId: selectedCommunity.id,
        userId: user?.uid,
        username: user?.displayName || 'anon',
        university: user?.university || '',
        createdAt: serverTimestamp(),
        likes: [],
        commentsCount: 0,
      });
      setLoading(false);
      Alert.alert('POSTED ✓', 'Your post is live.', [
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
        <Text style={[styles.headerSmall, { color: colors.textMuted }]}>
          say something
        </Text>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          NEW{' '}
          <Text style={{ color: colors.accent }}>POST</Text>
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        {/* Community Selector */}
        <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>
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
          label="What's on your mind?"
          value={text}
          onChangeText={setText}
          placeholder="type your thoughts anonymously..."
          multiline
          numberOfLines={6}
          style={{ marginTop: SPACING.md }}
        />

        {/* Image */}
        {image ? (
          <View style={[styles.imagePreview, { borderColor: colors.border }]}>
            <Image source={{ uri: image }} style={styles.previewImg} />
            <TouchableOpacity
              onPress={() => setImage(null)}
              style={[styles.removeBtn, { backgroundColor: colors.danger }]}
            >
              <Text style={styles.removeText}>✕</Text>
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
            <Text style={[styles.addImageIcon, { color: colors.textMuted }]}>
              🖼
            </Text>
            <Text style={[styles.addImageText, { color: colors.textMuted }]}>
              ADD IMAGE
            </Text>
          </TouchableOpacity>
        )}

        {/* Post button */}
        <BrutalButton
          title="Post It →"
          onPress={handlePost}
          loading={loading}
          variant="accent"
          style={{ marginTop: SPACING.lg }}
        />

        {/* Info */}
        <Text style={[styles.disclaimer, { color: colors.textMuted }]}>
          posting as anonymous · your identity is hidden
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
    paddingHorizontal: SPACING.md,
    paddingTop: 56,
    paddingBottom: SPACING.md,
    borderBottomWidth: 2.5,
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
    borderRadius: RADIUS.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '900',
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
  addImageIcon: {
    fontSize: 28,
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

import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, StatusBar } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { FONTS, SPACING, RADIUS } from '../theme';
import BrutalButton from '../components/BrutalButton';
import { db } from '../services/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';

const CreateCommunityScreen = ({ navigation }) => {
  const { colors, isDark } = useTheme();
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) {
      Alert.alert('Name required', 'Please enter a community name.');
      return;
    }
    setLoading(true);
    try {
      await addDoc(collection(db, 'communities'), {
        name: name.trim(),
        description: description.trim(),
        createdBy: user?.uid,
        createdAt: serverTimestamp(),
        members: [user?.uid],
      });
      setLoading(false);
      Alert.alert('Success', 'Community created!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (e) {
      setLoading(false);
      Alert.alert('Error', 'Failed to create community.');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}> 
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.bg} />
      <Text style={[styles.header, { color: colors.text }]}>Create Community</Text>
      <TextInput
        style={[styles.input, { color: colors.text, backgroundColor: colors.inputBg, borderColor: colors.border }]}
        placeholder="Community Name"
        placeholderTextColor={colors.textMuted}
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={[styles.input, { color: colors.text, backgroundColor: colors.inputBg, borderColor: colors.border, height: 80 }]}
        placeholder="Description (optional)"
        placeholderTextColor={colors.textMuted}
        value={description}
        onChangeText={setDescription}
        multiline
      />
      <BrutalButton
        title={loading ? 'Creating...' : 'Create'}
        onPress={handleCreate}
        loading={loading}
        variant="accent"
        style={{ marginTop: SPACING.md }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    fontSize: FONTS.headingSize,
    fontWeight: FONTS.black,
    marginBottom: SPACING.lg,
    textAlign: 'center',
  },
  input: {
    borderWidth: 2,
    borderRadius: RADIUS.md,
    padding: 14,
    fontSize: 16,
    marginBottom: SPACING.md,
  },
});

export default CreateCommunityScreen;

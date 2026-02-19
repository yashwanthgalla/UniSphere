import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { FONTS, SPACING, RADIUS } from '../theme';

const BrutalDropdown = ({ label, value, options, onSelect }) => {
  const [open, setOpen] = React.useState(false);

  return (
    <View style={{ marginBottom: SPACING.md }}>
      <Text style={[styles.label]}>{label}</Text>
      <TouchableOpacity
        style={styles.input}
        onPress={() => setOpen((o) => !o)}
        activeOpacity={0.8}
      >
        <Text style={styles.value}>{value || 'Select...'}</Text>
      </TouchableOpacity>
      {open && (
        <View style={styles.dropdown}>
          <FlatList
            data={options}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.option}
                onPress={() => {
                  onSelect(item);
                  setOpen(false);
                }}
              >
                <Text style={styles.optionText}>{item}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  label: {
    fontFamily: FONTS.bold,
    fontSize: 14,
    marginBottom: 4,
  },
  input: {
    borderWidth: 2,
    borderRadius: RADIUS.md,
    padding: 12,
    backgroundColor: '#fff',
    borderColor: '#222',
  },
  value: {
    fontFamily: FONTS.regular,
    fontSize: 16,
    color: '#222',
  },
  dropdown: {
    borderWidth: 2,
    borderColor: '#222',
    borderRadius: RADIUS.md,
    backgroundColor: '#fff',
    maxHeight: 200,
    marginTop: 4,
    zIndex: 10,
  },
  option: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  optionText: {
    fontFamily: FONTS.regular,
    fontSize: 16,
    color: '#222',
  },
});

export default BrutalDropdown;

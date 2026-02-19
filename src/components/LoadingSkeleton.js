import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { SPACING, RADIUS } from '../theme';

const SkeletonPulse = ({ style }) => {
  const { colors } = useTheme();
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, []);

  return (
    <Animated.View
      style={[
        { backgroundColor: colors.skeleton, opacity, borderRadius: RADIUS.sm },
        style,
      ]}
    />
  );
};

const LoadingSkeleton = ({ count = 3 }) => {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      {Array.from({ length: count }).map((_, i) => (
        <View
          key={i}
          style={[
            styles.card,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <View style={styles.header}>
            <SkeletonPulse style={styles.avatarSkeleton} />
            <View style={styles.headerLines}>
              <SkeletonPulse style={styles.nameSkeleton} />
              <SkeletonPulse style={styles.tagSkeleton} />
            </View>
          </View>
          <SkeletonPulse style={styles.line1} />
          <SkeletonPulse style={styles.line2} />
          <SkeletonPulse style={styles.line3} />
          <View style={styles.actionsRow}>
            <SkeletonPulse style={styles.actionSkeleton} />
            <SkeletonPulse style={styles.actionSkeleton} />
          </View>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: SPACING.md,
  },
  card: {
    borderWidth: 2.5,
    borderRadius: RADIUS.sm,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  avatarSkeleton: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.sm,
  },
  headerLines: {
    marginLeft: SPACING.sm,
    flex: 1,
  },
  nameSkeleton: {
    width: '60%',
    height: 14,
    marginBottom: 6,
  },
  tagSkeleton: {
    width: '30%',
    height: 10,
  },
  line1: { width: '100%', height: 12, marginBottom: 8 },
  line2: { width: '85%', height: 12, marginBottom: 8 },
  line3: { width: '50%', height: 12, marginBottom: SPACING.md },
  actionsRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  actionSkeleton: {
    width: 60,
    height: 24,
  },
});

export default LoadingSkeleton;

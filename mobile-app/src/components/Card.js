import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, borderRadius, shadows, spacing } from '../theme';

export const Card = ({ children, style, elevated = false }) => {
  return (
    <View style={[styles.cardWrapper, elevated && styles.elevated, style]}>
      <LinearGradient
        colors={['rgba(74, 124, 44, 0)', 'rgba(135, 168, 120, 0)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.topAccent}
      />
      <View style={styles.cardContent}>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardWrapper: {
    backgroundColor: colors.white,
    borderRadius: 24,
    ...shadows.md,
    borderWidth: 1.5,
    borderColor: 'rgba(135, 168, 120, 0.2)',
    overflow: 'hidden',
  },
  elevated: {
    ...shadows.lg,
    borderColor: 'rgba(135, 168, 120, 0.3)',
  },
  topAccent: {
    height: 4,
    width: '100%',
    opacity: 0.5,
  },
  cardContent: {
    padding: spacing.xl,
  },
});

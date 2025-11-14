import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Button } from '../components';
import { colors, spacing, shadows } from '../theme';
import { useTranslation } from 'react-i18next';

const { width, height } = Dimensions.get('window');

export default function LandingScreen({ navigation }) {
  const { t } = useTranslation();

  return (
    <LinearGradient
      colors={[colors.leafLight, colors.forest]}
      style={styles.container}
    >
      <View style={styles.content}>
        {/* Logo/Icon */}
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>🌱</Text>
        </View>

        {/* Title */}
        <Text style={styles.title}>ReNova</Text>
        <Text style={styles.tagline}>{t('tagline')}</Text>

        {/* Features */}
        <View style={styles.features}>
          <Text style={styles.feature}>🎯 Smart Scanning</Text>
          <Text style={styles.feature}>🪙 Earn Tokens</Text>
          <Text style={styles.feature}>🌍 Save Planet</Text>
        </View>
      </View>

      {/* Get Started Button */}
      <View style={styles.footer}>
        <Button
          title={t('getStarted')}
          onPress={() => navigation.replace('Home')}
          variant="secondary"
          style={styles.button}
        />
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  iconContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xxl,
    ...shadows.xl,
  },
  icon: {
    fontSize: 72,
  },
  title: {
    fontSize: 56,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: spacing.md,
    letterSpacing: 1,
  },
  tagline: {
    fontSize: 20,
    color: colors.white,
    opacity: 0.95,
    textAlign: 'center',
    marginBottom: spacing.xxl,
    lineHeight: 28,
    fontWeight: '500',
  },
  features: {
    alignItems: 'center',
    gap: spacing.lg,
  },
  feature: {
    fontSize: 18,
    color: colors.white,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  footer: {
    padding: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  button: {
    width: '100%',
  },
});

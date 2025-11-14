import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Button } from '../components';
import { colors, spacing } from '../theme';
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
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  icon: {
    fontSize: 64,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: spacing.sm,
  },
  tagline: {
    fontSize: 18,
    color: colors.white,
    opacity: 0.9,
    textAlign: 'center',
    marginBottom: spacing.xxl,
  },
  features: {
    alignItems: 'center',
    gap: spacing.md,
  },
  feature: {
    fontSize: 16,
    color: colors.white,
    fontWeight: '600',
  },
  footer: {
    padding: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  button: {
    width: '100%',
  },
});

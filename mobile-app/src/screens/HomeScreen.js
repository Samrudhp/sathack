import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Card } from '../components';
import { colors, spacing, borderRadius, shadows } from '../theme';
import { useUserStore } from '../store';
import { useTranslation } from 'react-i18next';

const { width } = Dimensions.get('window');

export default function HomeScreen({ navigation }) {
  const { user, language, setLanguage } = useUserStore();
  const { t } = useTranslation();

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.logo}>ReNova</Text>
          <Text style={styles.subtitle}>{t('tagline2')}</Text>
        </View>
        
        {/* Language Toggle */}
        <View style={styles.languageToggle}>
          <TouchableOpacity
            style={[
              styles.langButton,
              language === 'en' && styles.langButtonActive
            ]}
            onPress={() => setLanguage('en')}
          >
            <Text style={[
              styles.langText,
              language === 'en' && styles.langTextActive
            ]}>EN</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.langButton,
              language === 'hi' && styles.langButtonActive
            ]}
            onPress={() => setLanguage('hi')}
          >
            <Text style={[
              styles.langText,
              language === 'hi' && styles.langTextActive
            ]}>हि</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Hero Section */}
      <LinearGradient
        colors={[colors.sageLight + '40', colors.sage + '20']}
        style={styles.hero}
      >
        <View style={styles.userBadge}>
          <Text style={styles.userInitial}>{user?.name?.charAt(0) || '🌱'}</Text>
        </View>
        <Text style={styles.greeting}>{t('greeting', { name: user?.name })}</Text>
        <Text style={styles.heroText}>{t('tagline2')}</Text>
        
        <View style={styles.badges}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>🎯 {t('scanWaste')}</Text>
          </View>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>🪙 {t('tokensEarned')}</Text>
          </View>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>🌍 {t('yourImpact')}</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Main Actions */}
      <View style={styles.actions}>
        {/* Scan - Large */}
        <TouchableOpacity
          style={[styles.actionCard, styles.actionCardLarge]}
          onPress={() => navigation.navigate('Scan')}
        >
          <LinearGradient
            colors={[colors.leafLight, colors.forest]}
            style={styles.actionGradient}
          >
            <View style={styles.actionIcon}>
              <Text style={styles.actionIconText}>📸</Text>
            </View>
            <Text style={styles.actionTitle}>{t('scanWaste')}</Text>
            <Text style={styles.actionDesc}>{t('scanDesc')}</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Voice & Map */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('Voice')}
          >
            <LinearGradient
              colors={[colors.warning, colors.danger]}
              style={styles.actionGradient}
            >
              <Text style={styles.actionIconSmall}>🎤</Text>
              <Text style={styles.actionTitleSmall}>{t('voiceQuery')}</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('Map')}
          >
            <LinearGradient
              colors={[colors.sage, colors.moss]}
              style={styles.actionGradient}
            >
              <Text style={styles.actionIconSmall}>📍</Text>
              <Text style={styles.actionTitleSmall}>{t('findRecyclers')}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Impact & Profile */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('Impact')}
          >
            <LinearGradient
              colors={[colors.sky, colors.earth]}
              style={styles.actionGradient}
            >
              <Text style={styles.actionIconSmall}>🌍</Text>
              <Text style={styles.actionTitleSmall}>{t('yourImpact')}</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('Profile')}
          >
            <LinearGradient
              colors={[colors.leafLight, colors.forest]}
              style={styles.actionGradient}
            >
              <Text style={styles.actionIconSmall}>👤</Text>
              <Text style={styles.actionTitleSmall}>{t('profile')}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>

      {/* How It Works */}
      <Card style={styles.howItWorks}>
        <Text style={styles.sectionTitle}>{t('howItWorks')}</Text>
        <View style={styles.steps}>
          {[
            { num: '1', text: t('step1'), icon: '📸' },
            { num: '2', text: t('step2'), icon: '🤖' },
            { num: '3', text: t('step3'), icon: '📝' },
            { num: '4', text: t('step4'), icon: '📍' },
            { num: '5', text: t('step5'), icon: '🪙' }
          ].map((step, i) => (
            <View key={i} style={styles.step}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>{step.num}</Text>
              </View>
              <Text style={styles.stepText}>{step.text}</Text>
            </View>
          ))}
        </View>
      </Card>

      <View style={{ height: spacing.xl }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.cream,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: spacing.lg,
    paddingTop: spacing.xxl,
  },
  logo: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.forest,
  },
  subtitle: {
    fontSize: 14,
    color: colors.moss,
    marginTop: spacing.xs,
  },
  languageToggle: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: borderRadius.round,
    padding: 4,
    ...shadows.sm,
  },
  langButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: borderRadius.round,
  },
  langButtonActive: {
    backgroundColor: colors.forest,
  },
  langText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.forest,
  },
  langTextActive: {
    color: colors.white,
  },
  hero: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.xl,
    padding: spacing.xl,
    borderRadius: 24,
    ...shadows.lg,
  },
  userBadge: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: colors.forest,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
    ...shadows.md,
  },
  userInitial: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.white,
  },
  greeting: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.forest,
    marginBottom: spacing.sm,
    lineHeight: 38,
  },
  heroText: {
    fontSize: 16,
    color: colors.moss,
    marginBottom: spacing.xl,
    lineHeight: 22,
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  badge: {
    backgroundColor: 'rgba(74, 124, 44, 0.12)',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: 'rgba(74, 124, 44, 0.25)',
  },
  badgeText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.forest,
  },
  actions: {
    paddingHorizontal: spacing.lg,
  },
  actionCard: {
    flex: 1,
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: spacing.md,
    ...shadows.lg,
  },
  actionCardLarge: {
    height: 200,
    marginBottom: spacing.lg,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  actionGradient: {
    flex: 1,
    height: '100%',
    padding: spacing.xl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionIcon: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  actionIconText: {
    fontSize: 36,
  },
  actionIconSmall: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  actionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  actionTitleSmall: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.white,
    textAlign: 'center',
  },
  actionDesc: {
    fontSize: 14,
    color: colors.white,
    opacity: 0.95,
    textAlign: 'center',
    lineHeight: 20,
  },
  howItWorks: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    marginTop: spacing.md,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.forest,
    marginBottom: spacing.xl,
    textAlign: 'center',
  },
  steps: {
    gap: spacing.lg,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    paddingVertical: spacing.sm,
  },
  stepNumber: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.forest,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.md,
  },
  stepNumberText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.white,
  },
  stepText: {
    flex: 1,
    fontSize: 15,
    color: colors.moss,
    lineHeight: 22,
    fontWeight: '500',
  },
});

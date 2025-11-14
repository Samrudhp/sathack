import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Card, Button } from '../components';
import { colors, spacing, borderRadius } from '../theme';
import { useUserStore } from '../store';
import { getTokenBalance } from '../services/api';
import { useTranslation } from 'react-i18next';

export default function ProfileScreen({ navigation }) {
  const { t } = useTranslation();
  const { user, userId, language, setLanguage, logout } = useUserStore();
  const [tokens, setTokens] = useState(null);

  useEffect(() => {
    loadTokens();
  }, []);

  const loadTokens = async () => {
    try {
      const data = await getTokenBalance(userId);
      setTokens(data);
    } catch (err) {
      console.error('Failed to load tokens:', err);
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backText}>← {t('back')}</Text>
      </TouchableOpacity>

      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user?.name?.charAt(0) || '🌱'}</Text>
        </View>
        <Text style={styles.name}>{user?.name}</Text>
        <Text style={styles.phone}>{user?.phone}</Text>
      </View>

      {/* Token Wallet */}
      <LinearGradient colors={[colors.forest, colors.leafLight]} style={styles.tokenCard}>
        <Text style={styles.tokenTitle}>🪙 {t('tokenWallet')}</Text>
        <Text style={styles.tokenValue}>{tokens?.balance || 0}</Text>
        <Text style={styles.tokenLabel}>{t('availableTokens')}</Text>
      </LinearGradient>

      {/* Settings */}
      <Card style={styles.settingsCard}>
        <Text style={styles.sectionTitle}>{t('settings')}</Text>
        
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>{t('language')}</Text>
          <View style={styles.languageToggle}>
            <TouchableOpacity
              style={[styles.langButton, language === 'en' && styles.langButtonActive]}
              onPress={() => setLanguage('en')}
            >
              <Text style={[styles.langText, language === 'en' && styles.langTextActive]}>EN</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.langButton, language === 'hi' && styles.langButtonActive]}
              onPress={() => setLanguage('hi')}
            >
              <Text style={[styles.langText, language === 'hi' && styles.langTextActive]}>हि</Text>
            </TouchableOpacity>
          </View>
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
    padding: spacing.lg,
    paddingTop: spacing.xxl,
  },
  backButton: {
    marginBottom: spacing.lg,
  },
  backText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.forest,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.forest,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  avatarText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: colors.white,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.forest,
    marginBottom: spacing.xs,
  },
  phone: {
    fontSize: 14,
    color: colors.moss,
  },
  tokenCard: {
    padding: spacing.xl,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  tokenTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
    marginBottom: spacing.sm,
  },
  tokenValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: spacing.xs,
  },
  tokenLabel: {
    fontSize: 12,
    color: colors.white,
    opacity: 0.9,
  },
  settingsCard: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.forest,
    marginBottom: spacing.lg,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingLabel: {
    fontSize: 16,
    color: colors.forest,
  },
  languageToggle: {
    flexDirection: 'row',
    backgroundColor: colors.sand,
    borderRadius: borderRadius.round,
    padding: 4,
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
});

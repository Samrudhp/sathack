import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Card, Button } from '../components';
import { colors, spacing, borderRadius, shadows } from '../theme';
import { useUserStore } from '../store';
import { useTranslation } from 'react-i18next';
import axios from 'axios';

const API_BASE = 'http://172.16.16.114:8000/api';

export default function ProfileScreen({ navigation }) {
  const { t } = useTranslation();
  const { user, userId, language, setLanguage, logout } = useUserStore();
  const [stats, setStats] = useState(null);
  const [redeemCode, setRedeemCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const response = await axios.get(`${API_BASE}/user/stats/${userId}`);
      setStats(response.data);
    } catch (err) {
      console.error('Failed to load stats:', err);
      setStats({
        total_scans: 0,
        tokens_earned: 0,
        tokens_balance: 0,
        total_co2_saved_kg: 0,
        total_water_saved_liters: 0,
        total_landfill_saved_kg: 0
      });
    }
  };

  const handleRedeem = async () => {
    if (!redeemCode || redeemCode.length !== 6) {
      Alert.alert('Error', 'Please enter a valid 6-character code');
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const formData = new FormData();
      formData.append('user_id', userId);
      formData.append('code', redeemCode.toUpperCase());

      const response = await axios.post(`${API_BASE}/user/redeem`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      Alert.alert(
        'Success!',
        `You earned ${response.data.tokens_awarded} tokens!`,
        [{ text: 'OK', onPress: () => {
          setRedeemCode('');
          loadStats();
        }}]
      );
    } catch (error) {
      Alert.alert('Error', error.response?.data?.detail || 'Failed to redeem code');
    } finally {
      setLoading(false);
    }
  };

  if (!stats) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

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

      {/* Total Impact */}
      <LinearGradient colors={[colors.sageLight, colors.sage]} style={styles.impactCard}>
        <Text style={styles.impactTitle}>🌍 Total Impact</Text>
        <View style={styles.impactGrid}>
          <View style={styles.impactItem}>
            <Text style={styles.impactValue}>{stats.total_co2_saved_kg.toFixed(1)}</Text>
            <Text style={styles.impactLabel}>kg CO₂</Text>
          </View>
          <View style={styles.impactItem}>
            <Text style={styles.impactValue}>{stats.total_water_saved_liters.toFixed(0)}</Text>
            <Text style={styles.impactLabel}>Liters Water</Text>
          </View>
          <View style={styles.impactItem}>
            <Text style={styles.impactValue}>{stats.total_landfill_saved_kg.toFixed(1)}</Text>
            <Text style={styles.impactLabel}>kg Landfill</Text>
          </View>
        </View>
        
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{stats.total_scans}</Text>
            <Text style={styles.statLabel}>Total Scans</Text>
          </View>
          <View style={styles.tokenBox}>
            <Text style={styles.tokenValue}>{stats.tokens_balance}</Text>
            <Text style={styles.tokenLabel}>Tokens Available</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Redeem Code */}
      <Card style={styles.redeemCard}>
        <Text style={styles.sectionTitle}>🎫 Redeem Code</Text>
        <Text style={styles.redeemDesc}>
          Enter the 6-character code from the recycler to claim your tokens!
        </Text>
        
        <View style={styles.redeemInputContainer}>
          <TextInput
            style={styles.redeemInput}
            value={redeemCode}
            onChangeText={(text) => setRedeemCode(text.toUpperCase())}
            placeholder="ABC123"
            maxLength={6}
            autoCapitalize="characters"
            editable={!loading}
          />
          <TouchableOpacity
            style={[styles.redeemButton, loading && styles.redeemButtonDisabled]}
            onPress={handleRedeem}
            disabled={loading}
          >
            <LinearGradient
              colors={[colors.leafLight, colors.forest]}
              style={styles.redeemButtonGradient}
            >
              <Text style={styles.redeemButtonText}>{loading ? 'Redeeming...' : 'Redeem'}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </Card>

      {/* Settings */}
      <Card style={styles.settingsCard}>
        <Text style={styles.sectionTitle}>⚙️ {t('settings')}</Text>
        
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.cream,
  },
  loadingText: {
    fontSize: 18,
    color: colors.forest,
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
    marginBottom: spacing.lg,
    ...shadows.lg,
  },
  avatarText: {
    fontSize: 42,
    fontWeight: 'bold',
    color: colors.white,
  },
  name: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.forest,
    marginBottom: spacing.sm,
  },
  phone: {
    fontSize: 16,
    color: colors.moss,
    fontWeight: '500',
  },
  impactCard: {
    padding: spacing.xl,
    paddingVertical: spacing.xxl,
    borderRadius: 24,
    marginBottom: spacing.xl,
    ...shadows.lg,
  },
  impactTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: spacing.xl,
    textAlign: 'center',
  },
  impactGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
    gap: spacing.sm,
  },
  impactItem: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    padding: spacing.lg,
    borderRadius: 20,
    flex: 1,
  },
  impactValue: {
    fontSize: 26,
    fontWeight: 'bold',
    color: colors.forest,
    marginBottom: spacing.xs,
  },
  impactLabel: {
    fontSize: 12,
    color: colors.moss,
    textAlign: 'center',
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  statBox: {
    flex: 1,
    padding: spacing.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'rgba(135, 168, 120, 0.4)',
    alignItems: 'center',
  },
  tokenBox: {
    flex: 1,
    padding: spacing.lg,
    backgroundColor: colors.forest,
    borderRadius: 20,
    alignItems: 'center',
    ...shadows.md,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.forest,
    marginBottom: spacing.xs,
  },
  statLabel: {
    fontSize: 12,
    color: colors.moss,
    fontWeight: '600',
    textAlign: 'center',
  },
  tokenValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: spacing.xs,
  },
  tokenLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '600',
    textAlign: 'center',
  },
  redeemCard: {
    marginBottom: spacing.xl,
  },
  redeemDesc: {
    fontSize: 15,
    color: colors.moss,
    marginBottom: spacing.lg,
    lineHeight: 22,
  },
  redeemInputContainer: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  redeemInput: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: colors.sand,
    backgroundColor: colors.white,
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 3,
    color: colors.forest,
    textAlign: 'center',
  },
  redeemButton: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  redeemButtonDisabled: {
    opacity: 0.6,
  },
  redeemButtonGradient: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  redeemButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  settingsCard: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.forest,
    marginBottom: spacing.xl,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingLabel: {
    fontSize: 17,
    color: colors.forest,
    fontWeight: '600',
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

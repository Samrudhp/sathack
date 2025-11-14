import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Card, Loader } from '../components';
import { colors, spacing, borderRadius, shadows } from '../theme';
import { useUserStore } from '../store';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

const API_BASE = 'http://172.16.16.114:8000/api';

export default function ImpactScreen({ navigation }) {
  const { t } = useTranslation();
  const { userId } = useUserStore();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, [userId]);

  const loadStats = async () => {
    try {
      console.log('Loading stats for user:', userId);
      const response = await axios.get(`${API_BASE}/user/stats/${userId}`);
      console.log('Impact stats:', response.data);
      setStats(response.data);
    } catch (err) {
      console.error('Failed to load impact stats:', err);
      // Set default stats on error
      setStats({
        total_scans: 0,
        tokens_earned: 0,
        tokens_balance: 0,
        total_co2_saved_kg: 0,
        total_water_saved_liters: 0,
        total_landfill_saved_kg: 0
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backText}>← {t('back')}</Text>
      </TouchableOpacity>

      <View style={styles.header}>
        <View style={styles.iconBadge}>
          <Text style={styles.icon}>🌍</Text>
        </View>
        <Text style={styles.title}>{t('yourImpactTitle')}</Text>
      </View>

      {/* Main Stats */}
      <View style={styles.mainStats}>
        <Card style={styles.statCard}>
          <LinearGradient colors={[colors.leafLight, colors.forest]} style={styles.statGradient}>
            <Text style={styles.statIcon}>📊</Text>
            <Text style={styles.statValue}>{stats?.total_scans || 0}</Text>
            <Text style={styles.statLabel}>{t('totalScans')}</Text>
          </LinearGradient>
        </Card>

        <Card style={styles.statCard}>
          <LinearGradient colors={[colors.warning, colors.danger]} style={styles.statGradient}>
            <Text style={styles.statIcon}>🪙</Text>
            <Text style={styles.statValue}>{stats?.tokens_balance || 0}</Text>
            <Text style={styles.statLabel}>{t('tokensEarned')}</Text>
          </LinearGradient>
        </Card>
      </View>

      {/* Environmental Impact */}
      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>🌿 {t('envImpact')}</Text>
        <View style={styles.impactGrid}>
          <View style={styles.impactItem}>
            <Text style={styles.impactIcon}>☁️</Text>
            <Text style={styles.impactValue}>{(stats?.total_co2_saved_kg || 0).toFixed(2)}</Text>
            <Text style={styles.impactUnit}>kg CO₂</Text>
          </View>
          <View style={styles.impactItem}>
            <Text style={styles.impactIcon}>💧</Text>
            <Text style={styles.impactValue}>{(stats?.total_water_saved_liters || 0).toFixed(2)}</Text>
            <Text style={styles.impactUnit}>liters</Text>
          </View>
          <View style={styles.impactItem}>
            <Text style={styles.impactIcon}>🗑️</Text>
            <Text style={styles.impactValue}>{(stats?.total_landfill_saved_kg || 0).toFixed(2)}</Text>
            <Text style={styles.impactUnit}>kg</Text>
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
  iconBadge: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: colors.sky,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
    ...shadows.lg,
  },
  icon: {
    fontSize: 48,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.forest,
    lineHeight: 38,
  },
  mainStats: {
    flexDirection: 'row',
    gap: spacing.lg,
    marginBottom: spacing.xl,
  },
  statCard: {
    flex: 1,
    padding: 0,
    overflow: 'hidden',
    borderRadius: 24,
  },
  statGradient: {
    padding: spacing.xl,
    paddingVertical: spacing.xxl + spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    height: 160,
  },
  statIcon: {
    fontSize: 40,
    marginBottom: spacing.md,
  },
  statValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: spacing.sm,
  },
  statLabel: {
    fontSize: 13,
    color: colors.white,
    textAlign: 'center',
    fontWeight: '600',
  },
  card: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.forest,
    marginBottom: spacing.xl,
  },
  impactGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  impactItem: {
    alignItems: 'center',
    flex: 1,
  },
  impactIcon: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  impactValue: {
    fontSize: 26,
    fontWeight: 'bold',
    color: colors.forest,
    marginBottom: spacing.sm,
  },
  impactUnit: {
    fontSize: 12,
    color: colors.moss,
    textAlign: 'center',
  },
});

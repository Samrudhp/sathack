import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Card, Loader } from '../components';
import { colors, spacing, borderRadius } from '../theme';
import { useUserStore } from '../store';
import { getImpactStats } from '../services/api';
import { useTranslation } from 'react-i18next';

export default function ImpactScreen({ navigation }) {
  const { t } = useTranslation();
  const { userId } = useUserStore();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const data = await getImpactStats(userId, 'user', 'all_time');
      setStats(data);
    } catch (err) {
      console.error('Failed to load impact stats:', err);
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
            <Text style={styles.statValue}>{stats?.total_tokens || 0}</Text>
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
            <Text style={styles.impactValue}>{(stats?.co2_saved || 0).toFixed(2)}</Text>
            <Text style={styles.impactUnit}>kg CO₂</Text>
          </View>
          <View style={styles.impactItem}>
            <Text style={styles.impactIcon}>💧</Text>
            <Text style={styles.impactValue}>{(stats?.water_saved || 0).toFixed(2)}</Text>
            <Text style={styles.impactUnit}>liters</Text>
          </View>
          <View style={styles.impactItem}>
            <Text style={styles.impactIcon}>🗑️</Text>
            <Text style={styles.impactValue}>{(stats?.landfill_saved || 0).toFixed(2)}</Text>
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
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.sky,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  icon: {
    fontSize: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.forest,
  },
  mainStats: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  statCard: {
    flex: 1,
    padding: 0,
    overflow: 'hidden',
  },
  statGradient: {
    padding: spacing.lg,
    alignItems: 'center',
  },
  statIcon: {
    fontSize: 32,
    marginBottom: spacing.sm,
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: spacing.xs,
  },
  statLabel: {
    fontSize: 12,
    color: colors.white,
    textAlign: 'center',
  },
  card: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.forest,
    marginBottom: spacing.lg,
  },
  impactGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  impactItem: {
    alignItems: 'center',
    flex: 1,
  },
  impactIcon: {
    fontSize: 40,
    marginBottom: spacing.sm,
  },
  impactValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.forest,
    marginBottom: spacing.xs,
  },
  impactUnit: {
    fontSize: 12,
    color: colors.moss,
    textAlign: 'center',
  },
});

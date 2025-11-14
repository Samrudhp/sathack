import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Card, Button } from '../components';
import { colors, spacing, borderRadius, shadows } from '../theme';
import { useScanStore, useUserStore } from '../store';
import { useTranslation } from 'react-i18next';

export default function ResultScreen({ navigation }) {
  const { t } = useTranslation();
  const { currentScan, globalDocs, personalDocs } = useScanStore();
  const { language } = useUserStore();

  if (!currentScan) {
    return (
      <View style={styles.container}>
        <Card style={styles.centerCard}>
          <Text style={styles.noDataText}>{language === 'en' ? 'No scan data found' : 'कोई स्कैन डेटा नहीं मिला'}</Text>
          <Button title={t('home')} onPress={() => navigation.navigate('Home')} />
        </Card>
      </View>
    );
  }

  const {
    material,
    raw_detection,
    confidence,
    cleanliness_score,
    hazard_class,
    disposal_instruction,
    hazard_notes,
    estimated_credits,
    environmental_impact,
    recycler_ranking,
  } = currentScan;

  const displayMaterial = raw_detection || material || 'General Waste';

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('Home')}>
        <Text style={styles.backText}>← {t('back')}</Text>
      </TouchableOpacity>

      <View style={styles.header}>
        <View style={styles.iconBadge}>
          <Text style={styles.icon}>📊</Text>
        </View>
        <Text style={styles.title}>{t('results')}</Text>
      </View>

      {/* Material Detection */}
      <Card style={styles.card}>
        <Text style={styles.materialName}>{displayMaterial}</Text>
        <View style={styles.badges}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{t('confidence')} {((confidence || 1) * 100).toFixed(1)}%</Text>
          </View>
          {cleanliness_score && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{t('cleanliness')} {cleanliness_score.toFixed(0)}%</Text>
            </View>
          )}
          <View style={[styles.badge, hazard_class && styles.hazardBadge]}>
            <Text style={[styles.badgeText, hazard_class && styles.hazardText]}>
              {t('hazard')} {hazard_class || t('none')}
            </Text>
          </View>
        </View>
      </Card>

      {/* Hazard Warning */}
      {hazard_class === 'hazardous' && hazard_notes && (
        <LinearGradient colors={[colors.danger, colors.warning]} style={styles.hazardCard}>
          <Text style={styles.hazardTitle}>⚠️ {t('hazardWarning')}</Text>
          <Text style={styles.hazardText}>{hazard_notes}</Text>
        </LinearGradient>
      )}

      {/* Disposal Instructions */}
      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>♻️ {t('disposalInstructions')}</Text>
        <Text style={styles.instructions}>{disposal_instruction}</Text>
      </Card>

      {/* Environmental Impact */}
      {environmental_impact && (
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>🌿 {t('envImpact')}</Text>
          <View style={styles.impactGrid}>
            <View style={styles.impactItem}>
              <Text style={styles.impactIcon}>☁️</Text>
              <Text style={styles.impactLabel}>{t('co2Saved')}</Text>
              <Text style={styles.impactValue}>{(environmental_impact.co2_saved_kg || 0).toFixed(2)} kg</Text>
            </View>
            <View style={styles.impactItem}>
              <Text style={styles.impactIcon}>💧</Text>
              <Text style={styles.impactLabel}>{t('waterSaved')}</Text>
              <Text style={styles.impactValue}>{(environmental_impact.water_saved_liters || 0).toFixed(2)} L</Text>
            </View>
            <View style={styles.impactItem}>
              <Text style={styles.impactIcon}>🗑️</Text>
              <Text style={styles.impactLabel}>{t('landfillSaved')}</Text>
              <Text style={styles.impactValue}>{(environmental_impact.landfill_saved_kg || 0).toFixed(2)} kg</Text>
            </View>
          </View>
        </Card>
      )}

      {/* Estimated Credits */}
      <LinearGradient colors={[colors.forest, colors.leafLight]} style={styles.creditsCard}>
        <Text style={styles.creditsTitle}>🪙 {t('estimatedCredits')}</Text>
        <Text style={styles.creditsValue}>{estimated_credits || 0}</Text>
        <Text style={styles.creditsNote}>{t('tokensAdded')}</Text>
      </LinearGradient>

      {/* Nearby Recyclers */}
      {recycler_ranking?.length > 0 && (
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>📍 {t('nearbyRecyclers')}</Text>
          {recycler_ranking.slice(0, 3).map((recycler, i) => (
            <View key={i} style={styles.recyclerItem}>
              <Text style={styles.recyclerName}>{recycler.name}</Text>
              <Text style={styles.recyclerAddress}>{recycler.address}</Text>
              <View style={styles.recyclerBadges}>
                <Text style={styles.recyclerBadge}>📏 {recycler.distance_km?.toFixed(1)} km</Text>
                <Text style={styles.recyclerBadge}>⏱️ ~{recycler.estimated_travel_time_min?.toFixed(0)} min</Text>
              </View>
            </View>
          ))}
          <Button title="🗺️ Show on Map" onPress={() => navigation.navigate('Map', { recyclers: recycler_ranking })} style={styles.mapButton} />
        </Card>
      )}

      {/* Actions */}
      <View style={styles.actions}>
        <Button title="📸 Scan Again" onPress={() => navigation.navigate('Scan')} variant="outline" style={styles.actionButton} />
        <Button title="🎤 Voice" onPress={() => navigation.navigate('Voice')} style={styles.actionButton} />
      </View>

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
    backgroundColor: colors.sage,
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
  card: {
    marginBottom: spacing.lg,
  },
  centerCard: {
    margin: spacing.xl,
    alignItems: 'center',
  },
  noDataText: {
    fontSize: 18,
    color: colors.forest,
    marginBottom: spacing.lg,
  },
  materialName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.forest,
    marginBottom: spacing.md,
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  badge: {
    backgroundColor: colors.sageLight + '40',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.round,
  },
  hazardBadge: {
    backgroundColor: colors.danger + '20',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.forest,
  },
  hazardText: {
    color: colors.danger,
  },
  hazardCard: {
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.lg,
  },
  hazardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: spacing.sm,
  },
  hazardText: {
    fontSize: 14,
    color: colors.white,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.forest,
    marginBottom: spacing.md,
  },
  instructions: {
    fontSize: 14,
    color: colors.moss,
    lineHeight: 20,
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
    fontSize: 32,
    marginBottom: spacing.sm,
  },
  impactLabel: {
    fontSize: 12,
    color: colors.moss,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  impactValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.forest,
  },
  creditsCard: {
    padding: spacing.xl,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  creditsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: spacing.md,
  },
  creditsValue: {
    fontSize: 40,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: spacing.sm,
  },
  creditsNote: {
    fontSize: 12,
    color: colors.white,
    opacity: 0.9,
  },
  recyclerItem: {
    padding: spacing.md,
    backgroundColor: colors.cream,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
  },
  recyclerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.forest,
    marginBottom: spacing.xs,
  },
  recyclerAddress: {
    fontSize: 12,
    color: colors.moss,
    marginBottom: spacing.sm,
  },
  recyclerBadges: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  recyclerBadge: {
    fontSize: 12,
    color: colors.forest,
  },
  mapButton: {
    marginTop: spacing.sm,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  actionButton: {
    flex: 1,
  },
});

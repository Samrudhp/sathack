import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import { Card, Loader } from '../components';
import { colors, spacing, borderRadius } from '../theme';
import { useUserStore } from '../store';
import { useGeolocation } from '../hooks/useGeolocation';
import { getRecyclersNearby } from '../services/api';
import { useTranslation } from 'react-i18next';

const { height } = Dimensions.get('window');

export default function MapScreen({ navigation, route }) {
  const { t } = useTranslation();
  const { language } = useUserStore();
  const { latitude, longitude, loading: locationLoading } = useGeolocation();
  const [recyclers, setRecyclers] = useState(route.params?.recyclers || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!route.params?.recyclers && latitude && longitude) {
      loadRecyclers();
    }
  }, [latitude, longitude]);

  const loadRecyclers = async () => {
    setLoading(true);
    try {
      const data = await getRecyclersNearby(latitude, longitude, 'Plastic', 1.0);
      setRecyclers(data.recyclers || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (locationLoading || loading) {
    return <Loader />;
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backText}>← {t('back')}</Text>
      </TouchableOpacity>

      <Text style={styles.title}>🗺️ {t('nearbyRecyclersTitle')}</Text>

      {/* Map */}
      <MapView
        style={styles.map}
        provider={PROVIDER_DEFAULT}
        initialRegion={{
          latitude: latitude || 30.34,
          longitude: longitude || 76.38,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
      >
        {/* User location */}
        {latitude && longitude && (
          <Marker
            coordinate={{ latitude, longitude }}
            title={t('yourLocation')}
            pinColor={colors.forest}
          />
        )}

        {/* Recyclers */}
        {recyclers.map((recycler, i) => {
          const lat = recycler.location?.coordinates?.[1] || recycler.location_lat;
          const lon = recycler.location?.coordinates?.[0] || recycler.location_lon;
          if (!lat || !lon) return null;

          return (
            <Marker
              key={i}
              coordinate={{ latitude: lat, longitude: lon }}
              title={recycler.name || recycler.recycler_name}
              description={`${recycler.distance_km?.toFixed(1)} km away`}
              pinColor={i === 0 ? colors.leafLight : colors.sage}
            />
          );
        })}
      </MapView>

      {/* Recycler List */}
      <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
        <Text style={styles.listTitle}>{t('recyclerList')} ({recyclers.length})</Text>
        {recyclers.length === 0 ? (
          <Card>
            <Text style={styles.noRecyclers}>{t('noRecyclers')}</Text>
          </Card>
        ) : (
          recyclers.slice(0, 10).map((recycler, i) => (
            <Card key={i} style={styles.recyclerCard}>
              <View style={styles.recyclerHeader}>
                <Text style={styles.recyclerName}>{recycler.name || recycler.recycler_name}</Text>
                {i === 0 && <View style={styles.nearestBadge}><Text style={styles.nearestText}>{t('nearest')}</Text></View>}
              </View>
              <Text style={styles.recyclerAddress}>{recycler.address}</Text>
              <View style={styles.recyclerBadges}>
                <Text style={styles.recyclerBadge}>📏 {recycler.distance_km?.toFixed(1)} km</Text>
                <Text style={styles.recyclerBadge}>⏱️ ~{recycler.estimated_travel_time_min?.toFixed(0)} min</Text>
                {recycler.rating && <Text style={styles.recyclerBadge}>⭐ {recycler.rating}/5</Text>}
              </View>
            </Card>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.cream,
  },
  backButton: {
    position: 'absolute',
    top: spacing.xxl + 10,
    left: spacing.lg,
    backgroundColor: colors.white,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.round,
    zIndex: 10,
  },
  backText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.forest,
  },
  title: {
    position: 'absolute',
    top: spacing.xxl + 10,
    alignSelf: 'center',
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.forest,
    backgroundColor: colors.white,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.round,
    zIndex: 10,
  },
  map: {
    height: height * 0.5,
  },
  list: {
    flex: 1,
    padding: spacing.lg,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.forest,
    marginBottom: spacing.md,
  },
  noRecyclers: {
    fontSize: 14,
    color: colors.moss,
    textAlign: 'center',
  },
  recyclerCard: {
    marginBottom: spacing.md,
  },
  recyclerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  recyclerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.forest,
    flex: 1,
  },
  nearestBadge: {
    backgroundColor: colors.forest,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  nearestText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: colors.white,
  },
  recyclerAddress: {
    fontSize: 12,
    color: colors.moss,
    marginBottom: spacing.sm,
  },
  recyclerBadges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  recyclerBadge: {
    fontSize: 12,
    color: colors.forest,
  },
});

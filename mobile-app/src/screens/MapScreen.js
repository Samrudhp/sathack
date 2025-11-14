import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Platform } from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import { Card, Loader } from '../components';
import { colors, spacing, borderRadius, shadows } from '../theme';
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
  const [region, setRegion] = useState(null);

  useEffect(() => {
    console.log('MapScreen mounted');
    console.log('Route params:', route.params);
    console.log('Recyclers from params:', route.params?.recyclers);
    console.log('Current location:', { latitude, longitude });
  }, []);

  useEffect(() => {
    if (latitude && longitude) {
      console.log('Setting region:', { latitude, longitude });
      setRegion({
        latitude: latitude,
        longitude: longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });
    }
  }, [latitude, longitude]);

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
      console.error('Map error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (locationLoading || loading) {
    return <Loader />;
  }

  if (!latitude || !longitude) {
    return (
      <View style={styles.container}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← {t('back')}</Text>
        </TouchableOpacity>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>📍 Location not available</Text>
          <Text style={styles.errorSubtext}>Please enable location services</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backText}>← {t('back')}</Text>
      </TouchableOpacity>

      <Text style={styles.title}>🗺️ {t('nearbyRecyclersTitle')}</Text>

      {/* Map */}
      {region && (
        <MapView
          style={styles.map}
          provider={PROVIDER_DEFAULT}
          region={region}
          onRegionChangeComplete={setRegion}
          showsUserLocation={true}
          showsMyLocationButton={true}
          showsCompass={true}
          showsScale={true}
          loadingEnabled={true}
          loadingIndicatorColor={colors.forest}
        >
          {/* User location marker */}
          <Marker
            coordinate={{ latitude, longitude }}
            title={t('yourLocation')}
            description="You are here"
            pinColor={colors.forest}
          />

          {/* Recycler markers */}
          {recyclers.map((recycler, i) => {
            const lat = recycler.location?.coordinates?.[1] || recycler.location_lat;
            const lon = recycler.location?.coordinates?.[0] || recycler.location_lon;
            
            if (!lat || !lon) {
              console.log('Skipping recycler - no coordinates:', recycler);
              return null;
            }

            console.log(`Rendering marker ${i}:`, { lat, lon, name: recycler.name });

            return (
              <Marker
                key={`recycler-${i}`}
                coordinate={{ latitude: lat, longitude: lon }}
                title={recycler.name || recycler.recycler_name || 'Recycler'}
                description={`${recycler.distance_km?.toFixed(1) || '?'} km away`}
                pinColor={i === 0 ? colors.leafLight : colors.sage}
              />
            );
          })}
        </MapView>
      )}

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
    borderRadius: 24,
    zIndex: 10,
    ...shadows.lg,
  },
  backText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.forest,
  },
  title: {
    position: 'absolute',
    top: spacing.xxl + 10,
    alignSelf: 'center',
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.forest,
    backgroundColor: colors.white,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: 24,
    zIndex: 10,
    ...shadows.lg,
  },
  map: {
    width: '100%',
    height: height * 0.5,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  errorText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.forest,
    marginBottom: spacing.md,
  },
  errorSubtext: {
    fontSize: 16,
    color: colors.moss,
  },
  list: {
    flex: 1,
    padding: spacing.lg,
  },
  listTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.forest,
    marginBottom: spacing.lg,
  },
  noRecyclers: {
    fontSize: 15,
    color: colors.moss,
    textAlign: 'center',
    lineHeight: 22,
  },
  recyclerCard: {
    marginBottom: spacing.lg,
    padding: spacing.lg,
    borderWidth: 2,
    borderColor: 'rgba(135, 168, 120, 0.2)',
  },
  recyclerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  recyclerName: {
    fontSize: 17,
    fontWeight: 'bold',
    color: colors.forest,
    flex: 1,
  },
  nearestBadge: {
    backgroundColor: colors.forest,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 16,
  },
  nearestText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: colors.white,
  },
  recyclerAddress: {
    fontSize: 14,
    color: colors.moss,
    marginBottom: spacing.md,
    lineHeight: 20,
  },
  recyclerBadges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  recyclerBadge: {
    fontSize: 13,
    color: colors.forest,
    fontWeight: '600',
  },
});

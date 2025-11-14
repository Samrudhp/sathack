import { useState, useEffect } from 'react';
import * as Location from 'expo-location';
import { useLocationStore } from '../store';

export const useGeolocation = () => {
  const { latitude, longitude, loading, error, setLocation, setError } = useLocationStore();

  useEffect(() => {
    (async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setError('Permission to access location was denied');
          // Fallback to Patiala (where recyclers are located)
          setLocation(30.34, 76.38);
          return;
        }

        let location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });
        setLocation(location.coords.latitude, location.coords.longitude);
      } catch (err) {
        console.error('Geolocation error:', err);
        // Fallback to Patiala
        setLocation(30.34, 76.38);
        setError(err.message);
      }
    })();
  }, []);

  return { latitude, longitude, loading, error };
};

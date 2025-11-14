import { useState, useEffect } from 'react';
import { useLocationStore } from './store';

export const useGeolocation = () => {
  const { latitude, longitude, loading, error, setLocation, setError } = useLocationStore();

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Geolocation not supported');
      // Fallback to Patiala (where recyclers are located)
      setLocation(30.34, 76.38);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation(position.coords.latitude, position.coords.longitude);
      },
      (error) => {
        console.error('Geolocation error:', error);
        // Fallback to Patiala (where recyclers are located)
        setLocation(30.34, 76.38);
        setError(error.message);
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
  }, []);

  return { latitude, longitude, loading, error };
};

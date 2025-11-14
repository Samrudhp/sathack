import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { persist, createJSONStorage } from 'zustand/middleware';

// User store with mock user for testing
export const useUserStore = create(
  persist(
    (set) => ({
      user: { 
        id: '691642ec8c548b95117f24c1',
        name: 'Test User',
        phone: '+919876543210'
      },
      userId: '691642ec8c548b95117f24c1',
      language: 'en',
      setUser: (user) => set({ user, userId: user?.id || '691642ec8c548b95117f24c1' }),
      setUserId: (userId) => set({ userId }),
      setLanguage: (language) => set({ language }),
      logout: () => set({ user: null, userId: null }),
    }),
    {
      name: 'user-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

// Scan results store
export const useScanStore = create((set) => ({
  currentScan: null,
  globalDocs: [],
  personalDocs: [],
  setScan: (scan, globalDocs = [], personalDocs = []) => 
    set({ currentScan: scan, globalDocs, personalDocs }),
  clearScan: () => set({ currentScan: null, globalDocs: [], personalDocs: [] }),
}));

// Location store
export const useLocationStore = create((set) => ({
  latitude: null,
  longitude: null,
  loading: true,
  error: null,
  setLocation: (lat, lon) => set({ latitude: lat, longitude: lon, loading: false }),
  setError: (error) => set({ error, loading: false }),
}));

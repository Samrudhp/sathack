import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useUserStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      setUser: (user) => set({ user }),
      setToken: (token) => {
        localStorage.setItem('token', token);
        set({ token });
      },
      logout: () => {
        localStorage.removeItem('token');
        set({ user: null, token: null });
      },
    }),
    { name: 'user-storage' }
  )
);

export const useRecyclerStore = create(
  persist(
    (set) => ({
      recycler: null,
      token: null,
      setRecycler: (recycler) => set({ recycler }),
      setToken: (token) => {
        localStorage.setItem('recycler_token', token);
        set({ token });
      },
      logout: () => {
        localStorage.removeItem('recycler_token');
        set({ recycler: null, token: null });
      },
    }),
    { name: 'recycler-storage' }
  )
);

export const useScanStore = create((set) => ({
  currentScan: null,
  scanHistory: [],
  setScan: (scan) => set({ currentScan: scan }),
  addToHistory: (scan) =>
    set((state) => ({
      scanHistory: [scan, ...state.scanHistory.slice(0, 9)],
    })),
  clearScan: () => set({ currentScan: null }),
}));

export const useImpactStore = create((set) => ({
  stats: null,
  setStats: (stats) => set({ stats }),
  updateStats: (newData) =>
    set((state) => ({
      stats: state.stats ? { ...state.stats, ...newData } : newData,
    })),
}));

export const useTokenStore = create(
  persist(
    (set) => ({
      balance: 0,
      earnHistory: [],
      setBalance: (balance) => set({ balance }),
      addEarning: (earning) =>
        set((state) => ({
          balance: state.balance + earning.amount,
          earnHistory: [earning, ...state.earnHistory],
        })),
    }),
    { name: 'token-storage' }
  )
);

export const useLanguageStore = create(
  persist(
    (set) => ({
      language: 'en',
      setLanguage: (language) => set({ language }),
    }),
    { name: 'language-storage' }
  )
);

export const useRecyclerPendingStore = create((set) => ({
  items: [],
  setItems: (items) => set({ items }),
  removeItem: (scanId) =>
    set((state) => ({
      items: state.items.filter((item) => item.scan_id !== scanId),
    })),
}));

import { create } from 'zustand';

interface UserPreferences {
    theme: 'light' | 'dark' | 'system';
    canvasDomain: string | null;
    notificationsEnabled: boolean;
}

interface AppState {
    preferences: UserPreferences;
    isSyncing: boolean;
    lastSyncTime: number | null;
    setPreferences: (prefs: Partial<UserPreferences>) => void;
    setSyncStatus: (isSyncing: boolean) => void;
    setLastSyncTime: (time: number) => void;
}

export const useStore = create<AppState>((set) => ({
    preferences: {
        theme: 'system',
        canvasDomain: null,
        notificationsEnabled: true,
    },
    isSyncing: false,
    lastSyncTime: null,
    setPreferences: (prefs) =>
        set((state) => ({ preferences: { ...state.preferences, ...prefs } })),
    setSyncStatus: (isSyncing) => set({ isSyncing }),
    setLastSyncTime: (time) => set({ lastSyncTime: time }),
}));

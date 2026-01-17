import { create } from 'zustand';
import { settingsService, Settings } from '@/lib/api/services/settings.service';

interface SettingsStore {
  settings: Settings | null;
  loading: boolean;
  
  loadSettings: () => Promise<void>;
  updateSettings: (updates: Partial<Settings>) => Promise<void>;
  generateReport: (type: string, filters: any) => Promise<any>;
  exportReport: (type: string, filters: any) => Promise<string>;
}

export const useSettingsStore = create<SettingsStore>((set, get) => ({
  settings: null,
  loading: false,
  
  loadSettings: async () => {
    set({ loading: true });
    const settings = await settingsService.getSettings();
    set({ settings, loading: false });
  },
  
  updateSettings: async (updates) => {
    const updated = await settingsService.updateSettings(updates);
    set({ settings: updated });
  },
  
  generateReport: async (type, filters) => {
    if (type === 'sales') {
      return await settingsService.getSalesReport(filters);
    } else if (type === 'inventory') {
      return await settingsService.getInventoryReport(filters);
    }
    return null;
  },
  
  exportReport: async (type, filters) => {
    return await settingsService.exportReport(type, filters);
  },
}));

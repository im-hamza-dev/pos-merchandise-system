import { create } from 'zustand';
import { Banner } from '@/lib/types';
import { bannersService } from '@/lib/api/services/banners.service';
import { mockBanners } from '@/lib/mock-data';

interface BannersStore {
  banners: Banner[];
  activeBanner: Banner | null;
  loading: boolean;
  
  loadBanners: () => Promise<void>;
  setActiveBanner: (banner: Banner | null) => void;
  createBanner: (banner: Omit<Banner, 'id'>) => Promise<void>;
  updateBanner: (id: string, updates: Partial<Banner>) => Promise<void>;
  deleteBanner: (id: string) => Promise<void>;
  reorderBanners: (bannerIds: string[]) => Promise<void>;
}

export const useBannersStore = create<BannersStore>((set, get) => ({
  banners: [],
  activeBanner: null,
  loading: false,
  
  loadBanners: async () => {
    set({ loading: true });
    try {
      const banners = await bannersService.getBanners();
      set({ banners, loading: false });
    } catch (error) {
      set({ banners: mockBanners, loading: false });
    }
  },
  
  setActiveBanner: (banner) => set({ activeBanner: banner }),
  
  createBanner: async (bannerData) => {
    const banner = await bannersService.createBanner(bannerData);
    set((state) => ({
      banners: [...state.banners, banner],
    }));
  },
  
  updateBanner: async (id, updates) => {
    const updated = await bannersService.updateBanner(id, updates);
    set((state) => ({
      banners: state.banners.map(b => b.id === id ? updated : b),
      activeBanner: state.activeBanner?.id === id ? updated : state.activeBanner,
    }));
  },
  
  deleteBanner: async (id) => {
    await bannersService.deleteBanner(id);
    set((state) => ({
      banners: state.banners.filter(b => b.id !== id),
      activeBanner: state.activeBanner?.id === id ? null : state.activeBanner,
    }));
  },
  
  reorderBanners: async (bannerIds) => {
    await bannersService.reorderBanners(bannerIds);
    await get().loadBanners();
  },
}));

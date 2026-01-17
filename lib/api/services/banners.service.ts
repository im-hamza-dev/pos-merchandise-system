import { Banner } from '@/lib/types';
import { mockBanners } from '@/lib/mock-data';

const delay = () => new Promise(resolve => setTimeout(resolve, 100));

export const bannersService = {
  async getBanners(): Promise<Banner[]> {
    await delay();
    return [...mockBanners];
  },

  async getBannerById(id: string): Promise<Banner | undefined> {
    await delay();
    return mockBanners.find(b => b.id === id);
  },

  async createBanner(banner: Omit<Banner, 'id'>): Promise<Banner> {
    await delay();
    const newBanner: Banner = {
      ...banner,
      id: `banner-${Date.now()}`,
    };
    mockBanners.push(newBanner);
    return newBanner;
  },

  async updateBanner(id: string, updates: Partial<Banner>): Promise<Banner> {
    await delay();
    const index = mockBanners.findIndex(b => b.id === id);
    if (index === -1) throw new Error('Banner not found');
    
    mockBanners[index] = {
      ...mockBanners[index],
      ...updates,
    };
    return mockBanners[index];
  },

  async deleteBanner(id: string): Promise<void> {
    await delay();
    const index = mockBanners.findIndex(b => b.id === id);
    if (index !== -1) {
      mockBanners.splice(index, 1);
    }
  },

  async reorderBanners(bannerIds: string[]): Promise<void> {
    await delay();
    const reordered = bannerIds
      .map(id => mockBanners.find(b => b.id === id))
      .filter((b): b is Banner => b !== undefined);
    
    const remaining = mockBanners.filter(b => !bannerIds.includes(b.id));
    mockBanners.length = 0;
    mockBanners.push(...reordered, ...remaining);
    
    mockBanners.forEach((banner, index) => {
      banner.priority = index + 1;
    });
  },
};

const delay = () => new Promise(resolve => setTimeout(resolve, 100));

export interface Settings {
  taxRate: number;
  defaultReorderThreshold: number;
  memberDiscountPercent: number;
}

const defaultSettings: Settings = {
  taxRate: 0.08,
  defaultReorderThreshold: 10,
  memberDiscountPercent: 10,
};

export const settingsService = {
  async getSettings(): Promise<Settings> {
    await delay();
    return { ...defaultSettings };
  },

  async updateSettings(updates: Partial<Settings>): Promise<Settings> {
    await delay();
    Object.assign(defaultSettings, updates);
    return { ...defaultSettings };
  },

  async getSalesReport(filters: {
    dateRange: { start: Date; end: Date };
    groupBy?: 'date' | 'category';
  }) {
    await delay();
    return {
      totalSales: 0,
      totalTransactions: 0,
      data: [],
    };
  },

  async getInventoryReport(filters: {
    categoryId?: string;
    lowStockOnly?: boolean;
  }) {
    await delay();
    return {
      totalProducts: 0,
      lowStockCount: 0,
      outOfStockCount: 0,
      data: [],
    };
  },

  async exportReport(reportType: string, filters: any): Promise<string> {
    await delay();
    return 'csv-data';
  },
};

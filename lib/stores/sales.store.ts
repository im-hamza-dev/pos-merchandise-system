import { create } from 'zustand';
import { Transaction, Pickup } from '@/lib/types';
import { salesService } from '@/lib/api/services/sales.service';
import { mockTransactions } from '@/lib/mock-data';

interface SalesStore {
  transactions: Transaction[];
  pickups: Pickup[];
  loading: boolean;
  filters: {
    dateRange?: { start: Date; end: Date };
    buyerType?: 'member' | 'guest';
    paymentMethod?: string;
  };
  
  loadTransactions: (filters?: SalesStore['filters']) => Promise<void>;
  loadPickups: (filters?: { status?: 'pending' | 'picked-up' | 'cancelled' }) => Promise<void>;
  setFilters: (filters: Partial<SalesStore['filters']>) => void;
  markPickupComplete: (pickupId: string) => Promise<void>;
  cancelPickup: (pickupId: string) => Promise<void>;
  issueRefund: (transactionId: string, reason: string) => Promise<void>;
}

export const useSalesStore = create<SalesStore>((set, get) => ({
  transactions: [],
  pickups: [],
  loading: false,
  filters: {},
  
  loadTransactions: async (customFilters) => {
    set({ loading: true });
    try {
      const filters = customFilters || get().filters;
      const transactions = await salesService.getTransactions(filters);
      set({ transactions, loading: false });
    } catch (error) {
      set({ transactions: mockTransactions, loading: false });
    }
  },
  
  loadPickups: async (filters) => {
    set({ loading: true });
    const pickups = await salesService.getPickups(filters);
    set({ pickups, loading: false });
  },
  
  setFilters: (newFilters) => {
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
    }));
    get().loadTransactions();
  },
  
  markPickupComplete: async (pickupId) => {
    await salesService.markPickupComplete(pickupId);
    await get().loadPickups();
  },
  
  cancelPickup: async (pickupId) => {
    await salesService.cancelPickup(pickupId);
    await get().loadPickups();
  },
  
  issueRefund: async (transactionId, reason) => {
    await salesService.issueRefund(transactionId, reason);
    await get().loadTransactions();
  },
}));

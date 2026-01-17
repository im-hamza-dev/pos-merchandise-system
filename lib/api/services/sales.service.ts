import { Transaction, Pickup } from '@/lib/types';
import { mockTransactions } from '@/lib/mock-data';

const delay = () => new Promise(resolve => setTimeout(resolve, 100));

const mockPickups: Pickup[] = [];

export const salesService = {
  async getTransactions(filters?: {
    dateRange?: { start: Date; end: Date };
    buyerType?: 'member' | 'guest';
    paymentMethod?: string;
  }): Promise<Transaction[]> {
    await delay();
    let filtered = [...mockTransactions];
    
    if (filters?.dateRange) {
      filtered = filtered.filter(t => 
        t.date >= filters.dateRange!.start && t.date <= filters.dateRange!.end
      );
    }
    
    if (filters?.buyerType) {
      filtered = filtered.filter(t => t.customerType === filters.buyerType);
    }
    
    if (filters?.paymentMethod) {
      filtered = filtered.filter(t => t.paymentMethod === filters.paymentMethod);
    }
    
    return filtered.sort((a, b) => b.date.getTime() - a.date.getTime());
  },

  async getTransactionById(id: string): Promise<Transaction | undefined> {
    await delay();
    return mockTransactions.find(t => t.id === id);
  },

  async getPickups(filters?: {
    status?: 'pending' | 'picked-up' | 'cancelled';
  }): Promise<Pickup[]> {
    await delay();
    let filtered = [...mockPickups];
    
    if (filters?.status) {
      filtered = filtered.filter(p => p.status === filters.status);
    }
    
    return filtered;
  },

  async markPickupComplete(pickupId: string): Promise<Pickup> {
    await delay();
    const pickup = mockPickups.find(p => p.id === pickupId);
    if (!pickup) throw new Error('Pickup not found');
    
    pickup.status = 'picked-up';
    pickup.completedAt = new Date();
    return pickup;
  },

  async cancelPickup(pickupId: string): Promise<Pickup> {
    await delay();
    const pickup = mockPickups.find(p => p.id === pickupId);
    if (!pickup) throw new Error('Pickup not found');
    
    pickup.status = 'cancelled';
    return pickup;
  },

  async issueRefund(transactionId: string, reason: string): Promise<void> {
    await delay();
    const transaction = mockTransactions.find(t => t.id === transactionId);
    if (!transaction) throw new Error('Transaction not found');
  },
};

import { Product, Transaction, CartItem, Customer } from '@/lib/types';
import { mockProducts, mockTransactions, mockCustomers } from '@/lib/mock-data';

const delay = () => new Promise(resolve => setTimeout(resolve, 100));

export const checkoutService = {
  async searchProducts(query?: string, categoryId?: string): Promise<Product[]> {
    await delay();
    let filtered = [...mockProducts];
    
    if (query) {
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(query.toLowerCase())
      );
    }
    
    if (categoryId && categoryId !== 'all') {
      filtered = filtered.filter(p => p.categoryId === categoryId);
    }
    
    return filtered;
  },

  async getProductById(id: string): Promise<Product | undefined> {
    await delay();
    return mockProducts.find(p => p.id === id);
  },

  async createTransaction(transaction: Omit<Transaction, 'id' | 'date'>): Promise<Transaction> {
    await delay();
    const newTransaction: Transaction = {
      ...transaction,
      id: `txn-${Date.now()}`,
      date: new Date(),
    };
    mockTransactions.unshift(newTransaction);
    return newTransaction;
  },

  async decrementInventory(productId: string, variantId: string | null, quantity: number): Promise<void> {
    await delay();
    const product = mockProducts.find(p => p.id === productId);
    if (!product) return;

    if (variantId && product.variants) {
      for (const variant of product.variants) {
        const option = variant.options.find(opt => opt.id === variantId);
        if (option && option.stock !== undefined) {
          option.stock = Math.max(0, option.stock - quantity);
        }
      }
    } else {
      product.stock = Math.max(0, product.stock - quantity);
      if (product.stock === 0) {
        product.status = 'out-of-stock';
      }
    }
  },

  async searchCustomers(query: string): Promise<Customer[]> {
    await delay();
    if (!query) return [];
    return mockCustomers.filter(customer =>
      customer.name.toLowerCase().includes(query.toLowerCase()) ||
      customer.email.toLowerCase().includes(query.toLowerCase()) ||
      customer.phone?.includes(query)
    );
  },
};

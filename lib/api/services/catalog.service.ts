import { Product, Category, InventoryAdjustment } from '@/lib/types';
import { mockProducts, mockCategories } from '@/lib/mock-data';

const delay = () => new Promise(resolve => setTimeout(resolve, 100));

export const catalogService = {
  async getProducts(filters?: {
    categoryId?: string;
    status?: string;
    search?: string;
  }): Promise<Product[]> {
    await delay();
    let filtered = [...mockProducts];
    
    if (filters?.categoryId && filters.categoryId !== 'all') {
      filtered = filtered.filter(p => p.categoryId === filters.categoryId);
    }
    
    if (filters?.status && filters.status !== 'all') {
      filtered = filtered.filter(p => p.status === filters.status);
    }
    
    if (filters?.search) {
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(filters.search!.toLowerCase())
      );
    }
    
    return filtered;
  },

  async getProductById(id: string): Promise<Product | undefined> {
    await delay();
    return mockProducts.find(p => p.id === id);
  },

  async createProduct(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> {
    await delay();
    const newProduct: Product = {
      ...product,
      id: `prod-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    mockProducts.push(newProduct);
    return newProduct;
  },

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
    await delay();
    const index = mockProducts.findIndex(p => p.id === id);
    if (index === -1) throw new Error('Product not found');
    
    mockProducts[index] = {
      ...mockProducts[index],
      ...updates,
      updatedAt: new Date(),
    };
    return mockProducts[index];
  },

  async deleteProduct(id: string): Promise<void> {
    await delay();
    const index = mockProducts.findIndex(p => p.id === id);
    if (index !== -1) {
      mockProducts.splice(index, 1);
    }
  },

  async adjustInventory(
    productId: string,
    variantId: string | null,
    quantity: number,
    reason: string
  ): Promise<InventoryAdjustment> {
    await delay();
    const product = mockProducts.find(p => p.id === productId);
    if (!product) throw new Error('Product not found');

    let newStock = product.stock;
    
    if (variantId && product.variants) {
      for (const variant of product.variants) {
        const option = variant.options.find(opt => opt.id === variantId);
        if (option && option.stock !== undefined) {
          option.stock = Math.max(0, option.stock + quantity);
          newStock = option.stock;
        }
      }
    } else {
      product.stock = Math.max(0, product.stock + quantity);
      newStock = product.stock;
      
      if (product.stock === 0) {
        product.status = 'out-of-stock';
      } else if (product.status === 'out-of-stock') {
        product.status = 'active';
      }
    }

    const adjustment: InventoryAdjustment = {
      id: `adj-${Date.now()}`,
      productId,
      date: new Date(),
      change: quantity,
      reason,
      newStock,
    };

    return adjustment;
  },

  async getCategories(): Promise<Category[]> {
    await delay();
    return [...mockCategories];
  },

  async createCategory(category: Omit<Category, 'id'>): Promise<Category> {
    await delay();
    const newCategory: Category = {
      ...category,
      id: `cat-${Date.now()}`,
    };
    mockCategories.push(newCategory);
    return newCategory;
  },

  async updateCategory(id: string, updates: Partial<Category>): Promise<Category> {
    await delay();
    const index = mockCategories.findIndex(c => c.id === id);
    if (index === -1) throw new Error('Category not found');
    
    mockCategories[index] = {
      ...mockCategories[index],
      ...updates,
    };
    return mockCategories[index];
  },
};

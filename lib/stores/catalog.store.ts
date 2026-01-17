import { create } from 'zustand';
import { Product, Category, InventoryAdjustment } from '@/lib/types';
import { catalogService } from '@/lib/api/services/catalog.service';
import { mockProducts, mockCategories } from '@/lib/mock-data';

interface CatalogStore {
  products: Product[];
  categories: Category[];
  selectedProduct: Product | null;
  loading: boolean;
  filters: {
    categoryId: string;
    status: string;
    search: string;
  };
  
  loadProducts: (filters?: any) => Promise<void>;
  loadCategories: () => Promise<void>;
  setSelectedProduct: (product: Product | null) => void;
  setFilters: (filters: Partial<CatalogStore['filters']>) => void;
  createProduct: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateProduct: (id: string, updates: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  adjustInventory: (productId: string, variantId: string | null, quantity: number, reason: string) => Promise<InventoryAdjustment>;
  createCategory: (category: Omit<Category, 'id'>) => Promise<void>;
  updateCategory: (id: string, updates: Partial<Category>) => Promise<void>;
}

export const useCatalogStore = create<CatalogStore>((set, get) => ({
  products: [],
  categories: [],
  selectedProduct: null,
  loading: false,
  filters: {
    categoryId: 'all',
    status: 'all',
    search: '',
  },
  
  loadProducts: async (customFilters) => {
    set({ loading: true });
    try {
      const filters = customFilters || get().filters;
      const products = await catalogService.getProducts(filters);
      set({ products, loading: false });
    } catch (error) {
      set({ products: mockProducts, loading: false });
    }
  },
  
  loadCategories: async () => {
    try {
      const categories = await catalogService.getCategories();
      set({ categories });
    } catch (error) {
      set({ categories: mockCategories });
    }
  },
  
  setSelectedProduct: (product) => set({ selectedProduct: product }),
  
  setFilters: (newFilters) => {
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
    }));
    get().loadProducts();
  },
  
  createProduct: async (productData) => {
    const product = await catalogService.createProduct(productData);
    set((state) => ({
      products: [...state.products, product],
    }));
  },
  
  updateProduct: async (id, updates) => {
    const updated = await catalogService.updateProduct(id, updates);
    set((state) => ({
      products: state.products.map(p => p.id === id ? updated : p),
      selectedProduct: state.selectedProduct?.id === id ? updated : state.selectedProduct,
    }));
  },
  
  deleteProduct: async (id) => {
    await catalogService.deleteProduct(id);
    set((state) => ({
      products: state.products.filter(p => p.id !== id),
      selectedProduct: state.selectedProduct?.id === id ? null : state.selectedProduct,
    }));
  },
  
  adjustInventory: async (productId, variantId, quantity, reason) => {
    const adjustment = await catalogService.adjustInventory(productId, variantId, quantity, reason);
    await get().loadProducts();
    return adjustment;
  },
  
  createCategory: async (categoryData) => {
    const category = await catalogService.createCategory(categoryData);
    set((state) => ({
      categories: [...state.categories, category],
    }));
  },
  
  updateCategory: async (id, updates) => {
    const updated = await catalogService.updateCategory(id, updates);
    set((state) => ({
      categories: state.categories.map(c => c.id === id ? updated : c),
    }));
  },
}));

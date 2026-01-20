export interface Product {
  id: string;
  name: string;
  categoryId: string;
  price: number;
  description?: string;
  images: string[];
  variants?: ProductVariant[];
  inventoryTracking: boolean;
  stock: number;
  reorderThreshold?: number;
  discountEligible: boolean;
  status: 'active' | 'hidden' | 'out-of-stock';
  promoted: boolean;
  promotionPriority?: number;
  promoLabel?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductVariant {
  id: string;
  name: string;
  type: 'size' | 'color' | 'custom';
  options: VariantOption[];
}

export interface VariantOption {
  id: string;
  value: string;
  priceAdjustment?: number;
  stock?: number;
}

export interface Category {
  id: string;
  name: string;
  visible: boolean;
  displayOrder: number;
}

export interface CartItem {
  productId: string;
  product: Product;
  quantity: number;
  selectedVariants?: { [key: string]: string };
  price: number;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  isMember: boolean;
}

export interface Transaction {
  id: string;
  date: Date;
  customerId?: string;
  customerName: string;
  customerType: 'member' | 'guest';
  items: TransactionItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paymentMethod: string;
  pickupStatus?: 'pending' | 'picked-up' | 'cancelled';
}

export interface TransactionItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  variants?: { [key: string]: string };
}

export interface Banner {
  id: string;
  type: 'product' | 'static';
  image: string;
  headline: string;
  subtext?: string;
  ctaLink?: string;
  productIds?: string[];
  active: boolean;
  startDate?: Date;
  endDate?: Date;
  priority: number;
}

export interface InventoryAdjustment {
  id: string;
  productId: string;
  date: Date;
  change: number;
  reason: string;
  newStock: number;
}

export interface ReorderAlert {
  productId: string;
  productName: string;
  currentStock: number;
  threshold: number;
  status: 'normal' | 'low' | 'out';
}

export interface Pickup {
  id: string;
  transactionId: string;
  status: 'pending' | 'picked-up' | 'cancelled';
  createdAt: Date;
  completedAt?: Date;
}

export type UserRole = 'staff' | 'manager' | 'owner';

export interface Permissions {
  canAccessCheckout: boolean;
  canAccessOverview: boolean;
  canAccessCatalog: boolean;
  canEditCatalog: boolean;
  canAccessBanners: boolean;
  canAccessSales: boolean;
  canIssueRefund: boolean;
  canCancelPickup: boolean;
  canAccessSettings: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

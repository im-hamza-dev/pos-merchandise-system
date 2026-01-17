import { create } from 'zustand';
import { CartItem, Customer, Product, Transaction } from '@/lib/types';
import { checkoutService } from '@/lib/api/services/checkout.service';

interface CheckoutStore {
  cart: CartItem[];
  selectedCustomer: Customer | null;
  paymentMethod: string;
  
  addToCart: (product: Product, quantity: number, variants?: { [key: string]: string }) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  setSelectedCustomer: (customer: Customer | null) => void;
  setPaymentMethod: (method: string) => void;
  processPayment: () => Promise<Transaction>;
  resetCheckout: () => void;
}

export const useCheckoutStore = create<CheckoutStore>((set, get) => ({
  cart: [],
  selectedCustomer: null,
  paymentMethod: 'credit-card',
  
  addToCart: (product, quantity, variants) => {
    set((state) => {
      const existingIndex = state.cart.findIndex(
        item => item.productId === product.id && 
        JSON.stringify(item.selectedVariants) === JSON.stringify(variants)
      );

      if (existingIndex >= 0) {
        const updated = [...state.cart];
        updated[existingIndex].quantity += quantity;
        return { cart: updated };
      }

      return {
        cart: [...state.cart, {
          productId: product.id,
          product,
          quantity,
          selectedVariants: variants,
          price: product.price,
        }],
      };
    });
  },
  
  removeFromCart: (productId) => {
    set((state) => ({
      cart: state.cart.filter(item => item.productId !== productId),
    }));
  },
  
  updateCartQuantity: (productId, quantity) => {
    set((state) => {
      if (quantity <= 0) {
        return { cart: state.cart.filter(item => item.productId !== productId) };
      }
      return {
        cart: state.cart.map(item =>
          item.productId === productId ? { ...item, quantity } : item
        ),
      };
    });
  },
  
  clearCart: () => set({ cart: [] }),
  
  setSelectedCustomer: (customer) => set({ selectedCustomer: customer }),
  
  setPaymentMethod: (method) => set({ paymentMethod: method }),
  
  processPayment: async () => {
    const { cart, selectedCustomer, paymentMethod } = get();
    
    if (cart.length === 0) {
      throw new Error('Cart is empty');
    }
    
    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const discount = selectedCustomer?.isMember ? subtotal * 0.1 : 0;
    const tax = (subtotal - discount) * 0.08;
    const total = subtotal - discount + tax;

    const transaction = await checkoutService.createTransaction({
      customerId: selectedCustomer?.id,
      customerName: selectedCustomer?.name || 'Walk-in Guest',
      customerType: selectedCustomer?.isMember ? 'member' : 'guest',
      items: cart.map(item => ({
        productId: item.productId,
        productName: item.product.name,
        quantity: item.quantity,
        price: item.price,
        variants: item.selectedVariants,
      })),
      subtotal,
      discount,
      tax,
      total,
      paymentMethod,
    });

    for (const item of cart) {
      await checkoutService.decrementInventory(
        item.productId,
        null,
        item.quantity
      );
    }

    get().clearCart();
    get().setSelectedCustomer(null);
    
    return transaction;
  },
  
  resetCheckout: () => {
    set({
      cart: [],
      selectedCustomer: null,
      paymentMethod: 'credit-card',
    });
  },
}));

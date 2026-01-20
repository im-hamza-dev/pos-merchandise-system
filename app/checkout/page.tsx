'use client';

import { useState, useMemo, useEffect } from 'react';
import { useCheckoutStore } from '@/lib/stores/checkout.store';
import { useCatalogStore } from '@/lib/stores/catalog.store';
import { useBannersStore } from '@/lib/stores/banners.store';
import { useSettingsStore } from '@/lib/stores/settings.store';
import { Product, Customer } from '@/lib/types';
import { checkoutService } from '@/lib/api/services/checkout.service';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { toast } from 'sonner';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

export default function CheckoutPage() {
  const { cart, selectedCustomer, paymentMethod, addToCart, removeFromCart, updateCartQuantity, setSelectedCustomer, setPaymentMethod, processPayment } = useCheckoutStore();
  const { products, categories, loadProducts, loadCategories } = useCatalogStore();
  const { banners, loadBanners } = useBannersStore();
  const { settings, loadSettings } = useSettingsStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [customerSearch, setCustomerSearch] = useState('');
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [variantDialogProduct, setVariantDialogProduct] = useState<Product | null>(null);
  const [selectedVariants, setSelectedVariants] = useState<{ [key: string]: string }>({});
  const [variantQuantity, setVariantQuantity] = useState(1);

  useEffect(() => {
    loadProducts();
    loadCategories();
    loadBanners();
    loadSettings();
  }, [loadProducts, loadCategories, loadBanners, loadSettings]);

  useEffect(() => {
    const searchCustomers = async () => {
      if (customerSearch) {
        const results = await checkoutService.searchCustomers(customerSearch);
        setFilteredCustomers(results);
      } else {
        setFilteredCustomers([]);
      }
    };
    searchCustomers();
  }, [customerSearch]);

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || product.categoryId === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchTerm, selectedCategory]);

  const activeBanners = useMemo(() => {
    const now = new Date();
    return banners
      .filter(banner => banner.active)
      .filter(banner => {
        if (banner.startDate && now < banner.startDate) return false;
        if (banner.endDate && now > banner.endDate) return false;
        return true;
      })
      .sort((a, b) => (b.priority || 0) - (a.priority || 0));
  }, [banners]);

  const cartSubtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const taxRate = settings?.taxRate ?? 0.08;
  const memberDiscountPercent = settings?.memberDiscountPercent ?? 10;
  const discount = selectedCustomer?.isMember ? cartSubtotal * (memberDiscountPercent / 100) : 0;
  const tax = (cartSubtotal - discount) * taxRate;
  const total = cartSubtotal - discount + tax;

  const getStockBadge = (product: Product) => {
    if (product.status === 'out-of-stock' || product.stock === 0) {
      return <Badge variant="destructive">Out of Stock</Badge>;
    }
    if (product.reorderThreshold && product.stock <= product.reorderThreshold) {
      return <Badge variant="outline" className="border-orange-500 text-orange-500">Low Stock</Badge>;
    }
    return <Badge variant="outline" className="border-green-500 text-green-500">In Stock</Badge>;
  };

  const handleAddToCart = (product: Product) => {
    if (product.status === 'out-of-stock' || product.stock === 0) return;
    
    if (product.variants && product.variants.length > 0) {
      setVariantDialogProduct(product);
      setSelectedVariants({});
      setVariantQuantity(1);
    } else {
      addToCart(product, 1);
      toast.success(`Added ${product.name} to cart`);
    }
  };

  const handleVariantAdd = () => {
    if (variantDialogProduct) {
      addToCart(variantDialogProduct, variantQuantity, selectedVariants);
      toast.success(`Added ${variantDialogProduct.name} to cart`);
      setVariantDialogProduct(null);
    }
  };

  const handleCheckout = async () => {
    if (cart.length === 0) {
      toast.error('Cart is empty');
      return;
    }
    try {
      await processPayment();
      toast.success('Transaction completed successfully!');
      await loadProducts();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to process payment');
    }
  };

  return (
    <ProtectedRoute require="canAccessCheckout">
      <div className="space-y-6">
      {activeBanners.length > 0 && (
        <Card>
          <CardContent className="p-0">
            <Carousel className="w-full">
              <CarouselContent>
                {activeBanners.map((banner) => (
                  <CarouselItem key={banner.id}>
                    <div className="relative w-full h-48 md:h-64 rounded-lg overflow-hidden">
                      <img
                        src={banner.image}
                        alt={banner.headline}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-linear-to-r from-black/60 to-transparent flex items-center">
                        <div className="p-6 text-white">
                          <h3 className="text-2xl md:text-3xl font-bold mb-2">{banner.headline}</h3>
                          {banner.subtext && (
                            <p className="text-lg md:text-xl mb-4">{banner.subtext}</p>
                          )}
                          {banner.ctaLink && (
                            <Button
                              variant="secondary"
                              onClick={() => window.open(banner.ctaLink, '_blank')}
                            >
                              Learn More
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              {activeBanners.length > 1 && (
                <>
                  <CarouselPrevious />
                  <CarouselNext />
                </>
              )}
            </Carousel>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
      <div className="lg:col-span-2 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Product Selection</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Input
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.filter(c => c.visible).map(category => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[600px] overflow-y-auto">
              {filteredProducts.map(product => (
                <Card key={product.id} className="overflow-hidden">
                  <div className="flex gap-4 p-4">
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-20 h-20 object-cover rounded"
                    />
                    <div className="flex-1 space-y-2">
                      <div>
                        <h3 className="font-medium">{product.name}</h3>
                        <p className="text-sm text-muted-foreground">${product.price.toFixed(2)}</p>
                      </div>
                      <div className="flex items-center justify-between">
                        {getStockBadge(product)}
                        <Button
                          size="sm"
                          onClick={() => handleAddToCart(product)}
                          disabled={product.status === 'out-of-stock' || product.stock === 0}
                        >
                          Add to Cart
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Customer</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {selectedCustomer ? (
              <div className="flex items-center justify-between p-3 bg-muted rounded">
                <div>
                  <p className="font-medium">{selectedCustomer.name}</p>
                  <p className="text-sm text-muted-foreground">{selectedCustomer.email}</p>
                  {selectedCustomer.isMember && (
                    <Badge variant="outline" className="mt-1">Member - {memberDiscountPercent}% Discount</Badge>
                  )}
                </div>
                <Button variant="ghost" size="sm" onClick={() => setSelectedCustomer(null)}>
                  Clear
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <Input
                  placeholder="Search by name, email, or phone..."
                  value={customerSearch}
                  onChange={(e) => setCustomerSearch(e.target.value)}
                />
                {customerSearch && (
                  <div className="max-h-[150px] overflow-y-auto space-y-1">
                    {filteredCustomers.map(customer => (
                      <button
                        key={customer.id}
                        onClick={() => {
                          setSelectedCustomer(customer);
                          setCustomerSearch('');
                        }}
                        className="w-full text-left p-2 hover:bg-muted rounded text-sm"
                      >
                        <p className="font-medium">{customer.name}</p>
                        <p className="text-muted-foreground">{customer.email}</p>
                      </button>
                    ))}
                    {filteredCustomers.length === 0 && (
                      <p className="text-sm text-muted-foreground p-2">No customers found</p>
                    )}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Cart ({cart.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {cart.map((item, index) => (
                <div key={index} className="flex items-center gap-2 p-2 border rounded">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{item.product.name}</p>
                    {item.selectedVariants && Object.keys(item.selectedVariants).length > 0 && (
                      <p className="text-xs text-muted-foreground">
                        {Object.entries(item.selectedVariants).map(([k, v]) => `${k}: ${v}`).join(', ')}
                      </p>
                    )}
                    <p className="text-sm text-muted-foreground">${item.price.toFixed(2)}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateCartQuantity(item.productId, item.quantity - 1)}
                    >
                      -
                    </Button>
                    <span className="w-8 text-center text-sm">{item.quantity}</span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateCartQuantity(item.productId, item.quantity + 1)}
                    >
                      +
                    </Button>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => removeFromCart(item.productId)}
                  >
                    ×
                  </Button>
                </div>
              ))}
              {cart.length === 0 && (
                <p className="text-center text-muted-foreground py-8">Cart is empty</p>
              )}
            </div>

            {cart.length > 0 && (
              <>
                <div className="border-t pt-3 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span>${cartSubtotal.toFixed(2)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Member Discount ({memberDiscountPercent}%)</span>
                      <span>-${discount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span>Tax ({(taxRate * 100).toFixed(0)}%)</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold pt-2 border-t">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Payment Method</Label>
                  <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="credit-card">Credit Card</SelectItem>
                      <SelectItem value="debit-card">Debit Card</SelectItem>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="mobile">Mobile Payment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button className="w-full" size="lg" onClick={handleCheckout}>
                  Complete Transaction
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
      </div>

      <Dialog open={!!variantDialogProduct} onOpenChange={(open) => !open && setVariantDialogProduct(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Select Options - {variantDialogProduct?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {variantDialogProduct?.variants?.map(variant => (
              <div key={variant.id} className="space-y-2">
                <Label>{variant.name}</Label>
                <Select
                  value={selectedVariants[variant.name] || ''}
                  onValueChange={(value) => setSelectedVariants(prev => ({ ...prev, [variant.name]: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={`Select ${variant.name}`} />
                  </SelectTrigger>
                  <SelectContent>
                    {variant.options.map(option => (
                      <SelectItem key={option.id} value={option.value}>
                        {option.value}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))}
            <div className="space-y-2">
              <Label>Quantity</Label>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setVariantQuantity(Math.max(1, variantQuantity - 1))}
                >
                  -
                </Button>
                <span className="w-12 text-center">{variantQuantity}</span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setVariantQuantity(variantQuantity + 1)}
                >
                  +
                </Button>
              </div>
            </div>
            <Button
              className="w-full"
              onClick={handleVariantAdd}
              disabled={variantDialogProduct?.variants?.some(v => !selectedVariants[v.name])}
            >
              Add to Cart
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      </div>
    </ProtectedRoute>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { useCatalogStore } from '@/lib/stores/catalog.store';
import { Product } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProductDetails } from '@/components/catalog/ProductDetails';
import { ProductInventory } from '@/components/catalog/ProductInventory';
import { ProductPromotion } from '@/components/catalog/ProductPromotion';
import { ProductActivity } from '@/components/catalog/ProductActivity';
import { CategoriesManager } from '@/components/catalog/CategoriesManager';
import { toast } from 'sonner';

export default function CatalogPage() {
  const { products, categories, selectedProduct, loading, loadProducts, loadCategories, setSelectedProduct, createProduct } = useCatalogStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [newProductOpen, setNewProductOpen] = useState(false);
  const [newProductData, setNewProductData] = useState<Partial<Product>>({
    name: '',
    categoryId: '',
    price: 0,
    description: '',
    images: ['https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400'],
    inventoryTracking: true,
    stock: 0,
    discountEligible: true,
    status: 'active',
    promoted: false,
  });

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, [loadProducts, loadCategories]);

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getCategoryName = (categoryId: string) => {
    return categories.find(c => c.id === categoryId)?.name || 'Unknown';
  };

  const getStockStatus = (product: Product) => {
    if (product.stock === 0) return { label: 'Out of Stock', color: 'destructive' };
    if (product.reorderThreshold && product.stock <= product.reorderThreshold) {
      return { label: 'Low Stock', color: 'outline' };
    }
    return { label: 'In Stock', color: 'outline' };
  };

  const handleCreateProduct = async () => {
    if (!newProductData.name?.trim()) {
      toast.error('Product name is required');
      return;
    }
    if (!newProductData.categoryId) {
      toast.error('Category is required');
      return;
    }
    if (!newProductData.price || newProductData.price <= 0) {
      toast.error('Valid price is required');
      return;
    }

    try {
      await createProduct({
        name: newProductData.name,
        categoryId: newProductData.categoryId,
        price: newProductData.price,
        description: newProductData.description,
        images: newProductData.images || ['https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400'],
        inventoryTracking: newProductData.inventoryTracking ?? true,
        stock: newProductData.stock ?? 0,
        reorderThreshold: newProductData.reorderThreshold,
        discountEligible: newProductData.discountEligible ?? true,
        status: newProductData.status || 'active',
        promoted: newProductData.promoted ?? false,
        promotionPriority: newProductData.promotionPriority,
        promoLabel: newProductData.promoLabel,
        variants: newProductData.variants,
      });
      
      await loadProducts();
      toast.success('Product created successfully');
      setNewProductOpen(false);
      setNewProductData({
        name: '',
        categoryId: '',
        price: 0,
        description: '',
        images: ['https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400'],
        inventoryTracking: true,
        stock: 0,
        discountEligible: true,
        status: 'active',
        promoted: false,
      });
    } catch (error: any) {
      toast.error(error?.message || 'Failed to create product');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Catalog</h1>
          <p className="text-muted-foreground">Manage products, inventory, and categories</p>
        </div>
        <Dialog open={newProductOpen} onOpenChange={setNewProductOpen}>
          <DialogTrigger asChild>
            <Button>New Product</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Product</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Product Name *</Label>
                  <Input
                    value={newProductData.name}
                    onChange={(e) => setNewProductData({ ...newProductData, name: e.target.value })}
                    placeholder="Enter product name"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Category *</Label>
                  <Select
                    value={newProductData.categoryId}
                    onValueChange={(value) => setNewProductData({ ...newProductData, categoryId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.filter(c => c.visible).map(category => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Price *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={newProductData.price}
                    onChange={(e) => setNewProductData({ ...newProductData, price: parseFloat(e.target.value) || 0 })}
                    placeholder="0.00"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Initial Stock</Label>
                  <Input
                    type="number"
                    min="0"
                    value={newProductData.stock}
                    onChange={(e) => setNewProductData({ ...newProductData, stock: parseInt(e.target.value) || 0 })}
                    placeholder="0"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Image URL</Label>
                  <Input
                    value={newProductData.images?.[0] || ''}
                    onChange={(e) => setNewProductData({ ...newProductData, images: [e.target.value] })}
                    placeholder="https://..."
                  />
                </div>

                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select
                    value={newProductData.status}
                    onValueChange={(value: any) => setNewProductData({ ...newProductData, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="hidden">Hidden</SelectItem>
                      <SelectItem value="out-of-stock">Out of Stock</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={newProductData.description || ''}
                  onChange={(e) => setNewProductData({ ...newProductData, description: e.target.value })}
                  rows={4}
                  placeholder="Enter product description"
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Inventory Tracking</Label>
                  <Switch
                    checked={newProductData.inventoryTracking}
                    onCheckedChange={(checked) =>
                      setNewProductData({ ...newProductData, inventoryTracking: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label>Discount Eligible</Label>
                  <Switch
                    checked={newProductData.discountEligible}
                    onCheckedChange={(checked) =>
                      setNewProductData({ ...newProductData, discountEligible: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label>Promoted</Label>
                  <Switch
                    checked={newProductData.promoted}
                    onCheckedChange={(checked) =>
                      setNewProductData({ ...newProductData, promoted: checked })
                    }
                  />
                </div>
              </div>

              <Button className="w-full" onClick={handleCreateProduct}>
                Create Product
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="products" className="space-y-4">
        <TabsList>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="space-y-4">
          {!selectedProduct ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>All Products ({filteredProducts.length})</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />

                {viewMode === 'grid' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredProducts.map(product => {
                      const stockStatus = getStockStatus(product);
                      return (
                        <Card
                          key={product.id}
                          className="cursor-pointer hover:border-primary transition-colors"
                          onClick={() => setSelectedProduct(product)}
                        >
                          <div className="p-4 space-y-3">
                            <img
                              src={product.images[0]}
                              alt={product.name}
                              className="w-full h-40 object-cover rounded"
                            />
                            <div>
                              <h3 className="font-medium">{product.name}</h3>
                              <p className="text-sm text-muted-foreground">{getCategoryName(product.categoryId)}</p>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="font-bold">${product.price.toFixed(2)}</span>
                              <Badge variant={stockStatus.color as any}>
                                {stockStatus.label}
                              </Badge>
                            </div>
                            {product.promoted && (
                              <Badge variant="outline" className="border-purple-500 text-purple-500">
                                {product.promoLabel || 'Promoted'}
                              </Badge>
                            )}
                            <div className="flex items-center justify-between text-sm text-muted-foreground">
                              <span>Stock: {product.stock}</span>
                              {product.status === 'hidden' && (
                                <Badge variant="secondary">Hidden</Badge>
                              )}
                            </div>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredProducts.map(product => {
                      const stockStatus = getStockStatus(product);
                      return (
                        <Card
                          key={product.id}
                          className="cursor-pointer hover:border-primary transition-colors"
                          onClick={() => setSelectedProduct(product)}
                        >
                          <div className="p-4 flex items-center gap-4">
                            <img
                              src={product.images[0]}
                              alt={product.name}
                              className="w-16 h-16 object-cover rounded"
                            />
                            <div className="flex-1">
                              <h3 className="font-medium">{product.name}</h3>
                              <p className="text-sm text-muted-foreground">{getCategoryName(product.categoryId)}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold">${product.price.toFixed(2)}</p>
                              <p className="text-sm text-muted-foreground">Stock: {product.stock}</p>
                            </div>
                            <div className="space-y-1">
                              <Badge variant={stockStatus.color as any}>
                                {stockStatus.label}
                              </Badge>
                              {product.promoted && (
                                <Badge variant="outline" className="border-purple-500 text-purple-500 block">
                                  {product.promoLabel || 'Promoted'}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{selectedProduct.name}</CardTitle>
                  <Button variant="outline" onClick={() => setSelectedProduct(null)}>
                    Back to Products
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="details">
                  <TabsList className="grid grid-cols-4 w-full">
                    <TabsTrigger value="details">Details</TabsTrigger>
                    <TabsTrigger value="inventory">Inventory</TabsTrigger>
                    <TabsTrigger value="promotion">Promotion</TabsTrigger>
                    <TabsTrigger value="activity">Activity</TabsTrigger>
                  </TabsList>
                  <TabsContent value="details">
                    <ProductDetails product={selectedProduct} />
                  </TabsContent>
                  <TabsContent value="inventory">
                    <ProductInventory product={selectedProduct} />
                  </TabsContent>
                  <TabsContent value="promotion">
                    <ProductPromotion product={selectedProduct} />
                  </TabsContent>
                  <TabsContent value="activity">
                    <ProductActivity product={selectedProduct} />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="categories">
          <CategoriesManager />
        </TabsContent>
      </Tabs>
    </div>
  );
}

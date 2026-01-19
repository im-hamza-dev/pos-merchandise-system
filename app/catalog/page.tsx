'use client';

import { useState, useEffect } from 'react';
import { useCatalogStore } from '@/lib/stores/catalog.store';
import { Product } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProductDetails } from '@/components/catalog/ProductDetails';
import { ProductInventory } from '@/components/catalog/ProductInventory';
import { ProductPromotion } from '@/components/catalog/ProductPromotion';
import { ProductActivity } from '@/components/catalog/ProductActivity';
import { CategoriesManager } from '@/components/catalog/CategoriesManager';

export default function CatalogPage() {
  const { products, categories, selectedProduct, loading, loadProducts, loadCategories, setSelectedProduct } = useCatalogStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Catalog</h1>
          <p className="text-muted-foreground">Manage products, inventory, and categories</p>
        </div>
        <Button>
          New Product
        </Button>
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

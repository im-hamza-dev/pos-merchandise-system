'use client';

import { useState } from 'react';
import { Product } from '@/lib/types';
import { useCatalogStore } from '@/lib/stores/catalog.store';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface ProductDetailsProps {
  product: Product;
}

export function ProductDetails({ product }: ProductDetailsProps) {
  const { categories, updateProduct } = useCatalogStore();
  const [formData, setFormData] = useState(product);

  const handleSave = async () => {
    await updateProduct(product.id, formData);
    toast.success('Product details updated');
  };

  return (
    <div className="space-y-6 pt-4">
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Product Name *</Label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label>Category *</Label>
            <Select
              value={formData.categoryId}
              onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
            >
              <SelectTrigger>
                <SelectValue />
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
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
            />
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Product Image</Label>
            <img
              src={formData.images[0]}
              alt={formData.name}
              className="w-full h-48 object-cover rounded border"
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Inventory Tracking</Label>
              <Switch
                checked={formData.inventoryTracking}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, inventoryTracking: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <Label>Discount Eligible</Label>
              <Switch
                checked={formData.discountEligible}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, discountEligible: checked })
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value: any) => setFormData({ ...formData, status: value })}
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
        </div>
      </div>

      {formData.variants && formData.variants.length > 0 && (
        <div className="space-y-2">
          <Label>Product Variants</Label>
          {formData.variants.map(variant => (
            <div key={variant.id} className="border rounded p-3">
              <p className="font-medium mb-2">{variant.name} ({variant.type})</p>
              <div className="flex flex-wrap gap-2">
                {variant.options.map(option => (
                  <Badge key={option.id} variant="outline">
                    {option.value} {option.stock !== undefined && `(Stock: ${option.stock})`}
                  </Badge>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex justify-end">
        <Button onClick={handleSave}>
          Save Changes
        </Button>
      </div>
    </div>
  );
}

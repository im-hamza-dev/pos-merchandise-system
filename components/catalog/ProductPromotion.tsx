'use client';

import { useState } from 'react';
import { Product } from '@/lib/types';
import { useCatalogStore } from '@/lib/stores/catalog.store';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface ProductPromotionProps {
  product: Product;
}

export function ProductPromotion({ product }: ProductPromotionProps) {
  const { updateProduct } = useCatalogStore();
  const [promoted, setPromoted] = useState(product.promoted);
  const [priority, setPriority] = useState(product.promotionPriority || 0);
  const [promoLabel, setPromoLabel] = useState(product.promoLabel || '');

  const handleSave = async () => {
    await updateProduct(product.id, {
      promoted,
      promotionPriority: promoted ? priority : undefined,
      promoLabel: promoted && promoLabel ? promoLabel : undefined,
    });
    toast.success('Promotion settings updated');
  };

  return (
    <div className="space-y-6 pt-4">
      

      <div className="space-y-4 border rounded p-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label className="text-base">Promote this Product</Label>
            <p className="text-sm text-muted-foreground">
              Make this product eligible for banner promotions
            </p>
          </div>
          <Switch
            checked={promoted}
            onCheckedChange={setPromoted}
          />
        </div>

        {promoted && (
          <div className="space-y-4 pl-4 border-l-2 border-blue-500">
            <div className="space-y-2">
              <Label>Promotion Priority</Label>
              <Input
                type="number"
                min="0"
                value={priority}
                onChange={(e) => setPriority(parseInt(e.target.value) || 0)}
                placeholder="Higher numbers = higher priority"
              />
              <p className="text-sm text-muted-foreground">
                Higher priority products appear first in banner selections
              </p>
            </div>

            <div className="space-y-2">
              <Label>Promo Label (Optional)</Label>
              <Input
                value={promoLabel}
                onChange={(e) => setPromoLabel(e.target.value)}
                placeholder="e.g., New, Staff Pick, Popular"
                maxLength={20}
              />
              <p className="text-sm text-muted-foreground">
                This label will appear on the product card (max 20 characters)
              </p>
            </div>

            <div className="bg-muted p-3 rounded">
              <p className="text-sm font-medium mb-2">Preview</p>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="border-purple-500 text-purple-500">
                  {promoLabel || 'Promoted'}
                </Badge>
                <span className="text-sm text-muted-foreground">Priority: {priority}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave}>
          Save Changes
        </Button>
      </div>
    </div>
  );
}

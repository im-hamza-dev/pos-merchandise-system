'use client';

import { useState } from 'react';
import { Product } from '@/lib/types';
import { useCatalogStore } from '@/lib/stores/catalog.store';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

interface ProductInventoryProps {
  product: Product;
}

export function ProductInventory({ product }: ProductInventoryProps) {
  const { updateProduct, adjustInventory, loadProducts } = useCatalogStore();
  const [reorderThreshold, setReorderThreshold] = useState(product.reorderThreshold || 0);
  const [adjustmentOpen, setAdjustmentOpen] = useState(false);
  const [adjustmentType, setAdjustmentType] = useState<'increase' | 'decrease'>('increase');
  const [adjustmentAmount, setAdjustmentAmount] = useState(0);
  const [adjustmentReason, setAdjustmentReason] = useState('');

  const stockStatus = product.stock === 0
    ? { label: 'Out of Stock', color: 'destructive' }
    : product.reorderThreshold && product.stock <= product.reorderThreshold
    ? { label: 'Low Stock', color: 'outline' }
    : { label: 'Normal', color: 'outline' };

  const handleSaveThreshold = async () => {
    await updateProduct(product.id, { reorderThreshold });
    toast.success('Reorder threshold updated');
  };

  const handleAdjustment = async () => {
    if (!adjustmentReason.trim()) {
      toast.error('Please provide a reason for the adjustment');
      return;
    }
    
    const change = adjustmentType === 'increase' ? adjustmentAmount : -adjustmentAmount;
    await adjustInventory(product.id, null, change, adjustmentReason);
    toast.success(`Inventory ${adjustmentType === 'increase' ? 'increased' : 'decreased'} by ${adjustmentAmount}`);
    setAdjustmentOpen(false);
    setAdjustmentAmount(0);
    setAdjustmentReason('');
    await loadProducts();
  };

  return (
    <div className="space-y-6 pt-4">
      <div className="grid grid-cols-3 gap-4">
        <div className="border rounded p-4 space-y-2">
          <p className="text-sm text-gray-500">Current Stock</p>
          <p className="text-3xl font-bold">{product.stock}</p>
          <Badge variant={stockStatus.color as any}>{stockStatus.label}</Badge>
        </div>

        <div className="border rounded p-4 space-y-2">
          <p className="text-sm text-gray-500">Reorder Threshold</p>
          <p className="text-3xl font-bold">{product.reorderThreshold || '-'}</p>
          {product.reorderThreshold && product.stock <= product.reorderThreshold && (
            <Badge variant="outline" className="border-orange-500 text-orange-500">
              Below Threshold
            </Badge>
          )}
        </div>

        <div className="border rounded p-4 space-y-2">
          <p className="text-sm text-gray-500">Status</p>
          <p className="text-3xl font-bold">{product.status === 'active' ? '✓' : product.status === 'hidden' ? '⊘' : '✕'}</p>
          <Badge variant="secondary">{product.status}</Badge>
        </div>
      </div>

      <div className="space-y-4 border rounded p-4">
        <h3 className="font-medium">Reorder Alert Settings</h3>
        <div className="space-y-2">
          <Label>Minimum Stock Threshold</Label>
          <div className="flex gap-2">
            <Input
              type="number"
              value={reorderThreshold}
              onChange={(e) => setReorderThreshold(parseInt(e.target.value) || 0)}
              placeholder="Set minimum stock level"
            />
            <Button onClick={handleSaveThreshold}>
              Save
            </Button>
          </div>
          <p className="text-sm text-gray-500">
            Alert will trigger when stock falls to or below this level
          </p>
        </div>
      </div>

      <div className="space-y-4 border rounded p-4">
        <div className="flex items-center justify-between">
          <h3 className="font-medium">Manual Adjustments</h3>
          <Dialog open={adjustmentOpen} onOpenChange={setAdjustmentOpen}>
            <DialogTrigger asChild>
              <Button>Adjust Stock</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adjust Inventory - {product.name}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Adjustment Type</Label>
                  <Select
                    value={adjustmentType}
                    onValueChange={(value: any) => setAdjustmentType(value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="increase">Increase Stock</SelectItem>
                      <SelectItem value="decrease">Decrease Stock</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Amount</Label>
                  <Input
                    type="number"
                    min="0"
                    value={adjustmentAmount}
                    onChange={(e) => setAdjustmentAmount(parseInt(e.target.value) || 0)}
                    placeholder="Enter quantity"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Reason *</Label>
                  <Select value={adjustmentReason} onValueChange={setAdjustmentReason}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select reason" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new-stock">New Stock Received</SelectItem>
                      <SelectItem value="damaged">Damaged Goods</SelectItem>
                      <SelectItem value="lost">Lost/Missing Items</SelectItem>
                      <SelectItem value="audit">Audit Correction</SelectItem>
                      <SelectItem value="return">Customer Return</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="bg-gray-50 p-3 rounded">
                  <p className="text-sm">
                    <span className="font-medium">Current Stock:</span> {product.stock}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Adjusted Stock:</span>{' '}
                    {adjustmentType === 'increase'
                      ? product.stock + adjustmentAmount
                      : Math.max(0, product.stock - adjustmentAmount)}
                  </p>
                </div>

                <Button className="w-full" onClick={handleAdjustment}>
                  Confirm Adjustment
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <p className="text-sm text-gray-500">
          Adjustments require a reason and will be logged in the activity tab
        </p>
      </div>
    </div>
  );
}

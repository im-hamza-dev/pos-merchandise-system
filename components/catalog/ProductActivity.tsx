'use client';

import { Product } from '@/lib/types';
import { useSalesStore } from '@/lib/stores/sales.store';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format } from 'date-fns';

interface ProductActivityProps {
  product: Product;
}

export function ProductActivity({ product }: ProductActivityProps) {
  const { transactions } = useSalesStore();

  const relatedTransactions = transactions.filter(txn =>
    txn.items.some(item => item.productId === product.id)
  );

  const inventoryAdjustments = [
    {
      id: 'adj-1',
      date: new Date('2026-01-15T10:30:00'),
      change: 50,
      reason: 'New Stock Received',
      previousStock: 18,
      newStock: 68,
    },
    {
      id: 'adj-2',
      date: new Date('2026-01-10T14:20:00'),
      change: -2,
      reason: 'Damaged Goods',
      previousStock: 20,
      newStock: 18,
    },
  ];

  return (
    <div className="space-y-6 pt-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="border rounded p-4">
          <p className="text-sm text-muted-foreground mb-1">Total Sales</p>
          <p className="text-2xl font-bold">
            {relatedTransactions.reduce(
              (sum, txn) => sum + (txn.items.find(i => i.productId === product.id)?.quantity || 0),
              0
            )}
          </p>
          <p className="text-sm text-muted-foreground">units sold</p>
        </div>
        <div className="border rounded p-4">
          <p className="text-sm text-muted-foreground mb-1">Revenue Generated</p>
          <p className="text-2xl font-bold">
            $
            {relatedTransactions
              .reduce((sum, txn) => {
                const item = txn.items.find(i => i.productId === product.id);
                return sum + (item ? item.quantity * item.price : 0);
              }, 0)
              .toFixed(2)}
          </p>
          <p className="text-sm text-muted-foreground">total revenue</p>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="font-medium">Inventory Adjustments</h3>
        <ScrollArea className="h-[200px] border rounded">
          <div className="p-4 space-y-3">
            {inventoryAdjustments.length > 0 ? (
              inventoryAdjustments.map(adjustment => (
                <div key={adjustment.id} className="flex items-start gap-3 pb-3 border-b last:border-0">
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">
                        {adjustment.change > 0 ? '+' : ''}
                        {adjustment.change} units
                      </p>
                      <span className="text-sm text-muted-foreground">
                        {format(adjustment.date, 'MMM d, yyyy h:mm a')}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{adjustment.reason}</p>
                    <p className="text-xs text-muted-foreground/70 mt-1">
                      Stock: {adjustment.previousStock} → {adjustment.newStock}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p className="text-sm">No inventory adjustments recorded</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      <div className="space-y-3">
        <h3 className="font-medium">Related Transactions</h3>
        <ScrollArea className="h-[250px] border rounded">
          <div className="p-4 space-y-3">
            {relatedTransactions.length > 0 ? (
              relatedTransactions.map(txn => {
                const item = txn.items.find(i => i.productId === product.id);
                if (!item) return null;
                return (
                  <div key={txn.id} className="flex items-start gap-3 pb-3 border-b last:border-0">
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-medium">
                          {item.quantity} × ${item.price.toFixed(2)}
                        </p>
                        <span className="text-sm text-muted-foreground">
                          {format(txn.date, 'MMM d, yyyy h:mm a')}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {txn.customerName}
                        <Badge variant="outline" className="ml-2">
                          {txn.customerType}
                        </Badge>
                      </p>
                      {item.variants && (
                        <p className="text-xs text-muted-foreground/70 mt-1">
                          {Object.entries(item.variants)
                            .map(([k, v]) => `${k}: ${v}`)
                            .join(', ')}
                        </p>
                      )}
                      <p className="text-sm font-medium mt-1">
                        Total: ${(item.quantity * item.price).toFixed(2)}
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p className="text-sm">No transactions found for this product</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}

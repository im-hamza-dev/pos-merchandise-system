'use client';

import { useState, useEffect } from 'react';
import { useSalesStore } from '@/lib/stores/sales.store';
import { Transaction } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';

export default function SalesPage() {
  const { transactions, pickups, loading, loadTransactions, loadPickups } = useSalesStore();
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [filters, setFilters] = useState({
    buyerType: 'all',
    paymentMethod: 'all',
  });

  useEffect(() => {
    loadTransactions();
    loadPickups();
  }, [loadTransactions, loadPickups]);

  const filteredTransactions = transactions.filter(txn => {
    if (filters.buyerType !== 'all' && txn.customerType !== filters.buyerType) return false;
    if (filters.paymentMethod !== 'all' && txn.paymentMethod !== filters.paymentMethod) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Sales</h1>
        <p className="text-muted-foreground">View transactions and manage pickups</p>
      </div>

      <Tabs defaultValue="transactions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="pickups">Pickups</TabsTrigger>
        </TabsList>

        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>All Transactions ({filteredTransactions.length})</CardTitle>
                <div className="flex gap-2">
                  <Select value={filters.buyerType} onValueChange={(value) => setFilters({ ...filters, buyerType: value })}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="All Types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="member">Member</SelectItem>
                      <SelectItem value="guest">Guest</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filters.paymentMethod} onValueChange={(value) => setFilters({ ...filters, paymentMethod: value })}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="All Methods" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Methods</SelectItem>
                      <SelectItem value="Credit Card">Credit Card</SelectItem>
                      <SelectItem value="Debit Card">Debit Card</SelectItem>
                      <SelectItem value="Cash">Cash</SelectItem>
                      <SelectItem value="Mobile Payment">Mobile Payment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.map(txn => (
                    <TableRow key={txn.id} className="cursor-pointer" onClick={() => setSelectedTransaction(txn)}>
                      <TableCell>{format(txn.date, 'MMM d, yyyy h:mm a')}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{txn.customerName}</p>
                          <Badge variant="outline" className="mt-1">
                            {txn.customerType}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>{txn.items.length} items</TableCell>
                      <TableCell className="font-bold">${txn.total.toFixed(2)}</TableCell>
                      <TableCell>{txn.paymentMethod}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">View</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pickups" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pending Pickups ({pickups.filter(p => p.status === 'pending').length})</CardTitle>
            </CardHeader>
            <CardContent>
              {pickups.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No pickups found</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Transaction ID</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pickups.map(pickup => (
                      <TableRow key={pickup.id}>
                        <TableCell>{pickup.transactionId}</TableCell>
                        <TableCell>{format(pickup.createdAt, 'MMM d, yyyy')}</TableCell>
                        <TableCell>
                          <Badge variant={pickup.status === 'pending' ? 'default' : 'secondary'}>
                            {pickup.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {pickup.status === 'pending' && (
                            <Button variant="outline" size="sm">Mark Complete</Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {selectedTransaction && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Transaction Details</CardTitle>
              <Button variant="outline" onClick={() => setSelectedTransaction(null)}>Close</Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Transaction ID</p>
                <p className="font-medium">{selectedTransaction.id}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Date</p>
                <p className="font-medium">{format(selectedTransaction.date, 'MMM d, yyyy h:mm a')}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Customer</p>
                <p className="font-medium">{selectedTransaction.customerName}</p>
                <Badge variant="outline" className="mt-1">{selectedTransaction.customerType}</Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Payment Method</p>
                <p className="font-medium">{selectedTransaction.paymentMethod}</p>
              </div>
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-2">Items</p>
              <div className="space-y-2">
                {selectedTransaction.items.map((item, index) => (
                  <div key={index} className="flex justify-between p-2 border rounded">
                    <div>
                      <p className="font-medium">{item.productName}</p>
                      {item.variants && (
                        <p className="text-sm text-muted-foreground">
                          {Object.entries(item.variants).map(([k, v]) => `${k}: ${v}`).join(', ')}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{item.quantity} × ${item.price.toFixed(2)}</p>
                      <p className="text-sm text-muted-foreground">${(item.quantity * item.price).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${selectedTransaction.subtotal.toFixed(2)}</span>
              </div>
              {selectedTransaction.discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>-${selectedTransaction.discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Tax</span>
                <span>${selectedTransaction.tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg border-t pt-2">
                <span>Total</span>
                <span>${selectedTransaction.total.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

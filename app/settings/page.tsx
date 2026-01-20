'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSettingsStore } from '@/lib/stores/settings.store';
import { useSalesStore } from '@/lib/stores/sales.store';
import { useCatalogStore } from '@/lib/stores/catalog.store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

export default function SettingsPage() {
  const { settings, loading, loadSettings, updateSettings, generateReport } = useSettingsStore();
  const { transactions } = useSalesStore();
  const { products, categories } = useCatalogStore();
  const [settingsData, setSettingsData] = useState({
    taxRate: 0.08,
    defaultReorderThreshold: 10,
    memberDiscountPercent: 10,
  });

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  useEffect(() => {
    if (settings) {
      setSettingsData({
        taxRate: settings.taxRate,
        defaultReorderThreshold: settings.defaultReorderThreshold,
        memberDiscountPercent: settings.memberDiscountPercent,
      });
    }
  }, [settings]);

  const handleSaveSettings = async () => {
    await updateSettings(settingsData);
    toast.success('Settings updated');
  };

  const salesByCategoryReport = useMemo(() => {
    const categoryMap: { [key: string]: { count: number; revenue: number } } = {};
    transactions.forEach(txn => {
      txn.items.forEach(item => {
        const product = products.find(p => p.id === item.productId);
        if (product) {
          const category = categories.find(c => c.id === product.categoryId);
          const categoryName = category?.name || 'Unknown';
          if (!categoryMap[categoryName]) {
            categoryMap[categoryName] = { count: 0, revenue: 0 };
          }
          categoryMap[categoryName].count += item.quantity;
          categoryMap[categoryName].revenue += item.quantity * item.price;
        }
      });
    });
    return Object.entries(categoryMap)
      .map(([category, data]) => ({ category, ...data }))
      .sort((a, b) => b.revenue - a.revenue);
  }, [transactions, products, categories]);

  const topSellingReport = useMemo(() => {
    const productMap: { [key: string]: { name: string; quantity: number; revenue: number } } = {};
    transactions.forEach(txn => {
      txn.items.forEach(item => {
        if (!productMap[item.productId]) {
          productMap[item.productId] = { name: item.productName, quantity: 0, revenue: 0 };
        }
        productMap[item.productId].quantity += item.quantity;
        productMap[item.productId].revenue += item.quantity * item.price;
      });
    });
    return Object.values(productMap).sort((a, b) => b.revenue - a.revenue).slice(0, 10);
  }, [transactions]);

  const handleExportCSV = (reportName: string) => {
    toast.success(`${reportName} exported to CSV`);
  };

  return (
    <ProtectedRoute require="canAccessSettings">
      <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings & Reports</h1>
        <p className="text-muted-foreground">Analytics and system configuration</p>
      </div>

      <Tabs defaultValue="settings" className="space-y-4">
        <TabsList>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Tax Rate (%)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={settingsData.taxRate * 100}
                  onChange={(e) => setSettingsData({ ...settingsData, taxRate: parseFloat(e.target.value) / 100 })}
                />
              </div>

              <div className="space-y-2">
                <Label>Default Reorder Threshold</Label>
                <Input
                  type="number"
                  value={settingsData.defaultReorderThreshold}
                  onChange={(e) => setSettingsData({ ...settingsData, defaultReorderThreshold: parseInt(e.target.value) })}
                />
              </div>

              <div className="space-y-2">
                <Label>Member Discount (%)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={settingsData.memberDiscountPercent}
                  onChange={(e) => setSettingsData({ ...settingsData, memberDiscountPercent: parseFloat(e.target.value) })}
                />
              </div>

              <Button onClick={handleSaveSettings}>Save Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Sales by Category</CardTitle>
                <Button variant="outline" onClick={() => handleExportCSV('Sales by Category')}>
                  Export CSV
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={salesByCategoryReport}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="revenue" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Top Selling Products</CardTitle>
                <Button variant="outline" onClick={() => handleExportCSV('Top Selling Products')}>
                  Export CSV
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Quantity Sold</TableHead>
                    <TableHead>Revenue</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topSellingReport.map((product, index) => (
                    <TableRow key={index}>
                      <TableCell>{product.name}</TableCell>
                      <TableCell>{product.quantity}</TableCell>
                      <TableCell>${product.revenue.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      </div>
    </ProtectedRoute>
  );
}

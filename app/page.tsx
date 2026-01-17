'use client';

import { useMemo, useEffect } from 'react';
import { useSalesStore } from '@/lib/stores/sales.store';
import { useCatalogStore } from '@/lib/stores/catalog.store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format, subDays } from 'date-fns';

export default function OverviewPage() {
  const { transactions, loadTransactions } = useSalesStore();
  const { products, categories, loadProducts, loadCategories } = useCatalogStore();

  useEffect(() => {
    loadTransactions();
    loadProducts();
    loadCategories();
  }, [loadTransactions, loadProducts, loadCategories]);

  const totalRevenue = transactions.reduce((sum, txn) => sum + txn.total, 0);
  const totalTransactions = transactions.length;
  const lowStockProducts = products.filter(p => p.reorderThreshold && p.stock <= p.reorderThreshold);
  const outOfStockProducts = products.filter(p => p.stock === 0);

  const salesByDate = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = subDays(new Date(), 6 - i);
      const dateStr = format(date, 'MMM d');
      const dayTransactions = transactions.filter(
        txn => format(new Date(txn.date), 'MMM d') === dateStr
      );
      const revenue = dayTransactions.reduce((sum, txn) => sum + txn.total, 0);
      return { date: dateStr, revenue };
    });
    return last7Days;
  }, [transactions]);

  const salesByCategory = useMemo(() => {
    const categoryData: { [key: string]: number } = {};
    transactions.forEach(txn => {
      txn.items.forEach(item => {
        const product = products.find(p => p.id === item.productId);
        if (product) {
          const category = categories.find(c => c.id === product.categoryId);
          const categoryName = category?.name || 'Unknown';
          categoryData[categoryName] = (categoryData[categoryName] || 0) + item.quantity * item.price;
        }
      });
    });
    return Object.entries(categoryData).map(([name, value]) => ({ name, value }));
  }, [transactions, products, categories]);

  const customerTypeData = useMemo(() => {
    const memberRevenue = transactions
      .filter(txn => txn.customerType === 'member')
      .reduce((sum, txn) => sum + txn.total, 0);
    const guestRevenue = transactions
      .filter(txn => txn.customerType === 'guest')
      .reduce((sum, txn) => sum + txn.total, 0);
    return [
      { name: 'Members', value: memberRevenue },
      { name: 'Guests', value: guestRevenue },
    ];
  }, [transactions]);

  const COLORS = ['#3b82f6', '#10b981'];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Overview</h1>
        <p className="text-gray-500">Dashboard and key metrics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded">
                <span className="text-2xl">$</span>
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Revenue</p>
                <p className="text-2xl font-bold">${totalRevenue.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded">
                <span className="text-2xl">#</span>
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Transactions</p>
                <p className="text-2xl font-bold">{totalTransactions}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-orange-100 rounded">
                <span className="text-2xl">!</span>
              </div>
              <div>
                <p className="text-sm text-gray-500">Low Stock Items</p>
                <p className="text-2xl font-bold">{lowStockProducts.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-red-100 rounded">
                <span className="text-2xl">×</span>
              </div>
              <div>
                <p className="text-sm text-gray-500">Out of Stock</p>
                <p className="text-2xl font-bold">{outOfStockProducts.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Sales by Date (Last 7 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={salesByDate}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#3b82f6" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sales by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={salesByCategory}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Member vs Guest Spend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={customerTypeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${percent ? (percent * 100).toFixed(0) : 0}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {customerTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

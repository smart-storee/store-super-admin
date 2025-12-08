'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiRequest, getAuthToken, logout } from '@/utils/api';
import { Store, TrendingUp, Users, Package, ShoppingBag, DollarSign, Layers } from 'lucide-react';
import Link from 'next/link';

interface DashboardData {
  summary: {
    total_stores: number;
    total_customers: number;
    total_revenue: number;
    total_orders: number;
    total_categories: number;
    total_products: number;
    total_variants: number;
  };
  top_products: Array<{
    product_id: number;
    product_name: string;
    product_image: string | null;
    total_sold: number;
    total_revenue: number;
  }>;
  stores: Array<{
    store_id: number;
    store_name: string;
    owner_name: string;
    customer_count: number;
    revenue: number;
    order_count: number;
    category_count: number;
    product_count: number;
    variant_count: number;
    is_active: number;
  }>;
}

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!getAuthToken()) {
      router.push('/login');
      return;
    }

    fetchDashboard();
  }, [router]);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const response = await apiRequest<DashboardData>('/api/v1/super-admin/dashboard');
      if (response.success) {
        setData(response.data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  if (!data) return null;

  const summaryCards = [
    { title: 'Total Stores', value: data.summary.total_stores, icon: Store, color: 'bg-blue-500' },
    { title: 'Total Customers', value: data.summary.total_customers, icon: Users, color: 'bg-green-500' },
    { title: 'Total Revenue', value: `₹${data.summary.total_revenue.toLocaleString()}`, icon: DollarSign, color: 'bg-purple-500' },
    { title: 'Total Orders', value: data.summary.total_orders, icon: ShoppingBag, color: 'bg-orange-500' },
    { title: 'Categories', value: data.summary.total_categories, icon: Layers, color: 'bg-pink-500' },
    { title: 'Products', value: data.summary.total_products, icon: Package, color: 'bg-indigo-500' },
    { title: 'Variants', value: data.summary.total_variants, icon: TrendingUp, color: 'bg-teal-500' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Super Admin Dashboard</h1>
            <div className="flex gap-4">
              <Link href="/stores" className="text-blue-600 hover:text-blue-800">Stores</Link>
              <Link href="/billing" className="text-blue-600 hover:text-blue-800">Billing</Link>
              <button onClick={handleLogout} className="text-red-600 hover:text-red-800">
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {summaryCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <div key={index} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">{card.title}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-2">{card.value}</p>
                  </div>
                  <div className={`${card.color} p-3 rounded-lg`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="px-6 py-4 border-b">
            <h2 className="text-xl font-semibold text-gray-900">Top Selling Products (Last 30 Days)</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Units Sold</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {data.top_products.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-4 text-center text-gray-500">No data available</td>
                  </tr>
                ) : (
                  data.top_products.map((product) => (
                    <tr key={product.product_id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {product.product_image && (
                            <img src={product.product_image} alt={product.product_name} className="h-10 w-10 rounded object-cover mr-3" />
                          )}
                          <span className="text-sm font-medium text-gray-900">{product.product_name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.total_sold}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">₹{product.total_revenue.toLocaleString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Stores List */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b">
            <h2 className="text-xl font-semibold text-gray-900">All Stores</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Store Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Owner</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customers</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Revenue</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Orders</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {data.stores.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-gray-500">No stores found</td>
                  </tr>
                ) : (
                  data.stores.map((store) => (
                    <tr key={store.store_id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link href={`/stores/${store.store_id}`} className="text-sm font-medium text-blue-600 hover:text-blue-800">
                          {store.store_name}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{store.owner_name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{store.customer_count}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₹{store.revenue.toLocaleString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{store.order_count}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${store.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {store.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <Link href={`/stores/${store.store_id}`} className="text-blue-600 hover:text-blue-800 mr-4">
                          View
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

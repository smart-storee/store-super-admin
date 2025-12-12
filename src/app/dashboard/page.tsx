"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiRequest, getAuthToken } from "@/utils/api";
import {
  Store,
  TrendingUp,
  Users,
  Package,
  ShoppingBag,
  DollarSign,
  Layers,
  ArrowUpRight,
} from "lucide-react";
import Link from "next/link";

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
  const [error, setError] = useState("");

  useEffect(() => {
    if (!getAuthToken()) {
      router.push("/login");
      return;
    }
    fetchDashboard();
  }, [router]);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const response = await apiRequest<DashboardData>(
        "/api/v1/super-admin/dashboard"
      );
      if (response.success) {
        setData(response.data);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-200 dark:border-primary-800 border-t-primary-600 dark:border-t-primary-400"></div>
          <p className="text-slate-600 dark:text-slate-400">
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 max-w-md">
          <p className="text-red-700 dark:text-red-400 font-medium">{error}</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const summaryCards = [
    {
      title: "Total Stores",
      value: data.summary.total_stores,
      icon: Store,
      color: "from-blue-500 to-blue-600",
      bg: "bg-blue-50",
      iconColor: "text-blue-600",
    },
    {
      title: "Total Customers",
      value: data.summary.total_customers,
      icon: Users,
      color: "from-green-500 to-green-600",
      bg: "bg-green-50",
      iconColor: "text-green-600",
    },
    {
      title: "Total Revenue",
      value: `₹${data.summary.total_revenue.toLocaleString()}`,
      icon: DollarSign,
      color: "from-purple-500 to-purple-600",
      bg: "bg-purple-50",
      iconColor: "text-purple-600",
    },
    {
      title: "Total Orders",
      value: data.summary.total_orders,
      icon: ShoppingBag,
      color: "from-orange-500 to-orange-600",
      bg: "bg-orange-50",
      iconColor: "text-orange-600",
    },
    {
      title: "Categories",
      value: data.summary.total_categories,
      icon: Layers,
      color: "from-pink-500 to-pink-600",
      bg: "bg-pink-50",
      iconColor: "text-pink-600",
    },
    {
      title: "Products",
      value: data.summary.total_products,
      icon: Package,
      color: "from-indigo-500 to-indigo-600",
      bg: "bg-indigo-50",
      iconColor: "text-indigo-600",
    },
    {
      title: "Variants",
      value: data.summary.total_variants,
      icon: TrendingUp,
      color: "from-teal-500 to-teal-600",
      bg: "bg-teal-50",
      iconColor: "text-teal-600",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
          Dashboard
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          Overview of your platform
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div
              key={index}
              className="bg-white dark:bg-slate-800 rounded-xl shadow-card p-6 border border-slate-200 dark:border-slate-700 hover:shadow-card-lg transition-all duration-200 group"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
                    {card.title}
                  </p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                    {card.value}
                  </p>
                </div>
                <div
                  className={`${card.bg} dark:bg-opacity-20 p-3 rounded-xl group-hover:scale-110 transition-transform`}
                >
                  <Icon
                    className={`h-6 w-6 ${card.iconColor} dark:opacity-80`}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Top Products */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-card border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Top Selling Products
            </h2>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Last 30 Days
            </span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-slate-700/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Units Sold
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Revenue
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {data.top_products.length === 0 ? (
                <tr>
                  <td
                    colSpan={3}
                    className="px-6 py-8 text-center text-slate-500 dark:text-slate-400"
                  >
                    <Package className="h-8 w-8 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
                    <p>No products data available</p>
                  </td>
                </tr>
              ) : (
                data.top_products.map((product) => (
                  <tr
                    key={product.product_id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        {product.product_image ? (
                          <img
                            src={product.product_image}
                            alt={product.product_name}
                            className="h-10 w-10 rounded-lg object-cover border border-slate-200 dark:border-slate-600"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                            <Package className="h-5 w-5 text-slate-400 dark:text-slate-500" />
                          </div>
                        )}
                        <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                          {product.product_name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400">
                      {product.total_sold}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-900 dark:text-slate-100">
                      ₹{product.total_revenue.toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stores List */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-card border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              All Stores
            </h2>
            <Link
              href="/stores"
              className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium flex items-center gap-1"
            >
              View all
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-slate-700/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Store Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Owner
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Customers
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Revenue
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Orders
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {data.stores.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-8 text-center text-slate-500 dark:text-slate-400"
                  >
                    <Store className="h-8 w-8 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
                    <p>No stores found</p>
                  </td>
                </tr>
              ) : (
                data.stores.map((store) => (
                  <tr
                    key={store.store_id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link
                        href={`/stores/${store.store_id}`}
                        className="text-sm font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
                      >
                        {store.store_name}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400">
                      {store.owner_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400">
                      {store.customer_count}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-slate-100">
                      ₹{store.revenue.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400">
                      {store.order_count}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                          store.is_active
                            ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400"
                            : "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400"
                        }`}
                      >
                        {store.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <Link
                        href={`/stores/${store.store_id}`}
                        className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium transition-colors"
                      >
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
    </div>
  );
}

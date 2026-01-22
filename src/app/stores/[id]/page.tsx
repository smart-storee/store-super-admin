"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { apiRequest, getAuthToken } from "@/utils/api";
import Link from "next/link";
import { ArrowLeft, Save, Settings, Bell } from "lucide-react";
import { useToast } from "@/components/Toast";

export default function StoreDetailPage() {
  const router = useRouter();
  const params = useParams();
  const toast = useToast();
  const storeId = params.id;

  const [store, setStore] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [features, setFeatures] = useState({
    billing_status: "pending" as "active" | "pending" | "suspended" | "expired",
    billing_paid_until: null as string | null,
    last_billing_date: null as string | null,
    push_notifications_enabled: true,
    sms_enabled: true,
    whatsapp_enabled: false,
    email_enabled: false,
    max_categories: null as number | null,
    max_products: null as number | null,
    max_variants: null as number | null,
    max_branches: null as number | null,
    add_options_enabled: true,
    coupon_codes_enabled: true,
    app_settings_enabled: true,
    customers_enabled: true,
    employees_enabled: true,
    home_config_enabled: true,
    reports_enabled: true,
    branches_enabled: true,
    categories_enabled: true,
    products_enabled: true,
    orders_enabled: true,
    notifications_enabled: true,
    communication_logs_enabled: true,
    billings_enabled: true,
  });

  useEffect(() => {
    if (!getAuthToken()) {
      router.push("/login");
      return;
    }
    fetchStore();
  }, [storeId, router]);

  const fetchStore = async () => {
    try {
      setLoading(true);
      const response = await apiRequest<any>(
        `/api/v1/super-admin/stores/${storeId}`
      );
      console.log("Store API Response:", response);
      if (response.success && response.data) {
        setStore(response.data);
        setFeatures({
          billing_status: response.data.billing_status || "pending",
          billing_paid_until: response.data.billing_paid_until || null,
          last_billing_date: response.data.last_billing_date || null,
          push_notifications_enabled:
            response.data.push_notifications_enabled === 1 ||
            response.data.push_notifications_enabled === true,
          sms_enabled:
            response.data.sms_enabled === 1 ||
            response.data.sms_enabled === true,
          whatsapp_enabled:
            response.data.whatsapp_enabled === 1 ||
            response.data.whatsapp_enabled === true,
          email_enabled:
            response.data.email_enabled === 1 ||
            response.data.email_enabled === true,
          max_categories: response.data.max_categories,
          max_products: response.data.max_products,
          max_variants: response.data.max_variants,
          max_branches: response.data.max_branches,
          add_options_enabled:
            response.data.add_options_enabled === 1 ||
            response.data.add_options_enabled === true,
          coupon_codes_enabled:
            response.data.coupon_codes_enabled === 1 ||
            response.data.coupon_codes_enabled === true,
          app_settings_enabled:
            response.data.app_settings_enabled === 1 ||
            response.data.app_settings_enabled === true,
          customers_enabled:
            response.data.customers_enabled === 1 ||
            response.data.customers_enabled === true,
          employees_enabled:
            response.data.employees_enabled === 1 ||
            response.data.employees_enabled === true,
          home_config_enabled:
            response.data.home_config_enabled === 1 ||
            response.data.home_config_enabled === true,
          reports_enabled:
            response.data.reports_enabled === 1 ||
            response.data.reports_enabled === true,
          branches_enabled:
            response.data.branches_enabled === 1 ||
            response.data.branches_enabled === true,
          categories_enabled:
            response.data.categories_enabled === 1 ||
            response.data.categories_enabled === true,
          products_enabled:
            response.data.products_enabled === 1 ||
            response.data.products_enabled === true,
          orders_enabled:
            response.data.orders_enabled === 1 ||
            response.data.orders_enabled === true,
          notifications_enabled:
            response.data.notifications_enabled === 1 ||
            response.data.notifications_enabled === true,
          communication_logs_enabled:
            response.data.communication_logs_enabled === 1 ||
            response.data.communication_logs_enabled === true,
          billings_enabled:
            response.data.billings_enabled === 1 ||
            response.data.billings_enabled === true,
        });
      } else {
        console.error("Failed to fetch store:", response);
        setError(response.message || "Failed to load store details");
      }
    } catch (err: any) {
      console.error("Error fetching store:", err);
      setError(err.message || "Unknown error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      // Ensure all boolean fields are explicitly sent (even if false)
      const featuresToSave = {
        ...features,
        // Explicitly include all boolean flags to ensure false values are sent
        push_notifications_enabled: features.push_notifications_enabled ?? true,
        sms_enabled: features.sms_enabled ?? true,
        whatsapp_enabled: features.whatsapp_enabled ?? false,
        email_enabled: features.email_enabled ?? false,
        add_options_enabled: features.add_options_enabled ?? true,
        coupon_codes_enabled: features.coupon_codes_enabled ?? true,
        app_settings_enabled: features.app_settings_enabled ?? true,
        customers_enabled: features.customers_enabled ?? true,
        employees_enabled: features.employees_enabled ?? true,
        home_config_enabled: features.home_config_enabled ?? true,
        reports_enabled: features.reports_enabled ?? true,
        branches_enabled: features.branches_enabled ?? true,
        categories_enabled: features.categories_enabled ?? true,
        products_enabled: features.products_enabled ?? true,
        orders_enabled: features.orders_enabled ?? true,
        notifications_enabled: features.notifications_enabled ?? true,
        communication_logs_enabled: features.communication_logs_enabled ?? true,
        billings_enabled: features.billings_enabled ?? true,
      };

      const response = await apiRequest(
        `/api/v1/super-admin/stores/${storeId}/features`,
        {
          method: "PUT",
          body: JSON.stringify(featuresToSave),
        }
      );
      if (response.success) {
        toast.success("Features updated successfully!");
        fetchStore();
      } else {
        toast.error(
          "Failed to update features: " + (response.message || "Unknown error")
        );
      }
    } catch (err: any) {
      toast.error("Failed to update features: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const Toggle = ({
    enabled,
    onChange,
    label,
  }: {
    enabled: boolean;
    onChange: (val: boolean) => void;
    label: string;
  }) => (
    <div className="flex items-center justify-between py-3 border-b border-slate-200 dark:border-slate-700">
      <span className="text-sm font-medium text-gray-700 dark:text-slate-300">
        {label}
      </span>
      <button
        onClick={() => onChange(!enabled)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          enabled
            ? "bg-blue-600 dark:bg-blue-500"
            : "bg-gray-300 dark:bg-slate-600"
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white dark:bg-slate-200 transition-transform ${
            enabled ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400"></div>
      </div>
    );
  }

  if (error || !store) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center bg-white dark:bg-slate-800 p-8 rounded-lg shadow border border-slate-200 dark:border-slate-700">
          <p className="text-red-600 dark:text-red-400 mb-4 font-semibold">
            {error || "Store not found or failed to load"}
          </p>
          <Link
            href="/stores"
            className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Stores
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <header className="bg-white dark:bg-slate-800 shadow-sm border-b dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/stores"
                className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">
                {store.store_name}
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href={`/stores/${storeId}/notification-templates`}
                className="flex items-center gap-2 text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 px-4 py-2 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 border border-purple-200 dark:border-purple-800"
              >
                <Bell className="h-4 w-4" />
                Notification Templates
              </Link>
              <Link
                href={`/stores/${storeId}/permissions`}
                className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 px-4 py-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 border border-blue-200 dark:border-blue-800"
              >
                <Settings className="h-4 w-4" />
                Manage User Role Permissions
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="lg:py-8">
        {/* Store Info */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow mb-6 p-6 border border-slate-200 dark:border-slate-700">
          <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-slate-100">
            Store Information
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600 dark:text-slate-400">
                Owner Name
              </p>
              <p className="font-medium text-gray-900 dark:text-slate-100">
                {store.owner_name}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-slate-400">Email</p>
              <p className="font-medium text-gray-900 dark:text-slate-100">
                {store.owner_email}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-slate-400">Phone</p>
              <p className="font-medium text-gray-900 dark:text-slate-100">
                {store.owner_phone}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-slate-400">
                Status
              </p>
              <span
                className={`px-2 py-1 text-xs rounded-full ${
                  store.is_active
                    ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400"
                    : "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400"
                }`}
              >
                {store.is_active ? "Active" : "Inactive"}
              </span>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-slate-400">
                Billing Status
              </p>
              <span
                className={`px-2 py-1 text-xs rounded-full ${
                  features.billing_status === "active"
                    ? "bg-green-100 text-green-800"
                    : features.billing_status === "pending"
                    ? "bg-yellow-100 text-yellow-800"
                    : features.billing_status === "expired"
                    ? "bg-red-100 text-red-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {features.billing_status.charAt(0).toUpperCase() +
                  features.billing_status.slice(1)}
              </span>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-slate-400">
                Billing Paid Until
              </p>
              <p className="font-medium text-gray-900 dark:text-slate-100">
                {features.billing_paid_until
                  ? new Date(features.billing_paid_until).toLocaleDateString()
                  : "Not set"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-slate-400">
                Customers
              </p>
              <p className="font-medium text-gray-900 dark:text-slate-100">
                {store.customer_count}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-slate-400">
                Total Revenue
              </p>
              <p className="font-medium text-gray-900 dark:text-slate-100">
                ₹{store.total_revenue?.toLocaleString() || 0}
              </p>
            </div>
          </div>
        </div>

        {/* Billing Control */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow mb-6 p-6 border border-slate-200 dark:border-slate-700">
          <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-slate-100">
            Billing Control
          </h2>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                Billing Status
              </label>
              <select
                value={features.billing_status}
                onChange={(e) =>
                  setFeatures({
                    ...features,
                    billing_status: e.target.value as any,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100"
              >
                <option value="pending">Pending</option>
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
                <option value="expired">Expired</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                Billing Paid Until
              </label>
              <input
                type="date"
                value={features.billing_paid_until || ""}
                onChange={(e) =>
                  setFeatures({
                    ...features,
                    billing_paid_until: e.target.value || null,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                Last Billing Date
              </label>
              <input
                type="date"
                value={features.last_billing_date || ""}
                onChange={(e) =>
                  setFeatures({
                    ...features,
                    last_billing_date: e.target.value || null,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100"
              />
            </div>
          </div>
          <p className="mt-3 text-xs text-gray-500 dark:text-slate-400">
            {features.billing_status !== "active" && (
              <span className="text-red-600 dark:text-red-400 font-semibold">
                ⚠️ Features will be disabled when billing status is not "active"
              </span>
            )}
          </p>
        </div>

        {/* Store Features Section */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-100">Store Features</h2>
              <p className="text-sm text-gray-600 dark:text-slate-400 mt-1">
                Control which features are available for this store. These are
                store-level feature flags.
              </p>
            </div>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 dark:hover:bg-blue-800"
            >
              <Save className="h-4 w-4" />
              {saving ? "Saving..." : "Save Features"}
            </button>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-400 dark:border-blue-600 p-4 mb-6">
            <p className="text-sm text-blue-700 dark:text-blue-400">
              <strong>Note:</strong> Store Features control what functionality
              is available to the store owner. User Role Permissions (managed
              separately) control what individual staff members can do.
            </p>
          </div>

          <div className="space-y-2">
            <Toggle
              enabled={features.push_notifications_enabled}
              onChange={(val) =>
                setFeatures({ ...features, push_notifications_enabled: val })
              }
              label="Push Notifications"
            />
            <Toggle
              enabled={features.sms_enabled}
              onChange={(val) => setFeatures({ ...features, sms_enabled: val })}
              label="SMS"
            />
            <Toggle
              enabled={features.whatsapp_enabled}
              onChange={(val) =>
                setFeatures({ ...features, whatsapp_enabled: val })
              }
              label="WhatsApp"
            />
            <Toggle
              enabled={features.email_enabled}
              onChange={(val) =>
                setFeatures({ ...features, email_enabled: val })
              }
              label="Email"
            />
            <Toggle
              enabled={features.add_options_enabled}
              onChange={(val) =>
                setFeatures({ ...features, add_options_enabled: val })
              }
              label="Add Options"
            />
            <Toggle
              enabled={features.coupon_codes_enabled}
              onChange={(val) =>
                setFeatures({ ...features, coupon_codes_enabled: val })
              }
              label="Coupon Codes"
            />
            <Toggle
              enabled={features.app_settings_enabled}
              onChange={(val) =>
                setFeatures({ ...features, app_settings_enabled: val })
              }
              label="App Settings"
            />
            <Toggle
              enabled={features.customers_enabled}
              onChange={(val) =>
                setFeatures({ ...features, customers_enabled: val })
              }
              label="Customer List"
            />
            <Toggle
              enabled={features.employees_enabled}
              onChange={(val) =>
                setFeatures({ ...features, employees_enabled: val })
              }
              label="Employee Management"
            />
            <Toggle
              enabled={features.home_config_enabled}
              onChange={(val) =>
                setFeatures({ ...features, home_config_enabled: val })
              }
              label="Home Config"
            />
            <Toggle
              enabled={features.reports_enabled}
              onChange={(val) =>
                setFeatures({ ...features, reports_enabled: val })
              }
              label="Reports"
            />
            <Toggle
              enabled={features.branches_enabled}
              onChange={(val) =>
                setFeatures({ ...features, branches_enabled: val })
              }
              label="Branches Management"
            />
            <Toggle
              enabled={features.categories_enabled}
              onChange={(val) =>
                setFeatures({ ...features, categories_enabled: val })
              }
              label="Categories Management"
            />
            <Toggle
              enabled={features.products_enabled}
              onChange={(val) =>
                setFeatures({ ...features, products_enabled: val })
              }
              label="Products Management"
            />
            <Toggle
              enabled={features.orders_enabled}
              onChange={(val) =>
                setFeatures({ ...features, orders_enabled: val })
              }
              label="Orders Management"
            />
            <Toggle
              enabled={features.notifications_enabled}
              onChange={(val) =>
                setFeatures({ ...features, notifications_enabled: val })
              }
              label="Notifications"
            />
            <Toggle
              enabled={features.communication_logs_enabled}
              onChange={(val) =>
                setFeatures({ ...features, communication_logs_enabled: val })
              }
              label="Communication Logs"
            />
            <Toggle
              enabled={features.billings_enabled}
              onChange={(val) =>
                setFeatures({ ...features, billings_enabled: val })
              }
              label="Billing Access"
            />
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-slate-700">
            <h3 className="text-md font-semibold text-gray-900 dark:text-slate-100 mb-4">
              Limits (Leave empty for unlimited)
            </h3>
            <div className="grid grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  Max Categories
                </label>
                <input
                  type="number"
                  value={features.max_categories || ""}
                  onChange={(e) =>
                    setFeatures({
                      ...features,
                      max_categories: e.target.value
                        ? parseInt(e.target.value)
                        : null,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500"
                  placeholder="Unlimited"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  Max Products
                </label>
                <input
                  type="number"
                  value={features.max_products || ""}
                  onChange={(e) =>
                    setFeatures({
                      ...features,
                      max_products: e.target.value
                        ? parseInt(e.target.value)
                        : null,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500"
                  placeholder="Unlimited"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  Max Variants
                </label>
                <input
                  type="number"
                  value={features.max_variants || ""}
                  onChange={(e) =>
                    setFeatures({
                      ...features,
                      max_variants: e.target.value
                        ? parseInt(e.target.value)
                        : null,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500"
                  placeholder="Unlimited"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  Max Branches
                </label>
                <input
                  type="number"
                  value={features.max_branches || ""}
                  onChange={(e) =>
                    setFeatures({
                      ...features,
                      max_branches: e.target.value
                        ? parseInt(e.target.value)
                        : null,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500"
                  placeholder="Unlimited"
                />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiRequest, getAuthToken } from "@/utils/api";
import Link from "next/link";
import { ArrowLeft, Plus, CheckCircle, XCircle, Clock, X } from "lucide-react";
import { useToast } from "@/components/Toast";

export default function BillingPage() {
  const router = useRouter();
  const toast = useToast();
  const [invoices, setInvoices] = useState<any[]>([]);
  const [stores, setStores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newInvoice, setNewInvoice] = useState({
    store_id: "",
    billing_month: "",
    base_amount: "",
    sms_charges: "",
    push_notification_charges: "",
    additional_charges: "",
  });

  useEffect(() => {
    if (!getAuthToken()) {
      router.push("/login");
      return;
    }
    fetchInvoices();
    fetchStores();
  }, [router]);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const response = await apiRequest<any[]>(
        "/api/v1/super-admin/billing/invoices"
      );
      if (response.success) {
        setInvoices(response.data);
      }
    } catch (err: any) {
      console.error("Error fetching invoices:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStores = async () => {
    try {
      const response = await apiRequest<any[]>("/api/v1/super-admin/stores");
      if (response.success) {
        setStores(response.data);
      }
    } catch (err: any) {
      console.error("Error fetching stores:", err);
    }
  };

  const handleCreateInvoice = async () => {
    try {
      // Convert billing_month from 'YYYY-MM' to 'YYYY-MM-01' (first day of month)
      let billingMonthDate = newInvoice.billing_month;
      if (billingMonthDate && billingMonthDate.length === 7) {
        // If format is 'YYYY-MM', convert to 'YYYY-MM-01'
        billingMonthDate = billingMonthDate + "-01";
      }

      const response = await apiRequest(
        "/api/v1/super-admin/billing/invoices",
        {
          method: "POST",
          body: JSON.stringify({
            ...newInvoice,
            store_id: parseInt(newInvoice.store_id),
            billing_month: billingMonthDate,
            base_amount: parseFloat(newInvoice.base_amount || "0"),
            sms_charges: parseFloat(newInvoice.sms_charges || "0"),
            push_notification_charges: parseFloat(
              newInvoice.push_notification_charges || "0"
            ),
            additional_charges: parseFloat(
              newInvoice.additional_charges || "0"
            ),
          }),
        }
      );
      if (response.success) {
        setShowCreateModal(false);
        setNewInvoice({
          store_id: "",
          billing_month: "",
          base_amount: "",
          sms_charges: "",
          push_notification_charges: "",
          additional_charges: "",
        });
        fetchInvoices();
        toast.success("Invoice created successfully!");
      } else {
        toast.error(
          "Failed to create invoice: " + (response.message || "Unknown error")
        );
      }
    } catch (err: any) {
      console.error("Create invoice error:", err);
      toast.error("Failed to create invoice: " + err.message);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "paid":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "pending":
        return <Clock className="h-5 w-5 text-yellow-600" />;
      case "overdue":
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Clock className="h-5 w-5 text-gray-600" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400"></div>
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
                href="/dashboard"
                className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">
                Billing & Invoices
              </h1>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 bg-blue-600 dark:bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600"
            >
              <Plus className="h-4 w-4" />
              Create Invoice
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow overflow-hidden border border-slate-200 dark:border-slate-700">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-slate-700/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">
                  Invoice #
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">
                  Store
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">
                  Billing Month
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">
                  Due Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
              {invoices.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-4 text-center text-gray-500 dark:text-slate-400"
                  >
                    No invoices found
                  </td>
                </tr>
              ) : (
                invoices.map((invoice) => (
                  <tr
                    key={invoice.invoice_id}
                    className="hover:bg-gray-50 dark:hover:bg-slate-700/50"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-slate-100">
                      {invoice.invoice_number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-slate-400">
                      {invoice.store_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-slate-400">
                      {new Date(invoice.billing_month).toLocaleDateString(
                        "en-US",
                        { year: "numeric", month: "long" }
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-slate-100">
                      ₹{invoice.total_amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(invoice.payment_status)}
                        <span className="text-sm capitalize text-gray-700 dark:text-slate-300">
                          {invoice.payment_status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-slate-400">
                      {new Date(invoice.due_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <Link
                        href={`/billing/${invoice.invoice_id}`}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
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
      </main>

      {/* Create Invoice Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-slate-700">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-slate-100">
                Create New Invoice
              </h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                  Store *
                </label>
                <select
                  required
                  value={newInvoice.store_id}
                  onChange={(e) =>
                    setNewInvoice({ ...newInvoice, store_id: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100"
                >
                  <option value="">Select a store</option>
                  {stores.map((store) => (
                    <option key={store.store_id} value={store.store_id}>
                      {store.store_name} - {store.owner_name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                  Billing Month *
                </label>
                <input
                  type="month"
                  required
                  value={newInvoice.billing_month}
                  onChange={(e) =>
                    setNewInvoice({
                      ...newInvoice,
                      billing_month: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                  Base Amount
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={newInvoice.base_amount}
                  onChange={(e) =>
                    setNewInvoice({
                      ...newInvoice,
                      base_amount: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                  SMS Charges
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={newInvoice.sms_charges}
                  onChange={(e) =>
                    setNewInvoice({
                      ...newInvoice,
                      sms_charges: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                  Push Notification Charges
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={newInvoice.push_notification_charges}
                  onChange={(e) =>
                    setNewInvoice({
                      ...newInvoice,
                      push_notification_charges: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                  Additional Charges
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={newInvoice.additional_charges}
                  onChange={(e) =>
                    setNewInvoice({
                      ...newInvoice,
                      additional_charges: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100"
                />
              </div>
            </div>
            <div className="flex gap-4 mt-6">
              <button
                onClick={handleCreateInvoice}
                className="flex-1 bg-blue-600 dark:bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600"
              >
                Create
              </button>
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 bg-gray-200 dark:bg-slate-700 text-gray-800 dark:text-slate-300 px-4 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-slate-600"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

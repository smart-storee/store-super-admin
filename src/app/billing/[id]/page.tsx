"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { apiRequest, getAuthToken } from "@/utils/api";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";

export default function InvoiceDetailPage() {
  const router = useRouter();
  const params = useParams();
  const invoiceId = params.id;

  const [invoice, setInvoice] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [paymentData, setPaymentData] = useState({
    payment_status: "pending",
    payment_date: "",
    payment_method: "",
    payment_reference: "",
    payment_notes: "",
  });

  useEffect(() => {
    if (!getAuthToken()) {
      router.push("/login");
      return;
    }
    fetchInvoice();
  }, [invoiceId, router]);

  const fetchInvoice = async () => {
    try {
      setLoading(true);
      const response = await apiRequest<any>(
        `/api/v1/super-admin/billing/invoices/${invoiceId}`
      );
      if (response.success) {
        setInvoice(response.data);
        setPaymentData({
          payment_status: response.data.payment_status || "pending",
          payment_date: response.data.payment_date || "",
          payment_method: response.data.payment_method || "",
          payment_reference: response.data.payment_reference || "",
          payment_notes: response.data.payment_notes || "",
        });
      }
    } catch (err: any) {
      console.error("Error fetching invoice:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePayment = async () => {
    try {
      setSaving(true);
      const response = await apiRequest(
        `/api/v1/super-admin/billing/invoices/${invoiceId}/payment`,
        {
          method: "PUT",
          body: JSON.stringify(paymentData),
        }
      );
      if (response.success) {
        alert("Payment status updated successfully!");
        fetchInvoice();
      }
    } catch (err: any) {
      alert("Failed to update payment: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400"></div>
      </div>
    );
  }

  if (!invoice) return null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <header className="bg-white dark:bg-slate-800 shadow-sm border-b dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Link href="/billing" className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">
              Invoice {invoice.invoice_number}
            </h1>
          </div>
        </div>
      </header>

      <main className="lg:py-8">
        {/* Invoice Details */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow mb-6 p-6 border border-slate-200 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-4">Invoice Details</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600 dark:text-slate-400">Store</p>
              <p className="font-medium text-gray-900 dark:text-slate-100">{invoice.store_name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-slate-400">Billing Month</p>
              <p className="font-medium text-gray-900 dark:text-slate-100">
                {new Date(invoice.billing_month).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                })}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-slate-400">Base Amount</p>
              <p className="font-medium text-gray-900 dark:text-slate-100">
                ₹{invoice.base_amount?.toLocaleString() || 0}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-slate-400">SMS Charges</p>
              <p className="font-medium text-gray-900 dark:text-slate-100">
                ₹{invoice.sms_charges?.toLocaleString() || 0}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-slate-400">Push Notification Charges</p>
              <p className="font-medium text-gray-900 dark:text-slate-100">
                ₹{invoice.push_notification_charges?.toLocaleString() || 0}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-slate-400">Additional Charges</p>
              <p className="font-medium text-gray-900 dark:text-slate-100">
                ₹{invoice.additional_charges?.toLocaleString() || 0}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-slate-400">Total Amount</p>
              <p className="font-medium text-lg text-gray-900 dark:text-slate-100">
                ₹{invoice.total_amount?.toLocaleString() || 0}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-slate-400">Due Date</p>
              <p className="font-medium text-gray-900 dark:text-slate-100">
                {new Date(invoice.due_date).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {/* Payment Status */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6 border border-slate-200 dark:border-slate-700">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-100">Payment Status</h2>
            <button
              onClick={handleUpdatePayment}
              disabled={saving}
              className="flex items-center gap-2 bg-blue-600 dark:bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {saving ? "Saving..." : "Update Payment"}
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                Payment Status
              </label>
              <select
                value={paymentData.payment_status}
                onChange={(e) =>
                  setPaymentData({
                    ...paymentData,
                    payment_status: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100"
              >
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="overdue">Overdue</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                Payment Date
              </label>
              <input
                type="date"
                value={paymentData.payment_date}
                onChange={(e) =>
                  setPaymentData({
                    ...paymentData,
                    payment_date: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                Payment Method
              </label>
              <input
                type="text"
                value={paymentData.payment_method}
                onChange={(e) =>
                  setPaymentData({
                    ...paymentData,
                    payment_method: e.target.value,
                  })
                }
                placeholder="e.g., cash, bank_transfer, upi"
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                Payment Reference
              </label>
              <input
                type="text"
                value={paymentData.payment_reference}
                onChange={(e) =>
                  setPaymentData({
                    ...paymentData,
                    payment_reference: e.target.value,
                  })
                }
                placeholder="Transaction reference number"
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                Notes
              </label>
              <textarea
                value={paymentData.payment_notes}
                onChange={(e) =>
                  setPaymentData({
                    ...paymentData,
                    payment_notes: e.target.value,
                  })
                }
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100"
                placeholder="Additional notes about the payment"
              />
            </div>
          </div>
        </div>

        {/* History */}
        {invoice.history && invoice.history.length > 0 && (
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6 mt-6 border border-slate-200 dark:border-slate-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-4">Payment History</h2>
            <div className="space-y-3">
              {invoice.history.map((item: any, index: number) => (
                <div
                  key={index}
                  className="border-l-4 border-blue-500 dark:border-blue-400 pl-4 py-2"
                >
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-900 dark:text-slate-100">
                      {item.action_type.replace("_", " ")}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-slate-400">
                      {new Date(item.created_at).toLocaleString()}
                    </span>
                  </div>
                  {item.notes && (
                    <p className="text-sm text-gray-600 dark:text-slate-400 mt-1">{item.notes}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

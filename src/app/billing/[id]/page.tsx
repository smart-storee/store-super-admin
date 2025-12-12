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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!invoice) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Link href="/billing" className="text-blue-600 hover:text-blue-800">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">
              Invoice {invoice.invoice_number}
            </h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Invoice Details */}
        <div className="bg-white rounded-lg shadow mb-6 p-6">
          <h2 className="text-lg font-semibold mb-4">Invoice Details</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Store</p>
              <p className="font-medium">{invoice.store_name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Billing Month</p>
              <p className="font-medium">
                {new Date(invoice.billing_month).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                })}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Base Amount</p>
              <p className="font-medium">
                ₹{invoice.base_amount?.toLocaleString() || 0}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">SMS Charges</p>
              <p className="font-medium">
                ₹{invoice.sms_charges?.toLocaleString() || 0}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Push Notification Charges</p>
              <p className="font-medium">
                ₹{invoice.push_notification_charges?.toLocaleString() || 0}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Additional Charges</p>
              <p className="font-medium">
                ₹{invoice.additional_charges?.toLocaleString() || 0}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Amount</p>
              <p className="font-medium text-lg">
                ₹{invoice.total_amount?.toLocaleString() || 0}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Due Date</p>
              <p className="font-medium">
                {new Date(invoice.due_date).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {/* Payment Status */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold">Payment Status</h2>
            <button
              onClick={handleUpdatePayment}
              disabled={saving}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {saving ? "Saving..." : "Update Payment"}
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="overdue">Overdue</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="Additional notes about the payment"
              />
            </div>
          </div>
        </div>

        {/* History */}
        {invoice.history && invoice.history.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6 mt-6">
            <h2 className="text-lg font-semibold mb-4">Payment History</h2>
            <div className="space-y-3">
              {invoice.history.map((item: any, index: number) => (
                <div
                  key={index}
                  className="border-l-4 border-blue-500 pl-4 py-2"
                >
                  <div className="flex justify-between">
                    <span className="font-medium">
                      {item.action_type.replace("_", " ")}
                    </span>
                    <span className="text-sm text-gray-500">
                      {new Date(item.created_at).toLocaleString()}
                    </span>
                  </div>
                  {item.notes && (
                    <p className="text-sm text-gray-600 mt-1">{item.notes}</p>
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

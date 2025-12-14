"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { apiRequest, getAuthToken } from "@/utils/api";
import Link from "next/link";
import { ArrowLeft, Save, Plus, Edit, Trash2, Bell } from "lucide-react";
import { useToast } from "@/components/Toast";

interface NotificationTemplate {
  template_id: number;
  store_id: number;
  branch_id: number | null;
  template_name: string;
  template_type: "promotional" | "transactional" | "order_status";
  event_type: string;
  title_template: string;
  message_template: string;
  is_active: number;
  is_default: number;
  created_at: string;
  updated_at: string;
}

export default function NotificationTemplatesPage() {
  const router = useRouter();
  const params = useParams();
  const toast = useToast();
  const storeId = params.id;

  const [templates, setTemplates] = useState<NotificationTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingTemplate, setEditingTemplate] =
    useState<NotificationTemplate | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [store, setStore] = useState<any>(null);

  const [formData, setFormData] = useState({
    template_name: "",
    template_type: "transactional" as
      | "promotional"
      | "transactional"
      | "order_status",
    event_type: "",
    title_template: "",
    message_template: "",
    is_active: true,
  });

  useEffect(() => {
    if (!getAuthToken()) {
      router.push("/login");
      return;
    }
    fetchStore();
    fetchTemplates();
  }, [storeId, router]);

  const fetchStore = async () => {
    try {
      const response = await apiRequest<any>(
        `/api/v1/super-admin/stores/${storeId}`
      );
      if (response.success && response.data) {
        setStore(response.data);
      }
    } catch (err: any) {
      console.error("Error fetching store:", err);
    }
  };

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const response = await apiRequest<NotificationTemplate[]>(
        `/api/v1/super-admin/stores/${storeId}/notification-templates`
      );
      if (response.success) {
        setTemplates(response.data || []);
      }
    } catch (err: any) {
      console.error("Error fetching templates:", err);
      toast.error("Failed to load notification templates");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (template: NotificationTemplate) => {
    setEditingTemplate(template);
    setFormData({
      template_name: template.template_name,
      template_type: template.template_type,
      event_type: template.event_type,
      title_template: template.title_template,
      message_template: template.message_template,
      is_active: template.is_active === 1,
    });
    setShowCreateForm(true);
  };

  const handleCreate = () => {
    setEditingTemplate(null);
    setFormData({
      template_name: "",
      template_type: "transactional",
      event_type: "",
      title_template: "",
      message_template: "",
      is_active: true,
    });
    setShowCreateForm(true);
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      if (editingTemplate) {
        // Update existing template
        const response = await apiRequest<any>(
          `/api/v1/super-admin/stores/${storeId}/notification-templates/${editingTemplate.template_id}`,
          {
            method: "PUT",
            body: JSON.stringify(formData),
          }
        );

        if (response.success) {
          toast.success("Notification template updated successfully");
          setShowCreateForm(false);
          setEditingTemplate(null);
          fetchTemplates();
        } else {
          toast.error(response.message || "Failed to update template");
        }
      } else {
        // Create new template
        const response = await apiRequest<any>(
          `/api/v1/super-admin/stores/${storeId}/notification-templates`,
          {
            method: "POST",
            body: JSON.stringify(formData),
          }
        );

        if (response.success) {
          toast.success("Notification template created successfully");
          setShowCreateForm(false);
          fetchTemplates();
        } else {
          toast.error(response.message || "Failed to create template");
        }
      }
    } catch (err: any) {
      toast.error("Error saving template: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (templateId: number) => {
    if (
      !confirm("Are you sure you want to delete this notification template?")
    ) {
      return;
    }

    try {
      const response = await apiRequest<any>(
        `/api/v1/super-admin/stores/${storeId}/notification-templates/${templateId}`,
        {
          method: "DELETE",
        }
      );

      if (response.success) {
        toast.success("Notification template deleted successfully");
        fetchTemplates();
      } else {
        toast.error(response.message || "Failed to delete template");
      }
    } catch (err: any) {
      toast.error("Error deleting template: " + err.message);
    }
  };

  const eventTypeOptions = [
    { value: "order_created", label: "Order Created" },
    { value: "order_confirmed", label: "Order Confirmed" },
    { value: "order_preparing", label: "Order Preparing" },
    { value: "order_ready", label: "Order Ready" },
    { value: "order_out_for_delivery", label: "Order Out for Delivery" },
    { value: "order_delivered", label: "Order Delivered" },
    { value: "order_cancelled", label: "Order Cancelled" },
    {
      value: "order_cancelled_by_customer",
      label: "Order Cancelled by Customer",
    },
    { value: "order_cancelled_by_store", label: "Order Cancelled by Store" },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href={`/stores/${storeId}`}
            className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 mb-4 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Store Details
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                Notification Templates
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                {store?.store_name
                  ? `Manage notification templates for ${store.store_name}`
                  : "Manage notification templates"}
              </p>
            </div>
            <button
              onClick={handleCreate}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-500 text-white rounded-xl hover:from-primary-700 hover:to-primary-600 transition-all font-semibold shadow-lg"
            >
              <Plus className="h-5 w-5" />
              Create Template
            </button>
          </div>
        </div>

        {/* Create/Edit Form */}
        {showCreateForm && (
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-card border border-slate-200 dark:border-slate-700 p-6 mb-6">
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-4">
              {editingTemplate ? "Edit Template" : "Create New Template"}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Template Name *
                </label>
                <input
                  type="text"
                  value={formData.template_name}
                  onChange={(e) =>
                    setFormData({ ...formData, template_name: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                  placeholder="e.g., Order Created Notification"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Template Type *
                </label>
                <select
                  value={formData.template_type}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      template_type: e.target.value as any,
                    })
                  }
                  className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                >
                  <option value="transactional">Transactional</option>
                  <option value="promotional">Promotional</option>
                  <option value="order_status">Order Status</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Event Type *
                </label>
                <select
                  value={formData.event_type}
                  onChange={(e) =>
                    setFormData({ ...formData, event_type: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                >
                  <option value="">Select event type</option>
                  {eventTypeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Active
                </label>
                <div className="flex items-center h-12">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) =>
                      setFormData({ ...formData, is_active: e.target.checked })
                    }
                    className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
                  />
                  <span className="ml-2 text-sm text-slate-600 dark:text-slate-400">
                    Template is active
                  </span>
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Title Template *
                </label>
                <input
                  type="text"
                  value={formData.title_template}
                  onChange={(e) =>
                    setFormData({ ...formData, title_template: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                  placeholder="e.g., New Order #{order_number}"
                />
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Use placeholders like {"{customer_name}"}, {"{order_number}"},{" "}
                  {"{branch_name}"}, {"{total_amount}"}
                </p>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Message Template *
                </label>
                <textarea
                  value={formData.message_template}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      message_template: e.target.value,
                    })
                  }
                  rows={4}
                  className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                  placeholder="e.g., Customer {customer_name} has placed a new order #{order_number} at {branch_name} for ₹{total_amount}."
                />
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Use placeholders like {"{customer_name}"}, {"{order_number}"},{" "}
                  {"{branch_name}"}, {"{total_amount}"}, {"{reason}"},{" "}
                  {"{estimated_time}"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 mt-6">
              <button
                onClick={handleSave}
                disabled={
                  saving ||
                  !formData.template_name ||
                  !formData.event_type ||
                  !formData.title_template ||
                  !formData.message_template
                }
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-xl hover:from-green-700 hover:to-green-600 transition-all font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="h-5 w-5" />
                {saving
                  ? "Saving..."
                  : editingTemplate
                  ? "Update Template"
                  : "Create Template"}
              </button>
              <button
                onClick={() => {
                  setShowCreateForm(false);
                  setEditingTemplate(null);
                }}
                className="px-6 py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-all font-semibold"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Templates List */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-card border border-slate-200 dark:border-slate-700 p-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-4">
            Existing Templates ({templates.length})
          </h2>

          {templates.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600 dark:text-slate-400">
                No notification templates found. Create one to get started.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {templates.map((template) => (
                <div
                  key={template.template_id}
                  className="border border-slate-200 dark:border-slate-700 rounded-xl p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                          {template.template_name}
                        </h3>
                        <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs font-medium rounded">
                          {template.template_type}
                        </span>
                        <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 text-xs font-medium rounded">
                          {template.event_type}
                        </span>
                        {template.is_active === 1 ? (
                          <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 text-xs font-medium rounded">
                            Active
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 text-xs font-medium rounded">
                            Inactive
                          </span>
                        )}
                      </div>

                      <div className="space-y-2 mt-4">
                        <div>
                          <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                            Title:
                          </span>
                          <p className="text-slate-900 dark:text-slate-100 mt-1">
                            {template.title_template}
                          </p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                            Message:
                          </span>
                          <p className="text-slate-900 dark:text-slate-100 mt-1">
                            {template.message_template}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => handleEdit(template)}
                        className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                        title="Edit template"
                      >
                        <Edit className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(template.template_id)}
                        className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        title="Delete template"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

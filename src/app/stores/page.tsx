"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiRequest, getAuthToken } from "@/utils/api";
import Link from "next/link";
import { ArrowLeft, Plus, X, Store, Trash2, Search } from "lucide-react";

export default function StoresPage() {
  const router = useRouter();
  const [stores, setStores] = useState<any[]>([]);
  const [filteredStores, setFilteredStores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [deletingStoreId, setDeletingStoreId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    store_name: "",
    owner_name: "",
    owner_email: "",
    owner_phone: "",
    owner_password: "",
    address: "",
    city: "",
    pincode: "",
  });
  const [createdCredentials, setCreatedCredentials] = useState<any>(null);

  useEffect(() => {
    if (!getAuthToken()) {
      router.push("/login");
      return;
    }
    fetchStores();
  }, [router]);

  const fetchStores = async () => {
    try {
      setLoading(true);
      const response = await apiRequest<any[]>("/api/v1/super-admin/stores");
      if (response.success) {
        setStores(response.data);
        setFilteredStores(response.data);
      }
    } catch (err: any) {
      console.error("Error fetching stores:", err);
    } finally {
      setLoading(false);
    }
  };

  // Filter stores based on search and status
  useEffect(() => {
    let filtered = stores;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (store) =>
          store.store_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          store.owner_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          store.owner_email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (filterStatus !== "all") {
      if (filterStatus === "active") {
        filtered = filtered.filter((store) => store.is_active === 1);
      } else if (filterStatus === "inactive") {
        filtered = filtered.filter((store) => store.is_active === 0);
      } else {
        filtered = filtered.filter(
          (store) => store.billing_status === filterStatus
        );
      }
    }

    setFilteredStores(filtered);
  }, [searchTerm, filterStatus, stores]);

  const handleDeleteStore = async (storeId: number, storeName: string) => {
    if (
      !confirm(
        `Are you sure you want to delete "${storeName}"? This will deactivate the store and all associated users. This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      setDeletingStoreId(storeId);
      const response = await apiRequest<any>(
        `/api/v1/super-admin/stores/${storeId}`,
        {
          method: "DELETE",
        }
      );

      if (response.success) {
        alert("Store deleted successfully");
        fetchStores();
      } else {
        alert(
          "Failed to delete store: " + (response.message || "Unknown error")
        );
      }
    } catch (err: any) {
      alert("Error deleting store: " + err.message);
    } finally {
      setDeletingStoreId(null);
    }
  };

  const handleExportStores = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [
        [
          "Store Name",
          "Owner",
          "Email",
          "Phone",
          "Billing Status",
          "Status",
        ].join(","),
        ...filteredStores.map((store) =>
          [
            store.store_name || "",
            store.owner_name || "",
            store.owner_email || "",
            store.owner_phone || "",
            store.billing_status || "",
            store.is_active ? "Active" : "Inactive",
          ].join(",")
        ),
      ].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `stores_${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCreateStore = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setCreating(true);
      const response = await apiRequest<any>("/api/v1/super-admin/stores", {
        method: "POST",
        body: JSON.stringify(formData),
      });

      if (response.success) {
        setCreatedCredentials(response.data.owner_credentials);
        setFormData({
          store_name: "",
          owner_name: "",
          owner_email: "",
          owner_phone: "",
          owner_password: "",
          address: "",
          city: "",
          pincode: "",
        });
        fetchStores();
        alert(
          "Store created successfully! Owner credentials are displayed below."
        );
      } else {
        alert(
          "Failed to create store: " + (response.message || "Unknown error")
        );
      }
    } catch (err: any) {
      alert("Error creating store: " + err.message);
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-200 border-t-primary-600"></div>
          <p className="text-slate-600">Loading stores...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Stores</h1>
          <p className="text-slate-600 mt-1">
            Manage all stores in your platform
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleExportStores}
            className="flex items-center gap-2 bg-slate-100 text-slate-700 px-5 py-2.5 rounded-xl hover:bg-slate-200 transition-all font-semibold"
            disabled={filteredStores.length === 0}
          >
            Export CSV
          </button>
          <Link
            href="/stores/new"
            className="flex items-center gap-2 bg-gradient-to-r from-primary-600 to-primary-500 text-white px-5 py-2.5 rounded-xl hover:from-primary-700 hover:to-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all shadow-lg hover:shadow-xl font-semibold"
          >
            <Plus className="h-5 w-5" />
            Create Store
          </Link>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-xl shadow-card border border-slate-200 p-4">
        <div className="flex gap-4 items-center">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search stores by name, owner, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
          >
            <option value="all">All Stores</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="pending">Billing Pending</option>
            <option value="expired">Billing Expired</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
        {filteredStores.length !== stores.length && (
          <p className="text-sm text-slate-600 mt-2">
            Showing {filteredStores.length} of {stores.length} stores
          </p>
        )}
      </div>

      {/* Stores Table */}
      <div className="bg-white rounded-xl shadow-card border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Store Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Owner
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Phone
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Billing Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Features
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredStores.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-6 py-8 text-center text-slate-500"
                  >
                    <Store className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                    <p>
                      {searchTerm || filterStatus !== "all"
                        ? "No stores match your filters"
                        : "No stores found"}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredStores.map((store) => (
                  <tr
                    key={store.store_id}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link
                        href={`/stores/${store.store_id}`}
                        className="text-sm font-semibold text-primary-600 hover:text-primary-700 transition-colors"
                      >
                        {store.store_name}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                      {store.owner_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                      {store.owner_email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                      {store.owner_phone}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                          store.billing_status === "active"
                            ? "bg-green-100 text-green-800"
                            : store.billing_status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : store.billing_status === "expired"
                            ? "bg-red-100 text-red-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {store.billing_status
                          ? store.billing_status.charAt(0).toUpperCase() +
                            store.billing_status.slice(1)
                          : "Pending"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      <div className="flex gap-2 flex-wrap">
                        {store.branches_enabled && (
                          <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800">
                            Branches
                          </span>
                        )}
                        {store.products_enabled && (
                          <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-green-100 text-green-800">
                            Products
                          </span>
                        )}
                        {store.coupon_codes_enabled && (
                          <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-purple-100 text-purple-800">
                            Coupons
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                          store.is_active
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {store.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center gap-3">
                        <Link
                          href={`/stores/${store.store_id}`}
                          className="text-primary-600 hover:text-primary-700 font-medium transition-colors"
                        >
                          Manage
                        </Link>
                        <button
                          onClick={() =>
                            handleDeleteStore(store.store_id, store.store_name)
                          }
                          disabled={deletingStoreId === store.store_id}
                          className="text-red-600 hover:text-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Delete store"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Store Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-card-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-200 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-slate-200 sticky top-0 bg-white">
              <h2 className="text-2xl font-bold text-slate-900">
                Create New Store
              </h2>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setCreatedCredentials(null);
                }}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-slate-600" />
              </button>
            </div>

            {createdCredentials ? (
              <div className="p-6">
                <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6 mb-6">
                  <h3 className="font-semibold text-green-900 mb-4 text-lg">
                    Store Created Successfully!
                  </h3>
                  <div className="space-y-3 text-sm bg-white rounded-lg p-4 border border-green-200">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-slate-700">
                        Owner Email:
                      </span>
                      <span className="font-mono text-slate-900">
                        {createdCredentials.email}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-slate-700">
                        Owner Password:
                      </span>
                      <span className="font-mono text-slate-900">
                        {createdCredentials.password}
                      </span>
                    </div>
                  </div>
                  <p className="mt-4 text-xs text-green-700 flex items-start gap-2">
                    <span className="text-base">⚠️</span>
                    <span>
                      Please save these credentials. The owner can use these to
                      login to the Store Admin Portal.
                    </span>
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setCreatedCredentials(null);
                  }}
                  className="w-full bg-gradient-to-r from-primary-600 to-primary-500 text-white px-4 py-3 rounded-xl hover:from-primary-700 hover:to-primary-600 transition-all font-semibold shadow-lg"
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleCreateStore} className="p-6 space-y-5">
                {/* Form fields with improved styling */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Store Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.store_name}
                    onChange={(e) =>
                      setFormData({ ...formData, store_name: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                    placeholder="Enter store name"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Owner Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.owner_name}
                      onChange={(e) =>
                        setFormData({ ...formData, owner_name: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                      placeholder="Owner full name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Owner Phone *
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.owner_phone}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          owner_phone: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                      placeholder="+91 1234567890"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Owner Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.owner_email}
                    onChange={(e) =>
                      setFormData({ ...formData, owner_email: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                    placeholder="owner@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Owner Password *
                  </label>
                  <input
                    type="password"
                    required
                    value={formData.owner_password}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        owner_password: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                    placeholder="Password for store owner login"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Address
                    </label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) =>
                        setFormData({ ...formData, address: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                      placeholder="Street address"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      City
                    </label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) =>
                        setFormData({ ...formData, city: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                      placeholder="City"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Pincode
                    </label>
                    <input
                      type="text"
                      value={formData.pincode}
                      onChange={(e) =>
                        setFormData({ ...formData, pincode: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                      placeholder="123456"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4 border-t border-slate-200">
                  <button
                    type="submit"
                    disabled={creating}
                    className="flex-1 bg-gradient-to-r from-primary-600 to-primary-500 text-white px-4 py-3 rounded-xl hover:from-primary-700 hover:to-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold shadow-lg"
                  >
                    {creating ? "Creating..." : "Create Store"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 bg-slate-100 text-slate-700 px-4 py-3 rounded-xl hover:bg-slate-200 transition-all font-semibold"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

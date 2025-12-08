"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { apiRequest, getAuthToken } from "@/utils/api";
import Link from "next/link";
import { ArrowLeft, Save, Check, X } from "lucide-react";

interface Permission {
  permission_id: number;
  permission_code: string;
  permission_name: string;
  permission_description: string;
  feature_group: string;
  store_enabled: number;
}

export default function StorePermissionsPage() {
  const router = useRouter();
  const params = useParams();
  const storeId = params.id;

  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [store, setStore] = useState<any>(null);

  useEffect(() => {
    if (!getAuthToken()) {
      router.push("/login");
      return;
    }
    fetchStore();
    fetchPermissions();
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

  const fetchPermissions = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiRequest<Permission[]>(
        `/api/v1/super-admin/permissions/store/${storeId}`
      );
      console.log("Permissions API response:", response);

      if (response.success) {
        // Ensure we have an array and normalize store_enabled values
        const permissionsData = Array.isArray(response.data)
          ? response.data.map((perm) => ({
              ...perm,
              store_enabled:
                perm.store_enabled === null || perm.store_enabled === undefined
                  ? 1
                  : perm.store_enabled === 1
                  ? 1
                  : 0,
            }))
          : [];

        console.log("Processed permissions:", permissionsData);
        setPermissions(permissionsData);

        if (permissionsData.length === 0) {
          setError(
            "No permissions found. Please ensure permissions are seeded in the database."
          );
        } else {
          setError(null); // Clear any previous errors
        }
      } else {
        setError(response.message || "Failed to load permissions");
      }
    } catch (err: any) {
      console.error("Error fetching permissions:", err);
      setError(err.message || "Unknown error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePermission = (permissionId: number) => {
    setPermissions((prev) =>
      prev.map((perm) =>
        perm.permission_id === permissionId
          ? { ...perm, store_enabled: perm.store_enabled === 1 ? 0 : 1 }
          : perm
      )
    );
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const permissionsToUpdate = permissions.map((perm) => ({
        permission_id: perm.permission_id,
        is_enabled: perm.store_enabled === 1,
      }));

      const response = await apiRequest(
        `/api/v1/super-admin/permissions/store/${storeId}`,
        {
          method: "PUT",
          body: JSON.stringify({ permissions: permissionsToUpdate }),
        }
      );

      if (response.success) {
        alert("Permissions updated successfully!");
        fetchPermissions();
      } else {
        alert(
          "Failed to update permissions: " +
            (response.message || "Unknown error")
        );
      }
    } catch (err: any) {
      alert("Failed to update permissions: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const groupedPermissions = permissions.reduce((acc, perm) => {
    const group = perm.feature_group || "other";
    if (!acc[group]) {
      acc[group] = [];
    }
    acc[group].push(perm);
    return acc;
  }, {} as Record<string, Permission[]>);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !store) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-lg shadow">
          <p className="text-red-600 mb-4 font-semibold">
            {error || "Store not found or failed to load"}
          </p>
          <Link
            href={`/stores/${storeId}`}
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Store
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href={`/stores/${storeId}`}
                className="text-blue-600 hover:text-blue-800"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {store.store_name}
                </h1>
                <p className="text-sm text-gray-600">
                  Manage Store Permissions
                </p>
              </div>
            </div>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
            <p className="text-sm text-blue-700">
              <strong>Note:</strong> Selected permissions will be available for
              store owners to assign to their staff. Store owners can only
              assign permissions that are enabled here.
            </p>
          </div>

          {error && permissions.length === 0 && (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
              <p className="text-sm text-yellow-700">
                <strong>Warning:</strong> {error}
              </p>
            </div>
          )}

          {Object.entries(groupedPermissions).map(([group, perms]) => (
            <div key={group} className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 capitalize">
                {group.replace(/_/g, " ")}
              </h3>
              <div className="space-y-2">
                {perms.map((perm) => (
                  <div
                    key={perm.permission_id}
                    className="flex items-center justify-between py-3 px-4 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">
                          {perm.permission_name}
                        </span>
                        <span className="text-xs text-gray-500 font-mono">
                          ({perm.permission_code})
                        </span>
                      </div>
                      {perm.permission_description && (
                        <p className="text-sm text-gray-600 mt-1">
                          {perm.permission_description}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => handleTogglePermission(perm.permission_id)}
                      className={`ml-4 relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        perm.store_enabled === 1 ? "bg-blue-600" : "bg-gray-300"
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          perm.store_enabled === 1
                            ? "translate-x-6"
                            : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {permissions.length === 0 && !loading && (
            <div className="text-center py-12">
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 max-w-md mx-auto">
                <p className="text-lg font-semibold text-gray-900 mb-2">
                  No Permissions Found
                </p>
                <p className="text-sm text-gray-600 mb-4">
                  The permissions list is empty. This usually means permissions
                  haven't been seeded in the database yet.
                </p>
                <p className="text-xs text-gray-500">
                  Please run the seeding script:{" "}
                  <code className="bg-gray-200 px-2 py-1 rounded">
                    node saas-store-api/scripts/seed-permissions.js
                  </code>
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

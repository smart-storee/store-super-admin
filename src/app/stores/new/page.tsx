"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiRequest, getAuthToken } from "@/utils/api";
import Link from "next/link";
import {
  ArrowLeft,
  Store,
  Settings,
  BarChart3,
  Shield,
  CheckCircle2,
  X,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";

interface Permission {
  permission_id: number;
  permission_code: string;
  permission_name: string;
  permission_description: string;
  feature_group: string;
}

export default function NewStorePage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [selectedPermissions, setSelectedPermissions] = useState<number[]>([]);
  const [createdCredentials, setCreatedCredentials] = useState<any>(null);

  // Step 1: Basic Information
  const [basicInfo, setBasicInfo] = useState({
    store_name: "",
    owner_name: "",
    owner_email: "",
    owner_phone: "",
    owner_password: "",
    address: "",
    city: "",
    pincode: "",
  });

  // Step 2: Features
  const [features, setFeatures] = useState({
    billing_status: "pending",
    billing_paid_until: "",
    push_notifications_enabled: true,
    sms_enabled: true,
    whatsapp_enabled: false,
    email_enabled: false,
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

  // Step 3: Limits
  const [limits, setLimits] = useState({
    max_categories: "",
    max_products: "",
    max_variants: "",
    max_branches: "",
  });

  useEffect(() => {
    if (!getAuthToken()) {
      router.push("/login");
      return;
    }
    fetchPermissions();
  }, [router]);

  const fetchPermissions = async () => {
    try {
      const response = await apiRequest<Permission[]>(
        "/api/v1/super-admin/permissions"
      );
      if (response.success) {
        setPermissions(response.data || []);
        // Select all by default
        setSelectedPermissions(
          (response.data || []).map((p) => p.permission_id)
        );
      }
    } catch (err) {
      console.error("Error fetching permissions:", err);
    }
  };

  const handlePermissionToggle = (permissionId: number) => {
    setSelectedPermissions((prev) =>
      prev.includes(permissionId)
        ? prev.filter((id) => id !== permissionId)
        : [...prev, permissionId]
    );
  };

  const handleSelectAllPermissions = () => {
    if (selectedPermissions.length === permissions.length) {
      setSelectedPermissions([]);
    } else {
      setSelectedPermissions(permissions.map((p) => p.permission_id));
    }
  };

  const validateStep = (step: number): boolean => {
    if (step === 1) {
      return !!(
        basicInfo.store_name &&
        basicInfo.owner_name &&
        basicInfo.owner_email &&
        basicInfo.owner_phone &&
        basicInfo.owner_password
      );
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 5));
    }
  };

  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleCreateStore = async () => {
    try {
      setLoading(true);

      const payload = {
        ...basicInfo,
        ...features,
        ...limits,
        permissions: selectedPermissions,
        max_categories: limits.max_categories
          ? parseInt(limits.max_categories)
          : null,
        max_products: limits.max_products
          ? parseInt(limits.max_products)
          : null,
        max_variants: limits.max_variants
          ? parseInt(limits.max_variants)
          : null,
        max_branches: limits.max_branches
          ? parseInt(limits.max_branches)
          : null,
      };

      const response = await apiRequest<any>("/api/v1/super-admin/stores", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (response.success) {
        setCreatedCredentials(response.data.owner_credentials);
        setCurrentStep(5);
      } else {
        alert(
          "Failed to create store: " + (response.message || "Unknown error")
        );
      }
    } catch (err: any) {
      alert("Error creating store: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { id: 1, name: "Basic Info", icon: Store },
    { id: 2, name: "Features", icon: Settings },
    { id: 3, name: "Limits", icon: BarChart3 },
    { id: 4, name: "Permissions", icon: Shield },
    { id: 5, name: "Review", icon: CheckCircle2 },
  ];

  const groupedPermissions = permissions.reduce((acc, perm) => {
    if (!acc[perm.feature_group]) {
      acc[perm.feature_group] = [];
    }
    acc[perm.feature_group].push(perm);
    return acc;
  }, {} as Record<string, Permission[]>);

  if (createdCredentials) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">
                Store Created Successfully!
              </h1>
              <p className="text-slate-600">
                The store has been created with all configured settings.
              </p>
            </div>

            <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6 mb-6">
              <h3 className="font-semibold text-green-900 mb-4 text-lg">
                Owner Login Credentials
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

            <div className="flex gap-4">
              <Link
                href="/stores"
                className="flex-1 bg-slate-100 text-slate-700 px-6 py-3 rounded-xl hover:bg-slate-200 transition-all font-semibold text-center"
              >
                Back to Stores
              </Link>
              <button
                onClick={() => {
                  setCreatedCredentials(null);
                  setCurrentStep(1);
                  setBasicInfo({
                    store_name: "",
                    owner_name: "",
                    owner_email: "",
                    owner_phone: "",
                    owner_password: "",
                    address: "",
                    city: "",
                    pincode: "",
                  });
                }}
                className="flex-1 bg-gradient-to-r from-primary-600 to-primary-500 text-white px-6 py-3 rounded-xl hover:from-primary-700 hover:to-primary-600 transition-all font-semibold"
              >
                Create Another Store
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/stores"
            className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-4 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Stores
          </Link>
          <h1 className="text-3xl font-bold text-slate-900">
            Create New Store
          </h1>
          <p className="text-slate-600 mt-1">
            Complete the steps below to create a new store with all
            configurations
          </p>
        </div>

        {/* Progress Steps */}
        <div className="bg-white rounded-xl shadow-card border border-slate-200 p-6 mb-6">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;

              return (
                <div key={step.id} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-1">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                        isCompleted
                          ? "bg-green-500 text-white"
                          : isActive
                          ? "bg-primary-600 text-white"
                          : "bg-slate-200 text-slate-600"
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="h-6 w-6" />
                      ) : (
                        <Icon className="h-6 w-6" />
                      )}
                    </div>
                    <span
                      className={`mt-2 text-xs font-medium ${
                        isActive ? "text-primary-600" : "text-slate-600"
                      }`}
                    >
                      {step.name}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`h-1 flex-1 mx-2 -mt-6 ${
                        isCompleted ? "bg-green-500" : "bg-slate-200"
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-xl shadow-card border border-slate-200 p-8">
          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">
                  Basic Store Information
                </h2>
                <p className="text-slate-600">
                  Enter the basic details for the store and owner
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Store Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={basicInfo.store_name}
                    onChange={(e) =>
                      setBasicInfo({ ...basicInfo, store_name: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                    placeholder="Enter store name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Owner Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={basicInfo.owner_name}
                    onChange={(e) =>
                      setBasicInfo({ ...basicInfo, owner_name: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                    placeholder="Owner full name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Owner Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={basicInfo.owner_email}
                    onChange={(e) =>
                      setBasicInfo({
                        ...basicInfo,
                        owner_email: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                    placeholder="owner@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Owner Phone *
                  </label>
                  <input
                    type="tel"
                    required
                    value={basicInfo.owner_phone}
                    onChange={(e) =>
                      setBasicInfo({
                        ...basicInfo,
                        owner_phone: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                    placeholder="+1234567890"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Owner Password *
                  </label>
                  <input
                    type="password"
                    required
                    value={basicInfo.owner_password}
                    onChange={(e) =>
                      setBasicInfo({
                        ...basicInfo,
                        owner_password: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                    placeholder="Create password"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Address
                  </label>
                  <input
                    type="text"
                    value={basicInfo.address}
                    onChange={(e) =>
                      setBasicInfo({ ...basicInfo, address: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                    placeholder="Store address"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    City
                  </label>
                  <input
                    type="text"
                    value={basicInfo.city}
                    onChange={(e) =>
                      setBasicInfo({ ...basicInfo, city: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                    placeholder="City"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    PIN Code
                  </label>
                  <input
                    type="text"
                    value={basicInfo.pincode}
                    onChange={(e) =>
                      setBasicInfo({ ...basicInfo, pincode: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                    placeholder="PIN code"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Features */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">
                  Feature Configuration
                </h2>
                <p className="text-slate-600">
                  Enable or disable features for this store
                </p>
              </div>

              {/* Billing */}
              <div className="border border-slate-200 rounded-xl p-6">
                <h3 className="font-semibold text-slate-900 mb-4">Billing</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Billing Status
                    </label>
                    <select
                      value={features.billing_status}
                      onChange={(e) =>
                        setFeatures({
                          ...features,
                          billing_status: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                    >
                      <option value="pending">Pending</option>
                      <option value="active">Active</option>
                      <option value="suspended">Suspended</option>
                      <option value="expired">Expired</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Billing Paid Until
                    </label>
                    <input
                      type="date"
                      value={features.billing_paid_until}
                      onChange={(e) =>
                        setFeatures({
                          ...features,
                          billing_paid_until: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Core Features */}
              <div className="border border-slate-200 rounded-xl p-6">
                <h3 className="font-semibold text-slate-900 mb-4">
                  Core Features
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    { key: "branches_enabled", label: "Branches Management" },
                    {
                      key: "categories_enabled",
                      label: "Categories Management",
                    },
                    { key: "products_enabled", label: "Products Management" },
                    { key: "orders_enabled", label: "Orders Management" },
                    { key: "coupon_codes_enabled", label: "Coupon Codes" },
                    { key: "customers_enabled", label: "Customers" },
                    { key: "employees_enabled", label: "Employees" },
                    { key: "notifications_enabled", label: "Notifications" },
                    {
                      key: "communication_logs_enabled",
                      label: "Communication Logs",
                    },
                    { key: "reports_enabled", label: "Reports" },
                    { key: "home_config_enabled", label: "Home Config" },
                    { key: "app_settings_enabled", label: "App Settings" },
                    { key: "billings_enabled", label: "Billings" },
                  ].map((feature) => (
                    <label
                      key={feature.key}
                      className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={
                          features[
                            feature.key as keyof typeof features
                          ] as boolean
                        }
                        onChange={(e) =>
                          setFeatures({
                            ...features,
                            [feature.key]: e.target.checked,
                          })
                        }
                        className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
                      />
                      <span className="text-sm font-medium text-slate-700">
                        {feature.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Communication Features */}
              <div className="border border-slate-200 rounded-xl p-6">
                <h3 className="font-semibold text-slate-900 mb-4">
                  Communication Features
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    {
                      key: "push_notifications_enabled",
                      label: "Push Notifications",
                    },
                    { key: "sms_enabled", label: "SMS" },
                    { key: "whatsapp_enabled", label: "WhatsApp" },
                    { key: "email_enabled", label: "Email" },
                  ].map((feature) => (
                    <label
                      key={feature.key}
                      className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={
                          features[
                            feature.key as keyof typeof features
                          ] as boolean
                        }
                        onChange={(e) =>
                          setFeatures({
                            ...features,
                            [feature.key]: e.target.checked,
                          })
                        }
                        className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
                      />
                      <span className="text-sm font-medium text-slate-700">
                        {feature.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Additional Features */}
              <div className="border border-slate-200 rounded-xl p-6">
                <h3 className="font-semibold text-slate-900 mb-4">
                  Additional
                </h3>
                <label className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={features.add_options_enabled}
                    onChange={(e) =>
                      setFeatures({
                        ...features,
                        add_options_enabled: e.target.checked,
                      })
                    }
                    className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
                  />
                  <span className="text-sm font-medium text-slate-700">
                    Add Options
                  </span>
                </label>
              </div>
            </div>
          )}

          {/* Step 3: Limits */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">
                  Creation Limits
                </h2>
                <p className="text-slate-600">
                  Set maximum creation counts (leave empty for unlimited)
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  {
                    key: "max_categories",
                    label: "Max Categories",
                    placeholder: "Unlimited",
                  },
                  {
                    key: "max_products",
                    label: "Max Products",
                    placeholder: "Unlimited",
                  },
                  {
                    key: "max_variants",
                    label: "Max Variants",
                    placeholder: "Unlimited",
                  },
                  {
                    key: "max_branches",
                    label: "Max Branches",
                    placeholder: "Unlimited",
                  },
                ].map((limit) => (
                  <div key={limit.key}>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      {limit.label}
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={limits[limit.key as keyof typeof limits]}
                      onChange={(e) =>
                        setLimits({
                          ...limits,
                          [limit.key]: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                      placeholder={limit.placeholder}
                    />
                    <p className="text-xs text-slate-500 mt-1">
                      Leave empty for unlimited
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 4: Permissions */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-2">
                    Permissions Configuration
                  </h2>
                  <p className="text-slate-600">
                    Select which permissions are available for this store
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleSelectAllPermissions}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors text-sm font-medium"
                >
                  {selectedPermissions.length === permissions.length
                    ? "Deselect All"
                    : "Select All"}
                </button>
              </div>

              <div className="space-y-4">
                {Object.entries(groupedPermissions).map(([group, perms]) => (
                  <div
                    key={group}
                    className="border border-slate-200 rounded-xl p-6"
                  >
                    <h3 className="font-semibold text-slate-900 mb-4 capitalize">
                      {group.replace("_", " ")}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {perms.map((perm) => (
                        <label
                          key={perm.permission_id}
                          className="flex items-start gap-3 p-3 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={selectedPermissions.includes(
                              perm.permission_id
                            )}
                            onChange={() =>
                              handlePermissionToggle(perm.permission_id)
                            }
                            className="mt-1 w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
                          />
                          <div className="flex-1">
                            <div className="text-sm font-medium text-slate-700">
                              {perm.permission_name}
                            </div>
                            <div className="text-xs text-slate-500 mt-1">
                              {perm.permission_description}
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> Selected permissions will be available
                  for store owners to assign to their staff. Store owners can
                  only assign permissions that are enabled here.
                </p>
              </div>
            </div>
          )}

          {/* Step 5: Review */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">
                  Review
                </h2>
                <p className="text-slate-600">
                  Review all settings before creating the store
                </p>
              </div>

              {/* Basic Info Review */}
              <div className="border border-slate-200 rounded-xl p-6">
                <h3 className="font-semibold text-slate-900 mb-4">
                  Basic Information
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-slate-500">Store Name:</span>
                    <p className="font-medium text-slate-900">
                      {basicInfo.store_name}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-500">Owner Name:</span>
                    <p className="font-medium text-slate-900">
                      {basicInfo.owner_name}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-500">Owner Email:</span>
                    <p className="font-medium text-slate-900">
                      {basicInfo.owner_email}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-500">Owner Phone:</span>
                    <p className="font-medium text-slate-900">
                      {basicInfo.owner_phone}
                    </p>
                  </div>
                </div>
              </div>

              {/* Features Review */}
              <div className="border border-slate-200 rounded-xl p-6">
                <h3 className="font-semibold text-slate-900 mb-4">
                  Enabled Features
                </h3>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(features)
                    .filter(
                      ([key, value]) =>
                        key !== "billing_status" &&
                        key !== "billing_paid_until" &&
                        value === true
                    )
                    .map(([key]) => (
                      <span
                        key={key}
                        className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium"
                      >
                        {key.replace("_enabled", "").replace(/_/g, " ")}
                      </span>
                    ))}
                </div>
              </div>

              {/* Limits Review */}
              <div className="border border-slate-200 rounded-xl p-6">
                <h3 className="font-semibold text-slate-900 mb-4">
                  Creation Limits
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {Object.entries(limits).map(([key, value]) => (
                    <div key={key}>
                      <span className="text-slate-500">
                        {key.replace("max_", "").replace(/_/g, " ")}:
                      </span>
                      <p className="font-medium text-slate-900">
                        {value || "Unlimited"}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Permissions Review */}
              <div className="border border-slate-200 rounded-xl p-6">
                <h3 className="font-semibold text-slate-900 mb-4">
                  Selected Permissions ({selectedPermissions.length})
                </h3>
                <div className="flex flex-wrap gap-2">
                  {permissions
                    .filter((p) =>
                      selectedPermissions.includes(p.permission_id)
                    )
                    .map((perm) => (
                      <span
                        key={perm.permission_id}
                        className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium"
                      >
                        {perm.permission_name}
                      </span>
                    ))}
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-200">
            <button
              type="button"
              onClick={handlePrevious}
              disabled={currentStep === 1}
              className="flex items-center gap-2 px-6 py-3 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-5 w-5" />
              Previous
            </button>

            {currentStep < 5 ? (
              <button
                type="button"
                onClick={handleNext}
                disabled={!validateStep(currentStep)}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-500 text-white rounded-xl hover:from-primary-700 hover:to-primary-600 transition-all font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
                <ChevronRight className="h-5 w-5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleCreateStore}
                disabled={loading}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-xl hover:from-green-700 hover:to-green-600 transition-all font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Creating..." : "Create Store"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

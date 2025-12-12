const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000";

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  code?: string;
  data: T;
}

export const apiRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> => {
  const token = localStorage.getItem("superAdminToken");

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  } as Record<string, string>;

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Request failed");
    }

    return data;
  } catch (error) {
    console.error("API request error:", error);
    throw error;
  }
};

export const login = async (email: string, password: string) => {
  const response = await apiRequest<{ token: string; admin: any }>(
    "/api/v1/super-admin/auth/login",
    {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }
  );

  if (response.success && response.data.token) {
    localStorage.setItem("superAdminToken", response.data.token);
    localStorage.setItem("superAdmin", JSON.stringify(response.data.admin));
  }

  return response;
};

export const logout = () => {
  localStorage.removeItem("superAdminToken");
  localStorage.removeItem("superAdmin");
};

export const getAuthToken = () => {
  return localStorage.getItem("superAdminToken");
};

export const getCurrentAdmin = () => {
  const adminStr = localStorage.getItem("superAdmin");
  return adminStr ? JSON.parse(adminStr) : null;
};

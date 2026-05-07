// frontend/src/lib/api.ts
import { Asset, AssetCategory, AssetStatus } from "@prisma/client";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export interface AssetsQuery {
  search?: string;
  category?: AssetCategory;
  status?: AssetStatus;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
}

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const getAssets = async (query: AssetsQuery = {}): Promise<PaginatedResponse<Asset>> => {
  const params = new URLSearchParams();
  if (query.search) params.append("search", query.search);
  if (query.category) params.append("category", query.category);
  if (query.status) params.append("status", query.status);
  if (query.sortBy) params.append("sortBy", query.sortBy);
  if (query.sortOrder) params.append("sortOrder", query.sortOrder);
  if (query.page) params.append("page", query.page.toString());
  if (query.limit) params.append("limit", query.limit.toString());

  const res = await fetch(`${API_URL}/assets?${params.toString()}`);
  if (!res.ok) {
    throw new Error("Failed to fetch assets");
  }
  return res.json();
};

export const getAssetById = async (id: string): Promise<Asset> => {
  const res = await fetch(`${API_URL}/assets/${id}`);
  if (!res.ok) {
    throw new Error("Failed to fetch asset");
  }
  return res.json();
};

export const createAsset = async (assetData: Omit<Asset, "id" | "createdAt" | "updatedAt">): Promise<Asset> => {
  const res = await fetch(`${API_URL}/assets`, {
    method: 'POST',
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(assetData),
  });
  if (!res.ok) {
    throw new Error("Failed to create asset");
  }
  return res.json();
};

export const updateAsset = async (id: string, assetData: Partial<Omit<Asset, "id" | "createdAt" | "updatedAt">>): Promise<Asset> => {
  const res = await fetch(`${API_URL}/assets/${id}`, {
    method: 'PATCH',
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(assetData),
  });
  if (!res.ok) {
    throw new Error("Failed to update asset");
  }
  return res.json();
};

export const deleteAsset = async (id: string): Promise<void> => {
  const res = await fetch(`${API_URL}/assets/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    throw new Error("Failed to delete asset");
  }
};

export const getAssetSummary = async (): Promise<any> => {
  const res = await fetch(`${API_URL}/assets/summary`);
  if (!res.ok) {
    throw new Error("Failed to fetch asset summary");
  }
  return res.json();
};

export const getEmployees = async (): Promise<any[]> => {
  const res = await fetch(`${API_URL}/employees`);
  if (!res.ok) {
    throw new Error("Failed to fetch employees");
  }
  return res.json();
};

export const getBusinessUnits = async (): Promise<any[]> => {
  const res = await fetch(`${API_URL}/business-unit`);
  if (!res.ok) {
    throw new Error("Failed to fetch organizational structure");
  }
  return res.json();
};

export const createEmployee = async (payload: any): Promise<any> => {
  const res = await fetch(`${API_URL}/employees`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    let message = "Failed to create employee";
    try {
      const errorData = await res.json();
      if (errorData?.message) {
        message = Array.isArray(errorData.message) ? errorData.message.join(", ") : errorData.message;
      }
    } catch {
      // Fallback
    }
    throw new Error(message);
  }
  return res.json();
};

export const updateEmployee = async (id: string, payload: any): Promise<any> => {
  const res = await fetch(`${API_URL}/employees/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    let message = "Failed to update employee";
    try {
      const errorData = await res.json();
      if (errorData?.message) {
        message = Array.isArray(errorData.message) ? errorData.message.join(", ") : errorData.message;
      }
    } catch {
      // Fallback
    }
    throw new Error(message);
  }

  return res.json();
};

export const deleteEmployee = async (id: string): Promise<void> => {
  const res = await fetch(`${API_URL}/employees/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    throw new Error("Failed to delete employee");
  }
};

export const login = async (credentials: any): Promise<{ access_token: string }> => {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || "Failed to login");
  }
  return res.json();
};

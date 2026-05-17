// frontend/src/lib/api.ts
import { Asset, AssetCategory, AssetStatus } from "@/lib/mockups/types";
import { getSession } from "next-auth/react";
import { API_URL } from "@/lib/config";
import {
  MOCK_ASSETS,
  MOCK_ASSET_SUMMARY,
  MOCK_EMPLOYEES,
  MOCK_BUSINESS_UNITS,
  MOCK_LICENSES,
  MOCK_LICENSE_SUMMARY,
  MOCK_EXPIRING_SOON,
} from "@/lib/mockups/mock-db-data";

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === "true";

type AssetRecord = Asset & {
  imageUrl?: string | null;
};

type EmployeeRecord = {
  avatarUrl?: string | null;
  [key: string]: any;
};

type LicenseAssignmentRecord = {
  id: string;
  assignedDate: string;
  employee: {
    id: string;
    name: string;
    email: string;
    department?: { id: string; name: string } | null;
    businessUnit?: { id: string; name: string } | null;
  };
};

export type LicenseRecord = {
  id: string;
  name: string;
  vendor: string;
  type: string;
  totalSeats: number;
  status: "ACTIVE" | "WARNING" | "CRITICAL" | "EXPIRED";
  expiryDate: string;
  price: number;
  currency: string;
  billingCycle: string;
  annualCost: number;
  color: string;
  usedSeats: number;
  availableSeats: number;
  usagePercent: number;
  assignments: LicenseAssignmentRecord[];
};

export type LicenseSummary = {
  total: number;
  active: number;
  expiringSoon: number;
  assignedSeats: number;
  availableSeats: number;
  annualCostTotal: number;
};

export type LicenseExpiryAlert = {
  id: string;
  name: string;
  vendor: string;
  type: string;
  status: LicenseRecord["status"];
  expiryDate: string;
  daysLeft: number;
  urgency: "soon" | "warning" | "critical";
};

const authenticatedFetch = async (url: string, options: RequestInit = {}) => {
  const session: any = await getSession();
  const headers = new Headers(options.headers || {});

  if (session?.access_token) {
    headers.set("Authorization", `Bearer ${session.access_token}`);
  }

  return fetch(url, { ...options, headers });
};

const toFormData = (payload: Record<string, any>) => {
  const formData = new FormData();

  Object.entries(payload).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    if (value instanceof File) {
      formData.append("image", value);
      return;
    }

    formData.append(key, value instanceof Date ? value.toISOString() : String(value));
  });

  return formData;
};

async function submitPayload<T>(
  url: string,
  payload: Record<string, any> | FormData,
  method: "POST" | "PATCH",
): Promise<T> {
  const isFormData =
    payload instanceof FormData ||
    (payload instanceof Object &&
      Object.values(payload).some((value) => value instanceof File));
  const body = payload instanceof FormData ? payload : isFormData ? toFormData(payload) : JSON.stringify(payload);
  const res = await authenticatedFetch(url, {
    method,
    headers: isFormData ? undefined : { "Content-Type": "application/json" },
    body: body as BodyInit,
  });

  if (!res.ok) {
    let message = method === "POST" ? "Failed to create record" : "Failed to update record";
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
}

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

export const getAssets = async (query: AssetsQuery = {}): Promise<PaginatedResponse<AssetRecord>> => {
  if (USE_MOCK) {
    let data = (MOCK_ASSETS as unknown as any[]).slice();
    if (query.search) {
      const q = query.search.toLowerCase();
      data = data.filter((a) => a.name.toLowerCase().includes(q) || a.serialNumber?.toLowerCase().includes(q));
    }
    if (query.category) data = data.filter((a) => a.category === query.category);
    if (query.status) data = data.filter((a) => a.status === query.status);
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const total = data.length;
    const start = (page - 1) * limit;
    return { data: data.slice(start, start + limit), total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  const params = new URLSearchParams();
  if (query.search) params.append("search", query.search);
  if (query.category) params.append("category", query.category);
  if (query.status) params.append("status", query.status);
  if (query.sortBy) params.append("sortBy", query.sortBy);
  if (query.sortOrder) params.append("sortOrder", query.sortOrder);
  if (query.page) params.append("page", query.page.toString());
  if (query.limit) params.append("limit", query.limit.toString());

  const res = await authenticatedFetch(`${API_URL}/assets?${params.toString()}`);
  if (!res.ok) {
    throw new Error("Failed to fetch assets");
  }
  return res.json();
};

export const getAssetById = async (id: string): Promise<AssetRecord> => {
  if (USE_MOCK) {
    const found = (MOCK_ASSETS as unknown as any[]).find((a) => a.id === id);
    if (!found) throw new Error("Asset not found");
    return found;
  }
  const res = await authenticatedFetch(`${API_URL}/assets/${id}`);
  if (!res.ok) {
    throw new Error("Failed to fetch asset");
  }
  return res.json();
};

export const createAsset = async (assetData: Record<string, any> | FormData): Promise<AssetRecord> => {
  return submitPayload<AssetRecord>(`${API_URL}/assets`, assetData, "POST");
};

export const updateAsset = async (id: string, assetData: Record<string, any> | FormData): Promise<AssetRecord> => {
  return submitPayload<AssetRecord>(`${API_URL}/assets/${id}`, assetData, "PATCH");
};

export const deleteAsset = async (id: string): Promise<void> => {
  const res = await authenticatedFetch(`${API_URL}/assets/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    throw new Error("Failed to delete asset");
  }
};

export const assignAsset = async (payload: { employeeId: string; assetId: string }): Promise<any> => {
  return submitPayload<any>(`${API_URL}/assets/assign`, payload, "POST");
};

export const unassignAsset = async (payload: { assetId: string }): Promise<any> => {
  return submitPayload<any>(`${API_URL}/assets/unassign`, payload, "POST");
};

export const getAssetSummary = async (): Promise<any> => {
  if (USE_MOCK) return MOCK_ASSET_SUMMARY;
  const res = await authenticatedFetch(`${API_URL}/assets/summary`);
  if (!res.ok) {
    throw new Error("Failed to fetch asset summary");
  }
  return res.json();
};

export const getLicenses = async (): Promise<LicenseRecord[]> => {
  if (USE_MOCK) return MOCK_LICENSES as any;
  const res = await authenticatedFetch(`${API_URL}/licenses`);
  if (!res.ok) {
    throw new Error("Failed to fetch licenses");
  }
  return res.json();
};

export const getLicenseSummary = async (): Promise<LicenseSummary> => {
  if (USE_MOCK) return MOCK_LICENSE_SUMMARY as any;
  const res = await authenticatedFetch(`${API_URL}/licenses/summary`);
  if (!res.ok) {
    throw new Error("Failed to fetch license summary");
  }
  return res.json();
};

export const getExpiringSoonLicenses = async (): Promise<LicenseExpiryAlert[]> => {
  if (USE_MOCK) return MOCK_EXPIRING_SOON as any;
  const res = await authenticatedFetch(`${API_URL}/licenses/expiring-soon`);
  if (!res.ok) {
    throw new Error("Failed to fetch expiring licenses");
  }
  return res.json();
};

export const getLicenseById = async (id: string): Promise<LicenseRecord> => {
  if (USE_MOCK) {
    const found = (MOCK_LICENSES as any[]).find((l) => l.id === id);
    if (!found) throw new Error("License not found");
    return found;
  }
  const res = await authenticatedFetch(`${API_URL}/licenses/${id}`);
  if (!res.ok) {
    throw new Error("Failed to fetch license");
  }
  return res.json();
};

export const createLicense = async (payload: Record<string, any>): Promise<LicenseRecord> => {
  return submitPayload<LicenseRecord>(`${API_URL}/licenses`, payload, "POST");
};

export const updateLicense = async (
  id: string,
  payload: Record<string, any>,
): Promise<LicenseRecord> => {
  return submitPayload<LicenseRecord>(`${API_URL}/licenses/${id}`, payload, "PATCH");
};

export const deleteLicense = async (id: string): Promise<void> => {
  const res = await authenticatedFetch(`${API_URL}/licenses/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    throw new Error("Failed to delete license");
  }
};

export const assignLicense = async (
  id: string,
  payload: { employeeId: string },
): Promise<any> => {
  return submitPayload<any>(`${API_URL}/licenses/${id}/assign`, payload, "POST");
};

export const unassignLicense = async (
  id: string,
  payload: { assignmentId: string },
): Promise<any> => {
  return submitPayload<any>(`${API_URL}/licenses/${id}/unassign`, payload, "POST");
};

export const getEmployees = async (): Promise<EmployeeRecord[]> => {
  if (USE_MOCK) return MOCK_EMPLOYEES as any;
  const res = await authenticatedFetch(`${API_URL}/employees`);
  if (!res.ok) {
    throw new Error("Failed to fetch employees");
  }
  return res.json();
};

export const getBusinessUnits = async (): Promise<any[]> => {
  if (USE_MOCK) return MOCK_BUSINESS_UNITS as any;
  const res = await authenticatedFetch(`${API_URL}/business-unit`);
  if (!res.ok) {
    throw new Error("Failed to fetch organizational structure");
  }
  return res.json();
};

export const createEmployee = async (payload: Record<string, any> | FormData): Promise<EmployeeRecord> => {
  return submitPayload<EmployeeRecord>(`${API_URL}/employees`, payload, "POST");
};

export const updateEmployee = async (id: string, payload: Record<string, any> | FormData): Promise<EmployeeRecord> => {
  return submitPayload<EmployeeRecord>(`${API_URL}/employees/${id}`, payload, "PATCH");
};

export const deleteEmployee = async (id: string): Promise<void> => {
  const res = await authenticatedFetch(`${API_URL}/employees/${id}`, {
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

export const prepareAssetFormData = (payload: Record<string, any>) => toFormData(payload);
export const prepareEmployeeFormData = (payload: Record<string, any>) => toFormData(payload);

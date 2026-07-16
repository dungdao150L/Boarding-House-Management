const DEFAULT_AUTH_URL = "http://localhost:3001";
const DEFAULT_ROOM_URL = "http://localhost:3002";
const DEFAULT_BILLING_URL = "http://localhost:3005";
const DEFAULT_REPORT_URL = "http://localhost:3003";

type ServiceName = "auth" | "room" | "billing" | "report";

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
  details?: unknown;
};

export type RegisterPayload = {
  email?: string;
  fullName: string;
  password: string;
  phone?: string;
  role?: "tenant";
  username: string;
};

const baseUrls: Record<ServiceName, string> = {
  auth: import.meta.env.VITE_AUTH_API_URL || DEFAULT_AUTH_URL,
  billing: import.meta.env.VITE_BILLING_API_URL || DEFAULT_BILLING_URL,
  report: import.meta.env.VITE_REPORT_API_URL || DEFAULT_REPORT_URL,
  room: import.meta.env.VITE_ROOM_API_URL || DEFAULT_ROOM_URL,
};

let authToken = localStorage.getItem("boarding_house_token") || "";

export function setAuthToken(token: string) {
  authToken = token;
  localStorage.setItem("boarding_house_token", token);
}

export function clearAuthToken() {
  authToken = "";
  localStorage.removeItem("boarding_house_token");
}

async function request<T>(service: ServiceName, path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");

  if (authToken) {
    headers.set("Authorization", `Bearer ${authToken}`);
  }

  const response = await fetch(`${baseUrls[service]}${path}`, {
    ...options,
    headers,
  });

  const body = (await response.json().catch(() => null)) as ApiResponse<T> | null;

  if (!response.ok || !body?.success) {
    throw new Error(body?.message || `API request failed: ${response.status}`);
  }

  return body.data;
}

export const api = {
  clearAuthToken,
  setAuthToken,

  login: (username: string, password: string) =>
    request<{ token: string; user: { id: number; username: string; role: string; tenantId?: number } }>(
      "auth",
      "/api/auth/login",
      {
        body: JSON.stringify({ password, username }),
        method: "POST",
      },
    ),

  register: (payload: RegisterPayload) =>
    request<{ id: number; username: string; role: string; full_name?: string; fullName?: string }>(
      "auth",
      "/api/auth/register",
      {
        body: JSON.stringify({ ...payload, role: payload.role || "tenant" }),
        method: "POST",
      },
    ),

  getMe: () => request<{ id: number; username: string; role: string; tenantId?: number }>("auth", "/api/auth/me"),

  listRooms: () => request<any[]>("room", "/api/rooms"),
  listAvailableRooms: () => request<any[]>("room", "/api/rooms/available"),
  createRoom: (payload: any) =>
    request<any>("room", "/api/rooms", {
      body: JSON.stringify(payload),
      method: "POST",
    }),
  updateRoom: (id: number, payload: any) =>
    request<any>("room", `/api/rooms/${id}`, {
      body: JSON.stringify(payload),
      method: "PUT",
    }),
  createRentalRequest: (payload: any) =>
    request<any>("room", "/api/rooms/rental-requests", {
      body: JSON.stringify(payload),
      method: "POST",
    }),
  listRentalRequests: () => request<any[]>("room", "/api/rooms/rental-requests"),
  updateRentalRequestStatus: (id: number, payload: any) =>
    request<any>("room", `/api/rooms/rental-requests/${id}`, {
      body: JSON.stringify(payload),
      method: "PATCH",
    }),

  listTenants: () => request<any[]>("room", "/api/tenants"),
  createTenant: (payload: any) =>
    request<any>("room", "/api/tenants", {
      body: JSON.stringify(payload),
      method: "POST",
    }),
  deleteTenant: (id: number) =>
    request<{ deleted: boolean }>("room", `/api/tenants/${id}`, {
      method: "DELETE",
    }),

  listContracts: () => request<any[]>("room", "/api/contracts"),
  createContract: (payload: any) =>
    request<any>("room", "/api/contracts", {
      body: JSON.stringify(payload),
      method: "POST",
    }),
  endContract: (id: number) =>
    request<any>("room", `/api/contracts/${id}/end`, {
      method: "PATCH",
    }),

  listInvoices: () => request<any[]>("billing", "/api/invoices"),
  createInvoice: (payload: any) =>
    request<any>("billing", "/api/invoices", {
      body: JSON.stringify(payload),
      method: "POST",
    }),
  updateInvoice: (id: number, payload: any) =>
    request<any>("billing", `/api/invoices/${id}`, {
      body: JSON.stringify(payload),
      method: "PUT",
    }),
  markInvoicePaid: (id: number) =>
    request<any>("billing", `/api/invoices/${id}/payment-status`, {
      body: JSON.stringify({ paymentStatus: "paid" }),
      method: "PATCH",
    }),

  getRevenue: (month: string) => request<any>("report", `/api/reports/revenue?month=${encodeURIComponent(month)}`),
  getUnpaidInvoices: () => request<any[]>("report", "/api/reports/unpaid-invoices"),
  getRoomOccupancy: () => request<any>("report", "/api/reports/room-occupancy"),

  getMyRoom: () => request<any>("room", "/api/me/room"),
  getMyContracts: () => request<any[]>("room", "/api/me/contracts"),
  getMyInvoices: () => request<any[]>("room", "/api/me/invoices"),
  payMyInvoice: (id: number) =>
    request<any>("room", `/api/me/invoices/${id}/pay`, {
      method: "PATCH",
    }),
};

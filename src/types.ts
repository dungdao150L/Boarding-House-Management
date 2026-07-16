export enum RoomStatus {
  AVAILABLE = "AVAILABLE", // Trống
  OCCUPIED = "OCCUPIED",   // Đang thuê
  MAINTENANCE = "MAINTENANCE" // Bảo trì
}

export interface Room {
  id: string; // e.g., P.101
  backendId?: number;
  type: string; // e.g., Căn hộ Studio, Căn hộ 2PN
  floor: number;
  area: number; // m2
  rentPrice: number; // VNĐ
  status: RoomStatus;
  currentTenantId?: string;
  beds?: number;
  bathrooms?: number;
  balcony?: string;
  assets?: string[];
}

export interface Tenant {
  id: string;
  backendId?: number;
  name: string;
  phone: string;
  email: string;
  idCard: string; // CCCD
  roomNumber: string;
  contractStatus: "Active" | "Sắp hết hạn" | "Expired";
  contractStart: string;
  durationMonths: number;
  avatarUrl?: string;
}

export interface Contract {
  id: string; // e.g., HD-2023-1001
  backendId?: number;
  backendRoomId?: number;
  backendTenantId?: number;
  roomNumber: string;
  tenantName: string;
  startDate: string;
  endDate: string;
  deposit: number;
  monthlyRent: number;
  status: "Đang hiệu lực" | "Sắp hết hạn" | "Đã thanh lý";
}

export interface InvoiceDetail {
  roomRent: number;
  electricity: {
    kwh: number;
    price: number;
  };
  water: {
    cubicMeters: number;
    price: number;
  };
  services: number; // Phí dịch vụ
}

export interface Invoice {
  id: string; // e.g., INV-2310-01
  backendId?: number;
  backendContractId?: number;
  billingMonth?: string;
  roomNumber: string;
  tenantName: string;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  dueDate: string;
  status: "Unpaid" | "Partially Paid" | "Paid";
  createdDate: string;
  details: InvoiceDetail;
}

export interface UtilityRecord {
  roomNumber: string;
  tenantName: string;
  prevElectricity: number;
  currElectricity: number;
  prevWater: number;
  currWater: number;
  status: "Đã chốt" | "Chờ duyệt";
  month: string; // e.g., 10/2023
}

export interface PaymentTransaction {
  id: string; // e.g., #TRX-092
  roomNumber: string;
  date: string;
  amount: number;
  method: "Tiền mặt" | "Chuyển khoản" | "Momo" | "Khác";
  status: "Đã xác nhận" | "Chờ duyệt";
  note?: string;
}

export interface MaintenanceRequest {
  id: string;
  roomNumber: string;
  reporter: string;
  title: string;
  priority: "High" | "Medium" | "Low";
  status: "Pending" | "Processing" | "Done" | "Cancelled";
  createdDate: string;
  description: string;
}

export interface RentalRequest {
  id: number;
  userId: number;
  username: string;
  fullName: string;
  email?: string;
  phone?: string;
  roomId: number;
  roomNumber: string;
  roomPrice: number;
  status: "pending" | "approved" | "rejected" | "cancelled";
  created_at?: string;
}

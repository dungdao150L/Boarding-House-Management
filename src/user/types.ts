export interface Invoice {
  backendId?: number;
  id: string;
  month: string;
  dueDate: string;
  paidDate?: string;
  rent: number;
  electricity: number;
  water: number;
  other?: number;
  fee?: number;
  total: number;
  status: 'Pending' | 'Paid' | 'Overdue';
}

export interface ResidentRoom {
  backendId?: number;
  area?: number;
  basePrice?: number;
  electricityUsage?: number;
  floor?: number;
  roomNumber: string;
  tower?: string;
  waterUsage?: number;
}

export interface AvailableRoom {
  id: number;
  area?: number;
  floor?: number;
  name?: string;
  price?: number;
  roomNumber: string;
}

export interface ResidentContract {
  deposit?: number;
  endDate?: string;
  id: string;
  monthlyRent?: number;
  startDate?: string;
  status?: string;
}

export type PriorityLevel = 'Low' | 'Medium' | 'High';
export type RequestStatus = 'Submitted' | 'In Progress' | 'Completed';

export interface MaintenanceRequest {
  id: string;
  title: string;
  category: string;
  priority: PriorityLevel;
  description: string;
  submittedAt: string;
  status: RequestStatus;
  techName?: string;
  photos: string[];
  updates: {
    title: string;
    time: string;
    description?: string;
  }[];
}

export interface Amenity {
  id: string;
  name: string;
  description: string;
  iconName: string;
  image: string;
  capacity: string;
  rules: string;
}

export interface AmenityBooking {
  id: string;
  amenityId: string;
  amenityName: string;
  date: string;
  timeSlot: string;
  status: 'Confirmed' | 'Cancelled';
}

export interface TenantNotification {
  id: string;
  title: string;
  description: string;
  type: 'invoice' | 'system' | 'general';
  time: string;
  isRead: boolean;
}

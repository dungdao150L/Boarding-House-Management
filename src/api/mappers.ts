import {
  Contract,
  Invoice,
  PaymentTransaction,
  Room,
  RoomStatus,
  Tenant,
  UtilityRecord,
} from "../types";

const DEFAULT_ROOM_TYPE = "Phòng trọ";
const ELECTRICITY_PRICE = 3500;
const WATER_PRICE = 20000;

export function toApiRoomStatus(status: RoomStatus) {
  if (status === RoomStatus.OCCUPIED) return "rented";
  if (status === RoomStatus.MAINTENANCE) return "maintenance";
  return "available";
}

function toUiRoomStatus(status: string): RoomStatus {
  if (status === "rented") return RoomStatus.OCCUPIED;
  if (status === "maintenance") return RoomStatus.MAINTENANCE;
  return RoomStatus.AVAILABLE;
}

function toDisplayDate(value?: string | null) {
  if (!value) return "";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString("vi-VN");
}

export function toIsoDate(value?: string) {
  if (!value) return new Date().toISOString().slice(0, 10);
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;

  const ddmmyyyy = value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (ddmmyyyy) {
    const [, day, month, year] = ddmmyyyy;
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  }

  const parsed = new Date(value);
  if (!Number.isNaN(parsed.getTime())) return parsed.toISOString().slice(0, 10);
  return new Date().toISOString().slice(0, 10);
}

export function mapRoom(row: any): Room {
  return {
    area: Number(row.area || 0),
    assets: row.description ? [row.description] : [],
    backendId: Number(row.id),
    bathrooms: 1,
    beds: 1,
    floor: Number(row.floor || 1),
    id: row.name,
    rentPrice: Number(row.price || 0),
    status: toUiRoomStatus(row.status),
    type: row.description || DEFAULT_ROOM_TYPE,
  };
}

export function mapContract(row: any): Contract {
  const status = row.status === "ended" ? "Đã thanh lý" : "Đang hiệu lực";

  return {
    backendId: Number(row.id),
    backendRoomId: Number(row.roomId),
    backendTenantId: Number(row.tenantId),
    deposit: Number(row.deposit || 0),
    endDate: toDisplayDate(row.endDate),
    id: `HD-${row.id}`,
    monthlyRent: Number(row.monthlyRent || 0),
    roomNumber: row.room_name || String(row.roomId),
    startDate: toDisplayDate(row.startDate),
    status,
    tenantName: row.tenant_name || String(row.tenantId),
  };
}

export function mapTenant(row: any, contracts: Contract[]): Tenant {
  const activeContract = contracts.find(
    (contract) => contract.backendTenantId === Number(row.id) && contract.status === "Đang hiệu lực",
  );

  return {
    avatarUrl: undefined,
    backendId: Number(row.id),
    contractStart: activeContract?.startDate || "",
    contractStatus: activeContract ? "Active" : "Expired",
    durationMonths: 12,
    email: row.email || "",
    id: `T.${String(row.id).padStart(3, "0")}`,
    idCard: row.identityNumber || "",
    name: row.fullName,
    phone: row.phone,
    roomNumber: activeContract?.roomNumber || "-",
  };
}

export function mapInvoice(row: any, contracts: Contract[]): Invoice {
  const contract = contracts.find((item) => item.backendId === Number(row.contractId));
  const isPaid = row.paymentStatus === "paid";
  const totalAmount = Number(row.totalAmount || 0);

  return {
    backendContractId: Number(row.contractId),
    backendId: Number(row.id),
    billingMonth: row.month,
    createdDate: toDisplayDate(row.created_at) || row.month || "",
    details: {
      electricity: {
        kwh: Number(row.electricityUsage || 0),
        price: Number(row.electricityUnitPrice || 0),
      },
      roomRent: Number(row.roomFee || 0),
      services: Number(row.serviceFee || 0),
      water: {
        cubicMeters: Number(row.waterUsage || 0),
        price: Number(row.waterUnitPrice || 0),
      },
    },
    dueDate: row.month ? `${row.month}-05` : "",
    id: `INV-${row.id}`,
    paidAmount: isPaid ? totalAmount : 0,
    remainingAmount: isPaid ? 0 : totalAmount,
    roomNumber: contract?.roomNumber || String(row.room_id || ""),
    status: isPaid ? "Paid" : "Unpaid",
    tenantName: contract?.tenantName || String(row.tenant_id || ""),
    totalAmount,
  };
}

export function enrichRoomsWithContracts(rooms: Room[], contracts: Contract[]) {
  return rooms.map((room) => {
    const activeContract = contracts.find(
      (contract) => contract.roomNumber === room.id && contract.status === "Đang hiệu lực",
    );

    return activeContract
      ? {
          ...room,
          currentTenantId: `T.${String(activeContract.backendTenantId || "").padStart(3, "0")}`,
          status: RoomStatus.OCCUPIED,
        }
      : room;
  });
}

export function buildUtilities(contracts: Contract[], invoices: Invoice[]): UtilityRecord[] {
  const latestByRoom = new Map<string, Invoice>();
  invoices.forEach((invoice) => {
    if (!latestByRoom.has(invoice.roomNumber)) {
      latestByRoom.set(invoice.roomNumber, invoice);
    }
  });

  return contracts
    .filter((contract) => contract.status === "Đang hiệu lực")
    .map((contract) => {
      const invoice = latestByRoom.get(contract.roomNumber);
      const electricityUsage = invoice?.details.electricity.kwh || 0;
      const waterUsage = invoice?.details.water.cubicMeters || 0;

      return {
        currElectricity: electricityUsage,
        currWater: waterUsage,
        month: "Tháng hiện tại",
        prevElectricity: 0,
        prevWater: 0,
        roomNumber: contract.roomNumber,
        status: invoice ? "Đã chốt" : "Chờ duyệt",
        tenantName: contract.tenantName,
      };
    });
}

export function buildTransactions(invoices: Invoice[]): PaymentTransaction[] {
  return invoices
    .filter((invoice) => invoice.status === "Paid")
    .map((invoice) => ({
      amount: invoice.totalAmount,
      date: invoice.createdDate,
      id: `#TRX-${invoice.backendId || invoice.id}`,
      method: "Chuyển khoản",
      note: `Thanh toán hóa đơn ${invoice.id}`,
      roomNumber: invoice.roomNumber,
      status: "Đã xác nhận",
    }));
}

export const billingDefaults = {
  electricityUnitPrice: ELECTRICITY_PRICE,
  serviceFee: 150000,
  waterUnitPrice: WATER_PRICE,
};

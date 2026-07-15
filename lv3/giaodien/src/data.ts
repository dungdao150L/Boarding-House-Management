import { Room, RoomStatus, Tenant, Contract, Invoice, UtilityRecord, PaymentTransaction, MaintenanceRequest } from "./types";

export const INITIAL_ROOMS: Room[] = [
  {
    id: "P.101",
    type: "Căn hộ Studio",
    floor: 1,
    area: 45,
    rentPrice: 8500000,
    status: RoomStatus.AVAILABLE,
    beds: 1,
    bathrooms: 1,
    balcony: "Đông",
    assets: ["Smart TV 43\"", "Tủ lạnh 150L", "Điều hòa Casper", "Bếp hồng ngoại"]
  },
  {
    id: "P.102",
    type: "Căn hộ 1PN",
    floor: 1,
    area: 55,
    rentPrice: 10500000,
    status: RoomStatus.OCCUPIED,
    currentTenantId: "T.001",
    beds: 1,
    bathrooms: 1,
    balcony: "Nam",
    assets: ["Smart TV 55\"", "Tủ lạnh 250L", "Điều hòa Daikin", "Máy giặt Electrolux"]
  },
  {
    id: "P.205",
    type: "Căn hộ 2PN",
    floor: 2,
    area: 75,
    rentPrice: 14000000,
    status: RoomStatus.MAINTENANCE,
    beds: 2,
    bathrooms: 2,
    balcony: "Tây",
    assets: ["Smart TV 55\"", "Tủ lạnh 300L", "Điều hòa Daikin (2 dàn)", "Máy sấy độc lập"]
  },
  {
    id: "P.301",
    type: "Căn hộ Studio",
    floor: 3,
    area: 45,
    rentPrice: 8500000,
    status: RoomStatus.OCCUPIED,
    currentTenantId: "T.002",
    beds: 1,
    bathrooms: 1,
    balcony: "Đông",
    assets: ["Smart TV 43\"", "Tủ lạnh 150L", "Điều hòa Casper", "Bông hoa trang trí"]
  },
  {
    id: "P.402",
    type: "2 Phòng ngủ cao cấp",
    floor: 4,
    area: 85,
    rentPrice: 24500000,
    status: RoomStatus.OCCUPIED,
    currentTenantId: "T.004",
    beds: 2,
    bathrooms: 2,
    balcony: "Nam",
    assets: ["Smart TV 65\" Sony Bravia", "Tủ lạnh Inverter Hitachi 500L", "Điều hòa âm trần Daikin (3 dàn)", "Máy giặt sấy Electrolux 10kg"]
  },
  {
    id: "P.403",
    type: "Căn hộ Studio",
    floor: 4,
    area: 45,
    rentPrice: 8500000,
    status: RoomStatus.AVAILABLE,
    beds: 1,
    bathrooms: 1,
    balcony: "Bắc",
    assets: ["Smart TV 43\"", "Tủ lạnh 150L", "Điều hòa Casper"]
  }
];

export const INITIAL_TENANTS: Tenant[] = [
  {
    id: "T.001",
    name: "Nguyễn Văn A",
    phone: "0901 234 567",
    email: "nguyenvana@email.com",
    idCard: "079012345678",
    roomNumber: "P.102",
    contractStatus: "Active",
    contractStart: "01/01/2023",
    durationMonths: 12,
    avatarUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuCBC-znfZyf1waztqEkaMyKO0Ykgg7s4p1v0xOIo3hCAYUZ8zH5roLCI9NgKFn-9Se7rlC-6aLFbaNTNfaL2KIIujhNILlcXxojhZLZBv7seqLZRqsWCpft3eOQLmByRaHkxtFY5t69yTqTptoL-6V-k02KF9SQT6M5sWcZGc_QU2tJ8TCq-pB7ufgHcXen4-HOvLzDUhp97O03y6t5Hu3ROX1ifszizfjcKGCNS6UcPfnIMC7gHzy-ZSjQGVaYPwIU_DdQ2JTLSDg"
  },
  {
    id: "T.002",
    name: "Trần Thị B",
    phone: "0988 765 432",
    email: "tranthib@email.com",
    idCard: "001122334455",
    roomNumber: "P.301",
    contractStatus: "Sắp hết hạn",
    contractStart: "15/03/2023",
    durationMonths: 12,
    avatarUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuCemAjj0chBqwACaX9gFAbjxxZqnFxIcsDxZWNHgn37RG-ugTPA11OMIGqygO0iTXJI2U_-05IFiGxXhXD_SfpRsEvJhv3DGCNUmJFprY1vkvbn4s7jHCaix2l-86I4P-8oGKS8Qd-3v5CIL3AHiPKmc65zepNJJlJxto6801bPaKyF1Zpis_m6wqJvn9m8IWo43Lo_tC4dhT-kgZTZArC1JbHC_2NUWkJk808Or7gjEY0LLyJt58RZMLIWbCMc5ex_VphHGTTuu8s"
  },
  {
    id: "T.003",
    name: "Lê Văn C",
    phone: "0912 345 678",
    email: "levanc@email.com",
    idCard: "098765432109",
    roomNumber: "P.205",
    contractStatus: "Expired",
    contractStart: "10/11/2022",
    durationMonths: 12,
    avatarUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuDrFo4yBBaUIYEbEovhsA5cGLoYXNTldNqsbZwjch4s6KfXL9YwJhUYFQNXsov8LhuIRWL0_M7scnB939yiOGV7zik_hZdMO3L9FAfeVZ2yUR_JZKUddFZCdNuyIYLiTFUE3fL2lajlV3lEzBKeRXI-WcM2a0OV0Gu6rKU9hojIAbFfGQ8bHbmy_xmVQQbW53d1eBbeNVdjcyaJ1fzV-39SMN_vYbR2yIfDPqV6CU6g1GtJPUNJk9YJ0WHxNEoyOgDh1DRVAXqC8Ds"
  },
  {
    id: "T.004",
    name: "Trần Văn Quân",
    phone: "0988 123 456",
    email: "quan.tran@corporate.vn",
    idCard: "001293004567",
    roomNumber: "P.402",
    contractStatus: "Active",
    contractStart: "01/09/2023",
    durationMonths: 12,
    avatarUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuCxcG_LR_sfljaQD20RhVkYp6PSmHC6b28VJOMmc_5ixS6itHXye6lWjLtsWHFp1Fo9ZFcyD6AdePlDNgDdb5V7wAf8G0guYIw3sCinm_goKesFJxu3XWNQ_WIgaomDCI-AJGdG0lnKQP0wKep14oKPRWJP5rYRXWx3z6utCGGQGAttk15Bc3y9AaDsUgTMxU6wsGaLvxm-QwLQn5eroJ4A0s4lSs3Ga5V1Eka7H5ULxZTApRIsXKQ_U82yMD0jeMu1HOo6T5cGHcY"
  }
];

export const INITIAL_CONTRACTS: Contract[] = [
  {
    id: "HD-2023-1001",
    roomNumber: "P.102",
    tenantName: "Nguyễn Văn A",
    startDate: "01/01/2023",
    endDate: "31/12/2023",
    deposit: 15000000,
    monthlyRent: 10500000,
    status: "Đang hiệu lực"
  },
  {
    id: "HD-2023-1042",
    roomNumber: "P.301",
    tenantName: "Trần Thị B",
    startDate: "15/03/2023",
    endDate: "14/03/2024",
    deposit: 18000000,
    monthlyRent: 8500000,
    status: "Đang hiệu lực"
  },
  {
    id: "HD-2022-0889",
    roomNumber: "P.205",
    tenantName: "Lê Văn C",
    startDate: "10/11/2022",
    endDate: "09/11/2023",
    deposit: 20000000,
    monthlyRent: 14000000,
    status: "Sắp hết hạn"
  },
  {
    id: "HD-2021-0112",
    roomNumber: "P.403",
    tenantName: "Phạm Thị D",
    startDate: "01/05/2021",
    endDate: "30/04/2022",
    deposit: 10000000,
    monthlyRent: 8000000,
    status: "Đã thanh lý"
  },
  {
    id: "HD-2023-402",
    roomNumber: "P.402",
    tenantName: "Trần Văn Quân",
    startDate: "01/09/2023",
    endDate: "31/08/2024",
    deposit: 49000000,
    monthlyRent: 24500000,
    status: "Đang hiệu lực"
  }
];

export const INITIAL_INVOICES: Invoice[] = [
  {
    id: "INV-2310-01",
    roomNumber: "P.102",
    tenantName: "Nguyễn Văn A",
    totalAmount: 8500000,
    paidAmount: 0,
    remainingAmount: 8500000,
    dueDate: "15/10/2023",
    status: "Unpaid",
    createdDate: "01/10/2023",
    details: {
      roomRent: 7500000,
      electricity: { kwh: 150, price: 3500 },
      water: { cubicMeters: 15, price: 20000 },
      services: 175000
    }
  },
  {
    id: "INV-2310-02",
    roomNumber: "P.301",
    tenantName: "Trần Thị B",
    totalAmount: 12000000,
    paidAmount: 6000000,
    remainingAmount: 6000000,
    dueDate: "20/10/2023",
    status: "Partially Paid",
    createdDate: "01/10/2023",
    details: {
      roomRent: 10000000,
      electricity: { kwh: 200, price: 3500 },
      water: { cubicMeters: 25, price: 20000 },
      services: 800000
    }
  },
  {
    id: "INV-2310-402",
    roomNumber: "P.402",
    tenantName: "Trần Văn Quân",
    totalAmount: 26850000,
    paidAmount: 0,
    remainingAmount: 26850000,
    dueDate: "05/10/2023",
    status: "Unpaid",
    createdDate: "01/10/2023",
    details: {
      roomRent: 24500000,
      electricity: { kwh: 250, price: 3500 },
      water: { cubicMeters: 14, price: 20000 },
      services: 1200000
    }
  }
];

export const INITIAL_UTILITIES: UtilityRecord[] = [
  {
    roomNumber: "P.102",
    tenantName: "Nguyễn Văn A",
    prevElectricity: 1540,
    currElectricity: 1620,
    prevWater: 120,
    currWater: 135,
    status: "Đã chốt",
    month: "Tháng 10/2023"
  },
  {
    roomNumber: "P.301",
    tenantName: "Trần Thị B",
    prevElectricity: 2100,
    currElectricity: 2250,
    prevWater: 45,
    currWater: 52,
    status: "Chờ duyệt",
    month: "Tháng 10/2023"
  },
  {
    roomNumber: "P.402",
    tenantName: "Trần Văn Quân",
    prevElectricity: 3450,
    currElectricity: 3700,
    prevWater: 180,
    currWater: 194,
    status: "Đã chốt",
    month: "Tháng 10/2023"
  }
];

export const INITIAL_TRANSACTIONS: PaymentTransaction[] = [
  {
    id: "#TRX-092",
    roomNumber: "P.102",
    date: "24/10/2023",
    amount: 8500000,
    method: "Chuyển khoản",
    status: "Đã xác nhận",
    note: "Thanh toán tiền nhà tháng 10"
  },
  {
    id: "#TRX-091",
    roomNumber: "P.301",
    date: "23/10/2023",
    amount: 12000000,
    method: "Tiền mặt",
    status: "Chờ duyệt",
    note: "Khách trả tiền mặt tại quầy"
  },
  {
    id: "#TRX-090",
    roomNumber: "P.205",
    date: "22/10/2023",
    amount: 6200000,
    method: "Momo",
    status: "Đã xác nhận",
    note: "Momo transaction ID: 9482741"
  },
  {
    id: "#TRX-089",
    roomNumber: "P.402",
    date: "20/10/2023",
    amount: 8500000,
    method: "Chuyển khoản",
    status: "Đã xác nhận",
    note: "Chuyển khoản ngân hàng Vietcombank"
  }
];

export const INITIAL_MAINTENANCE: MaintenanceRequest[] = [
  {
    id: "M.001",
    roomNumber: "P.205",
    reporter: "Trần Thị B",
    title: "Rò rỉ nước vòi hoa sen",
    priority: "High",
    status: "Pending",
    createdDate: "Hôm nay, 09:30",
    description: "Phòng tắm master bị rỉ nước liên tục từ vòi hoa sen."
  },
  {
    id: "M.002",
    roomNumber: "P.402",
    reporter: "Trần Văn Quân",
    title: "Vệ sinh điều hòa",
    priority: "Low",
    status: "Done",
    createdDate: "12/08/2023",
    description: "Khách yêu cầu vệ sinh định kỳ 3 máy điều hòa âm trần Daikin."
  },
  {
    id: "M.003",
    roomNumber: "P.102",
    reporter: "Nguyễn Văn A",
    title: "Hỏng điều hòa phòng khách",
    priority: "High",
    status: "Pending",
    createdDate: "10/10/2023",
    description: "Điều hòa phòng khách bật không lên nguồn."
  },
  {
    id: "M.004",
    roomNumber: "P.205",
    reporter: "Trần Thị B",
    title: "Tắc đường ống bồn rửa mặt",
    priority: "Medium",
    status: "Processing",
    createdDate: "09/10/2023",
    description: "Nước rút rất chậm ở bồn rửa mặt phòng vệ sinh chính."
  },
  {
    id: "M.005",
    roomNumber: "P.301",
    reporter: "Lê Văn C",
    title: "Thay bóng đèn ban công",
    priority: "Low",
    status: "Done",
    createdDate: "05/10/2023",
    description: "Bóng đèn led ngoài ban công bị cháy."
  },
  {
    id: "M.006",
    roomNumber: "P.402",
    reporter: "Phạm Thị M",
    title: "Cửa sổ kẹt bản lề",
    priority: "Low",
    status: "Cancelled",
    createdDate: "01/10/2023",
    description: "Bản lề cửa sổ phòng ngủ phụ bị rỉ sét và kẹt."
  }
];

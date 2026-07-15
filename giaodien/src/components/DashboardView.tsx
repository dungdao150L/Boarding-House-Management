import React from "react";
import {
  TrendingUp,
  Home,
  Users,
  Wrench,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  CheckCircle,
  Clock,
  DollarSign
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";
import { Room, Tenant, PaymentTransaction, MaintenanceRequest, RoomStatus } from "../types";

interface DashboardViewProps {
  rooms: Room[];
  tenants: Tenant[];
  transactions: PaymentTransaction[];
  maintenance: MaintenanceRequest[];
  onNavigateToTab: (tab: any) => void;
  onNavigateToRoom: (roomId: string) => void;
  onUpdateMaintenanceStatus: (id: string, newStatus: any) => void;
}

export default function DashboardView({
  rooms,
  tenants,
  transactions,
  maintenance,
  onNavigateToTab,
  onNavigateToRoom,
  onUpdateMaintenanceStatus
}: DashboardViewProps) {
  // Calculations
  const totalRooms = rooms.length;
  const occupiedRooms = rooms.filter((r) => r.status === RoomStatus.OCCUPIED).length;
  const maintenanceRooms = rooms.filter((r) => r.status === RoomStatus.MAINTENANCE).length;
  const availableRooms = rooms.filter((r) => r.status === RoomStatus.AVAILABLE).length;

  const occupancyRate = totalRooms > 0 ? ((occupiedRooms / totalRooms) * 100).toFixed(1) : "0";

  // Total active monthly rent revenue
  const totalMonthlyRent = rooms
    .filter((r) => r.status === RoomStatus.OCCUPIED)
    .reduce((sum, r) => sum + r.rentPrice, 0);

  const pendingMaintenanceCount = maintenance.filter((m) => m.status === "Pending" || m.status === "Processing").length;

  // Chart 1: 6-month Revenue Data (Vietnamese Dong)
  const revenueData = [
    { name: "Tháng 5", revenue: 42000000, utilities: 4500000 },
    { name: "Tháng 6", revenue: 48000000, utilities: 5100000 },
    { name: "Tháng 7", revenue: 48000000, utilities: 4900000 },
    { name: "Tháng 8", revenue: 52000000, utilities: 6000000 },
    { name: "Tháng 9", revenue: 56500000, utilities: 6200000 },
    { name: "Tháng 10", revenue: totalMonthlyRent, utilities: 6500000 }
  ];

  // Chart 2: Room Status Data
  const roomStatusData = [
    { name: "Đang thuê", value: occupiedRooms, color: "#101828" },
    { name: "Trống", value: availableRooms, color: "#c9a45c" },
    { name: "Bảo trì", value: maintenanceRooms, color: "#e8c176" }
  ].filter((item) => item.value > 0);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Welcome bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#101828] tracking-tight">Hệ Thống Quản Trị</h1>
          <p className="text-sm text-[#4e4639]/70 mt-1">
            Tổng quan tình hình vận hành khu căn hộ <strong className="text-[#775a19]">LUMI Residence</strong> hôm nay.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-[#d1c5b4]/30 shadow-sm text-sm text-[#4e4639]">
          <Calendar className="w-4 h-4 text-[#c9a45c]" />
          <span className="font-medium">Kỳ soát vé: Tháng 10, 2026</span>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Metric 1 */}
        <div className="bg-white p-6 rounded-2xl border border-[#d1c5b4]/20 shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-[#4e4639]/60 uppercase tracking-wider">
                Doanh thu thuê phòng
              </p>
              <h3 className="text-2xl font-bold text-[#101828] mt-2 font-sans tracking-tight">
                {formatCurrency(totalMonthlyRent)}
              </h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[#c9a45c]/10 flex items-center justify-center text-[#c9a45c]">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-center gap-1.5 mt-4 text-xs">
            <span className="flex items-center font-medium text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
              <TrendingUp className="w-3.5 h-3.5 mr-0.5" /> +12.5%
            </span>
            <span className="text-gray-500">So với tháng trước</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div
          onClick={() => onNavigateToTab("rooms")}
          className="bg-white p-6 rounded-2xl border border-[#d1c5b4]/20 shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex flex-col justify-between cursor-pointer hover:border-[#c9a45c]/50 transition-all"
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-[#4e4639]/60 uppercase tracking-wider">
                Tỷ lệ lấp đầy
              </p>
              <h3 className="text-2xl font-bold text-[#101828] mt-2 font-sans tracking-tight">
                {occupancyRate}%
              </h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[#101828]/5 flex items-center justify-center text-[#101828]">
              <Home className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-center gap-2 mt-4 text-xs text-gray-500">
            <div className="flex-1 bg-gray-100 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-[#c9a45c] h-full rounded-full"
                style={{ width: `${occupancyRate}%` }}
              ></div>
            </div>
            <span className="font-semibold text-[#101828]">
              {occupiedRooms}/{totalRooms} phòng
            </span>
          </div>
        </div>

        {/* Metric 3 */}
        <div
          onClick={() => onNavigateToTab("tenants")}
          className="bg-white p-6 rounded-2xl border border-[#d1c5b4]/20 shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex flex-col justify-between cursor-pointer hover:border-[#c9a45c]/50 transition-all"
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-[#4e4639]/60 uppercase tracking-wider">
                Khách đang thuê
              </p>
              <h3 className="text-2xl font-bold text-[#101828] mt-2 font-sans tracking-tight">
                {tenants.length} người
              </h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-center gap-1.5 mt-4 text-xs text-gray-500">
            <span className="font-medium text-[#101828]">{rooms.filter(r => r.status === RoomStatus.AVAILABLE).length} phòng trống</span>
            <span>sẵn sàng đón khách mới</span>
          </div>
        </div>

        {/* Metric 4 */}
        <div
          onClick={() => onNavigateToTab("maintenance")}
          className="bg-white p-6 rounded-2xl border border-[#d1c5b4]/20 shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex flex-col justify-between cursor-pointer hover:border-[#c9a45c]/50 transition-all"
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-[#4e4639]/60 uppercase tracking-wider">
                Yêu cầu bảo trì
              </p>
              <h3 className="text-2xl font-bold text-[#101828] mt-2 font-sans tracking-tight">
                {pendingMaintenanceCount} cần xử lý
              </h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-600">
              <Wrench className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-center gap-1.5 mt-4 text-xs text-gray-500">
            {pendingMaintenanceCount > 0 ? (
              <span className="flex items-center text-rose-600 font-medium">
                <Clock className="w-3.5 h-3.5 mr-1" /> Có yêu cầu khẩn cấp!
              </span>
            ) : (
              <span className="flex items-center text-emerald-600 font-medium">
                <CheckCircle className="w-3.5 h-3.5 mr-1" /> Hệ thống ổn định
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Visualizations & Charts Block */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Area Chart */}
        <div className="bg-white p-6 rounded-2xl border border-[#d1c5b4]/20 shadow-[0_4px_20px_rgba(0,0,0,0.02)] lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-[#101828]">Doanh thu 6 tháng gần nhất</h3>
              <p className="text-xs text-[#4e4639]/70 mt-0.5">Xu hướng tiền thuê phòng & dịch vụ tiện ích</p>
            </div>
            <span className="text-xs font-medium text-[#775a19] bg-[#c9a45c]/10 px-2.5 py-1 rounded-full border border-[#c9a45c]/20">
              Đơn vị: VNĐ
            </span>
          </div>

          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: 20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#c9a45c" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#c9a45c" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorUtilities" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#101828" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#101828" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0efe9" />
                <XAxis dataKey="name" stroke="#a39683" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis
                  stroke="#a39683"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `${(v / 1000000).toFixed(0)}M`}
                />
                <Tooltip
                  formatter={(value: any) => [formatCurrency(Number(value)), ""]}
                  contentStyle={{
                    backgroundColor: "#101828",
                    color: "#fff",
                    borderRadius: "12px",
                    border: "none",
                    boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
                    fontSize: "12px"
                  }}
                />
                <Area
                  name="Tiền thuê phòng"
                  type="monotone"
                  dataKey="revenue"
                  stroke="#c9a45c"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                />
                <Area
                  name="Tiền điện nước"
                  type="monotone"
                  dataKey="utilities"
                  stroke="#101828"
                  strokeWidth={1.5}
                  fillOpacity={1}
                  fill="url(#colorUtilities)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Room Status Doughnut */}
        <div className="bg-white p-6 rounded-2xl border border-[#d1c5b4]/20 shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-[#101828] mb-1">Trạng thái phòng</h3>
            <p className="text-xs text-[#4e4639]/70 mb-6">Tỷ lệ phân bố công suất sử dụng</p>
          </div>

          <div className="h-48 w-full relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={roomStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {roomStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(v) => [`${v} phòng`]}
                  contentStyle={{
                    backgroundColor: "#fff",
                    borderRadius: "8px",
                    borderColor: "#e1d9cc",
                    fontSize: "12px"
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            {/* Centered label */}
            <div className="absolute flex flex-col items-center">
              <span className="text-3xl font-extrabold text-[#101828]">{occupiedRooms}</span>
              <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400">Đã thuê</span>
            </div>
          </div>

          <div className="space-y-2 mt-4">
            {roomStatusData.map((item, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                  <span className="text-[#4e4639] font-medium">{item.name}</span>
                </div>
                <span className="font-semibold text-[#101828]">
                  {item.value} phòng ({((item.value / totalRooms) * 100).toFixed(0)}%)
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tables Row: Recent Transactions & Active Maintenance */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Recent Transactions Table */}
        <div className="bg-white p-6 rounded-2xl border border-[#d1c5b4]/20 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-[#101828]">Lịch sử giao dịch mới</h3>
              <p className="text-xs text-[#4e4639]/70 mt-0.5">Cập nhật thanh toán gần đây từ khách hàng</p>
            </div>
            <button
              onClick={() => onNavigateToTab("payments")}
              className="text-xs font-semibold text-[#775a19] hover:text-[#c9a45c] flex items-center gap-1 transition-colors"
            >
              Xem tất cả <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-[#d1c5b4]/20 text-gray-400 text-xs font-semibold uppercase">
                  <th className="py-3 px-2">Mã GD</th>
                  <th className="py-3 px-2">Phòng</th>
                  <th className="py-3 px-2">Ngày</th>
                  <th className="py-3 px-2">Số tiền</th>
                  <th className="py-3 px-2 text-right">Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {transactions.slice(0, 4).map((trx) => (
                  <tr key={trx.id} className="border-b border-gray-50 hover:bg-[#fcfbf9] transition-colors">
                    <td className="py-3.5 px-2 font-mono font-bold text-gray-700">{trx.id}</td>
                    <td className="py-3.5 px-2">
                      <span
                        onClick={() => onNavigateToRoom(trx.roomNumber)}
                        className="font-semibold text-[#775a19] hover:underline cursor-pointer"
                      >
                        {trx.roomNumber}
                      </span>
                    </td>
                    <td className="py-3.5 px-2 text-gray-500">{trx.date}</td>
                    <td className="py-3.5 px-2 font-semibold text-[#101828]">{formatCurrency(trx.amount)}</td>
                    <td className="py-3.5 px-2 text-right">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          trx.status === "Đã xác nhận"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-amber-50 text-amber-700 border border-amber-200"
                        }`}
                      >
                        {trx.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Maintenance Requests Widget */}
        <div className="bg-white p-6 rounded-2xl border border-[#d1c5b4]/20 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-[#101828]">Yêu cầu sửa chữa khẩn</h3>
              <p className="text-xs text-[#4e4639]/70 mt-0.5">Danh sách phiếu cần điều phối kỹ thuật</p>
            </div>
            <button
              onClick={() => onNavigateToTab("maintenance")}
              className="text-xs font-semibold text-[#775a19] hover:text-[#c9a45c] flex items-center gap-1 transition-colors"
            >
              Điều phối <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
            {maintenance
              .filter((m) => m.status === "Pending" || m.status === "Processing")
              .slice(0, 4)
              .map((req) => (
                <div
                  key={req.id}
                  className="p-4 rounded-xl border border-gray-100 hover:border-[#c9a45c]/30 hover:bg-[#fcfbf9] transition-all flex items-start justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span
                        onClick={() => onNavigateToRoom(req.roomNumber)}
                        className="px-2 py-0.5 bg-[#101828] text-white text-xs font-bold rounded cursor-pointer hover:bg-[#c9a45c] transition-colors"
                      >
                        {req.roomNumber}
                      </span>
                      <h4 className="font-semibold text-sm text-[#101828]">{req.title}</h4>
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${
                          req.priority === "High"
                            ? "bg-rose-50 text-rose-700 border border-rose-100"
                            : "bg-amber-50 text-amber-700 border border-amber-100"
                        }`}
                      >
                        {req.priority}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 line-clamp-1">{req.description}</p>
                    <span className="text-[10px] text-gray-400 font-mono block">Ngày báo: {req.createdDate}</span>
                  </div>

                  <div className="flex flex-col gap-1.5 shrink-0">
                    <button
                      onClick={() => onUpdateMaintenanceStatus(req.id, "Processing")}
                      className={`text-xs px-2.5 py-1 rounded-lg border font-medium transition-all cursor-pointer ${
                        req.status === "Pending"
                          ? "bg-[#c9a45c]/10 text-[#775a19] border-[#c9a45c]/20 hover:bg-[#c9a45c]/20"
                          : "bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100"
                      }`}
                    >
                      {req.status === "Pending" ? "Xử lý" : "Đang sửa"}
                    </button>
                    {req.status === "Processing" && (
                      <button
                        onClick={() => onUpdateMaintenanceStatus(req.id, "Done")}
                        className="text-xs px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-medium hover:bg-emerald-700 transition-all cursor-pointer"
                      >
                        Hoàn thành
                      </button>
                    )}
                  </div>
                </div>
              ))}

            {maintenance.filter((m) => m.status === "Pending" || m.status === "Processing").length === 0 && (
              <div className="py-12 text-center text-gray-400 flex flex-col items-center gap-2">
                <CheckCircle className="w-8 h-8 text-emerald-500" />
                <span className="text-sm">Không có yêu cầu bảo trì tồn đọng!</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

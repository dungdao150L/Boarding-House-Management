import React, { useState } from "react";
import {
  ArrowLeft,
  CheckCircle,
  Home,
  Users,
  FileText,
  DollarSign,
  Zap,
  Droplet,
  Wrench,
  Hammer,
  Layers,
  Settings,
  Plus,
  Trash2,
  Calendar,
  AlertTriangle
} from "lucide-react";
import { Room, Tenant, Contract, Invoice, UtilityRecord, MaintenanceRequest, RoomStatus } from "../types";

interface RoomDetailViewProps {
  roomId: string;
  rooms: Room[];
  tenants: Tenant[];
  contracts: Contract[];
  invoices: Invoice[];
  utilities: UtilityRecord[];
  maintenance: MaintenanceRequest[];
  onBack: () => void;
  onUpdateRoomStatus: (id: string, status: RoomStatus) => void;
  onAddAsset: (id: string, asset: string) => void;
  onRemoveAsset: (id: string, assetIndex: number) => void;
}

export default function RoomDetailView({
  roomId,
  rooms,
  tenants,
  contracts,
  invoices,
  utilities,
  maintenance,
  onBack,
  onUpdateRoomStatus,
  onAddAsset,
  onRemoveAsset
}: RoomDetailViewProps) {
  const [newAsset, setNewAsset] = useState("");

  const room = rooms.find((r) => r.id === roomId);
  if (!room) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-[#d1c5b4]/20">
        <p className="text-gray-500 font-semibold">Căn hộ không tồn tại hoặc đã bị xóa!</p>
        <button onClick={onBack} className="mt-4 px-4 py-2 bg-[#c9a45c] text-white rounded-lg">
          Quay lại
        </button>
      </div>
    );
  }

  // Get active tenant details
  const tenant = tenants.find((t) => t.roomNumber === room.id && t.contractStatus !== "Expired");
  // Get active contract
  const contract = contracts.find((c) => c.roomNumber === room.id && c.status !== "Đã thanh lý");
  // Get active utility record
  const utility = utilities.find((u) => u.roomNumber === room.id);
  // Get room invoices
  const roomInvoices = invoices.filter((i) => i.roomNumber === room.id);
  const latestInvoice = roomInvoices[roomInvoices.length - 1];
  // Get maintenance requests
  const roomMaintenance = maintenance.filter((m) => m.roomNumber === room.id);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(val);
  };

  const handleAddAssetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAsset.trim()) return;
    onAddAsset(room.id, newAsset.trim());
    setNewAsset("");
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Detail Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-full border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center text-gray-600 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-extrabold text-[#101828] tracking-tight">{room.id}</h1>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                  room.status === RoomStatus.AVAILABLE
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : room.status === RoomStatus.OCCUPIED
                    ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                    : "bg-rose-50 text-rose-700 border border-rose-200"
                }`}
              >
                {room.status === RoomStatus.AVAILABLE
                  ? "Trống"
                  : room.status === RoomStatus.OCCUPIED
                  ? "Đang thuê"
                  : "Bảo trì"}
              </span>
            </div>
            <p className="text-sm text-gray-500 font-medium mt-0.5">
              Loại: <span className="text-[#775a19]">{room.type}</span> • Tầng {room.floor}
            </p>
          </div>
        </div>

        {/* Change Status Quick Control */}
        <div className="flex items-center gap-2 bg-white p-2 rounded-xl border border-gray-200 shadow-sm">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wide px-2">Cập nhật trạng thái:</span>
          <select
            className="h-9 px-2 bg-gray-50 rounded-lg text-xs font-bold text-[#101828] border-none focus:ring-2 focus:ring-[#c9a45c]/30"
            value={room.status}
            onChange={(e) => onUpdateRoomStatus(room.id, e.target.value as RoomStatus)}
          >
            <option value={RoomStatus.AVAILABLE}>Trống (Sẵn sàng)</option>
            <option value={RoomStatus.OCCUPIED}>Đang thuê</option>
            <option value={RoomStatus.MAINTENANCE}>Bảo trì / Sửa chữa</option>
          </select>
        </div>
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Panel 1: Basic Specifications */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-[0_4px_25px_rgba(0,0,0,0.01)] space-y-4">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
            <Layers className="w-5 h-5 text-[#c9a45c]" />
            <h3 className="font-bold text-base text-[#101828]">Thông số căn hộ</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 p-3 rounded-xl">
              <span className="text-xs text-gray-400 font-medium block">Diện tích</span>
              <span className="text-lg font-bold text-[#101828]">{room.area} m²</span>
            </div>
            <div className="bg-gray-50 p-3 rounded-xl">
              <span className="text-xs text-gray-400 font-medium block">Giá cho thuê</span>
              <span className="text-base font-bold text-[#101828] text-amber-700">{formatCurrency(room.rentPrice)}</span>
            </div>
            <div className="bg-gray-50 p-3 rounded-xl">
              <span className="text-xs text-gray-400 font-medium block">Ban công</span>
              <span className="text-sm font-bold text-[#101828]">Hướng {room.balcony || "Nam"}</span>
            </div>
            <div className="bg-gray-50 p-3 rounded-xl">
              <span className="text-xs text-gray-400 font-medium block">Bố cục</span>
              <span className="text-sm font-bold text-[#101828]">
                {room.beds || 1} Giường • {room.bathrooms || 1} WC
              </span>
            </div>
          </div>
        </div>

        {/* Panel 2: Contract & Occupant details */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-[0_4px_25px_rgba(0,0,0,0.01)] space-y-4">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
            <Users className="w-5 h-5 text-[#c9a45c]" />
            <h3 className="font-bold text-base text-[#101828]">Khách thuê & Hợp đồng</h3>
          </div>

          {tenant ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                {tenant.avatarUrl ? (
                  <img
                    src={tenant.avatarUrl}
                    alt={tenant.name}
                    className="w-11 h-11 rounded-full border-2 border-[#c9a45c] object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-11 h-11 rounded-full bg-[#101828] text-white flex items-center justify-center font-bold">
                    {tenant.name.charAt(0)}
                  </div>
                )}
                <div>
                  <h4 className="font-bold text-[#101828] text-sm">{tenant.name}</h4>
                  <p className="text-xs text-gray-500">{tenant.phone} • {tenant.email}</p>
                </div>
              </div>

              {contract ? (
                <div className="bg-[#fcfbf9] border border-amber-100 p-3.5 rounded-xl space-y-2 text-xs text-[#4e4639]">
                  <div className="flex justify-between font-semibold text-[#101828]">
                    <span>Hợp đồng:</span>
                    <span className="font-mono text-amber-800">{contract.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Thời hạn:</span>
                    <span>{contract.startDate} - {contract.endDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tiền cọc:</span>
                    <span className="font-medium text-[#101828]">{formatCurrency(contract.deposit)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Kỳ thanh toán:</span>
                    <span className="font-medium text-amber-700">Ngày 5 hàng tháng</span>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-amber-600 bg-amber-50 p-2 rounded-lg border border-amber-100">
                  Phòng đang ở nhưng không tìm thấy hợp đồng hoạt động hợp lệ.
                </p>
              )}
            </div>
          ) : (
            <div className="py-8 text-center text-gray-400 text-sm flex flex-col items-center gap-1">
              <Users className="w-8 h-8 text-gray-300" />
              <span>Chưa có khách thuê phòng này</span>
              <p className="text-xs text-gray-400">Hãy thêm khách thuê và hợp đồng mới.</p>
            </div>
          )}
        </div>

        {/* Panel 3: Latest billing invoice */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-[0_4px_25px_rgba(0,0,0,0.01)] space-y-4">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
            <FileText className="w-5 h-5 text-[#c9a45c]" />
            <h3 className="font-bold text-base text-[#101828]">Hóa đơn tháng mới nhất</h3>
          </div>

          {latestInvoice ? (
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs text-gray-400 block font-mono">{latestInvoice.id}</span>
                  <span className="text-xl font-bold text-gray-900">{formatCurrency(latestInvoice.totalAmount)}</span>
                </div>
                <span
                  className={`px-2.5 py-0.5 text-xs font-bold rounded-full ${
                    latestInvoice.status === "Paid"
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "bg-rose-50 text-rose-700 border border-rose-200"
                  }`}
                >
                  {latestInvoice.status === "Paid" ? "Đã đóng" : "Chưa đóng"}
                </span>
              </div>

              <div className="space-y-1.5 text-xs text-gray-500">
                <div className="flex justify-between">
                  <span>Tiền thuê nhà:</span>
                  <span className="font-semibold text-gray-800">{formatCurrency(latestInvoice.details.roomRent)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Điện nước sử dụng:</span>
                  <span className="font-semibold text-gray-800">
                    {formatCurrency(
                      latestInvoice.details.electricity.kwh * latestInvoice.details.electricity.price +
                        latestInvoice.details.water.cubicMeters * latestInvoice.details.water.price
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Phí dịch vụ chung:</span>
                  <span className="font-semibold text-gray-800">{formatCurrency(latestInvoice.details.services)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-dashed border-gray-100 text-gray-400 font-mono">
                  <span>Hạn thanh toán:</span>
                  <span className="text-[#101828] font-bold">{latestInvoice.dueDate}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-10 text-center text-gray-400 text-sm flex flex-col items-center justify-center gap-1">
              <FileText className="w-8 h-8 text-gray-300" />
              <span>Chưa có hóa đơn nào được lập</span>
            </div>
          )}
        </div>

        {/* Panel 4: Utility indicators */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-[0_4px_25px_rgba(0,0,0,0.01)] space-y-4">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
            <Zap className="w-5 h-5 text-amber-500" />
            <h3 className="font-bold text-base text-[#101828]">Đọc số điện nước</h3>
          </div>

          {utility ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {/* Electricity */}
                <div className="bg-amber-50/50 p-3.5 rounded-xl border border-amber-100">
                  <div className="flex items-center gap-1.5 text-amber-700 font-semibold text-xs uppercase tracking-wider mb-2">
                    <Zap className="w-3.5 h-3.5 text-amber-500" /> Điện năng
                  </div>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Số cũ:</span>
                      <span className="font-mono text-gray-700 font-medium">{utility.prevElectricity} kWh</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Số mới:</span>
                      <span className="font-mono text-gray-700 font-semibold">{utility.currElectricity} kWh</span>
                    </div>
                    <div className="flex justify-between pt-1 border-t border-amber-100 font-bold text-[#101828]">
                      <span>Sử dụng:</span>
                      <span>{utility.currElectricity - utility.prevElectricity} kWh</span>
                    </div>
                  </div>
                </div>

                {/* Water */}
                <div className="bg-indigo-50/30 p-3.5 rounded-xl border border-indigo-100">
                  <div className="flex items-center gap-1.5 text-indigo-700 font-semibold text-xs uppercase tracking-wider mb-2">
                    <Droplet className="w-3.5 h-3.5 text-indigo-500" /> Nước sinh hoạt
                  </div>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Số cũ:</span>
                      <span className="font-mono text-gray-700 font-medium">{utility.prevWater} m³</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Số mới:</span>
                      <span className="font-mono text-gray-700 font-semibold">{utility.currWater} m³</span>
                    </div>
                    <div className="flex justify-between pt-1 border-t border-indigo-100 font-bold text-[#101828]">
                      <span>Sử dụng:</span>
                      <span>{utility.currWater - utility.prevWater} m³</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="text-[10px] text-gray-400 text-center font-mono uppercase tracking-wider">
                Tháng đo: {utility.month} ({utility.status})
              </div>
            </div>
          ) : (
            <div className="py-10 text-center text-gray-400 text-sm flex flex-col items-center justify-center gap-1">
              <Zap className="w-8 h-8 text-gray-300" />
              <span>Chưa đo số điện nước kỳ này</span>
            </div>
          )}
        </div>

        {/* Panel 5: Assets Management inside room */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-[0_4px_25px_rgba(0,0,0,0.01)] space-y-4 md:col-span-1 lg:col-span-2">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-[#c9a45c]" />
              <h3 className="font-bold text-base text-[#101828]">Danh mục tài sản đính kèm</h3>
            </div>
          </div>

          {/* Asset List */}
          <div className="flex flex-wrap gap-2 max-h-[140px] overflow-y-auto pr-1">
            {room.assets && room.assets.length > 0 ? (
              room.assets.map((asset, index) => (
                <div
                  key={index}
                  className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#f8f9ff] text-xs font-semibold text-gray-700 border border-[#d1c5b4]/30 rounded-lg group"
                >
                  <span>{asset}</span>
                  <button
                    onClick={() => onRemoveAsset(room.id, index)}
                    className="text-gray-400 hover:text-rose-600 transition-colors cursor-pointer"
                    title="Xóa tài sản"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            ) : (
              <p className="text-xs text-gray-400 py-4 w-full text-center">Căn hộ này chưa khai báo danh mục tài sản đi kèm.</p>
            )}
          </div>

          {/* Form to Add Asset */}
          <form onSubmit={handleAddAssetSubmit} className="flex gap-2 pt-2">
            <input
              type="text"
              required
              className="flex-1 h-10 px-3 bg-[#f8f9ff] border border-gray-300 rounded-lg text-xs font-medium text-[#101828] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#c9a45c]/30"
              placeholder="Nhập tên tài sản mới (e.g. Sofa nỉ, Lò nướng...)"
              value={newAsset}
              onChange={(e) => setNewAsset(e.target.value)}
            />
            <button
              type="submit"
              className="h-10 px-4 bg-[#101828] hover:bg-[#c9a45c] text-[#e8c176] hover:text-[#101828] font-bold rounded-lg text-xs tracking-wider transition-all cursor-pointer shrink-0"
            >
              Thêm
            </button>
          </form>
        </div>

        {/* Panel 6: Room Maintenance Issues */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-[0_4px_25px_rgba(0,0,0,0.01)] space-y-4 md:col-span-2 lg:col-span-3">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
            <Wrench className="w-5 h-5 text-rose-500" />
            <h3 className="font-bold text-base text-[#101828]">Nhật ký báo hỏng & sửa chữa</h3>
          </div>

          <div className="space-y-3">
            {roomMaintenance.length > 0 ? (
              roomMaintenance.map((m) => (
                <div key={m.id} className="p-3.5 bg-gray-50 rounded-xl border border-gray-150 flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5">
                      <span className="font-bold text-[#101828] text-sm">{m.title}</span>
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full uppercase ${
                          m.priority === "High" ? "bg-rose-50 text-rose-700 border border-rose-100" : "bg-amber-50 text-amber-700 border border-amber-100"
                        }`}
                      >
                        {m.priority}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">{m.description}</p>
                    <span className="text-[10px] text-gray-400 font-mono">Báo cáo: {m.createdDate}</span>
                  </div>

                  <span
                    className={`text-xs px-2.5 py-1 rounded-full border font-bold ${
                      m.status === "Done"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : m.status === "Processing"
                        ? "bg-amber-50 text-amber-700 border-amber-200"
                        : m.status === "Cancelled"
                        ? "bg-gray-50 text-gray-500 border-gray-200"
                        : "bg-rose-50 text-rose-700 border-rose-200 animate-pulse"
                    }`}
                  >
                    {m.status === "Done"
                      ? "Đã hoàn thành"
                      : m.status === "Processing"
                      ? "Đang xử lý"
                      : m.status === "Cancelled"
                      ? "Đã hủy"
                      : "Chờ tiếp nhận"}
                  </span>
                </div>
              ))
            ) : (
              <div className="py-12 text-center text-gray-400 text-xs flex flex-col items-center justify-center gap-2">
                <Wrench className="w-8 h-8 text-emerald-500" />
                <span>Không ghi nhận sự cố hay yêu cầu sửa chữa nào ở căn hộ này.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

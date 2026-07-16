import React, { useState } from "react";
import { Plus, Search, Filter, Home, ArrowUpRight, CheckCircle2, AlertTriangle, Hammer, X } from "lucide-react";
import { Room, RoomStatus } from "../types";

interface RoomManagementViewProps {
  rooms: Room[];
  onRoomSelect: (roomId: string) => void;
  onAddRoom: (room: Room) => Promise<void> | void;
}

export default function RoomManagementView({ rooms, onRoomSelect, onAddRoom }: RoomManagementViewProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [floorFilter, setFloorFilter] = useState<string>("ALL");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [newRoomId, setNewRoomId] = useState("");
  const [newRoomType, setNewRoomType] = useState("Căn hộ Studio");
  const [newFloor, setNewFloor] = useState(1);
  const [newArea, setNewArea] = useState(45);
  const [newRentPrice, setNewRentPrice] = useState(8500000);
  const [newBalcony, setNewBalcony] = useState("Nam");
  const [newBeds, setNewBeds] = useState(1);
  const [newBathrooms, setNewBathrooms] = useState(1);
  const [newAssets, setNewAssets] = useState("Smart TV, Tủ lạnh, Điều hòa, Bếp từ");

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoomId.trim() || isSubmitting) return;

    const parsedAssets = newAssets
      .split(",")
      .map((item) => item.trim())
      .filter((item) => item !== "");

    const room: Room = {
      id: newRoomId.trim().toUpperCase(),
      type: newRoomType,
      floor: Number(newFloor),
      area: Number(newArea),
      rentPrice: Number(newRentPrice),
      status: RoomStatus.AVAILABLE,
      beds: Number(newBeds),
      bathrooms: Number(newBathrooms),
      balcony: newBalcony,
      assets: parsedAssets
    };

    setIsSubmitting(true);
    try {
      await onAddRoom(room);
    } catch {
      return;
    } finally {
      setIsSubmitting(false);
    }
    setIsAddModalOpen(false);
    // Reset Form
    setNewRoomId("");
    setNewRoomType("Căn hộ Studio");
    setNewFloor(1);
    setNewArea(45);
    setNewRentPrice(8500000);
    setNewBalcony("Nam");
    setNewBeds(1);
    setNewBathrooms(1);
    setNewAssets("Smart TV, Tủ lạnh, Điều hòa, Bếp từ");
  };

  // Filter Logics
  const filteredRooms = rooms.filter((room) => {
    const matchesSearch = room.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room.type.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "ALL" || room.status === statusFilter;
    const matchesFloor = floorFilter === "ALL" || room.floor.toString() === floorFilter;

    return matchesSearch && matchesStatus && matchesFloor;
  });

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(val);
  };

  const getStatusBadge = (status: RoomStatus) => {
    switch (status) {
      case RoomStatus.AVAILABLE:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" /> Trống
          </span>
        );
      case RoomStatus.OCCUPIED:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
            <Home className="w-3.5 h-3.5" /> Đang thuê
          </span>
        );
      case RoomStatus.MAINTENANCE:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <Hammer className="w-3.5 h-3.5" /> Bảo trì
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#101828] tracking-tight">Danh sách phòng</h1>
          <p className="text-sm text-[#4e4639]/70 mt-1">
            Quản lý sơ đồ phòng, trạng thái sử dụng và thông tin tài sản chi tiết.
          </p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="h-11 px-5 bg-[#c9a45c] hover:bg-[#e8c176] text-[#523a00] font-semibold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-sm tracking-wide uppercase bg-gradient-to-b from-white/10 to-transparent cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          Thêm phòng mới
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-[#d1c5b4]/20 shadow-[0_4px_20px_rgba(0,0,0,0.01)] flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 pointer-events-none">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            className="w-full h-11 pl-10 pr-4 bg-[#f8f9ff] border border-[#d1c5b4]/40 rounded-xl text-sm text-[#101828] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#c9a45c]/30 focus:border-[#c9a45c] transition-all"
            placeholder="Tìm số phòng, loại phòng..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#4e4639]/60 uppercase tracking-wider">Trạng thái</span>
            <select
              className="h-11 px-3 bg-[#f8f9ff] border border-[#d1c5b4]/40 rounded-xl text-sm font-medium text-[#101828] focus:outline-none focus:ring-2 focus:ring-[#c9a45c]/30"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">Tất cả</option>
              <option value={RoomStatus.AVAILABLE}>Trống</option>
              <option value={RoomStatus.OCCUPIED}>Đang thuê</option>
              <option value={RoomStatus.MAINTENANCE}>Bảo trì</option>
            </select>
          </div>

          {/* Floor Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#4e4639]/60 uppercase tracking-wider">Tầng</span>
            <select
              className="h-11 px-3 bg-[#f8f9ff] border border-[#d1c5b4]/40 rounded-xl text-sm font-medium text-[#101828] focus:outline-none focus:ring-2 focus:ring-[#c9a45c]/30"
              value={floorFilter}
              onChange={(e) => setFloorFilter(e.target.value)}
            >
              <option value="ALL">Tất cả tầng</option>
              <option value="1">Tầng 1</option>
              <option value="2">Tầng 2</option>
              <option value="3">Tầng 3</option>
              <option value="4">Tầng 4</option>
            </select>
          </div>
        </div>
      </div>

      {/* Rooms Table */}
      <div className="bg-white rounded-2xl border border-[#d1c5b4]/20 shadow-[0_4px_30px_rgba(0,0,0,0.02)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-[#d1c5b4]/20 text-gray-400 text-xs font-semibold uppercase bg-gray-50/50">
                <th className="py-4 px-6">Số Phòng</th>
                <th className="py-4 px-6">Loại Phòng</th>
                <th className="py-4 px-6">Tầng</th>
                <th className="py-4 px-6">Diện tích (m²)</th>
                <th className="py-4 px-6">Giá thuê / Tháng</th>
                <th className="py-4 px-6">Trạng thái</th>
                <th className="py-4 px-6 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredRooms.map((room) => (
                <tr
                  key={room.id}
                  className="border-b border-gray-100 hover:bg-[#fcfbf9] transition-all cursor-pointer group"
                  onClick={() => onRoomSelect(room.id)}
                >
                  <td className="py-4 px-6 font-bold text-lg text-[#775a19] tracking-tight">
                    {room.id}
                  </td>
                  <td className="py-4 px-6 text-gray-700 font-medium">{room.type}</td>
                  <td className="py-4 px-6 text-gray-500 font-mono">Tầng {room.floor}</td>
                  <td className="py-4 px-6 text-gray-500 font-mono">{room.area} m²</td>
                  <td className="py-4 px-6 font-semibold text-[#101828]">
                    {formatCurrency(room.rentPrice)}
                  </td>
                  <td className="py-4 px-6" onClick={(e) => e.stopPropagation()}>
                    {getStatusBadge(room.status)}
                  </td>
                  <td className="py-4 px-6 text-right" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => onRoomSelect(room.id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-[#101828] text-[#e8c176] rounded-lg hover:bg-[#c9a45c] hover:text-[#101828] transition-all shadow-sm cursor-pointer"
                    >
                      Chi tiết <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}

              {filteredRooms.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-gray-400">
                    <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                    Không tìm thấy phòng nào phù hợp bộ lọc!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-gray-100 bg-gray-50/30 flex justify-between items-center text-xs text-gray-500">
          <span>Đang hiển thị {filteredRooms.length} trong tổng số {rooms.length} phòng</span>
          <span className="font-mono">LUMI Residence System v1.1</span>
        </div>
      </div>

      {/* Add Room Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl overflow-hidden border border-[#d1c5b4]/20 animate-scale-up">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50">
              <h2 className="text-xl font-bold text-[#101828]">Thêm Căn Hộ Mới</h2>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-full hover:bg-gray-200 text-gray-500 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Số phòng *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. P.105, P.502"
                    className="w-full h-10 px-3 bg-[#f8f9ff] border border-gray-300 rounded-lg text-sm text-[#101828] focus:outline-none focus:ring-2 focus:ring-[#c9a45c]/30"
                    value={newRoomId}
                    onChange={(e) => setNewRoomId(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Loại phòng *
                  </label>
                  <select
                    className="w-full h-10 px-3 bg-[#f8f9ff] border border-gray-300 rounded-lg text-sm text-[#101828] focus:outline-none focus:ring-2 focus:ring-[#c9a45c]/30"
                    value={newRoomType}
                    onChange={(e) => setNewRoomType(e.target.value)}
                  >
                    <option value="Căn hộ Studio">Căn hộ Studio</option>
                    <option value="Căn hộ 1PN">Căn hộ 1PN</option>
                    <option value="Căn hộ 2PN">Căn hộ 2PN</option>
                    <option value="Căn hộ Studio Luxury">Căn hộ Studio Luxury</option>
                    <option value="2 Phòng ngủ cao cấp">2 Phòng ngủ cao cấp</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Tầng *
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={15}
                    className="w-full h-10 px-3 bg-[#f8f9ff] border border-gray-300 rounded-lg text-sm text-[#101828]"
                    value={newFloor}
                    onChange={(e) => setNewFloor(Number(e.target.value))}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Diện tích (m²)
                  </label>
                  <input
                    type="number"
                    required
                    min={10}
                    className="w-full h-10 px-3 bg-[#f8f9ff] border border-gray-300 rounded-lg text-sm text-[#101828]"
                    value={newArea}
                    onChange={(e) => setNewArea(Number(e.target.value))}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Hướng Ban Công
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Đông, Nam"
                    className="w-full h-10 px-3 bg-[#f8f9ff] border border-gray-300 rounded-lg text-sm text-[#101828]"
                    value={newBalcony}
                    onChange={(e) => setNewBalcony(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Giá thuê (VNĐ/tháng) *
                  </label>
                  <input
                    type="number"
                    required
                    min={100000}
                    step={100000}
                    className="w-full h-10 px-3 bg-[#f8f9ff] border border-gray-300 rounded-lg text-sm text-[#101828]"
                    value={newRentPrice}
                    onChange={(e) => setNewRentPrice(Number(e.target.value))}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Số giường
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    className="w-full h-10 px-3 bg-[#f8f9ff] border border-gray-300 rounded-lg text-sm text-[#101828]"
                    value={newBeds}
                    onChange={(e) => setNewBeds(Number(e.target.value))}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Số nhà tắm
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    className="w-full h-10 px-3 bg-[#f8f9ff] border border-gray-300 rounded-lg text-sm text-[#101828]"
                    value={newBathrooms}
                    onChange={(e) => setNewBathrooms(Number(e.target.value))}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Tài sản đi kèm (phân cách bằng dấu phẩy)
                </label>
                <textarea
                  rows={2}
                  className="w-full p-3 bg-[#f8f9ff] border border-gray-300 rounded-lg text-sm text-[#101828] focus:outline-none focus:ring-2 focus:ring-[#c9a45c]/30"
                  placeholder="TV, Điều hòa, Sofa, Tủ lạnh, Lò vi sóng..."
                  value={newAssets}
                  onChange={(e) => setNewAssets(e.target.value)}
                />
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-lg cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 text-sm font-bold bg-[#c9a45c] hover:bg-[#e8c176] text-[#523a00] rounded-lg transition-all cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Lưu thông tin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

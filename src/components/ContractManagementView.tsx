import React, { useState } from "react";
import { Plus, Search, FileText, Calendar, DollarSign, X, ShieldCheck, AlertTriangle } from "lucide-react";
import { Contract } from "../types";

interface ContractManagementViewProps {
  contracts: Contract[];
  onAddContract: (contract: Contract) => void;
  onTerminateContract: (id: string) => void;
  onNavigateToRoom: (roomId: string) => void;
}

export default function ContractManagementView({
  contracts,
  onAddContract,
  onTerminateContract,
  onNavigateToRoom
}: ContractManagementViewProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [roomNumber, setRoomNumber] = useState("");
  const [tenantName, setTenantName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [deposit, setDeposit] = useState(15000000);
  const [monthlyRent, setMonthlyRent] = useState(8500000);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomNumber.trim() || !tenantName.trim()) return;

    const newContract: Contract = {
      id: "HD-2026-" + String(contracts.length + 1).padStart(3, "0"),
      roomNumber: roomNumber.trim().toUpperCase(),
      tenantName: tenantName.trim(),
      startDate: startDate || new Date().toLocaleDateString("vi-VN"),
      endDate: endDate || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toLocaleDateString("vi-VN"),
      deposit: Number(deposit),
      monthlyRent: Number(monthlyRent),
      status: "Đang hiệu lực"
    };

    onAddContract(newContract);
    setIsModalOpen(false);

    // Reset Form
    setRoomNumber("");
    setTenantName("");
    setStartDate("");
    setEndDate("");
    setDeposit(15000000);
    setMonthlyRent(8500000);
  };

  const filteredContracts = contracts.filter((c) => {
    const matchesSearch =
      c.roomNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.tenantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "ALL" || c.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(val);
  };

  // Calculations
  const activeContractsCount = contracts.filter((c) => c.status === "Đang hiệu lực").length;
  const totalDepositHeld = contracts
    .filter((c) => c.status !== "Đã thanh lý")
    .reduce((sum, c) => sum + c.deposit, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#101828] tracking-tight">Hợp đồng cho thuê</h1>
          <p className="text-sm text-[#4e4639]/70 mt-1">
            Quản lý danh sách các hợp đồng thuê nhà, tiền đặt cọc và thời hạn cam kết lưu trú.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="h-11 px-5 bg-[#c9a45c] hover:bg-[#e8c176] text-[#523a00] font-semibold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-sm tracking-wide uppercase bg-gradient-to-b from-white/10 to-transparent cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          Ký hợp đồng mới
        </button>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-150 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-gray-400 font-bold uppercase tracking-wider block">
              Hợp đồng đang hoạt động
            </span>
            <span className="text-3xl font-bold text-[#101828] block">{activeContractsCount} hợp đồng</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-[#c9a45c]/10 flex items-center justify-center text-[#c9a45c]">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-150 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-gray-400 font-bold uppercase tracking-wider block">
              Tổng tiền đặt cọc đang giữ
            </span>
            <span className="text-3xl font-bold text-[#101828] block">{formatCurrency(totalDepositHeld)}</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-150 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            className="w-full h-11 pl-10 pr-4 bg-[#f8f9ff] border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a45c]/30"
            placeholder="Tìm theo mã HĐ, tên khách, số phòng..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Trạng thái</span>
          <select
            className="h-11 px-3 bg-[#f8f9ff] border border-gray-250 rounded-xl text-sm focus:ring-2 focus:ring-[#c9a45c]/30"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">Tất cả</option>
            <option value="Đang hiệu lực">Đang hiệu lực</option>
            <option value="Sắp hết hạn">Sắp hết hạn</option>
            <option value="Đã thanh lý">Đã thanh lý</option>
          </select>
        </div>
      </div>

      {/* Contracts Table */}
      <div className="bg-white rounded-2xl border border-gray-150 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-[#d1c5b4]/20 text-gray-400 text-xs font-semibold uppercase bg-gray-50/50">
                <th className="py-4 px-6">Mã Hợp Đồng</th>
                <th className="py-4 px-6">Căn hộ</th>
                <th className="py-4 px-6">Khách hàng ký kết</th>
                <th className="py-4 px-6">Thời hạn liên đới</th>
                <th className="py-4 px-6">Tiền đặt cọc</th>
                <th className="py-4 px-6">Tiền thuê / Tháng</th>
                <th className="py-4 px-6">Trạng thái</th>
                <th className="py-4 px-6 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredContracts.map((c) => (
                <tr key={c.id} className="border-b border-gray-100 hover:bg-[#fcfbf9] transition-colors">
                  <td className="py-4 px-6 font-mono font-bold text-gray-800">{c.id}</td>
                  <td className="py-4 px-6">
                    <span
                      onClick={() => onNavigateToRoom(c.roomNumber)}
                      className="px-2.5 py-1 bg-[#101828] text-white text-xs font-bold rounded-lg cursor-pointer hover:bg-[#c9a45c] transition-colors"
                    >
                      {c.roomNumber}
                    </span>
                  </td>
                  <td className="py-4 px-6 font-semibold text-gray-700">{c.tenantName}</td>
                  <td className="py-4 px-6 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-gray-400" />
                      <span>{c.startDate} - {c.endDate}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 font-medium text-gray-700">{formatCurrency(c.deposit)}</td>
                  <td className="py-4 px-6 font-bold text-[#101828]">{formatCurrency(c.monthlyRent)}</td>
                  <td className="py-4 px-6">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        c.status === "Đang hiệu lực"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : c.status === "Sắp hết hạn"
                          ? "bg-amber-50 text-amber-700 border border-amber-200 animate-pulse"
                          : "bg-gray-50 text-gray-500 border border-gray-200"
                      }`}
                    >
                      {c.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    {c.status !== "Đã thanh lý" && (
                      <button
                        onClick={() => onTerminateContract(c.id)}
                        className="text-xs px-2.5 py-1.5 border border-gray-250 hover:bg-rose-50 hover:text-rose-600 font-bold rounded-lg transition-all cursor-pointer"
                      >
                        Thanh lý HĐ
                      </button>
                    )}
                  </td>
                </tr>
              ))}

              {filteredContracts.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-gray-400">
                    <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                    Không tìm thấy hợp đồng phù hợp!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Contract Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl overflow-hidden border border-gray-150 animate-scale-up">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50">
              <h2 className="text-xl font-bold text-[#101828]">Soạn Thảo Hợp Đồng Cho Thuê</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-full hover:bg-gray-200 text-gray-500 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Số phòng đối ứng *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. P.102"
                    className="w-full h-10 px-3 bg-[#f8f9ff] border border-gray-300 rounded-lg text-sm text-[#101828]"
                    value={roomNumber}
                    onChange={(e) => setRoomNumber(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Họ tên khách thuê *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Nguyễn Văn A"
                    className="w-full h-10 px-3 bg-[#f8f9ff] border border-gray-300 rounded-lg text-sm text-[#101828]"
                    value={tenantName}
                    onChange={(e) => setTenantName(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Ngày bắt đầu hiệu lực *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="DD/MM/YYYY"
                    className="w-full h-10 px-3 bg-[#f8f9ff] border border-gray-300 rounded-lg text-sm text-[#101828]"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Ngày đáo hạn *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="DD/MM/YYYY"
                    className="w-full h-10 px-3 bg-[#f8f9ff] border border-gray-300 rounded-lg text-sm text-[#101828]"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Giá cọc đảm bảo (VNĐ) *
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    className="w-full h-10 px-3 bg-[#f8f9ff] border border-gray-300 rounded-lg text-sm text-[#101828]"
                    value={deposit}
                    onChange={(e) => setDeposit(Number(e.target.value))}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Giá thuê hàng tháng (VNĐ) *
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    className="w-full h-10 px-3 bg-[#f8f9ff] border border-gray-300 rounded-lg text-sm text-[#101828]"
                    value={monthlyRent}
                    onChange={(e) => setMonthlyRent(Number(e.target.value))}
                  />
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-lg cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm font-bold bg-[#c9a45c] hover:bg-[#e8c176] text-[#523a00] rounded-lg transition-all cursor-pointer"
                >
                  Ký kết hợp đồng
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

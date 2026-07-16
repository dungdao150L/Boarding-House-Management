import React, { useState } from "react";
import { Plus, Search, Mail, Phone, FileText, UserPlus, Trash2, X, AlertTriangle, CheckCircle2 } from "lucide-react";
import { RentalRequest, Tenant } from "../types";

interface TenantManagementViewProps {
  tenants: Tenant[];
  rentalRequests: RentalRequest[];
  onAddTenant: (tenant: Tenant) => Promise<void> | void;
  onApproveRentalRequest: (request: RentalRequest) => Promise<void> | void;
  onRejectRentalRequest: (request: RentalRequest) => Promise<void> | void;
  onRemoveTenant: (id: string) => void;
  onNavigateToRoom: (roomId: string) => void;
}

export default function TenantManagementView({
  tenants,
  rentalRequests,
  onAddTenant,
  onApproveRentalRequest,
  onRejectRentalRequest,
  onRemoveTenant,
  onNavigateToRoom
}: TenantManagementViewProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [idCard, setIdCard] = useState("");
  const [roomNumber, setRoomNumber] = useState("");
  const [contractStart, setContractStart] = useState("");
  const [durationMonths, setDurationMonths] = useState(12);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !roomNumber.trim() || isSubmitting) return;

    const newTenant: Tenant = {
      id: "T." + String(tenants.length + 1).padStart(3, "0"),
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim() || `${name.trim().toLowerCase().replace(/\s+/g, "")}@email.com`,
      idCard: idCard.trim(),
      roomNumber: roomNumber.trim().toUpperCase(),
      contractStatus: "Active",
      contractStart: contractStart || new Date().toLocaleDateString("vi-VN"),
      durationMonths: Number(durationMonths),
      avatarUrl: undefined
    };

    setIsSubmitting(true);
    try {
      await onAddTenant(newTenant);
    } catch {
      return;
    } finally {
      setIsSubmitting(false);
    }
    setIsModalOpen(false);

    // Reset Form
    setName("");
    setPhone("");
    setEmail("");
    setIdCard("");
    setRoomNumber("");
    setContractStart("");
    setDurationMonths(12);
  };

  const filteredTenants = tenants.filter((t) => {
    return (
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.roomNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.phone.includes(searchTerm)
    );
  });
  const pendingRentalRequests = rentalRequests.filter((request) => request.status === "pending");

  const getContractStatusBadge = (status: Tenant["contractStatus"]) => {
    switch (status) {
      case "Active":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            Đang thuê
          </span>
        );
      case "Sắp hết hạn":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            Sắp hết hạn
          </span>
        );
      case "Expired":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-50 text-gray-500 border border-gray-200">
            Hết hạn / Đã rời đi
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#101828] tracking-tight">Quản lý người thuê</h1>
          <p className="text-sm text-[#4e4639]/70 mt-1">
            Tra cứu thông tin liên lạc, hồ sơ CCCD, số điện thoại và thời hạn hợp đồng của khách hàng.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="h-11 px-5 bg-[#c9a45c] hover:bg-[#e8c176] text-[#523a00] font-semibold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-sm tracking-wide uppercase bg-gradient-to-b from-white/10 to-transparent cursor-pointer shrink-0"
        >
          <UserPlus className="w-4 h-4" />
          Đăng ký người thuê mới
        </button>
      </div>

      {pendingRentalRequests.length > 0 && (
        <div className="bg-white rounded-2xl border border-[#d1c5b4]/30 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between gap-3 border-b border-[#d1c5b4]/20 px-5 py-4">
            <div>
              <h2 className="text-lg font-bold text-[#101828]">Yêu cầu thuê phòng</h2>
              <p className="text-sm text-[#4e4639]/70">Người dùng đã chọn phòng và đang chờ admin duyệt.</p>
            </div>
            <span className="rounded-full bg-[#c9a45c]/15 px-3 py-1 text-xs font-bold text-[#775a19]">
              {pendingRentalRequests.length} chờ duyệt
            </span>
          </div>

          <div className="divide-y divide-gray-100">
            {pendingRentalRequests.map((request) => (
              <div key={request.id} className="grid gap-4 px-5 py-4 md:grid-cols-[1.5fr_1fr_auto] md:items-center">
                <div>
                  <p className="font-bold text-[#101828]">{request.fullName || request.username}</p>
                  <p className="text-xs text-gray-500">
                    {request.email || "Chưa có email"} • {request.phone || "Chưa có SĐT"}
                  </p>
                </div>

                <div className="text-sm">
                  <button
                    type="button"
                    onClick={() => onNavigateToRoom(request.roomNumber)}
                    className="rounded-lg bg-[#101828] px-2.5 py-1 text-xs font-bold text-white hover:bg-[#c9a45c] hover:text-[#101828]"
                  >
                    {request.roomNumber}
                  </button>
                  <span className="ml-2 font-semibold text-[#775a19]">
                    {request.roomPrice.toLocaleString("vi-VN")} đ/tháng
                  </span>
                </div>

                <div className="flex gap-2 md:justify-end">
                  <button
                    type="button"
                    onClick={() => onApproveRentalRequest(request)}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-700"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Duyệt
                  </button>
                  <button
                    type="button"
                    onClick={() => onRejectRentalRequest(request)}
                    className="rounded-lg border border-rose-200 px-3 py-2 text-xs font-bold text-rose-700 hover:bg-rose-50"
                  >
                    Từ chối
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-5 rounded-2xl border border-gray-150 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-gray-400 font-bold uppercase tracking-wider block">Tổng số khách thuê</span>
            <span className="text-3xl font-bold text-[#101828] mt-1 block">
              {tenants.filter((t) => t.contractStatus !== "Expired").length} người
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#c9a45c]/10 flex items-center justify-center text-[#c9a45c] font-bold">
            {tenants.filter((t) => t.contractStatus !== "Expired").length}
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-150 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-gray-400 font-bold uppercase tracking-wider block">Hợp đồng hoạt động</span>
            <span className="text-3xl font-bold text-emerald-600 mt-1 block">
              {tenants.filter((t) => t.contractStatus === "Active").length} HĐ
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 font-bold">
            {tenants.filter((t) => t.contractStatus === "Active").length}
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-150 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-gray-400 font-bold uppercase tracking-wider block">Cần lưu ý gia hạn</span>
            <span className="text-3xl font-bold text-amber-600 mt-1 block">
              {tenants.filter((t) => t.contractStatus === "Sắp hết hạn").length} người
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 font-bold">
            {tenants.filter((t) => t.contractStatus === "Sắp hết hạn").length}
          </div>
        </div>
      </div>

      {/* Toolbar Filter */}
      <div className="bg-white p-4 rounded-2xl border border-gray-150 shadow-sm flex items-center justify-between">
        <div className="relative w-full sm:w-80">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            className="w-full h-11 pl-10 pr-4 bg-[#f8f9ff] border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a45c]/30 focus:border-[#c9a45c]"
            placeholder="Tìm theo tên, số phòng, số điện thoại..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Tenants Table Grid */}
      <div className="bg-white rounded-2xl border border-gray-150 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-[#d1c5b4]/20 text-gray-400 text-xs font-semibold uppercase bg-gray-50/50">
                <th className="py-4 px-6">Người Thuê</th>
                <th className="py-4 px-6">Căn Hộ</th>
                <th className="py-4 px-6">Thông Tin Liên Hệ</th>
                <th className="py-4 px-6">Số Định Danh (CCCD)</th>
                <th className="py-4 px-6">Ngày Bắt Đầu</th>
                <th className="py-4 px-6">Trạng Thái HĐ</th>
                <th className="py-4 px-6 text-right">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filteredTenants.map((t) => (
                <tr key={t.id} className="border-b border-gray-100 hover:bg-[#fcfbf9] transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      {t.avatarUrl ? (
                        <img
                          src={t.avatarUrl}
                          alt={t.name}
                          className="w-10 h-10 rounded-full border border-[#c9a45c] object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-[#101828] text-[#e8c176] flex items-center justify-center font-bold text-sm">
                          {t.name.split(" ").pop()?.charAt(0)}
                        </div>
                      )}
                      <div>
                        <h4 className="font-bold text-[#101828] text-sm">{t.name}</h4>
                        <span className="text-[10px] text-gray-400 font-mono">{t.id}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span
                      onClick={() => onNavigateToRoom(t.roomNumber)}
                      className="px-2.5 py-1 bg-[#101828] hover:bg-[#c9a45c] text-white hover:text-[#101828] text-xs font-bold rounded-lg cursor-pointer transition-colors shadow-sm"
                    >
                      {t.roomNumber}
                    </span>
                  </td>
                  <td className="py-4 px-6 space-y-0.5">
                    <div className="flex items-center gap-1.5 text-xs text-gray-700">
                      <Phone className="w-3.5 h-3.5 text-gray-400" /> {t.phone}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-gray-400">
                      <Mail className="w-3.5 h-3.5 text-gray-400" /> {t.email}
                    </div>
                  </td>
                  <td className="py-4 px-6 font-mono text-xs text-gray-600">{t.idCard}</td>
                  <td className="py-4 px-6 text-xs text-gray-500">{t.contractStart}</td>
                  <td className="py-4 px-6">{getContractStatusBadge(t.contractStatus)}</td>
                  <td className="py-4 px-6 text-right">
                    <button
                      onClick={() => onRemoveTenant(t.id)}
                      className="p-1.5 rounded-lg border border-gray-150 hover:bg-rose-500/10 text-gray-400 hover:text-rose-600 transition-colors cursor-pointer"
                      title="Xóa người thuê"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}

              {filteredTenants.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-gray-400">
                    <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                    Không tìm thấy người thuê phù hợp!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Tenant Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl overflow-hidden border border-gray-150 animate-scale-up">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50">
              <h2 className="text-xl font-bold text-[#101828]">Đăng Ký Người Thuê Mới</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-full hover:bg-gray-200 text-gray-500 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Họ tên khách thuê *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Nguyễn Văn Hoàng"
                  className="w-full h-10 px-3 bg-[#f8f9ff] border border-gray-300 rounded-lg text-sm text-[#101828] focus:outline-none focus:ring-2 focus:ring-[#c9a45c]/30"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Số điện thoại *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 0988 123 456"
                    className="w-full h-10 px-3 bg-[#f8f9ff] border border-gray-300 rounded-lg text-sm text-[#101828]"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Số CCCD *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 001201004321"
                    className="w-full h-10 px-3 bg-[#f8f9ff] border border-gray-300 rounded-lg text-sm text-[#101828]"
                    value={idCard}
                    onChange={(e) => setIdCard(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Căn hộ ký gửi *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. P.402"
                    className="w-full h-10 px-3 bg-[#f8f9ff] border border-gray-300 rounded-lg text-sm text-[#101828]"
                    value={roomNumber}
                    onChange={(e) => setRoomNumber(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Email liên lạc
                  </label>
                  <input
                    type="email"
                    placeholder="e.g. hoang.nguyen@email.com"
                    className="w-full h-10 px-3 bg-[#f8f9ff] border border-gray-300 rounded-lg text-sm text-[#101828]"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Ngày bắt đầu thuê *
                  </label>
                  <input
                    type="text"
                    placeholder="DD/MM/YYYY"
                    className="w-full h-10 px-3 bg-[#f8f9ff] border border-gray-300 rounded-lg text-sm text-[#101828]"
                    value={contractStart}
                    onChange={(e) => setContractStart(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Thời hạn hợp đồng (Tháng) *
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    className="w-full h-10 px-3 bg-[#f8f9ff] border border-gray-300 rounded-lg text-sm text-[#101828]"
                    value={durationMonths}
                    onChange={(e) => setDurationMonths(Number(e.target.value))}
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
                  disabled={isSubmitting}
                  className="px-5 py-2 text-sm font-bold bg-[#c9a45c] hover:bg-[#e8c176] text-[#523a00] rounded-lg transition-all cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Đăng ký lưu trú
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

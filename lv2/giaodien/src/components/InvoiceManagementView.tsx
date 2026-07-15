import React, { useState } from "react";
import {
  FileText,
  Search,
  Filter,
  DollarSign,
  Printer,
  BellRing,
  CheckCircle,
  X,
  CreditCard,
  QrCode,
  Calendar,
  AlertTriangle
} from "lucide-react";
import { Invoice } from "../types";

interface InvoiceManagementViewProps {
  invoices: Invoice[];
  onMarkAsPaid: (invoiceId: string) => void;
  onSendReminder: (invoiceId: string) => void;
  onNavigateToRoom: (roomId: string) => void;
}

export default function InvoiceManagementView({
  invoices,
  onMarkAsPaid,
  onSendReminder,
  onNavigateToRoom
}: InvoiceManagementViewProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(val);
  };

  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch =
      inv.roomNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.tenantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "ALL" || inv.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: Invoice["status"]) => {
    switch (status) {
      case "Paid":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            Đã thanh toán
          </span>
        );
      case "Partially Paid":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            Trả một phần
          </span>
        );
      case "Unpaid":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            Chưa thanh toán
          </span>
        );
    }
  };

  const totalUnpaid = invoices
    .filter((inv) => inv.status !== "Paid")
    .reduce((sum, inv) => sum + inv.remainingAmount, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-[#101828] tracking-tight">Hóa đơn & Thanh toán</h1>
        <p className="text-sm text-[#4e4639]/70 mt-1">
          Quản lý biên lai, theo dõi nợ đọng, gửi nhắc nhở thanh toán và xuất bản hóa đơn điện nước định kỳ.
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="bg-white p-5 rounded-2xl border border-gray-150 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-gray-400 font-bold uppercase tracking-wider block">Doanh số chưa đóng</span>
            <span className="text-3xl font-bold text-rose-600 mt-1 block">{formatCurrency(totalUnpaid)}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600 font-bold">
            {invoices.filter((i) => i.status !== "Paid").length} phiếu
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-150 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-gray-400 font-bold uppercase tracking-wider block">Phiếu đã đối soát</span>
            <span className="text-3xl font-bold text-emerald-600 mt-1 block">
              {formatCurrency(invoices.filter((i) => i.status === "Paid").reduce((sum, i) => sum + i.totalAmount, 0))}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 font-bold">
            {invoices.filter((i) => i.status === "Paid").length} phiếu
          </div>
        </div>
      </div>

      {/* Filters block */}
      <div className="bg-white p-4 rounded-2xl border border-gray-150 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            className="w-full h-11 pl-10 pr-4 bg-[#f8f9ff] border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a45c]/30"
            placeholder="Tìm theo số hóa đơn, phòng, tên..."
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
            <option value="Paid">Đã thanh toán</option>
            <option value="Partially Paid">Trả một phần</option>
            <option value="Unpaid">Chưa thanh toán</option>
          </select>
        </div>
      </div>

      {/* Layout Content: Master List (Left 2/3) + Interactive Details Pane (Right 1/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Invoice List */}
        <div className="bg-white rounded-2xl border border-gray-150 shadow-sm overflow-hidden lg:col-span-2">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-[#d1c5b4]/20 text-gray-400 text-xs font-semibold uppercase bg-gray-50/50">
                  <th className="py-4 px-5">Hóa Đơn</th>
                  <th className="py-4 px-5">Phòng</th>
                  <th className="py-4 px-5">Khách thuê</th>
                  <th className="py-4 px-5">Tổng tiền</th>
                  <th className="py-4 px-5">Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.map((inv) => (
                  <tr
                    key={inv.id}
                    onClick={() => setSelectedInvoice(inv)}
                    className={`border-b border-gray-100 hover:bg-[#fcfbf9] transition-all cursor-pointer ${
                      selectedInvoice?.id === inv.id ? "bg-amber-50/30 font-medium" : ""
                    }`}
                  >
                    <td className="py-4 px-5">
                      <div className="font-mono font-bold text-gray-800">{inv.id}</div>
                      <span className="text-[10px] text-gray-400 block font-mono">Hạn đóng: {inv.dueDate}</span>
                    </td>
                    <td className="py-4 px-5">
                      <span
                        onClick={(e) => {
                          e.stopPropagation();
                          onNavigateToRoom(inv.roomNumber);
                        }}
                        className="px-2 py-0.5 bg-[#101828] text-white text-xs font-bold rounded hover:bg-[#c9a45c] transition-colors"
                      >
                        {inv.roomNumber}
                      </span>
                    </td>
                    <td className="py-4 px-5 text-gray-700 font-semibold">{inv.tenantName}</td>
                    <td className="py-4 px-5 font-bold text-[#101828]">{formatCurrency(inv.totalAmount)}</td>
                    <td className="py-4 px-5">{getStatusBadge(inv.status)}</td>
                  </tr>
                ))}

                {filteredInvoices.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-16 text-center text-gray-400">
                      <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                      Không tìm thấy hóa đơn nào phù hợp!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Dynamic Detail & Action Pane (Right 1/3) */}
        <div className="bg-[#101828] text-white p-6 rounded-2xl border border-white/5 shadow-md flex flex-col justify-between min-h-[480px]">
          {selectedInvoice ? (
            <div className="space-y-6 flex-1 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex justify-between items-start border-b border-white/10 pb-3">
                  <div>
                    <span className="text-xs text-gray-400 font-mono tracking-wider">{selectedInvoice.id}</span>
                    <h3 className="font-bold text-lg text-[#e8c176]">{selectedInvoice.roomNumber}</h3>
                  </div>
                  <button
                    onClick={() => setSelectedInvoice(null)}
                    className="p-1 rounded-full hover:bg-white/10 text-gray-400 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Bill Breakdown details */}
                <div className="space-y-3.5 text-xs">
                  <div className="flex justify-between text-[#d9e3f6]">
                    <span>Khách thuê:</span>
                    <span className="font-bold text-white">{selectedInvoice.tenantName}</span>
                  </div>
                  <div className="flex justify-between text-[#d9e3f6]">
                    <span>Ngày lập:</span>
                    <span>{selectedInvoice.createdDate}</span>
                  </div>
                  <div className="flex justify-between text-[#d9e3f6]">
                    <span>Hạn nộp:</span>
                    <span className="text-rose-300 font-bold">{selectedInvoice.dueDate}</span>
                  </div>

                  {/* List items detail breakdown */}
                  <div className="bg-white/5 p-4 rounded-xl space-y-2 border border-white/5">
                    <div className="flex justify-between font-medium">
                      <span>1. Tiền phòng chính:</span>
                      <span className="font-mono text-gray-200">{formatCurrency(selectedInvoice.details.roomRent)}</span>
                    </div>
                    <div className="flex justify-between font-medium">
                      <span>2. Điện ({selectedInvoice.details.electricity.kwh} kWh):</span>
                      <span className="font-mono text-gray-200">
                        {formatCurrency(selectedInvoice.details.electricity.kwh * selectedInvoice.details.electricity.price)}
                      </span>
                    </div>
                    <div className="flex justify-between font-medium">
                      <span>3. Nước ({selectedInvoice.details.water.cubicMeters} m³):</span>
                      <span className="font-mono text-gray-200">
                        {formatCurrency(selectedInvoice.details.water.cubicMeters * selectedInvoice.details.water.price)}
                      </span>
                    </div>
                    <div className="flex justify-between font-medium">
                      <span>4. Dịch vụ tiện ích khác:</span>
                      <span className="font-mono text-gray-200">{formatCurrency(selectedInvoice.details.services)}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-white/10 font-bold text-[#e8c176]">
                      <span>Tổng tiền phòng:</span>
                      <span className="font-mono">{formatCurrency(selectedInvoice.totalAmount)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions Box */}
              <div className="space-y-2 pt-6">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      setIsPrintModalOpen(true);
                    }}
                    className="h-10 px-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-lg text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Printer className="w-4 h-4 text-[#e8c176]" />
                    In hóa đơn
                  </button>

                  <button
                    onClick={() => onSendReminder(selectedInvoice.id)}
                    className="h-10 px-3 bg-[#e8c176]/10 hover:bg-[#e8c176]/20 text-[#e8c176] font-bold rounded-lg text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <BellRing className="w-4 h-4" />
                    Báo nhắc nợ
                  </button>
                </div>

                {selectedInvoice.status !== "Paid" && (
                  <button
                    onClick={() => {
                      onMarkAsPaid(selectedInvoice.id);
                      setSelectedInvoice((prev) => (prev ? { ...prev, status: "Paid", paidAmount: prev.totalAmount, remainingAmount: 0 } : null));
                    }}
                    className="w-full h-11 bg-[#c9a45c] hover:bg-[#e8c176] text-[#523a00] font-bold rounded-xl text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Đã thanh toán (Thu đủ)
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center text-gray-400 space-y-2 py-24">
              <FileText className="w-12 h-12 text-gray-500" />
              <p className="text-sm">Vui lòng chọn một hóa đơn từ bảng danh sách bên trái để tra cứu chi tiết và tương tác.</p>
            </div>
          )}
        </div>
      </div>

      {/* Exquisite Print Invoice PDF Preview Modal */}
      {isPrintModalOpen && selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden border border-gray-300 animate-scale-up text-gray-800">
            {/* Modal Header */}
            <div className="flex justify-between items-center px-6 py-4 bg-gray-50 border-b border-gray-150">
              <h3 className="font-bold text-[#101828]">Biên Lai Thu Tiền Điện Tử</h3>
              <button
                onClick={() => setIsPrintModalOpen(false)}
                className="p-1 rounded-full hover:bg-gray-200 text-gray-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Print Body (Stylized Luxury Bill Receipt) */}
            <div className="p-8 space-y-6 max-h-[500px] overflow-y-auto" id="print-area">
              {/* Bill Header */}
              <div className="flex justify-between items-start border-b-2 border-[#101828] pb-6">
                <div>
                  <h2 className="text-xl font-black text-[#101828] uppercase tracking-wider">LUMI Residence</h2>
                  <p className="text-xs text-gray-500 mt-0.5">Địa chỉ: 10 Mai Chí Thọ, Thủ Thiêm, TP. Thủ Đức, TP. HCM</p>
                  <p className="text-xs text-gray-400 font-mono">Hotline: 1900 8198 • Web: lumiresidence.com</p>
                </div>
                <div className="text-right">
                  <h3 className="text-lg font-bold text-[#775a19] uppercase">Phiếu Thu Tiền</h3>
                  <span className="font-mono text-xs font-bold text-[#101828] bg-[#c9a45c]/10 px-2 py-0.5 rounded">
                    Số: {selectedInvoice.id}
                  </span>
                  <p className="text-[10px] text-gray-400 mt-1 font-mono">Ngày lập: {selectedInvoice.createdDate}</p>
                </div>
              </div>

              {/* Customer Info Row */}
              <div className="grid grid-cols-2 gap-4 text-xs bg-gray-50 p-4 rounded-xl">
                <div>
                  <span className="text-gray-400 uppercase tracking-wider font-bold block mb-1">Khách hàng thanh toán</span>
                  <p className="font-bold text-gray-800 text-sm">{selectedInvoice.tenantName}</p>
                  <p className="text-gray-500">Đối tượng thuê: Căn hộ {selectedInvoice.roomNumber}</p>
                </div>
                <div className="text-right">
                  <span className="text-gray-400 uppercase tracking-wider font-bold block mb-1">Hạn nộp thanh toán</span>
                  <p className="font-bold text-rose-600 text-sm">{selectedInvoice.dueDate}</p>
                  <p className="text-gray-500">Kỳ chốt: Tháng 10/2023</p>
                </div>
              </div>

              {/* Calculation Table */}
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b-2 border-gray-200 text-gray-500 font-bold uppercase">
                    <th className="py-2.5">Khoản mục thanh toán</th>
                    <th className="py-2.5 text-center">Đơn vị</th>
                    <th className="py-2.5 text-right">Đơn giá</th>
                    <th className="py-2.5 text-right">Thành tiền</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-100">
                    <td className="py-3 font-semibold text-gray-800">Tiền thuê căn hộ tháng 10/2023</td>
                    <td className="py-3 text-center">Căn</td>
                    <td className="py-3 text-right font-mono">{formatCurrency(selectedInvoice.details.roomRent)}</td>
                    <td className="py-3 text-right font-bold text-gray-800 font-mono">{formatCurrency(selectedInvoice.details.roomRent)}</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-3">
                      <p className="font-semibold text-gray-800">Tiêu thụ điện năng sinh hoạt</p>
                      <span className="text-[10px] text-gray-400 block font-mono">Số lượng: {selectedInvoice.details.electricity.kwh} kWh</span>
                    </td>
                    <td className="py-3 text-center">kWh</td>
                    <td className="py-3 text-right font-mono">{formatCurrency(selectedInvoice.details.electricity.price)}</td>
                    <td className="py-3 text-right font-bold text-gray-800 font-mono">
                      {formatCurrency(selectedInvoice.details.electricity.kwh * selectedInvoice.details.electricity.price)}
                    </td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-3">
                      <p className="font-semibold text-gray-800">Tiêu thụ nước sinh hoạt chính</p>
                      <span className="text-[10px] text-gray-400 block font-mono">Số lượng: {selectedInvoice.details.water.cubicMeters} m³</span>
                    </td>
                    <td className="py-3 text-center">m³</td>
                    <td className="py-3 text-right font-mono">{formatCurrency(selectedInvoice.details.water.price)}</td>
                    <td className="py-3 text-right font-bold text-gray-800 font-mono">
                      {formatCurrency(selectedInvoice.details.water.cubicMeters * selectedInvoice.details.water.price)}
                    </td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-3 font-semibold text-gray-800">Phí quản lý & dịch vụ tiện ích khu</td>
                    <td className="py-3 text-center">Kỳ</td>
                    <td className="py-3 text-right font-mono">{formatCurrency(selectedInvoice.details.services)}</td>
                    <td className="py-3 text-right font-bold text-gray-800 font-mono">{formatCurrency(selectedInvoice.details.services)}</td>
                  </tr>
                </tbody>
              </table>

              {/* Total Summary */}
              <div className="flex justify-between items-center border-t-2 border-[#101828] pt-4 text-sm font-bold text-gray-900">
                <span className="uppercase text-[#775a19]">Tổng Cộng Cần Thanh Toán:</span>
                <span className="text-xl font-black text-[#101828] font-mono">{formatCurrency(selectedInvoice.totalAmount)}</span>
              </div>

              {/* Signatures & Bank QR Info */}
              <div className="grid grid-cols-2 gap-4 pt-6 border-t border-dashed border-gray-200">
                <div className="flex items-center gap-3 bg-gray-50 p-3.5 rounded-xl border border-gray-150">
                  <QrCode className="w-14 h-14 text-gray-700 shrink-0" />
                  <div className="text-[10px] text-gray-500">
                    <p className="font-bold text-gray-800">QR-PAYMENT VIETCOMBANK</p>
                    <p className="mt-0.5">TK: 10294829302 (LUMI RESIDENCE)</p>
                    <p className="mt-0.5">Nội dung: {selectedInvoice.id}</p>
                  </div>
                </div>

                <div className="text-right text-xs pr-6 pt-2">
                  <p className="text-gray-400 uppercase font-bold tracking-wider text-[10px]">Đại diện LUMI Residence</p>
                  <p className="font-bold text-gray-700 mt-6">(Đã ký điện tử)</p>
                </div>
              </div>
            </div>

            {/* Print Action Bottom */}
            <div className="flex gap-3 justify-end px-6 py-4 bg-gray-50 border-t border-gray-150">
              <button
                onClick={() => setIsPrintModalOpen(false)}
                className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-lg cursor-pointer"
              >
                Đóng lại
              </button>
              <button
                onClick={() => {
                  window.print();
                }}
                className="px-5 py-2 text-sm font-bold bg-[#101828] text-[#e8c176] rounded-lg hover:bg-[#c9a45c] hover:text-[#101828] transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4" />
                In phiếu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

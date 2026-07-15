import React, { useState } from "react";
import { Plus, Search, DollarSign, CreditCard, Wallet, Calendar, PlusCircle, AlertTriangle, CheckCircle } from "lucide-react";
import { PaymentTransaction } from "../types";

interface PaymentManagementViewProps {
  transactions: PaymentTransaction[];
  onAddTransaction: (trx: PaymentTransaction) => void;
  onApproveTransaction: (id: string) => void;
  onNavigateToRoom: (roomId: string) => void;
}

export default function PaymentManagementView({
  transactions,
  onAddTransaction,
  onApproveTransaction,
  onNavigateToRoom
}: PaymentManagementViewProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [methodFilter, setMethodFilter] = useState<string>("ALL");
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Form State
  const [roomNumber, setRoomNumber] = useState("");
  const [amount, setAmount] = useState(8500000);
  const [method, setMethod] = useState<PaymentTransaction["method"]>("Chuyển khoản");
  const [note, setNote] = useState("Thanh toán tiền nhà");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomNumber.trim() || amount <= 0) return;

    const newTrx: PaymentTransaction = {
      id: "#TRX-" + String(transactions.length + 100).padStart(3, "0"),
      roomNumber: roomNumber.trim().toUpperCase(),
      date: new Date().toLocaleDateString("vi-VN"),
      amount: Number(amount),
      method: method,
      status: "Chờ duyệt",
      note: note.trim()
    };

    onAddTransaction(newTrx);
    setIsFormOpen(false);

    // Reset Form
    setRoomNumber("");
    setAmount(8500000);
    setMethod("Chuyển khoản");
    setNote("Thanh toán tiền nhà");
    alert("Đã gửi yêu cầu đối soát giao dịch mới lên hệ thống thành công!");
  };

  const filteredTransactions = transactions.filter((trx) => {
    const matchesSearch =
      trx.roomNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trx.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (trx.note && trx.note.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesMethod = methodFilter === "ALL" || trx.method === methodFilter;

    return matchesSearch && matchesMethod;
  });

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(val);
  };

  const totalConfirmed = transactions
    .filter((t) => t.status === "Đã xác nhận")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalPending = transactions
    .filter((t) => t.status === "Chờ duyệt")
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#101828] tracking-tight">Sổ quỹ & Thanh toán</h1>
          <p className="text-sm text-[#4e4639]/70 mt-1">
            Ghi nhận phiếu thu ngân quỹ, kiểm soát giao dịch chuyển khoản ngân hàng và ví điện tử trực tuyến.
          </p>
        </div>
        <button
          onClick={() => setIsFormOpen(!isFormOpen)}
          className="h-11 px-5 bg-[#c9a45c] hover:bg-[#e8c176] text-[#523a00] font-semibold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-sm tracking-wide uppercase bg-gradient-to-b from-white/10 to-transparent cursor-pointer shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          {isFormOpen ? "Đóng form" : "Ghi nhận thanh toán mới"}
        </button>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="bg-white p-5 rounded-2xl border border-gray-150 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-gray-400 font-bold uppercase tracking-wider block">Doanh số thực thu</span>
            <span className="text-3xl font-bold text-emerald-600 mt-1 block">{formatCurrency(totalConfirmed)}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 font-bold">
            {transactions.filter((t) => t.status === "Đã xác nhận").length} GD
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-150 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-gray-400 font-bold uppercase tracking-wider block">Giao dịch chờ duyệt</span>
            <span className="text-3xl font-bold text-amber-600 mt-1 block">{formatCurrency(totalPending)}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 font-bold">
            {transactions.filter((t) => t.status === "Chờ duyệt").length} GD
          </div>
        </div>
      </div>

      {/* Create Transaction Collapsible Form */}
      {isFormOpen && (
        <div className="bg-white p-6 rounded-2xl border border-gray-150 shadow-md animate-scale-up space-y-4">
          <h3 className="font-bold text-lg text-[#101828] border-b border-gray-100 pb-2">Phiếu báo thu mới</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Số phòng *
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
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Số tiền đóng *
              </label>
              <input
                type="number"
                required
                min={1000}
                className="w-full h-10 px-3 bg-[#f8f9ff] border border-gray-300 rounded-lg text-sm text-[#101828]"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Hình thức đóng *
              </label>
              <select
                className="w-full h-10 px-3 bg-[#f8f9ff] border border-gray-300 rounded-lg text-sm text-[#101828]"
                value={method}
                onChange={(e) => setMethod(e.target.value as any)}
              >
                <option value="Chuyển khoản">Chuyển khoản</option>
                <option value="Tiền mặt">Tiền mặt</option>
                <option value="Momo">Momo</option>
                <option value="Khác">Khác</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Ghi chú phụ
              </label>
              <input
                type="text"
                placeholder="e.g. Tiền nhà tháng 10"
                className="w-full h-10 px-3 bg-[#f8f9ff] border border-gray-300 rounded-lg text-sm text-[#101828]"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>

            <div className="md:col-span-4 flex justify-end pt-2">
              <button
                type="submit"
                className="px-6 h-10 bg-[#101828] text-[#e8c176] font-bold rounded-lg text-xs tracking-wider uppercase hover:bg-[#c9a45c] hover:text-[#101828] transition-all cursor-pointer"
              >
                Tạo giao dịch đối soát
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filter toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-150 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            className="w-full h-11 pl-10 pr-4 bg-[#f8f9ff] border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a45c]/30"
            placeholder="Tìm theo số phòng, mã GD, ghi chú..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Hình thức</span>
          <select
            className="h-11 px-3 bg-[#f8f9ff] border border-gray-250 rounded-xl text-sm focus:ring-2 focus:ring-[#c9a45c]/30"
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
          >
            <option value="ALL">Tất cả hình thức</option>
            <option value="Chuyển khoản">Chuyển khoản</option>
            <option value="Tiền mặt">Tiền mặt</option>
            <option value="Momo">Momo</option>
            <option value="Khác">Khác</option>
          </select>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-2xl border border-gray-150 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-[#d1c5b4]/20 text-gray-400 text-xs font-semibold uppercase bg-gray-50/50">
                <th className="py-4 px-6">Mã giao dịch</th>
                <th className="py-4 px-6">Căn hộ</th>
                <th className="py-4 px-6">Ngày đóng</th>
                <th className="py-4 px-6">Số tiền</th>
                <th className="py-4 px-6">Hình thức</th>
                <th className="py-4 px-6">Nội dung / Ghi chú</th>
                <th className="py-4 px-6">Trạng thái</th>
                <th className="py-4 px-6 text-right">Duyệt thu</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map((trx) => (
                <tr key={trx.id} className="border-b border-gray-100 hover:bg-[#fcfbf9] transition-colors">
                  <td className="py-4 px-6 font-mono font-bold text-gray-700">{trx.id}</td>
                  <td className="py-4 px-6">
                    <span
                      onClick={() => onNavigateToRoom(trx.roomNumber)}
                      className="px-2.5 py-1 bg-[#101828] text-white text-xs font-bold rounded hover:bg-[#c9a45c] transition-colors cursor-pointer"
                    >
                      {trx.roomNumber}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-xs text-gray-500">{trx.date}</td>
                  <td className="py-4 px-6 font-bold text-[#101828]">{formatCurrency(trx.amount)}</td>
                  <td className="py-4 px-6 text-xs font-semibold text-gray-600">{trx.method}</td>
                  <td className="py-4 px-6 text-xs text-gray-500">{trx.note || "Thanh toán"}</td>
                  <td className="py-4 px-6">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        trx.status === "Đã xác nhận"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-amber-50 text-amber-700 border border-amber-200 animate-pulse"
                      }`}
                    >
                      {trx.status === "Đã xác nhận" ? (
                        <>
                          <CheckCircle className="w-3 h-3" /> Đã xác nhận
                        </>
                      ) : (
                        "Chờ duyệt"
                      )}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    {trx.status === "Chờ duyệt" && (
                      <button
                        onClick={() => {
                          onApproveTransaction(trx.id);
                          alert(`Đã duyệt thành công giao dịch thu tiền ${trx.id} của căn hộ ${trx.roomNumber}!`);
                        }}
                        className="text-xs px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition-all cursor-pointer shadow-sm"
                      >
                        Duyệt thu
                      </button>
                    )}
                  </td>
                </tr>
              ))}

              {filteredTransactions.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-gray-400">
                    <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                    Không tìm thấy giao dịch nào phù hợp!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

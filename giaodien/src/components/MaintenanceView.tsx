import React, { useState } from "react";
import { PlusCircle, Search, Filter, Wrench, CheckCircle, Clock, Hammer, AlertTriangle, AlertCircle, X } from "lucide-react";
import { MaintenanceRequest } from "../types";

interface MaintenanceViewProps {
  maintenance: MaintenanceRequest[];
  onAddRequest: (req: MaintenanceRequest) => void;
  onUpdateStatus: (id: string, newStatus: MaintenanceRequest["status"]) => void;
  onNavigateToRoom: (roomId: string) => void;
}

export default function MaintenanceView({
  maintenance,
  onAddRequest,
  onUpdateStatus,
  onNavigateToRoom
}: MaintenanceViewProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [priorityFilter, setPriorityFilter] = useState<string>("ALL");
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Form State
  const [roomNumber, setRoomNumber] = useState("");
  const [reporter, setReporter] = useState("");
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<MaintenanceRequest["priority"]>("Medium");
  const [description, setDescription] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomNumber.trim() || !title.trim() || !reporter.trim()) return;

    const newReq: MaintenanceRequest = {
      id: "M." + String(maintenance.length + 1).padStart(3, "0"),
      roomNumber: roomNumber.trim().toUpperCase(),
      reporter: reporter.trim(),
      title: title.trim(),
      priority: priority,
      status: "Pending",
      createdDate: "Hôm nay, " + new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
      description: description.trim()
    };

    onAddRequest(newReq);
    setIsFormOpen(false);

    // Reset Form
    setRoomNumber("");
    setReporter("");
    setTitle("");
    setPriority("Medium");
    setDescription("");
    alert("Đã tạo phiếu yêu cầu sửa chữa thành công!");
  };

  const filteredRequests = maintenance.filter((req) => {
    const matchesSearch =
      req.roomNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.reporter.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "ALL" || req.status === statusFilter;
    const matchesPriority = priorityFilter === "ALL" || req.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  const getPriorityBadge = (p: MaintenanceRequest["priority"]) => {
    switch (p) {
      case "High":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <AlertCircle className="w-3 h-3 text-rose-500" /> Khẩn cấp
          </span>
        );
      case "Medium":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            Bình thường
          </span>
        );
      case "Low":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-50 text-gray-500 border border-gray-200">
            Thấp
          </span>
        );
    }
  };

  const getStatusBadge = (s: MaintenanceRequest["status"]) => {
    switch (s) {
      case "Pending":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200 animate-pulse">
            Chờ xử lý
          </span>
        );
      case "Processing":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            Đang tiến hành
          </span>
        );
      case "Done":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            Đã sửa xong
          </span>
        );
      case "Cancelled":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-50 text-gray-500 border border-gray-200">
            Đã hủy
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#101828] tracking-tight">Sửa chữa & Bảo trì</h1>
          <p className="text-sm text-[#4e4639]/70 mt-1">
            Điều hành đội kỹ thuật xử lý các lỗi thiết bị điện nước, cơ sở hạ tầng báo về từ phòng ở.
          </p>
        </div>
        <button
          onClick={() => setIsFormOpen(!isFormOpen)}
          className="h-11 px-5 bg-[#c9a45c] hover:bg-[#e8c176] text-[#523a00] font-semibold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-sm tracking-wide uppercase bg-gradient-to-b from-white/10 to-transparent cursor-pointer shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          {isFormOpen ? "Đóng form" : "Tạo phiếu báo hỏng"}
        </button>
      </div>

      {/* Collapsible Ticket Creation Form */}
      {isFormOpen && (
        <div className="bg-white p-6 rounded-2xl border border-gray-150 shadow-md animate-scale-up space-y-4">
          <h3 className="font-bold text-lg text-[#101828] border-b border-gray-100 pb-2">Phiếu báo hỏng thiết bị</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Căn hộ xảy ra sự cố *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. P.205"
                  className="w-full h-10 px-3 bg-[#f8f9ff] border border-gray-300 rounded-lg text-sm text-[#101828]"
                  value={roomNumber}
                  onChange={(e) => setRoomNumber(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Người báo cáo *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Nguyễn Văn A"
                  className="w-full h-10 px-3 bg-[#f8f9ff] border border-gray-300 rounded-lg text-sm text-[#101828]"
                  value={reporter}
                  onChange={(e) => setReporter(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Mức độ ưu tiên *
                </label>
                <select
                  className="w-full h-10 px-3 bg-[#f8f9ff] border border-gray-300 rounded-lg text-sm text-[#101828]"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as any)}
                >
                  <option value="Low">Thấp (Định kỳ)</option>
                  <option value="Medium">Bình thường</option>
                  <option value="High">Khẩn cấp (Sửa ngay)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Tiêu đề sự cố *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Hỏng vòi nước phòng tắm, Không lên nguồn máy lạnh"
                className="w-full h-10 px-3 bg-[#f8f9ff] border border-gray-300 rounded-lg text-sm text-[#101828]"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Mô tả chi tiết lỗi thiết bị
              </label>
              <textarea
                rows={3}
                placeholder="Nhập ghi chú chi tiết về sự cố hỏng hóc để kỹ thuật viên nắm thông tin chuẩn bị vật tư..."
                className="w-full p-3 bg-[#f8f9ff] border border-gray-300 rounded-lg text-sm text-[#101828]"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="px-6 h-10 bg-[#101828] text-[#e8c176] font-bold rounded-lg text-xs tracking-wider uppercase hover:bg-[#c9a45c] hover:text-[#101828] transition-all cursor-pointer"
              >
                Gửi lệnh kỹ thuật
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
            placeholder="Tìm theo phòng, sự cố, người báo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Trạng thái</span>
            <select
              className="h-11 px-3 bg-[#f8f9ff] border border-gray-250 rounded-xl text-sm focus:ring-2 focus:ring-[#c9a45c]/30"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">Tất cả</option>
              <option value="Pending">Chờ xử lý</option>
              <option value="Processing">Đang tiến hành</option>
              <option value="Done">Đã sửa xong</option>
              <option value="Cancelled">Đã hủy</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Ưu tiên</span>
            <select
              className="h-11 px-3 bg-[#f8f9ff] border border-gray-250 rounded-xl text-sm focus:ring-2 focus:ring-[#c9a45c]/30"
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
            >
              <option value="ALL">Tất cả mức độ</option>
              <option value="High">Khẩn cấp</option>
              <option value="Medium">Bình thường</option>
              <option value="Low">Thấp</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tickets List Board */}
      <div className="bg-white rounded-2xl border border-gray-150 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-[#d1c5b4]/20 text-gray-400 text-xs font-semibold uppercase bg-gray-50/50">
                <th className="py-4 px-6">Mã Phiếu</th>
                <th className="py-4 px-6">Căn hộ</th>
                <th className="py-4 px-6">Người báo</th>
                <th className="py-4 px-6">Nội dung báo hỏng</th>
                <th className="py-4 px-6">Mức ưu tiên</th>
                <th className="py-4 px-6 font-mono">Báo cáo lúc</th>
                <th className="py-4 px-6">Trạng thái</th>
                <th className="py-4 px-6 text-right">Cập nhật tiến độ</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.map((req) => (
                <tr key={req.id} className="border-b border-gray-100 hover:bg-[#fcfbf9] transition-colors">
                  <td className="py-4 px-6 font-mono font-bold text-gray-700">{req.id}</td>
                  <td className="py-4 px-6">
                    <span
                      onClick={() => onNavigateToRoom(req.roomNumber)}
                      className="px-2.5 py-1 bg-[#101828] text-white text-xs font-bold rounded-lg cursor-pointer hover:bg-[#c9a45c] transition-colors"
                    >
                      {req.roomNumber}
                    </span>
                  </td>
                  <td className="py-4 px-6 font-semibold text-gray-700">{req.reporter}</td>
                  <td className="py-4 px-6">
                    <div className="font-bold text-gray-900">{req.title}</div>
                    <span className="text-xs text-gray-400 block line-clamp-1">{req.description}</span>
                  </td>
                  <td className="py-4 px-6">{getPriorityBadge(req.priority)}</td>
                  <td className="py-4 px-6 font-mono text-xs text-gray-500">{req.createdDate}</td>
                  <td className="py-4 px-6">{getStatusBadge(req.status)}</td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex gap-1.5 justify-end">
                      {req.status === "Pending" && (
                        <button
                          onClick={() => onUpdateStatus(req.id, "Processing")}
                          className="text-xs px-2.5 py-1.5 bg-indigo-50 border border-indigo-200 text-indigo-700 font-bold rounded-lg hover:bg-indigo-100 transition-all cursor-pointer"
                        >
                          Xử lý lỗi
                        </button>
                      )}
                      {req.status === "Processing" && (
                        <button
                          onClick={() => onUpdateStatus(req.id, "Done")}
                          className="text-xs px-2.5 py-1.5 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 transition-all cursor-pointer"
                        >
                          Xong
                        </button>
                      )}
                      {req.status !== "Done" && req.status !== "Cancelled" && (
                        <button
                          onClick={() => onUpdateStatus(req.id, "Cancelled")}
                          className="text-xs px-2 py-1 border border-gray-300 text-gray-400 hover:text-rose-600 rounded-lg hover:bg-gray-100 transition-all cursor-pointer font-bold"
                          title="Hủy phiếu"
                        >
                          Hủy
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}

              {filteredRequests.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-gray-400">
                    <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                    Không tìm thấy phiếu yêu cầu bảo trì phù hợp!
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

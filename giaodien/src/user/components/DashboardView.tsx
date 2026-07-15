import React from 'react';
import {
  AlertTriangle,
  ArrowRight,
  CreditCard,
  Droplet,
  Home,
  Info,
  Megaphone,
  Receipt,
  Wrench,
  Zap,
} from 'lucide-react';
import { AvailableRoom, Invoice, ResidentRoom, TenantNotification } from '../types';

interface DashboardViewProps {
  lang: 'vi' | 'en';
  setActiveTab: (tab: string) => void;
  onPayInvoice: (invoiceId: string) => void;
  onRequestRoom: () => void;
  invoices: Invoice[];
  notifications: TenantNotification[];
  room: ResidentRoom | null;
  availableRooms: AvailableRoom[];
  currentUserName?: string;
  loading?: boolean;
  rentalMessage?: string;
  rentalSubmitting?: boolean;
  selectedRoomId: string;
  setSelectedRoomId: (id: string) => void;
}

export default function DashboardView({
  lang,
  setActiveTab,
  onPayInvoice,
  onRequestRoom,
  invoices,
  notifications,
  room,
  availableRooms,
  currentUserName,
  loading,
  rentalMessage,
  rentalSubmitting,
  selectedRoomId,
  setSelectedRoomId,
}: DashboardViewProps) {
  const pendingInvoice = invoices.find((inv) => inv.status === 'Pending' || inv.status === 'Overdue') || invoices[0];
  const selectedRoom = availableRooms.find((item) => String(item.id) === selectedRoomId);
  const shownRoom = room || selectedRoom;

  const formatCurrency = (val: number) => val.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
  const monthlyRent = room?.basePrice || selectedRoom?.price || pendingInvoice?.rent || 0;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold text-brand-primary tracking-tight">
          {lang === 'vi' ? `Xin chào, ${currentUserName || 'cư dân'}` : `Hello, ${currentUserName || 'Resident'}`}
        </h1>
        <p className="text-on-surface-variant font-medium mt-2">
          {loading
            ? (lang === 'vi' ? 'Đang tải dữ liệu từ hệ thống...' : 'Loading your account data...')
            : (lang === 'vi' ? 'Dưới đây là tóm tắt nhanh tài khoản cư dân của bạn.' : 'Here is a quick overview of your resident account.')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <div className="bg-[#ffffff] rounded-2xl p-6 flex flex-col justify-between shadow-[0px_4px_20px_rgba(26,43,75,0.05)] border border-[#e7e8e9] hover:shadow-md transition-all">
          <div>
            <div className="flex items-center gap-2 text-brand-primary mb-5">
              <Home className="w-5 h-5 text-brand-primary" />
              <h3 className="font-bold text-lg">{lang === 'vi' ? 'Phòng' : 'Room Details'}</h3>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-on-surface-variant font-medium">{lang === 'vi' ? 'Mã phòng' : 'Unit ID'}</span>
                <span className="font-bold text-brand-primary font-mono bg-brand-surface-bg px-2.5 py-1 rounded-lg border border-[#e7e8e9]">
                  {shownRoom?.roomNumber || '-'}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-on-surface-variant font-medium">{lang === 'vi' ? 'Tầng' : 'Floor'}</span>
                <span className="font-semibold text-brand-primary">{shownRoom?.floor || '-'}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-on-surface-variant font-medium">{lang === 'vi' ? 'Tòa tháp' : 'Tower'}</span>
                <span className="font-semibold text-brand-primary">{room?.tower || 'A'}</span>
              </div>
            </div>

            {!room && (
              <div className="mt-5 space-y-3 rounded-xl border border-[#e7e8e9] bg-brand-surface-bg p-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                  {lang === 'vi' ? 'Chọn phòng muốn thuê' : 'Choose a room'}
                </label>
                <select
                  value={selectedRoomId}
                  onChange={(event) => setSelectedRoomId(event.target.value)}
                  className="w-full rounded-lg border border-[#d1c5b4]/50 bg-white px-3 py-2 text-sm font-semibold text-brand-primary outline-none focus:border-brand-secondary"
                >
                  <option value="">{lang === 'vi' ? 'Chọn phòng trống' : 'Available rooms'}</option>
                  {availableRooms.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.roomNumber} - {formatCurrency(item.price || 0)}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  disabled={!selectedRoomId || rentalSubmitting}
                  onClick={onRequestRoom}
                  className="w-full rounded-xl bg-brand-primary px-4 py-2.5 text-sm font-bold text-white transition-all hover:bg-brand-primary-container disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {rentalSubmitting ? 'Đang gửi...' : 'Gửi yêu cầu thuê phòng'}
                </button>
                {rentalMessage && <p className="text-xs font-semibold text-brand-secondary">{rentalMessage}</p>}
              </div>
            )}
          </div>

          <div className="mt-8 pt-4 border-t border-[#e7e8e9]">
            <div className="flex justify-between items-center">
              <span className="text-xs text-on-surface-variant font-semibold uppercase tracking-wider">
                {lang === 'vi' ? 'Giá thuê hằng tháng' : 'Monthly Rent'}
              </span>
              <span className="text-xl font-extrabold text-brand-primary">
                {formatCurrency(monthlyRent)}
                <span className="text-xs text-on-surface-variant font-medium lowercase">/{lang === 'vi' ? 'tháng' : 'mo'}</span>
              </span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-[#ffffff] to-brand-surface-bg rounded-2xl p-6 flex flex-col justify-between shadow-[0px_4px_20px_rgba(26,43,75,0.05)] border border-[#e7e8e9] hover:shadow-md transition-all relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-12 -mt-12 w-40 h-40 bg-brand-secondary-container rounded-full opacity-10 pointer-events-none" />
          <div>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2 text-brand-secondary">
                <Receipt className="w-5 h-5" />
                <h3 className="font-bold text-lg">{lang === 'vi' ? 'Hóa đơn' : 'Next Invoice'}</h3>
              </div>
              <span className="bg-brand-secondary-container text-brand-secondary font-bold text-xs px-3 py-1 rounded-full shadow-sm border border-brand-secondary/10">
                {lang === 'vi' ? 'Chờ thanh toán' : 'Pending Payment'}
              </span>
            </div>

            <div className="flex flex-col items-center justify-center py-3">
              <span className="text-xs text-on-surface-variant font-bold uppercase tracking-widest">{lang === 'vi' ? 'Tổng cộng' : 'Total Due'}</span>
              <span className="text-4xl font-black text-brand-primary mt-1 font-mono">
                {formatCurrency(pendingInvoice?.total || 0)}
              </span>
            </div>
          </div>

          <div className="mt-4 space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#ba1a1a]">
              <AlertTriangle className="w-4 h-4" />
              <span>{lang === 'vi' ? `Hạn chót: ${pendingInvoice?.dueDate || '-'}` : `Due Date: ${pendingInvoice?.dueDate || '-'}`}</span>
            </div>

            <button
              onClick={() => pendingInvoice && onPayInvoice(pendingInvoice.id)}
              disabled={!pendingInvoice}
              className="w-full bg-brand-primary hover:bg-brand-primary-container text-[#ffffff] font-semibold py-3 rounded-xl shadow-sm text-sm active:scale-[0.98] transition-all disabled:cursor-not-allowed disabled:opacity-50"
            >
              {lang === 'vi' ? 'Thanh toán ngay' : 'Pay Now'}
            </button>
          </div>
        </div>

        <div className="bg-[#ffffff] rounded-2xl p-6 flex flex-col justify-between shadow-[0px_4px_20px_rgba(26,43,75,0.05)] border border-[#e7e8e9] hover:shadow-md transition-all">
          <div>
            <div className="flex items-center gap-2 text-brand-primary mb-6">
              <Zap className="w-5 h-5 text-brand-primary" />
              <h3 className="font-bold text-lg">{lang === 'vi' ? 'Điện & Nước' : 'Utilities (Current Mo)'}</h3>
            </div>

            <div className="space-y-5">
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-sm font-medium text-on-surface flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-brand-secondary" />
                    {lang === 'vi' ? 'Điện tiêu thụ' : 'Electricity'}
                  </span>
                  <span className="text-sm font-bold text-brand-primary font-mono">{room?.electricityUsage || 0} kWh</span>
                </div>
                <div className="w-full bg-[#f3f4f5] rounded-full h-2.5">
                  <div className="bg-brand-secondary h-2.5 rounded-full transition-all duration-500" style={{ width: '60%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-sm font-medium text-on-surface flex items-center gap-1.5">
                    <Droplet className="w-4 h-4 text-brand-primary" />
                    {lang === 'vi' ? 'Nước tiêu thụ' : 'Water'}
                  </span>
                  <span className="text-sm font-bold text-brand-primary font-mono">{room?.waterUsage || 0} m³</span>
                </div>
                <div className="w-full bg-[#f3f4f5] rounded-full h-2.5">
                  <div className="bg-brand-primary h-2.5 rounded-full transition-all duration-500" style={{ width: '40%' }} />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex items-center gap-1 text-xs text-on-surface-variant bg-brand-surface-bg p-2 rounded-lg border border-[#e7e8e9]">
            <Info className="w-4 h-4 text-brand-primary shrink-0" />
            <span>{lang === 'vi' ? 'Cập nhật tự động ngày 01 hằng tháng.' : 'Auto-meter updated on 1st of month.'}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="bg-[#ffffff] rounded-2xl p-6 shadow-[0px_4px_20px_rgba(26,43,75,0.05)] border border-[#e7e8e9] xl:col-span-2 hover:shadow-md transition-all">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2 text-brand-primary">
              <Megaphone className="w-5 h-5 text-brand-primary" />
              <h3 className="font-bold text-lg">{lang === 'vi' ? 'Thông báo' : 'Notifications'}</h3>
            </div>
            <button onClick={() => setActiveTab('dashboard')} className="text-xs text-brand-primary hover:underline font-bold">
              {lang === 'vi' ? 'Xem lịch sử' : 'View history'}
            </button>
          </div>

          <ul className="space-y-4">
            {notifications.map((notif) => (
              <li
                key={notif.id}
                onClick={() => {
                  if (notif.type === 'invoice') setActiveTab('payments');
                }}
                className="flex items-start gap-4 p-4 rounded-xl bg-brand-surface-bg hover:bg-[#edeeef] cursor-pointer transition-all border border-[#e7e8e9]"
              >
                <div className={`mt-1 w-2.5 h-2.5 rounded-full shrink-0 ${notif.type === 'invoice' ? 'bg-brand-secondary' : 'bg-brand-primary'}`} />
                <div className="flex-1">
                  <p className="font-bold text-sm text-brand-primary">{notif.title}</p>
                  <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">{notif.description}</p>
                  <span className="text-[10px] text-on-surface-variant font-mono mt-2 block">{notif.time}</span>
                </div>
              </li>
            ))}
            {notifications.length === 0 && (
              <li className="rounded-xl border border-[#e7e8e9] bg-brand-surface-bg p-4 text-sm font-semibold text-on-surface-variant">
                {lang === 'vi' ? 'Chưa có thông báo mới.' : 'No new notifications.'}
              </li>
            )}
          </ul>
        </div>

        <div className="bg-[#ffffff] rounded-2xl p-6 shadow-[0px_4px_20px_rgba(26,43,75,0.05)] border border-[#e7e8e9] flex flex-col justify-between hover:shadow-md transition-all">
          <div>
            <h3 className="font-bold text-lg text-brand-primary mb-6">{lang === 'vi' ? 'Thao tác nhanh' : 'Quick Actions'}</h3>
            <div className="space-y-3">
              <button
                onClick={() => setActiveTab('payments')}
                className="w-full flex items-center justify-between border border-brand-secondary text-brand-secondary hover:bg-brand-secondary/5 rounded-xl py-3 px-4 font-bold text-sm active:scale-[0.98] transition-all"
              >
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  <span>{lang === 'vi' ? 'Thanh toán hóa đơn' : 'Pay Monthly Invoices'}</span>
                </div>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => setActiveTab('maintenance')}
                className="w-full flex items-center justify-between bg-brand-surface-bg text-brand-primary hover:bg-[#edeeef] rounded-xl py-3 px-4 font-bold text-sm active:scale-[0.98] transition-all border border-[#e7e8e9]"
              >
                <div className="flex items-center gap-2">
                  <Wrench className="w-4 h-4" />
                  <span>{lang === 'vi' ? 'Gửi yêu cầu sửa chữa' : 'Submit Repair Request'}</span>
                </div>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-[#e7e8e9] text-center">
            <span className="text-xs text-on-surface-variant">
              {lang === 'vi' ? 'Cần giúp đỡ thêm? ' : 'Need more help? '}
              <button onClick={() => setActiveTab('support')} className="text-brand-primary font-bold hover:underline">
                {lang === 'vi' ? 'Liên hệ hỗ trợ' : 'Contact Support'}
              </button>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

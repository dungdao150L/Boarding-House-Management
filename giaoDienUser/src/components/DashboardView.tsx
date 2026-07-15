import React from 'react';
import { 
  Home, 
  Receipt, 
  Bolt, 
  Droplet, 
  Megaphone, 
  ArrowRight,
  CreditCard,
  Wrench,
  AlertTriangle,
  Flame,
  Zap,
  Info
} from 'lucide-react';
import { Invoice, TenantNotification } from '../types';

interface DashboardViewProps {
  lang: 'vi' | 'en';
  setActiveTab: (tab: string) => void;
  onPayInvoice: (invoiceId: string) => void;
  invoices: Invoice[];
  notifications: TenantNotification[];
}

export default function DashboardView({ lang, setActiveTab, onPayInvoice, invoices, notifications }: DashboardViewProps) {
  // Find pending or overdue invoices
  const pendingInvoice = invoices.find(inv => inv.status === 'Pending' || inv.status === 'Overdue') || invoices[0];

  const formatCurrency = (val: number) => {
    return val.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
      {/* Greeting Section */}
      <div>
        <h1 className="text-3xl md:text-4xl font-bold text-brand-primary tracking-tight">
          {lang === 'vi' ? 'Xin chào, Nguyễn Văn A' : 'Hello, Nguyen Van A'}
        </h1>
        <p className="text-on-surface-variant font-medium mt-2">
          {lang === 'vi' ? 'Dưới đây là tóm tắt nhanh tài khoản cư dân của bạn.' : 'Here is a quick overview of your resident account.'}
        </p>
      </div>

      {/* Grid of Main Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        
        {/* Room Information Card */}
        <div className="bg-[#ffffff] rounded-2xl p-6 flex flex-col justify-between shadow-[0px_4px_20px_rgba(26,43,75,0.05)] border border-[#e7e8e9] hover:shadow-md transition-all">
          <div>
            <div className="flex items-center gap-2 text-brand-primary mb-5">
              <Home className="w-5 h-5 text-brand-primary" />
              <h3 className="font-bold text-lg">{lang === 'vi' ? 'Phòng' : 'Room Details'}</h3>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-on-surface-variant font-medium">{lang === 'vi' ? 'Mã phòng' : 'Unit ID'}</span>
                <span className="font-bold text-brand-primary font-mono bg-brand-surface-bg px-2.5 py-1 rounded-lg border border-[#e7e8e9]">P.402</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-on-surface-variant font-medium">{lang === 'vi' ? 'Tầng' : 'Floor'}</span>
                <span className="font-semibold text-brand-primary">4</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-on-surface-variant font-medium">{lang === 'vi' ? 'Tòa tháp' : 'Tower'}</span>
                <span className="font-semibold text-brand-primary">{lang === 'vi' ? 'Tháp A' : 'Tower A'}</span>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-[#e7e8e9]">
            <div className="flex justify-between items-center">
              <span className="text-xs text-on-surface-variant font-semibold uppercase tracking-wider">{lang === 'vi' ? 'Giá thuê hàng tháng' : 'Monthly Rent'}</span>
              <span className="text-xl font-extrabold text-brand-primary">
                {lang === 'vi' ? '7.5tr' : '$2,500.00'}
                <span className="text-xs text-on-surface-variant font-medium lowercase">/{lang === 'vi' ? 'tháng' : 'mo'}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Invoice Highlight Card */}
        <div className="bg-gradient-to-br from-[#ffffff] to-brand-surface-bg rounded-2xl p-6 flex flex-col justify-between shadow-[0px_4px_20px_rgba(26,43,75,0.05)] border border-[#e7e8e9] hover:shadow-md transition-all relative overflow-hidden">
          {/* Subtle Accent color block */}
          <div className="absolute top-0 right-0 -mr-12 -mt-12 w-40 h-40 bg-brand-secondary-container rounded-full opacity-10 pointer-events-none"></div>

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
                {lang === 'vi' ? '8.2tr' : formatCurrency(pendingInvoice ? pendingInvoice.total : 2665.50)}
              </span>
            </div>
          </div>

          <div className="mt-4 space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#ba1a1a]">
              <AlertTriangle className="w-4 h-4" />
              <span>{lang === 'vi' ? 'Hạn chót: 05/10/2023' : 'Due Date: Oct 05, 2023'}</span>
            </div>
            
            <button 
              onClick={() => pendingInvoice && onPayInvoice(pendingInvoice.id)}
              className="w-full bg-brand-primary hover:bg-brand-primary-container text-[#ffffff] font-semibold py-3 rounded-xl shadow-sm text-sm active:scale-[0.98] transition-all"
            >
              {lang === 'vi' ? 'Thanh toán ngay' : 'Pay Now'}
            </button>
          </div>
        </div>

        {/* Utilities Stats Card */}
        <div className="bg-[#ffffff] rounded-2xl p-6 flex flex-col justify-between shadow-[0px_4px_20px_rgba(26,43,75,0.05)] border border-[#e7e8e9] hover:shadow-md transition-all">
          <div>
            <div className="flex items-center gap-2 text-brand-primary mb-6">
              <Zap className="w-5 h-5 text-brand-primary" />
              <h3 className="font-bold text-lg">{lang === 'vi' ? 'Điện & Nước' : 'Utilities (Current Mo)'}</h3>
            </div>

            <div className="space-y-5">
              {/* Electricity */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-sm font-medium text-on-surface flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-brand-secondary" />
                    {lang === 'vi' ? 'Điện tiêu thụ' : 'Electricity'}
                  </span>
                  <span className="text-sm font-bold text-brand-primary font-mono">120 kWh</span>
                </div>
                <div className="w-full bg-[#f3f4f5] rounded-full h-2.5">
                  <div className="bg-brand-secondary h-2.5 rounded-full transition-all duration-500" style={{ width: '60%' }}></div>
                </div>
              </div>

              {/* Water */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-sm font-medium text-on-surface flex items-center gap-1.5">
                    <Droplet className="w-4 h-4 text-brand-primary" />
                    {lang === 'vi' ? 'Nước tiêu thụ' : 'Water'}
                  </span>
                  <span className="text-sm font-bold text-brand-primary font-mono">8 m³</span>
                </div>
                <div className="w-full bg-[#f3f4f5] rounded-full h-2.5">
                  <div className="bg-brand-primary h-2.5 rounded-full transition-all duration-500" style={{ width: '40%' }}></div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex items-center gap-1 text-xs text-on-surface-variant bg-brand-surface-bg p-2 rounded-lg border border-[#e7e8e9]">
            <Info className="w-4 h-4 text-brand-primary shrink-0" />
            <span>{lang === 'vi' ? 'Cập nhật tự động ngày 01 hàng tháng.' : 'Auto-meter updated on 1st of month.'}</span>
          </div>
        </div>

      </div>

      {/* Notifications and Quick Actions Panel */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Notifications Card */}
        <div className="bg-[#ffffff] rounded-2xl p-6 shadow-[0px_4px_20px_rgba(26,43,75,0.05)] border border-[#e7e8e9] xl:col-span-2 hover:shadow-md transition-all">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2 text-brand-primary">
              <Megaphone className="w-5 h-5 text-brand-primary" />
              <h3 className="font-bold text-lg">{lang === 'vi' ? 'Thông báo' : 'Notifications'}</h3>
            </div>
            <button 
              onClick={() => setActiveTab('dashboard')} 
              className="text-xs text-brand-primary hover:underline font-bold"
            >
              {lang === 'vi' ? 'Xem lịch sử' : 'View history'}
            </button>
          </div>

          <ul className="space-y-4">
            {notifications.map((notif) => (
              <li 
                key={notif.id}
                onClick={() => {
                  if (notif.type === 'invoice') {
                    setActiveTab('payments');
                  }
                }}
                className="flex items-start gap-4 p-4 rounded-xl bg-brand-surface-bg hover:bg-[#edeeef] cursor-pointer transition-all border border-[#e7e8e9]"
              >
                <div className={`mt-1 w-2.5 h-2.5 rounded-full shrink-0 ${notif.type === 'invoice' ? 'bg-brand-secondary' : 'bg-brand-primary'}`}></div>
                <div className="flex-1">
                  <p className="font-bold text-sm text-brand-primary">{notif.title}</p>
                  <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">{notif.description}</p>
                  <span className="text-[10px] text-on-surface-variant font-mono mt-2 block">{notif.time}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Quick Actions Card */}
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
              <button 
                onClick={() => setActiveTab('support')}
                className="text-brand-primary font-bold hover:underline"
              >
                {lang === 'vi' ? 'Liên hệ hỗ trợ' : 'Contact Support'}
              </button>
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}

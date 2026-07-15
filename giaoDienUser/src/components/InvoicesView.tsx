import React, { useState, useMemo } from 'react';
import { 
  Calendar, 
  CheckCircle, 
  AlertTriangle, 
  Search, 
  ChevronDown,
  Download,
  Eye,
  Info,
  DollarSign
} from 'lucide-react';
import { Invoice } from '../types';

interface InvoicesViewProps {
  lang: 'vi' | 'en';
  invoices: Invoice[];
  onPayInvoice: (invoiceId: string) => void;
  onViewInvoiceDetails: (invoice: Invoice) => void;
}

export default function InvoicesView({ lang, invoices, onPayInvoice, onViewInvoiceDetails }: InvoicesViewProps) {
  const [selectedYear, setSelectedYear] = useState('2023');
  const [selectedMonth, setSelectedMonth] = useState('All Months');
  const [searchQuery, setSearchQuery] = useState('');

  const monthsList = [
    { value: 'All Months', label: lang === 'vi' ? 'Tất cả các tháng' : 'All Months' },
    { value: 'October', label: lang === 'vi' ? 'Tháng 10' : 'October' },
    { value: 'September', label: lang === 'vi' ? 'Tháng 9' : 'September' },
    { value: 'August', label: lang === 'vi' ? 'Tháng 8' : 'August' },
  ];

  const filteredInvoices = useMemo(() => {
    return invoices.filter(invoice => {
      // Filter by search query
      const matchesSearch = invoice.month.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            invoice.id.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Filter by month
      let matchesMonth = true;
      if (selectedMonth !== 'All Months') {
        matchesMonth = invoice.month.toLowerCase().includes(selectedMonth.toLowerCase());
      }

      return matchesSearch && matchesMonth;
    });
  }, [invoices, searchQuery, selectedMonth]);

  const formatCurrency = (val: number) => {
    return val.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
      {/* Top section with title and select dropdown filters */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-brand-primary tracking-tight">
            {lang === 'vi' ? 'Hóa đơn' : 'Invoices'}
          </h2>
          <p className="text-on-surface-variant font-medium mt-2">
            {lang === 'vi' ? 'Quản lý và xem xét các bảng kê khai hàng tháng của bạn.' : 'Manage and review your monthly statements.'}
          </p>
        </div>

        {/* Dropdown Filters */}
        <div className="flex items-center gap-4 w-full md:w-auto">
          {/* Search bar inside view for mobile/tablet */}
          <div className="flex md:hidden items-center bg-[#ffffff] rounded-xl px-3 py-2 border border-[#c5c6cf] w-full max-w-xs">
            <Search className="text-on-surface-variant w-4 h-4 mr-2" />
            <input 
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none focus:outline-none text-xs text-on-surface w-full" 
              placeholder={lang === 'vi' ? "Tìm kiếm..." : "Search..."}
              type="text"
            />
          </div>

          <div className="relative shrink-0">
            <select 
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="appearance-none bg-[#ffffff] dark:bg-[#2e3132] border border-[#c5c6cf] dark:border-[#44474e] text-brand-primary dark:text-[#ffffff] font-semibold text-sm rounded-xl py-3 pl-4 pr-10 focus:outline-none focus:ring-1 focus:ring-brand-primary cursor-pointer"
            >
              <option value="2023">2023</option>
              <option value="2022">2022</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant w-4 h-4 pointer-events-none" />
          </div>

          <div className="relative shrink-0">
            <select 
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="appearance-none bg-[#ffffff] dark:bg-[#2e3132] border border-[#c5c6cf] dark:border-[#44474e] text-brand-primary dark:text-[#ffffff] font-semibold text-sm rounded-xl py-3 pl-4 pr-10 focus:outline-none focus:ring-1 focus:ring-brand-primary cursor-pointer"
            >
              {monthsList.map(m => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant w-4 h-4 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Invoice List */}
      <div className="space-y-6">
        {filteredInvoices.length === 0 ? (
          <div className="bg-[#ffffff] rounded-2xl p-12 text-center border border-[#e7e8e9] shadow-[0px_4px_20px_rgba(26,43,75,0.05)]">
            <Info className="w-10 h-10 text-on-surface-variant mx-auto mb-3" />
            <p className="text-sm font-semibold text-brand-primary">
              {lang === 'vi' ? 'Không tìm thấy hóa đơn nào khớp' : 'No invoices found matching current criteria.'}
            </p>
          </div>
        ) : (
          filteredInvoices.map((invoice) => {
            const isPending = invoice.status === 'Pending';
            const isPaid = invoice.status === 'Paid';
            const isOverdue = invoice.status === 'Overdue';

            return (
              <div 
                key={invoice.id}
                className="bg-[#ffffff] rounded-2xl p-6 shadow-[0px_4px_20px_rgba(26,43,75,0.05)] border border-[#e7e8e9] hover:border-[#c5c6cf] transition-all flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6"
              >
                {/* Left block: Icon and Month */}
                <div className="flex items-center gap-5 w-full xl:w-auto">
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center shrink-0 ${
                    isPaid ? 'bg-[#ffe088]/20' : isOverdue ? 'bg-[#ffdad6]' : 'bg-brand-secondary-container/20'
                  }`}>
                    {isPaid ? (
                      <CheckCircle className="text-brand-secondary w-7 h-7" />
                    ) : isOverdue ? (
                      <AlertTriangle className="text-[#ba1a1a] w-7 h-7" />
                    ) : (
                      <Calendar className="text-brand-secondary w-7 h-7" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-brand-primary">{invoice.month}</h3>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        isPaid 
                          ? 'bg-brand-secondary-container/30 text-brand-secondary' 
                          : isOverdue 
                            ? 'bg-[#ffdad6] text-[#93000a]' 
                            : 'bg-brand-secondary-container text-brand-secondary'
                      }`}>
                        {lang === 'vi' 
                          ? isPaid ? 'Đã thanh toán' : isOverdue ? 'Quá hạn' : 'Chờ xử lý'
                          : invoice.status
                        }
                      </span>
                      <span className="text-xs text-on-surface-variant font-medium">
                        {isPaid 
                          ? `${lang === 'vi' ? 'Đã trả' : 'Paid'}: ${invoice.paidDate}`
                          : `${lang === 'vi' ? 'Hạn chót' : 'Due'}: ${invoice.dueDate}`
                        }
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right block: Billing Details and Actions */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-6 w-full xl:w-auto">
                  {/* Grid showing individual service fees */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 bg-brand-surface-bg p-4 rounded-xl border border-[#e7e8e9] flex-1">
                    {invoice.rent > 0 && (
                      <div className="flex flex-col">
                        <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">{lang === 'vi' ? 'Tiền nhà' : 'Rent'}</span>
                        <span className="text-sm font-semibold text-brand-primary font-mono mt-0.5">{formatCurrency(invoice.rent)}</span>
                      </div>
                    )}
                    {invoice.electricity > 0 && (
                      <div className="flex flex-col">
                        <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">{lang === 'vi' ? 'Điện' : 'Electricity'}</span>
                        <span className="text-sm font-semibold text-brand-primary font-mono mt-0.5">{formatCurrency(invoice.electricity)}</span>
                      </div>
                    )}
                    {invoice.water > 0 && (
                      <div className="flex flex-col">
                        <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">{lang === 'vi' ? 'Nước' : 'Water'}</span>
                        <span className="text-sm font-semibold text-brand-primary font-mono mt-0.5">{formatCurrency(invoice.water)}</span>
                      </div>
                    )}
                    {invoice.fee && invoice.fee > 0 ? (
                      <div className="flex flex-col">
                        <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">{lang === 'vi' ? 'Phí phạt' : 'Late Fee'}</span>
                        <span className="text-sm font-semibold text-[#ba1a1a] font-mono mt-0.5">{formatCurrency(invoice.fee)}</span>
                      </div>
                    ) : null}
                    
                    <div className="flex flex-col justify-center">
                      <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">{lang === 'vi' ? 'Tổng cộng' : 'Total'}</span>
                      <span className={`text-base font-extrabold font-mono mt-0.5 ${isOverdue ? 'text-[#ba1a1a]' : 'text-brand-primary'}`}>
                        {formatCurrency(invoice.total)}
                      </span>
                    </div>
                  </div>

                  {/* Button Action */}
                  <div className="shrink-0 flex items-center justify-center">
                    {isPaid ? (
                      <button 
                        onClick={() => onViewInvoiceDetails(invoice)}
                        className="w-full sm:w-auto bg-transparent hover:bg-brand-surface-bg text-brand-primary font-bold text-sm py-2.5 px-6 rounded-xl border border-[#c5c6cf] flex items-center justify-center gap-2 active:scale-95 transition-all"
                      >
                        <Eye className="w-4 h-4" />
                        <span>{lang === 'vi' ? 'Xem chi tiết' : 'View Details'}</span>
                      </button>
                    ) : (
                      <button 
                        onClick={() => onPayInvoice(invoice.id)}
                        className="w-full sm:w-auto bg-brand-primary hover:bg-brand-primary-container text-[#ffffff] font-bold text-sm py-2.5 px-6 rounded-xl shadow-sm flex items-center justify-center gap-1.5 active:scale-95 transition-all"
                      >
                        <DollarSign className="w-4 h-4" />
                        <span>{lang === 'vi' ? 'Thanh toán ngay' : 'Pay Now'}</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

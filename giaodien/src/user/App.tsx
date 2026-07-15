import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { initialRequests } from './data';
import { AvailableRoom, Invoice, MaintenanceRequest, ResidentContract, ResidentRoom, TenantNotification } from './types';
import Sidebar from './components/Sidebar';
import MobileNav from './components/MobileNav';
import Header from './components/Header';
import DashboardView from './components/DashboardView';
import InvoicesView from './components/InvoicesView';
import PaymentDetailsView from './components/PaymentDetailsView';
import MaintenanceView from './components/MaintenanceView';
import AmenitiesView from './components/AmenitiesView';
import DocumentsView from './components/DocumentsView';
import SettingsView from './components/SettingsView';
import SupportView from './components/SupportView';

interface ResidentPortalProps {
  currentUser?: {
    username: string;
    role: string;
  } | null;
  onLogout?: () => void;
}

const formatDate = (value?: string | null) => {
  if (!value) return '';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString('vi-VN');
};

const toInvoice = (row: any): Invoice => {
  const status = row.paymentStatus || row.status;
  return {
    backendId: Number(row.id),
    dueDate: formatDate(row.due_date) || `${row.month || ''}-10`,
    electricity: Number(row.electricityFee || 0),
    id: `INV-${row.id}`,
    month: row.month || '',
    other: Number(row.serviceFee || 0),
    paidDate: formatDate(row.paidAt),
    rent: Number(row.roomFee || 0),
    status: status === 'paid' ? 'Paid' : status === 'overdue' ? 'Overdue' : 'Pending',
    total: Number(row.totalAmount || row.total_amount || 0),
    water: Number(row.waterFee || 0),
  };
};

const toRoom = (row: any): ResidentRoom => ({
  area: Number(row.area || 0),
  basePrice: Number(row.price || row.base_price || 0),
  backendId: Number(row.id),
  electricityUsage: Number(row.electricity_usage || 0),
  floor: Number(row.floor || 0),
  roomNumber: row.name || row.room_number || '-',
  tower: row.tower || 'A',
  waterUsage: Number(row.water_usage || 0),
});

const toAvailableRoom = (row: any): AvailableRoom => ({
  area: Number(row.area || 0),
  floor: Number(row.floor || 0),
  id: Number(row.id),
  name: row.name || row.room_number,
  price: Number(row.price || row.base_price || 0),
  roomNumber: row.name || row.room_number || '-',
});

const toContract = (row: any): ResidentContract => ({
  deposit: Number(row.deposit_amount || 0),
  endDate: formatDate(row.end_date),
  id: `HD-${row.id}`,
  monthlyRent: Number(row.monthly_rent || 0),
  startDate: formatDate(row.start_date),
  status: row.status,
});

export default function App({ currentUser, onLogout }: ResidentPortalProps) {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [lang, setLang] = useState<'vi' | 'en'>('vi');
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [requests, setRequests] = useState<MaintenanceRequest[]>(initialRequests);
  const [notifications, setNotifications] = useState<TenantNotification[]>([]);
  const [residentRoom, setResidentRoom] = useState<ResidentRoom | null>(null);
  const [availableRooms, setAvailableRooms] = useState<AvailableRoom[]>([]);
  const [contracts, setContracts] = useState<ResidentContract[]>([]);
  const [dataError, setDataError] = useState('');
  const [dataLoading, setDataLoading] = useState(true);
  const [rentalMessage, setRentalMessage] = useState('');
  const [rentalSubmitting, setRentalSubmitting] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState('');
  const [selectedInvoiceToPay, setSelectedInvoiceToPay] = useState<Invoice | null>(null);

  const loadResidentData = async () => {
    setDataLoading(true);
    setDataError('');
    try {
      const roomOptions = await api.listAvailableRooms();
      setAvailableRooms(roomOptions.map(toAvailableRoom));

      const [roomRow, contractRows, invoiceRows] = await Promise.all([
        api.getMyRoom(),
        api.getMyContracts(),
        api.getMyInvoices(),
      ]);
      const mappedInvoices = invoiceRows.map(toInvoice);
      setResidentRoom({
        ...toRoom(roomRow),
        electricityUsage: Number(invoiceRows[0]?.electricityUsage || 0),
        waterUsage: Number(invoiceRows[0]?.waterUsage || 0),
      });
      setContracts(contractRows.map(toContract));
      setInvoices(mappedInvoices);
      setNotifications(mappedInvoices.filter((invoice) => invoice.status !== 'Paid').map((invoice) => ({
        description: `Vui lòng thanh toán trước hạn ${invoice.dueDate || 'gần nhất'}.`,
        id: `invoice-${invoice.id}`,
        isRead: false,
        time: invoice.dueDate || invoice.month,
        title: `Hóa đơn ${invoice.month} đã sẵn sàng`,
        type: 'invoice',
      })));
    } catch (error) {
      setResidentRoom(null);
      setContracts([]);
      setInvoices([]);
      setNotifications([]);
      const message = error instanceof Error ? error.message : '';
      setDataError(
        message.includes('Tenant account is required') || message.includes('Active rented room not found')
          ? 'Tài khoản này chưa được gắn với phòng nào. Bạn có thể chọn phòng trống để gửi yêu cầu thuê.'
          : message || 'Không tải được dữ liệu người dùng',
      );
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => {
    loadResidentData();
  }, []);

  // Quick action handles
  const handlePayInvoice = (invoiceId: string) => {
    const inv = invoices.find(i => i.id === invoiceId);
    if (inv) {
      setSelectedInvoiceToPay(inv);
    }
  };

  const handleConfirmPayment = async (invoiceId: string) => {
    const invoiceToPay = invoices.find(i => i.id === invoiceId);
    if (invoiceToPay?.backendId) {
      await api.payMyInvoice(invoiceToPay.backendId);
    }

    // 1. Mark invoice as Paid
    setInvoices(prev => prev.map(inv => {
      if (inv.id === invoiceId) {
        return {
          ...inv,
          status: 'Paid',
          paidDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        };
      }
      return inv;
    }));

    // 2. Add confirmation notification
    const paidInv = invoices.find(i => i.id === invoiceId);
    const newNotif: TenantNotification = {
      id: `n-${Math.random()}`,
      title: lang === 'vi' 
        ? `Đã nhận thanh toán ${paidInv?.month}` 
        : `Received payment for ${paidInv?.month}`,
      description: lang === 'vi' 
        ? `Cảm ơn bạn. Hóa đơn của bạn đã được thanh toán thành công và đang đối soát.` 
        : `Thank you. Your monthly statement has been successfully settled.`,
      type: 'invoice',
      time: new Date().toLocaleDateString('en-US'),
      isRead: false
    };
    setNotifications(prev => [newNotif, ...prev]);

    // 3. Clear checkout state and return to dashboard/payments
    setSelectedInvoiceToPay(null);
    setActiveTab('payments');
  };

  const handleRequestRoom = async () => {
    if (!selectedRoomId || rentalSubmitting) return;

    setRentalSubmitting(true);
    setRentalMessage('');
    try {
      await api.createRentalRequest({ roomId: Number(selectedRoomId) });
      setRentalMessage('Đã gửi yêu cầu thuê phòng cho admin duyệt.');
    } catch (error) {
      setRentalMessage(error instanceof Error ? error.message : 'Không gửi được yêu cầu thuê phòng');
    } finally {
      setRentalSubmitting(false);
    }
  };

  // Determine view title
  const getViewTitle = () => {
    if (selectedInvoiceToPay) {
      return lang === 'vi' ? 'Chi tiết thanh toán' : 'Payment Checkout';
    }

    switch (activeTab) {
      case 'dashboard':
        return lang === 'vi' ? 'Tổng quan cư dân' : 'Resident Dashboard';
      case 'payments':
        return lang === 'vi' ? 'Sổ hóa đơn' : 'Billing & Invoices';
      case 'maintenance':
        return lang === 'vi' ? 'Khai báo sự cố' : 'Maintenance Center';
      case 'amenities':
        return lang === 'vi' ? 'Đặt lịch tiện ích' : 'Amenities Booking';
      case 'documents':
        return lang === 'vi' ? 'Hợp đồng lưu trú' : 'Lease Agreement';
      case 'settings':
        return lang === 'vi' ? 'Cấu hình tài khoản' : 'Resident Profile';
      case 'support':
        return lang === 'vi' ? 'Tổng đài hỗ trợ' : 'Concierge Help';
      default:
        return 'Resident Portal';
    }
  };

  return (
    <div className="bg-[#ffffff] text-brand-primary font-sans antialiased min-h-screen transition-colors duration-200">
      
      {/* Sidebar - Desktop navigation panel */}
      {!selectedInvoiceToPay && (
        <Sidebar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          lang={lang} 
          onBookAmenityClick={() => setActiveTab('amenities')}
        />
      )}

      {/* Main canvas viewport */}
      <div className={`flex flex-col min-h-screen ${!selectedInvoiceToPay ? 'lg:pl-64' : ''}`}>
        
        {/* Header App Bar */}
        <Header 
          lang={lang} 
          setLang={setLang} 
          notifications={notifications}
          setNotifications={setNotifications}
          setActiveTab={setActiveTab}
          title={getViewTitle()}
          showSearch={activeTab === 'payments' && !selectedInvoiceToPay}
          currentUser={currentUser}
          onLogout={onLogout}
        />

        {/* Primary Page Content Wrapper */}
        <main className="flex-1 pt-24 pb-24 lg:pb-12 px-6 md:px-10">
          <div className="max-w-[1280px] mx-auto">
            {dataError && (
              <div className="mb-6 rounded-xl border border-[#ffdad6] bg-[#fff7f6] px-4 py-3 text-sm font-semibold text-[#93000a]">
                {dataError}
              </div>
            )}
            {selectedInvoiceToPay ? (
              <PaymentDetailsView 
                lang={lang} 
                invoice={selectedInvoiceToPay} 
                onBack={() => setSelectedInvoiceToPay(null)} 
                onConfirmPayment={handleConfirmPayment}
              />
            ) : (
              <>
                {activeTab === 'dashboard' && (
                  <DashboardView 
                    lang={lang} 
                    setActiveTab={setActiveTab} 
                    onPayInvoice={handlePayInvoice}
                    onRequestRoom={handleRequestRoom}
                    invoices={invoices}
                    notifications={notifications}
                    room={residentRoom}
                    availableRooms={availableRooms}
                    currentUserName={currentUser?.username}
                    loading={dataLoading}
                    rentalMessage={rentalMessage}
                    rentalSubmitting={rentalSubmitting}
                    selectedRoomId={selectedRoomId}
                    setSelectedRoomId={setSelectedRoomId}
                  />
                )}
                {activeTab === 'payments' && (
                  <InvoicesView 
                    lang={lang} 
                    invoices={invoices} 
                    onPayInvoice={handlePayInvoice}
                    onViewInvoiceDetails={(invoice) => setSelectedInvoiceToPay(invoice)}
                  />
                )}
                {activeTab === 'maintenance' && (
                  <MaintenanceView 
                    lang={lang} 
                    requests={requests} 
                    setRequests={setRequests}
                  />
                )}
                {activeTab === 'amenities' && (
                  <AmenitiesView lang={lang} />
                )}
                {activeTab === 'documents' && (
                  <DocumentsView lang={lang} room={residentRoom} contract={contracts[0]} />
                )}
                {activeTab === 'settings' && (
                  <SettingsView lang={lang} />
                )}
                {activeTab === 'support' && (
                  <SupportView lang={lang} />
                )}
              </>
            )}
          </div>
        </main>

        {/* Mobile Bottom Navigation Bar */}
        {!selectedInvoiceToPay && (
          <MobileNav 
            activeTab={activeTab} 
            setActiveTab={setActiveTab} 
            lang={lang} 
          />
        )}

      </div>

    </div>
  );
}

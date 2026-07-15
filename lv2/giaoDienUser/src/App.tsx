import React, { useState, useEffect } from 'react';
import { initialInvoices, initialRequests, initialNotifications } from './data';
import { Invoice, MaintenanceRequest, TenantNotification } from './types';
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

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [lang, setLang] = useState<'vi' | 'en'>('vi');
  const [invoices, setInvoices] = useState<Invoice[]>(initialInvoices);
  const [requests, setRequests] = useState<MaintenanceRequest[]>(initialRequests);
  const [notifications, setNotifications] = useState<TenantNotification[]>(initialNotifications);
  const [selectedInvoiceToPay, setSelectedInvoiceToPay] = useState<Invoice | null>(null);

  // Quick action handles
  const handlePayInvoice = (invoiceId: string) => {
    const inv = invoices.find(i => i.id === invoiceId);
    if (inv) {
      setSelectedInvoiceToPay(inv);
    }
  };

  const handleConfirmPayment = (invoiceId: string) => {
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
    <div className="bg-[#ffffff] dark:bg-[#121315] text-brand-primary dark:text-[#ffffff] font-sans antialiased min-h-screen transition-colors duration-200">
      
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
        />

        {/* Primary Page Content Wrapper */}
        <main className="flex-1 pt-24 pb-24 lg:pb-12 px-6 md:px-10">
          <div className="max-w-[1280px] mx-auto">
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
                    invoices={invoices}
                    notifications={notifications}
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
                  <DocumentsView lang={lang} />
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

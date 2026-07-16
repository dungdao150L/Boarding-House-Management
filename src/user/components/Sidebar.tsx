import React from 'react';
import { 
  LayoutDashboard, 
  CreditCard, 
  Wrench, 
  Calendar, 
  FileText, 
  Settings, 
  HelpCircle,
  Building2
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  lang: 'vi' | 'en';
  onBookAmenityClick: () => void;
}

export default function Sidebar({ activeTab, setActiveTab, lang, onBookAmenityClick }: SidebarProps) {
  const menuItems = [
    {
      id: 'dashboard',
      label: lang === 'vi' ? 'Tổng quan' : 'Dashboard',
      icon: LayoutDashboard,
    },
    {
      id: 'payments',
      label: lang === 'vi' ? 'Thanh toán' : 'Payments',
      icon: CreditCard,
    },
    {
      id: 'maintenance',
      label: lang === 'vi' ? 'Bảo trì' : 'Maintenance',
      icon: Wrench,
    },
    {
      id: 'amenities',
      label: lang === 'vi' ? 'Tiện ích' : 'Amenities',
      icon: Calendar,
    },
    {
      id: 'documents',
      label: lang === 'vi' ? 'Hợp đồng & Phòng' : 'Documents',
      icon: FileText,
    },
  ];

  return (
    <aside id="sidebar-panel" className="hidden lg:flex flex-col h-screen w-64 fixed left-0 top-0 bg-[#ffffff] border-r border-[#e7e8e9] py-6 px-4 z-40 transition-colors duration-200">
      {/* Brand Logo */}
      <div className="flex items-center gap-3 mb-10 px-2">
        <div className="w-10 h-10 rounded-xl bg-brand-primary flex items-center justify-center shadow-sm">
          <Building2 className="text-[#ffffff] w-5 h-5" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-brand-primary tracking-tight">LuxLiving</h1>
          <p className="text-xs text-on-surface-variant font-medium mt-0.5">Premium Resident Portal</p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 flex flex-col gap-1.5">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-150 active:scale-[0.98] ${
                isActive
                  ? 'border-l-4 border-brand-secondary-container bg-brand-surface-bg text-brand-primary font-bold'
                  : 'text-on-surface-variant hover:text-brand-primary hover:bg-[#f3f4f5]'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-brand-primary' : 'text-on-surface-variant'}`} />
              <span className="text-sm font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Action Footer */}
      <div className="mt-auto flex flex-col gap-4">
        <button 
          onClick={onBookAmenityClick}
          className="w-full bg-brand-primary text-[#ffffff] hover:bg-brand-primary-container py-3 rounded-xl font-semibold text-sm hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-md shadow-brand-primary/10"
        >
          <Calendar className="w-4 h-4" />
          <span>{lang === 'vi' ? 'Đặt tiện ích' : 'Book Amenity'}</span>
        </button>

        <div className="border-t border-[#e7e8e9] pt-4 flex flex-col gap-1.5">
          <button 
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-left text-sm font-medium transition-all duration-150 ${
              activeTab === 'settings'
                ? 'bg-brand-surface-bg text-brand-primary font-bold'
                : 'text-on-surface-variant hover:text-brand-primary hover:bg-[#f3f4f5]'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>{lang === 'vi' ? 'Cài đặt' : 'Settings'}</span>
          </button>
          <button 
            onClick={() => setActiveTab('support')}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-left text-sm font-medium transition-all duration-150 ${
              activeTab === 'support'
                ? 'bg-brand-surface-bg text-brand-primary font-bold'
                : 'text-on-surface-variant hover:text-brand-primary hover:bg-[#f3f4f5]'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>{lang === 'vi' ? 'Hỗ trợ' : 'Support'}</span>
          </button>
        </div>
      </div>
    </aside>
  );
}

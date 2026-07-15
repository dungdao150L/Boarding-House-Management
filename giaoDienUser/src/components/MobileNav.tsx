import React from 'react';
import { 
  Home, 
  Wallet, 
  Wrench, 
  Calendar,
  FileText
} from 'lucide-react';

interface MobileNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  lang: 'vi' | 'en';
}

export default function MobileNav({ activeTab, setActiveTab, lang }: MobileNavProps) {
  const navItems = [
    {
      id: 'dashboard',
      label: lang === 'vi' ? 'Trang chủ' : 'Home',
      icon: Home,
    },
    {
      id: 'payments',
      label: lang === 'vi' ? 'Thanh toán' : 'Pay',
      icon: Wallet,
    },
    {
      id: 'maintenance',
      label: lang === 'vi' ? 'Sửa chữa' : 'Fix',
      icon: Wrench,
    },
    {
      id: 'amenities',
      label: lang === 'vi' ? 'Đặt lịch' : 'Book',
      icon: Calendar,
    },
    {
      id: 'documents',
      label: lang === 'vi' ? 'Hồ sơ' : 'Docs',
      icon: FileText,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-2 py-2 pb-safe lg:hidden shadow-lg border-t border-[#e7e8e9] dark:border-[#2e3132] bg-[#ffffff] dark:bg-[#1c1d1f] rounded-t-xl transition-colors duration-200">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all duration-150 active:scale-90 ${
              isActive
                ? 'bg-brand-primary-container text-brand-secondary-container font-bold'
                : 'text-on-surface-variant hover:bg-brand-surface-bg'
            }`}
          >
            <Icon className="w-5 h-5" />
            <span className="text-[10px] font-medium mt-1 tracking-tight">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

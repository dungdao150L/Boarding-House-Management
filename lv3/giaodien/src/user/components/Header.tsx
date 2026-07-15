import React, { useState, useRef, useEffect } from 'react';
import { Bell, MessageSquare, Search, Languages, Check, LogOut } from 'lucide-react';
import { TenantNotification } from '../types';

interface HeaderProps {
  lang: 'vi' | 'en';
  setLang: (lang: 'vi' | 'en') => void;
  notifications: TenantNotification[];
  setNotifications: React.Dispatch<React.SetStateAction<TenantNotification[]>>;
  setActiveTab: (tab: string) => void;
  title?: string;
  showSearch?: boolean;
  onSearchChange?: (val: string) => void;
  currentUser?: {
    username: string;
    role: string;
  } | null;
  onLogout?: () => void;
}

export default function Header({ 
  lang, 
  setLang, 
  notifications, 
  setNotifications, 
  setActiveTab,
  title = "Resident Portal",
  showSearch = false,
  onSearchChange,
  currentUser,
  onLogout,
}: HeaderProps) {
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const langRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifDropdown(false);
      }
      if (langRef.current && !langRef.current.contains(event.target as Node)) {
        setShowLanguageDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const handleNotificationClick = (notif: TenantNotification) => {
    setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, isRead: true } : n));
    setShowNotifDropdown(false);
    if (notif.type === 'invoice') {
      setActiveTab('payments');
    } else {
      setActiveTab('dashboard');
    }
  };

  return (
    <header className="fixed top-0 right-0 w-full lg:pl-64 flex justify-between items-center h-16 px-6 md:px-10 bg-[#ffffff] border-b border-[#e7e8e9] z-30 transition-colors duration-200">
      {/* Title / Resident Portal */}
      <div className="font-bold text-lg text-brand-primary tracking-tight">
        {title}
      </div>

      <div className="flex items-center gap-4">
        {/* Optional Search */}
        {showSearch && (
          <div className="hidden md:flex items-center bg-[#f3f4f5] rounded-full px-4 py-2 border border-[#c5c6cf] focus-within:border-brand-primary focus-within:ring-1 focus-within:ring-brand-primary transition-all">
            <Search className="text-on-surface-variant w-4 h-4 mr-2" />
            <input 
              onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
              className="bg-transparent border-none focus:outline-none text-sm text-on-surface placeholder:text-on-surface-variant w-48" 
              placeholder={lang === 'vi' ? "Tìm kiếm hóa đơn..." : "Search invoices..."} 
              type="text"
            />
          </div>
        )}

        {/* Language Switcher */}
        <div ref={langRef} className="relative">
          <button 
            onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
            className="text-on-surface-variant hover:text-brand-primary p-2 rounded-full hover:bg-brand-surface-bg active:scale-95 transition-all flex items-center gap-1.5"
            title="Switch Language"
          >
            <Languages className="w-5 h-5" />
            <span className="text-xs font-semibold uppercase">{lang}</span>
          </button>
          
          {showLanguageDropdown && (
            <div className="absolute right-0 mt-2 w-40 bg-[#ffffff] rounded-xl shadow-lg border border-[#e7e8e9] py-1 z-50">
              <button 
                onClick={() => { setLang('vi'); setShowLanguageDropdown(false); }}
                className="w-full flex items-center justify-between px-4 py-2 text-sm hover:bg-[#f3f4f5] transition-colors"
              >
                <span className={lang === 'vi' ? 'font-bold text-brand-primary' : 'text-on-surface-variant'}>Tiếng Việt</span>
                {lang === 'vi' && <Check className="w-4 h-4 text-brand-secondary" />}
              </button>
              <button 
                onClick={() => { setLang('en'); setShowLanguageDropdown(false); }}
                className="w-full flex items-center justify-between px-4 py-2 text-sm hover:bg-[#f3f4f5] transition-colors"
              >
                <span className={lang === 'en' ? 'font-bold text-brand-primary' : 'text-on-surface-variant'}>English</span>
                {lang === 'en' && <Check className="w-4 h-4 text-brand-secondary" />}
              </button>
            </div>
          )}
        </div>

        {/* Notifications */}
        <div ref={notifRef} className="relative">
          <button 
            onClick={() => setShowNotifDropdown(!showNotifDropdown)}
            className="relative text-on-surface-variant hover:text-brand-primary p-2 rounded-full hover:bg-brand-surface-bg active:scale-95 transition-all"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#ba1a1a] rounded-full animate-pulse"></span>
            )}
          </button>

          {showNotifDropdown && (
            <div className="absolute right-0 mt-2 w-80 bg-[#ffffff] rounded-2xl shadow-xl border border-[#e7e8e9] overflow-hidden z-50">
              <div className="px-4 py-3 border-b border-[#e7e8e9] flex justify-between items-center">
                <span className="font-bold text-sm text-brand-primary">
                  {lang === 'vi' ? 'Thông báo' : 'Notifications'} ({unreadCount})
                </span>
                {unreadCount > 0 && (
                  <button 
                    onClick={markAllAsRead}
                    className="text-xs text-brand-secondary hover:underline font-semibold"
                  >
                    {lang === 'vi' ? 'Đọc tất cả' : 'Mark all read'}
                  </button>
                )}
              </div>
              <div className="max-h-72 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-xs text-on-surface-variant">
                    {lang === 'vi' ? 'Không có thông báo mới' : 'No new notifications'}
                  </div>
                ) : (
                  <div className="divide-y divide-[#e7e8e9]">
                    {notifications.map((notif) => (
                      <div 
                        key={notif.id}
                        onClick={() => handleNotificationClick(notif)}
                        className={`p-4 cursor-pointer hover:bg-[#f3f4f5] transition-colors ${!notif.isRead ? 'bg-brand-surface-bg' : ''}`}
                      >
                        <div className="flex items-start gap-2.5">
                          <div className={`mt-1.5 w-1.5 h-1.5 rounded-full ${notif.type === 'invoice' ? 'bg-brand-secondary' : 'bg-brand-primary'}`}></div>
                          <div className="flex-1">
                            <p className="text-xs font-semibold text-brand-primary">{notif.title}</p>
                            <p className="text-[11px] text-on-surface-variant mt-0.5 line-clamp-2">{notif.description}</p>
                            <span className="text-[10px] text-on-surface-variant mt-1.5 block font-mono">{notif.time}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Chat / Messages Button (Interactive Shortcut to maintenance/support) */}
        <button 
          onClick={() => setActiveTab('support')}
          className="text-on-surface-variant hover:text-brand-primary p-2 rounded-full hover:bg-brand-surface-bg active:scale-95 transition-all"
          title="Chat Support"
        >
          <MessageSquare className="w-5 h-5" />
        </button>

        {/* User Profile */}
        <div
          onClick={() => setActiveTab('settings')}
          className="flex items-center gap-2 border-l border-[#e7e8e9] pl-4 cursor-pointer hover:opacity-85 active:scale-95 transition-all"
        >
          <img 
            alt="User Profile" 
            className="w-8 h-8 rounded-full object-cover border border-[#c5c6cf]" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAog033nSNwzBH3h_F2xMQ3WpP3YC9mx7feECdQZOxWWrGqfWw6AZprlO517JFc-yaeizI1i9HiuVA9XZ-i15L4PoHpyR8y3KBdg7i1hZBg8TtLLz2FauGQQM8pLjRWJvScb6a8mXE4M4eJrDH7tqMlxquWwahR6ajXDXQbrE_KQ2370kkR-PXE9i5C8coffZ_HOC-QzMjTILsfXe9eRSrmmD2h34LTT9FsnMadcIRHXeE9Q-fpQFNHKq0ImXuli5o_M61qW7ZmIFgN"
          />
          <span className="hidden sm:inline text-xs font-bold text-brand-primary">{currentUser?.username || 'Nguyen Van A'}</span>
        </div>

        {onLogout && (
          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 rounded-full border border-[#e7e8e9] px-3 py-2 text-xs font-bold text-brand-primary hover:bg-brand-surface-bg active:scale-95 transition-all"
            title={lang === 'vi' ? 'Đăng xuất' : 'Logout'}
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">{lang === 'vi' ? 'Đăng xuất' : 'Logout'}</span>
          </button>
        )}
      </div>
    </header>
  );
}

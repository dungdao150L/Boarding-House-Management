import React, { useState } from 'react';
import { Settings, User, Bell, Shield, Lock, CheckCircle } from 'lucide-react';

interface SettingsViewProps {
  lang: 'vi' | 'en';
}

export default function SettingsView({ lang }: SettingsViewProps) {
  const [notifEmail, setNotifEmail] = useState(true);
  const [notifSms, setNotifSms] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-8 max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div>
        <h2 className="text-3xl font-bold text-brand-primary tracking-tight">
          {lang === 'vi' ? 'Cài đặt' : 'Account Settings'}
        </h2>
        <p className="text-on-surface-variant font-medium mt-2">
          {lang === 'vi' ? 'Cập nhật thông tin cá nhân và cấu hình thông báo.' : 'Manage your contact information, security preferences, and alerts.'}
        </p>
      </div>

      {saved && (
        <div className="p-4 bg-brand-secondary-container/20 border border-brand-secondary text-brand-secondary rounded-xl flex items-center gap-3 text-sm font-semibold animate-in fade-in duration-150">
          <CheckCircle className="w-5 h-5" />
          <span>{lang === 'vi' ? 'Đã lưu thay đổi thành công!' : 'Settings updated successfully!'}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="bg-[#ffffff] rounded-2xl p-6 md:p-8 shadow-[0px_4px_20px_rgba(26,43,75,0.05)] border border-[#e7e8e9] space-y-6">
        
        {/* Profile details */}
        <div>
          <h3 className="font-bold text-sm text-brand-primary uppercase tracking-wider mb-4 flex items-center gap-2">
            <User className="w-4 h-4" />
            {lang === 'vi' ? 'Thông tin cá nhân' : 'Personal Details'}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-on-surface-variant mb-1.5 uppercase tracking-wide">{lang === 'vi' ? 'Họ và tên' : 'Full Name'}</label>
              <input 
                type="text" 
                defaultValue="Nguyễn Văn A" 
                className="w-full bg-[#f3f4f5] border border-[#c5c6cf] rounded-xl px-4 py-2.5 text-sm font-semibold text-brand-primary focus:outline-none" 
                disabled 
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-on-surface-variant mb-1.5 uppercase tracking-wide">{lang === 'vi' ? 'Email cư dân' : 'Email Address'}</label>
              <input 
                type="email" 
                defaultValue="daotiendung110@gmail.com" 
                className="w-full bg-brand-surface-bg border border-[#c5c6cf] rounded-xl px-4 py-2.5 text-sm text-on-surface focus:border-brand-primary" 
              />
            </div>
          </div>
        </div>

        {/* Notifications toggles */}
        <div className="pt-6 border-t border-[#e7e8e9]">
          <h3 className="font-bold text-sm text-brand-primary uppercase tracking-wider mb-4 flex items-center gap-2">
            <Bell className="w-4 h-4" />
            {lang === 'vi' ? 'Nhận thông báo' : 'Notification Channels'}
          </h3>

          <div className="space-y-3">
            <label className="flex items-center justify-between cursor-pointer p-2 rounded-lg hover:bg-brand-surface-bg transition-all">
              <span className="text-xs font-semibold text-brand-primary">{lang === 'vi' ? 'Nhận thông báo qua Email' : 'Email Alerts (Invoices & System)'}</span>
              <input 
                type="checkbox" 
                checked={notifEmail} 
                onChange={(e) => setNotifEmail(e.target.checked)}
                className="rounded text-brand-primary focus:ring-brand-primary w-5 h-5 border-[#c5c6cf] cursor-pointer" 
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer p-2 rounded-lg hover:bg-brand-surface-bg transition-all">
              <span className="text-xs font-semibold text-brand-primary">{lang === 'vi' ? 'Gửi tin nhắn SMS khẩn cấp' : 'SMS Alerts (Urgent Alerts)'}</span>
              <input 
                type="checkbox" 
                checked={notifSms} 
                onChange={(e) => setNotifSms(e.target.checked)}
                className="rounded text-brand-primary focus:ring-brand-primary w-5 h-5 border-[#c5c6cf] cursor-pointer" 
              />
            </label>
          </div>
        </div>

        {/* Submit action buttons */}
        <div className="pt-6 border-t border-[#e7e8e9] flex justify-end">
          <button 
            type="submit"
            className="px-6 py-3 bg-brand-primary hover:bg-brand-primary-container text-[#ffffff] font-bold text-sm rounded-xl transition-all shadow-md active:scale-95"
          >
            {lang === 'vi' ? 'Lưu thay đổi' : 'Save Preferences'}
          </button>
        </div>

      </form>
    </div>
  );
}

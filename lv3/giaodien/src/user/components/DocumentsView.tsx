import React, { useState } from 'react';
import { 
  FileText, 
  Trash, 
  Wifi, 
  SquareParking, 
  Droplets,
  AlertTriangle,
  Download,
  Calendar,
  Layers,
  Users,
  CheckCircle,
  Hash,
  Sparkles
} from 'lucide-react';
import { ResidentContract, ResidentRoom } from '../types';

interface DocumentsViewProps {
  lang: 'vi' | 'en';
  room: ResidentRoom | null;
  contract?: ResidentContract;
}

export default function DocumentsView({ lang, room, contract }: DocumentsViewProps) {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = () => {
    setDownloading(true);
    setTimeout(() => {
      setDownloading(false);
      // Mock triggering a download
      alert(lang === 'vi' 
        ? 'Tải xuống hợp đồng (HD123.pdf) thành công!' 
        : 'Lease Agreement (HD123.pdf) downloaded successfully!'
      );
    }, 1500);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
      
      {/* Page Header */}
      <div>
        <h2 className="text-3xl font-bold text-brand-primary tracking-tight">
          {lang === 'vi' ? 'Phòng & Hợp đồng' : 'Lease & Documents'}
        </h2>
        <p className="text-on-surface-variant font-medium mt-2">
          {lang === 'vi' 
            ? 'Quản lý thông tin lưu trú và tài liệu pháp lý của bạn.' 
            : 'Manage your lease details, legal contracts, and residential documents.'
          }
        </p>
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Room Details Card (Span 8 on desktop) */}
        <div className="md:col-span-8 bg-[#ffffff] rounded-2xl shadow-[0px_4px_20px_rgba(26,43,75,0.05)] overflow-hidden border border-[#e7e8e9] flex flex-col justify-between group">
          
          {/* Hero Image Banner with overlay */}
          <div className="h-48 relative overflow-hidden">
            <div 
              className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105" 
              style={{ backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuBirLwBgFmrGbbfwB1AjxOdfczIjBxmygO0axa2RbUB0bCHngQpI6gLgnYe0GxzmQd0Qwf14GbVBld1CEF3dZZPdE9kyEeuhXzE-3geAtlDz1QHtFdf57ybmuaM8jmk0cEdbtDvlFvTSM1CHHG6VgsUuyWPT9JHq1ip3Qdrg2DVnQ_Si8vHvFuHc0sZzrkt7pBUkBgTA8uhjmM8IuWAJbOhdQaUu1meozee41Y5Ln5ntbt4-kZsfTOT9FCI-fODdG1TBdi7mtVSgYyt')` }}
            ></div>
            <div className="absolute inset-0 bg-gradient-to-t from-brand-primary/90 to-transparent"></div>
            
            <div className="absolute bottom-6 left-6 right-6 flex flex-col gap-2">
              <span className="px-3 py-1 bg-brand-secondary-container/90 text-brand-secondary rounded-full font-bold text-xs flex items-center gap-1 w-fit shadow-sm">
                <CheckCircle className="w-3.5 h-3.5" />
                {lang === 'vi' ? 'Đang thuê' : 'Active Lease'}
              </span>
              <h3 className="font-extrabold text-2xl text-[#ffffff]">
                {lang === 'vi'
                  ? `Phòng ${room?.roomNumber || '-'}`
                  : `Room ${room?.roomNumber || '-'}`}
              </h3>
            </div>
          </div>

          {/* Three columns metrics details info list */}
          <div className="p-6 grid grid-cols-3 gap-6 bg-[#ffffff]">
            <div className="flex flex-col gap-1">
              <span className="text-xs text-on-surface-variant font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-brand-primary" />
                {lang === 'vi' ? 'Diện tích' : 'Area'}
              </span>
              <span className="text-base font-extrabold text-brand-primary">{room?.area || 0} m²</span>
            </div>
            
            <div className="w-px bg-[#e7e8e9] self-stretch"></div>
            
            <div className="flex flex-col gap-1">
              <span className="text-xs text-on-surface-variant font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Users className="w-4 h-4 text-brand-primary" />
                {lang === 'vi' ? 'Sức chứa' : 'Max Capacity'}
              </span>
              <span className="text-base font-extrabold text-brand-primary">2 {lang === 'vi' ? 'Người lớn' : 'Adults'}</span>
            </div>
            
            <div className="w-px bg-[#e7e8e9] self-stretch"></div>
            
            <div className="flex flex-col gap-1">
              <span className="text-xs text-on-surface-variant font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-brand-primary" />
                {lang === 'vi' ? 'Bàn giao' : 'Furnishing'}
              </span>
              <span className="text-base font-extrabold text-brand-primary">
                {lang === 'vi' ? 'Full nội thất' : 'Fully Furnished'}
              </span>
            </div>
          </div>

        </div>

        {/* Services Icon Grid (Span 4 on desktop) */}
        <div className="md:col-span-4 bg-[#ffffff] rounded-2xl shadow-[0px_4px_20px_rgba(26,43,75,0.05)] p-6 border border-[#e7e8e9] flex flex-col justify-between">
          <h3 className="font-bold text-base text-brand-primary mb-4">
            {lang === 'vi' ? 'Dịch vụ đi kèm' : 'Included Services'}
          </h3>
          
          <div className="grid grid-cols-2 gap-4 flex-1">
            <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-brand-surface-bg border border-[#e7e8e9] hover:bg-[#ffffff] transition-all cursor-default text-center gap-1.5">
              <Wifi className="text-brand-secondary w-6 h-6" />
              <span className="text-xs font-bold text-brand-primary">{lang === 'vi' ? 'Wifi tốc độ cao' : 'High-speed Wifi'}</span>
            </div>
            
            <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-brand-surface-bg border border-[#e7e8e9] hover:bg-[#ffffff] transition-all cursor-default text-center gap-1.5">
              <Trash className="text-brand-secondary w-6 h-6" />
              <span className="text-xs font-bold text-brand-primary">{lang === 'vi' ? 'Thu gom rác' : 'Trash Collection'}</span>
            </div>
            
            <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-brand-surface-bg border border-[#e7e8e9] hover:bg-[#ffffff] transition-all cursor-default text-center gap-1.5">
              <SquareParking className="text-brand-secondary w-6 h-6" />
              <span className="text-xs font-bold text-brand-primary">{lang === 'vi' ? 'Giữ xe máy' : 'Moto Parking'}</span>
            </div>
            
            <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-brand-surface-bg border border-[#e7e8e9] hover:bg-[#ffffff] transition-all cursor-default text-center gap-1.5 opacity-60">
              <Droplets className="text-on-surface-variant w-6 h-6" />
              <span className="text-xs font-bold text-on-surface-variant">{lang === 'vi' ? 'Nước sinh hoạt' : 'Domestic Water'}</span>
            </div>
          </div>
        </div>

        {/* Contract Details Card (Span 12) */}
        <div className="md:col-span-12 bg-[#ffffff] rounded-2xl shadow-[0px_4px_20px_rgba(26,43,75,0.05)] border border-[#e7e8e9] overflow-hidden flex flex-col">
          
          {/* Expiration Warning Banner */}
          <div className="bg-[#ffdad6] px-6 py-4 flex items-start sm:items-center gap-3 border-b border-[#ffdad6]">
            <AlertTriangle className="text-[#93000a] w-5 h-5 shrink-0 mt-0.5 sm:mt-0" />
            <div className="flex-1">
              <p className="text-xs font-bold text-[#93000a]">
                {lang === 'vi' ? 'Hợp đồng sắp hết hạn' : 'Lease Expiring Soon'}
              </p>
              <p className="text-xs text-[#93000a] opacity-90 mt-1">
                {lang === 'vi' 
                  ? 'Hợp đồng thuê căn hộ của bạn sẽ kết thúc sau chưa đầy 30 ngày. Vui lòng liên hệ ban quản lý để gia hạn.' 
                  : 'Your current lease agreement is set to expire in less than 30 days. Please reach out to extend.'
                }
              </p>
            </div>
          </div>

          {/* Contract Metadata Specifications */}
          <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-6">
              
              <div className="flex flex-col gap-1.5">
                <span className="text-xs text-on-surface-variant font-bold uppercase tracking-wider">
                  {lang === 'vi' ? 'Mã hợp đồng' : 'Contract ID'}
                </span>
                <div className="flex items-center gap-1.5 bg-brand-surface-bg w-fit px-3 py-1 rounded-lg border border-[#e7e8e9]">
                  <Hash className="w-3.5 h-3.5 text-on-surface-variant" />
                  <span className="text-xs font-bold text-brand-primary font-mono">{contract?.id || '-'}</span>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <span className="text-xs text-on-surface-variant font-bold uppercase tracking-wider">
                  {lang === 'vi' ? 'Ngày bắt đầu' : 'Start Date'}
                </span>
                <div className="flex items-center gap-2 text-sm text-brand-primary font-semibold">
                  <Calendar className="w-4 h-4 text-brand-primary" />
                  <span className="font-mono">{contract?.startDate || '-'}</span>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <span className="text-xs text-on-surface-variant font-bold uppercase tracking-wider">
                  {lang === 'vi' ? 'Ngày kết thúc' : 'End Date'}
                </span>
                <div className="flex items-center gap-2 text-sm text-[#ba1a1a] font-semibold">
                  <Calendar className="w-4 h-4 text-[#ba1a1a]" />
                  <span className="font-mono">{contract?.endDate || '-'}</span>
                </div>
              </div>

            </div>

            {/* Download lease button */}
            <div className="flex-shrink-0 border-t md:border-t-0 md:border-l border-[#e7e8e9] pt-6 md:pt-0 md:pl-8 flex flex-col justify-center">
              <button 
                onClick={handleDownload}
                disabled={downloading}
                className="bg-transparent border border-brand-secondary text-brand-secondary hover:bg-brand-secondary/5 font-bold text-sm py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
              >
                <Download className={`w-4 h-4 ${downloading ? 'animate-bounce' : ''}`} />
                <span>{downloading ? (lang === 'vi' ? 'Đang tải...' : 'Downloading...') : (lang === 'vi' ? 'Tải file hợp đồng' : 'Download Contract PDF')}</span>
              </button>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}

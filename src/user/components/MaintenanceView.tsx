import React, { useState } from 'react';
import { 
  Wrench, 
  ChevronDown, 
  Image, 
  Check, 
  Clock, 
  Plus, 
  Trash2,
  Info,
  CheckCircle,
  FileText,
  AlertTriangle,
  Upload,
  ArrowRight
} from 'lucide-react';
import { MaintenanceRequest, PriorityLevel, RequestStatus } from '../types';

interface MaintenanceViewProps {
  lang: 'vi' | 'en';
  requests: MaintenanceRequest[];
  setRequests: React.Dispatch<React.SetStateAction<MaintenanceRequest[]>>;
}

export default function MaintenanceView({ lang, requests, setRequests }: MaintenanceViewProps) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [priority, setPriority] = useState<PriorityLevel>('Medium');
  const [description, setDescription] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [showAllHistory, setShowAllHistory] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Hardcoded mockup images of repairs for quick-click previews
  const mockImages = [
    'https://images.unsplash.com/photo-1581094288338-2314dddb7eed?auto=format&fit=crop&q=80&w=300',
    'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&q=80&w=300',
  ];

  const handleAddMockPhoto = (url: string) => {
    if (photos.includes(url)) return;
    setPhotos(prev => [...prev, url]);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Mock upload a local file
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const objectUrl = URL.createObjectURL(file);
      setPhotos(prev => [...prev, objectUrl]);
    }
  };

  const handleRemovePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !category || !description.trim()) return;

    const newRequest: MaintenanceRequest = {
      id: `MR-${Math.floor(1000 + Math.random() * 9000)}`,
      title,
      category,
      priority,
      description,
      submittedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      status: 'Submitted',
      photos,
      updates: [
        {
          title: lang === 'vi' ? 'Đã gửi yêu cầu' : 'Request Submitted',
          time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          description: lang === 'vi' ? 'Đang chờ Ban quản lý phân công kỹ thuật viên' : 'Awaiting technician assignment'
        }
      ]
    };

    setRequests(prev => [newRequest, ...prev]);
    
    // Clear form
    setTitle('');
    setCategory('');
    setPriority('Medium');
    setDescription('');
    setPhotos([]);
    setSubmitSuccess(true);
    setTimeout(() => setSubmitSuccess(false), 4000);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
      
      {/* Title */}
      <div className="mb-4">
        <h2 className="text-3xl font-bold text-brand-primary tracking-tight">
          {lang === 'vi' ? 'Yêu cầu sửa chữa' : 'Request Maintenance'}
        </h2>
        <p className="text-on-surface-variant font-medium mt-2">
          {lang === 'vi' 
            ? 'Báo cáo sự cố thiết bị hoặc hạ tầng để ban kỹ thuật nhanh chóng xử lý.' 
            : 'Submit an issue and our team will attend to it promptly.'
          }
        </p>
      </div>

      <div className="w-full flex flex-col lg:flex-row gap-8">
        
        {/* Left Column: Form Card */}
        <div className="w-full lg:w-7/12 xl:w-2/3">
          <div className="bg-[#ffffff] rounded-2xl p-6 md:p-8 shadow-[0px_4px_20px_rgba(26,43,75,0.05)] border border-[#e7e8e9]">
            
            {submitSuccess && (
              <div className="mb-6 p-4 bg-brand-secondary-container/20 border border-brand-secondary text-brand-secondary rounded-xl flex items-center gap-3 text-sm font-semibold animate-in fade-in duration-150">
                <CheckCircle className="w-5 h-5" />
                <span>{lang === 'vi' ? 'Đã gửi yêu cầu thành công!' : 'Maintenance request submitted successfully!'}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-bold text-brand-primary mb-2" htmlFor="title">
                  {lang === 'vi' ? 'Tiêu đề sự cố' : 'Issue Title'}
                </label>
                <input 
                  id="title"
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-brand-surface-bg border border-[#c5c6cf] focus:border-brand-primary focus:ring-1 focus:ring-brand-primary rounded-xl px-4 py-3 text-sm text-on-surface transition-all placeholder:text-on-surface-variant"
                  placeholder={lang === 'vi' ? "Ví dụ: Rò rỉ vòi nước trong bếp" : "e.g. Leaking faucet in kitchen"}
                />
              </div>

              {/* Grid Category & Priority */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Category */}
                <div>
                  <label className="block text-sm font-bold text-brand-primary mb-2" htmlFor="category">
                    {lang === 'vi' ? 'Danh mục sự cố' : 'Category'}
                  </label>
                  <div className="relative">
                    <select 
                      id="category"
                      required
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="appearance-none w-full bg-brand-surface-bg border border-[#c5c6cf] focus:border-brand-primary focus:ring-1 focus:ring-brand-primary rounded-xl px-4 py-3 text-sm text-on-surface cursor-pointer pr-10"
                    >
                      <option value="" disabled>{lang === 'vi' ? 'Chọn loại sự cố' : 'Select issue type'}</option>
                      <option value="Plumbing">{lang === 'vi' ? 'Đường nước / Plumbing' : 'Plumbing'}</option>
                      <option value="Electrical">{lang === 'vi' ? 'Hệ thống điện / Electrical' : 'Electrical'}</option>
                      <option value="Appliances">{lang === 'vi' ? 'Thiết bị gia dụng / Appliances' : 'Appliances'}</option>
                      <option value="HVAC / AC">{lang === 'vi' ? 'Hệ thống lạnh HVAC / AC' : 'HVAC / AC'}</option>
                      <option value="General">{lang === 'vi' ? 'Sửa chữa tổng hợp / General' : 'General Maintenance'}</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant w-4 h-4 pointer-events-none" />
                  </div>
                </div>

                {/* Priority */}
                <div>
                  <label className="block text-sm font-bold text-brand-primary mb-2" htmlFor="priority">
                    {lang === 'vi' ? 'Mức độ ưu tiên' : 'Priority Level'}
                  </label>
                  <div className="relative">
                    <select 
                      id="priority"
                      value={priority}
                      onChange={(e) => setPriority(e.target.value as PriorityLevel)}
                      className="appearance-none w-full bg-brand-surface-bg border border-[#c5c6cf] focus:border-brand-primary focus:ring-1 focus:ring-brand-primary rounded-xl px-4 py-3 text-sm text-on-surface cursor-pointer pr-10"
                    >
                      <option value="Low">{lang === 'vi' ? 'Thấp - Định kỳ sửa' : 'Low - Routine'}</option>
                      <option value="Medium">{lang === 'vi' ? 'Trung bình - Cần sửa sớm' : 'Medium - Needs attention soon'}</option>
                      <option value="High">{lang === 'vi' ? 'Cao - Khẩn cấp' : 'High - Urgent (e.g. active leak)'}</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant w-4 h-4 pointer-events-none" />
                  </div>
                </div>

              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-bold text-brand-primary mb-2" htmlFor="description">
                  {lang === 'vi' ? 'Mô tả chi tiết' : 'Detailed Description'}
                </label>
                <textarea 
                  id="description"
                  required
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-brand-surface-bg border border-[#c5c6cf] focus:border-brand-primary focus:ring-1 focus:ring-brand-primary rounded-xl px-4 py-3 text-sm text-on-surface transition-all placeholder:text-on-surface-variant resize-none"
                  placeholder={lang === 'vi' ? "Vui lòng mô tả chi tiết vị trí và biểu hiện sự cố..." : "Please provide as much detail as possible..."}
                />
              </div>

              {/* Photo Upload Area */}
              <div>
                <label className="block text-sm font-bold text-brand-primary mb-2">
                  {lang === 'vi' ? 'Đính kèm hình ảnh (Không bắt buộc)' : 'Attach Photos (Optional)'}
                </label>
                
                <div className="border-2 border-dashed border-[#c5c6cf] hover:border-brand-primary transition-all rounded-2xl p-6 text-center cursor-pointer bg-brand-surface-bg group relative">
                  <input 
                    type="file" 
                    id="photo-file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="flex flex-col items-center justify-center gap-1.5">
                    <Upload className="w-8 h-8 text-on-surface-variant group-hover:text-brand-primary transition-colors" />
                    <span className="text-xs font-bold text-brand-primary">
                      {lang === 'vi' ? 'Tải ảnh lên' : 'Upload a file'}
                      <span className="text-on-surface-variant font-medium"> {lang === 'vi' ? 'hoặc kéo thả vào đây' : 'or drag and drop'}</span>
                    </span>
                    <span className="text-[10px] text-on-surface-variant">PNG, JPG, GIF up to 10MB</span>
                  </div>
                </div>

                {/* Pre-suggested quick mockup photos for testing */}
                <div className="mt-3 flex items-center gap-3">
                  <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">{lang === 'vi' ? 'Thêm nhanh ảnh mẫu:' : 'Quick add mock photo:'}</span>
                  <div className="flex gap-2">
                    {mockImages.map((img, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleAddMockPhoto(img)}
                        className="text-[10px] font-semibold bg-brand-secondary-container/15 text-brand-secondary hover:bg-brand-secondary-container/30 px-2 py-1 rounded border border-brand-secondary/20 transition-all active:scale-95"
                      >
                        {lang === 'vi' ? `Mẫu ${idx + 1}` : `Mock ${idx + 1}`}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Photos Previews list */}
                {photos.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-3">
                    {photos.map((url, index) => (
                      <div key={index} className="relative w-16 h-16 rounded-xl border border-[#e7e8e9] overflow-hidden group">
                        <img src={url} alt="Uploaded" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => handleRemovePhoto(index)}
                          className="absolute inset-0 bg-[#ba1a1a]/80 text-[#ffffff] opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                          title="Remove photo"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-[#e7e8e9] flex justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => {
                    setTitle('');
                    setCategory('');
                    setPriority('Medium');
                    setDescription('');
                    setPhotos([]);
                  }}
                  className="px-5 py-3 text-sm font-semibold text-brand-primary hover:bg-brand-surface-bg rounded-xl transition-all"
                >
                  {lang === 'vi' ? 'Hủy' : 'Cancel'}
                </button>
                <button 
                  type="submit"
                  className="px-7 py-3 bg-brand-primary hover:bg-brand-primary-container text-[#ffffff] font-bold text-sm rounded-xl shadow-md active:scale-95 transition-all"
                >
                  {lang === 'vi' ? 'Gửi yêu cầu' : 'Submit Request'}
                </button>
              </div>

            </form>

          </div>
        </div>

        {/* Right Column: Active Requests timelines list */}
        <div className="w-full lg:w-5/12 xl:w-1/3 flex flex-col gap-6">
          <h3 className="font-bold text-lg text-brand-primary tracking-tight">
            {lang === 'vi' ? 'Yêu cầu đang xử lý' : 'Active Requests'}
          </h3>

          <div className="space-y-6">
            {requests.map((request) => {
              const isNew = request.status === 'Submitted';
              const isInProgress = request.status === 'In Progress';
              const isCompleted = request.status === 'Completed';

              return (
                <div 
                  key={request.id}
                  className="bg-[#ffffff] rounded-2xl p-6 shadow-[0px_4px_20px_rgba(26,43,75,0.05)] border border-[#e7e8e9] relative overflow-hidden"
                >
                  {/* Vertical left indicator line matching design */}
                  <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                    isNew ? 'bg-[#c5c6cf]' : isInProgress ? 'bg-brand-secondary-container' : 'bg-[#2e7d32]'
                  }`}></div>

                  <div className="flex justify-between items-start mb-4 gap-2">
                    <div>
                      <h4 className="font-bold text-brand-primary text-base leading-snug">{request.title}</h4>
                      <p className="text-[11px] text-on-surface-variant font-mono mt-1">
                        Req #{request.id} • {lang === 'vi' ? 'Gửi' : 'Submitted'} {request.submittedAt}
                      </p>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      isNew 
                        ? 'bg-brand-surface-bg text-on-surface-variant' 
                        : isInProgress 
                          ? 'bg-brand-secondary-container text-brand-secondary' 
                          : 'bg-[#a3f69c] text-[#002204]'
                    }`}>
                      {lang === 'vi'
                        ? isNew ? 'Mới gửi' : isInProgress ? 'Đang sửa' : 'Hoàn thành'
                        : request.status
                      }
                    </span>
                  </div>

                  {/* Interactive Details expanded descriptions */}
                  <div className="text-xs text-on-surface-variant leading-relaxed bg-brand-surface-bg p-3 rounded-lg border border-[#e7e8e9] mb-4">
                    <p className="font-bold text-brand-primary mb-1">{lang === 'vi' ? 'Mô tả:' : 'Description:'}</p>
                    <p>{request.description}</p>
                  </div>

                  {/* Timeline representation matching design */}
                  <div className="relative pl-7 mt-6 space-y-6">
                    {/* Running timeline track line */}
                    <div className="absolute top-1.5 left-2.5 bottom-1 w-0.5 bg-[#e7e8e9]"></div>

                    {request.updates.map((up, idx) => (
                      <div key={idx} className="relative">
                        {/* Bullet point indicator */}
                        <div className="absolute -left-7 top-1.5 w-5 h-5 rounded-full bg-brand-secondary-container text-brand-secondary flex items-center justify-center shadow-sm border border-[#ffffff] z-10">
                          {idx === 0 ? (
                            <Check className="w-3 h-3 text-brand-secondary" />
                          ) : (
                            <div className="w-1.5 h-1.5 rounded-full bg-brand-secondary"></div>
                          )}
                        </div>

                        <div>
                          <p className="text-xs font-bold text-brand-primary">{up.title}</p>
                          <p className="text-[10px] text-on-surface-variant mt-0.5">{up.time}</p>
                          {up.description && (
                            <p className="text-[11px] text-on-surface-variant mt-1 italic font-medium">{up.description}</p>
                          )}
                        </div>
                      </div>
                    ))}

                    {/* Pending state details if not completed */}
                    {!isCompleted && (
                      <div className="relative opacity-60">
                        <div className="absolute -left-7 top-1 w-5 h-5 rounded-full bg-[#f3f4f5] border border-[#c5c6cf] flex items-center justify-center z-10">
                          <Clock className="w-3 h-3 text-on-surface-variant" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-on-surface-variant">
                            {lang === 'vi' ? 'Hoàn thành bàn giao' : 'Completed'}
                          </p>
                          <p className="text-[11px] text-on-surface-variant italic mt-0.5">
                            {lang === 'vi' ? 'Chưa thực hiện' : 'Pending inspection'}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <button 
            onClick={() => setShowAllHistory(!showAllHistory)}
            className="w-full py-3.5 text-brand-primary hover:text-brand-primary-container font-bold text-sm border border-[#c5c6cf] hover:border-brand-primary rounded-xl transition-all flex items-center justify-center gap-1.5 active:scale-95 bg-[#ffffff] shadow-sm"
          >
            <span>{lang === 'vi' ? 'Xem toàn bộ lịch sử' : 'View All History'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>

    </div>
  );
}

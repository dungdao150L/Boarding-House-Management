import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  Users, 
  ShieldCheck, 
  Info, 
  CheckCircle, 
  X, 
  Trash2,
  ChevronRight,
  ArrowRight
} from 'lucide-react';
import { amenities } from '../data';
import { Amenity, AmenityBooking } from '../types';

interface AmenitiesViewProps {
  lang: 'vi' | 'en';
}

export default function AmenitiesView({ lang }: AmenitiesViewProps) {
  const [selectedAmenity, setSelectedAmenity] = useState<Amenity | null>(null);
  const [date, setDate] = useState('');
  const [timeSlot, setTimeSlot] = useState('');
  const [bookings, setBookings] = useState<AmenityBooking[]>([
    {
      id: 'b-1',
      amenityId: 'gym',
      amenityName: lang === 'vi' ? 'Phòng Gym Cao Cấp' : 'Premium Fitness Center',
      date: new Date().toLocaleDateString('en-US'),
      timeSlot: '18:00 - 20:00',
      status: 'Confirmed'
    }
  ]);
  const [successMsg, setSuccessMsg] = useState(false);

  const timeSlots = [
    '08:00 - 10:00',
    '10:00 - 12:00',
    '14:00 - 16:00',
    '16:00 - 18:00',
    '18:00 - 20:00',
  ];

  const handleBook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAmenity || !date || !timeSlot) return;

    const newBooking: AmenityBooking = {
      id: `b-${Math.floor(1000 + Math.random() * 9000)}`,
      amenityId: selectedAmenity.id,
      amenityName: selectedAmenity.name,
      date,
      timeSlot,
      status: 'Confirmed'
    };

    setBookings(prev => [newBooking, ...prev]);
    setDate('');
    setTimeSlot('');
    setSelectedAmenity(null);
    setSuccessMsg(true);
    setTimeout(() => setSuccessMsg(false), 4000);
  };

  const handleCancelBooking = (id: string) => {
    setBookings(prev => prev.filter(b => b.id !== id));
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
      
      {/* Page Header */}
      <div>
        <h2 className="text-3xl font-bold text-brand-primary tracking-tight">
          {lang === 'vi' ? 'Tiện ích tòa nhà' : 'Building Amenities'}
        </h2>
        <p className="text-on-surface-variant font-medium mt-2">
          {lang === 'vi' 
            ? 'Đăng ký đặt trước hồ bơi, phòng gym, lò nướng BBQ hoặc phòng hội nghị.' 
            : 'Reserve premium community amenities for your personal or guest use.'
          }
        </p>
      </div>

      {successMsg && (
        <div className="p-4 bg-brand-secondary-container/20 border border-brand-secondary text-brand-secondary rounded-xl flex items-center gap-3 text-sm font-semibold animate-in fade-in duration-150 shadow-sm">
          <CheckCircle className="w-5 h-5" />
          <span>{lang === 'vi' ? 'Đã đăng ký đặt tiện ích thành công!' : 'Amenity reserved successfully!'}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Amenities List */}
        <div className="lg:col-span-8 space-y-6">
          <h3 className="font-bold text-lg text-brand-primary">
            {lang === 'vi' ? 'Danh sách tiện ích' : 'Available Amenities'}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {amenities.map((amenity) => (
              <div 
                key={amenity.id}
                onClick={() => setSelectedAmenity(amenity)}
                className={`bg-[#ffffff] rounded-2xl overflow-hidden border transition-all cursor-pointer group shadow-sm flex flex-col justify-between ${
                  selectedAmenity?.id === amenity.id 
                    ? 'border-brand-primary ring-2 ring-brand-primary/10 scale-[1.01]' 
                    : 'border-[#e7e8e9] hover:border-[#c5c6cf] hover:scale-[1.005]'
                }`}
              >
                {/* Image Banner */}
                <div className="h-40 overflow-hidden relative">
                  <img 
                    src={amenity.image} 
                    alt={amenity.name} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent"></div>
                  <h4 className="absolute bottom-4 left-4 font-bold text-lg text-[#ffffff]">{amenity.name}</h4>
                </div>

                {/* Info area */}
                <div className="p-5 flex-1 flex flex-col justify-between gap-4">
                  <div>
                    <p className="text-xs text-on-surface-variant leading-relaxed line-clamp-2 mb-3">
                      {amenity.description}
                    </p>
                    <div className="flex flex-wrap gap-2 text-xs text-brand-primary font-semibold">
                      <span className="bg-brand-surface-bg border border-[#e7e8e9] px-2 py-1 rounded-lg flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5" />
                        {amenity.capacity}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-end items-center border-t border-[#e7e8e9] pt-3 text-xs font-bold text-brand-primary group-hover:text-brand-secondary transition-colors gap-1">
                    <span>{lang === 'vi' ? 'Đăng ký đặt chỗ' : 'Book Session'}</span>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Active booking / My bookings summary */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Active booking form panel */}
          {selectedAmenity ? (
            <div className="bg-[#ffffff] rounded-2xl p-6 shadow-md border border-brand-primary animate-in zoom-in-95 duration-150">
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-bold text-lg text-brand-primary">
                  {lang === 'vi' ? 'Đặt tiện ích' : 'Reserve Amenity'}
                </h3>
                <button onClick={() => setSelectedAmenity(null)} className="p-1 rounded-full hover:bg-brand-surface-bg text-on-surface-variant">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="text-sm font-bold text-brand-secondary mb-5 pb-3 border-b border-[#e7e8e9]">
                {selectedAmenity.name}
              </div>

              <form onSubmit={handleBook} className="space-y-4">
                {/* Date Selection */}
                <div>
                  <label className="block text-xs font-bold text-brand-primary uppercase tracking-wider mb-2">
                    {lang === 'vi' ? 'Chọn ngày' : 'Select Date'}
                  </label>
                  <input 
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-brand-surface-bg border border-[#c5c6cf] focus:border-brand-primary focus:ring-1 focus:ring-brand-primary rounded-xl px-4 py-2.5 text-sm font-semibold"
                  />
                </div>

                {/* Time Slot Selection */}
                <div>
                  <label className="block text-xs font-bold text-brand-primary uppercase tracking-wider mb-2">
                    {lang === 'vi' ? 'Chọn khung giờ' : 'Select Time Slot'}
                  </label>
                  <div className="relative">
                    <select
                      required
                      value={timeSlot}
                      onChange={(e) => setTimeSlot(e.target.value)}
                      className="appearance-none w-full bg-brand-surface-bg border border-[#c5c6cf] focus:border-brand-primary focus:ring-1 focus:ring-brand-primary rounded-xl px-4 py-2.5 text-sm font-medium cursor-pointer pr-10"
                    >
                      <option value="" disabled>{lang === 'vi' ? 'Khung giờ trống' : 'Select slot'}</option>
                      {timeSlots.map(slot => (
                        <option key={slot} value={slot}>{slot}</option>
                      ))}
                    </select>
                    <Clock className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant w-4 h-4 pointer-events-none" />
                  </div>
                </div>

                <div className="bg-brand-secondary-container/10 border border-brand-secondary-container/30 p-3 rounded-xl flex items-start gap-2 text-xs text-brand-secondary mt-4">
                  <ShieldCheck className="w-4.5 h-4.5 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">{lang === 'vi' ? 'Nội quy sử dụng:' : 'Usage Rules:'}</p>
                    <p className="mt-1 font-medium leading-relaxed">{selectedAmenity.rules}</p>
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full bg-brand-primary hover:bg-brand-primary-container text-[#ffffff] font-bold py-3 rounded-xl text-sm transition-all shadow-md shadow-brand-primary/10 mt-5 active:scale-95"
                >
                  {lang === 'vi' ? 'Xác nhận đặt lịch' : 'Confirm Reservation'}
                </button>
              </form>
            </div>
          ) : (
            <div className="bg-[#ffffff] rounded-2xl p-6 border border-[#e7e8e9] text-center shadow-sm">
              <Calendar className="w-10 h-10 text-on-surface-variant mx-auto mb-3" />
              <p className="text-xs font-semibold text-brand-primary">
                {lang === 'vi' ? 'Chọn tiện ích bên trái để đăng ký đặt chỗ.' : 'Click any amenity on the left to start a booking.'}
              </p>
            </div>
          )}

          {/* My Bookings Summaries list */}
          <div className="bg-[#ffffff] rounded-2xl p-6 shadow-sm border border-[#e7e8e9]">
            <h3 className="font-bold text-sm text-brand-primary mb-4 border-b border-[#e7e8e9] pb-3 uppercase tracking-wider">
              {lang === 'vi' ? 'Lịch đặt của tôi' : 'My Reservations'}
            </h3>

            {bookings.length === 0 ? (
              <p className="text-xs text-on-surface-variant font-medium text-center py-4">
                {lang === 'vi' ? 'Chưa có lịch đăng ký nào.' : 'You have no reservations scheduled.'}
              </p>
            ) : (
              <div className="space-y-4">
                {bookings.map((b) => (
                  <div key={b.id} className="p-3 bg-brand-surface-bg rounded-xl border border-[#e7e8e9] flex justify-between items-center gap-2">
                    <div className="min-w-0">
                      <p className="font-bold text-xs text-brand-primary truncate">{b.amenityName}</p>
                      <div className="flex flex-col gap-0.5 mt-1 text-[10px] text-on-surface-variant font-mono">
                        <span>{b.date}</span>
                        <span className="font-bold text-brand-secondary">{b.timeSlot}</span>
                      </div>
                    </div>

                    <button 
                      onClick={() => handleCancelBooking(b.id)}
                      className="text-[#ba1a1a] hover:bg-[#ffdad6] p-1.5 rounded-lg transition-all active:scale-90"
                      title={lang === 'vi' ? 'Hủy đặt lịch' : 'Cancel booking'}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}

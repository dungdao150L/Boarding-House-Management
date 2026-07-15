import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Copy, 
  Check, 
  CheckCircle2, 
  AlertTriangle, 
  QrCode, 
  Camera, 
  X,
  CreditCard
} from 'lucide-react';
import { Invoice } from '../types';

interface PaymentDetailsViewProps {
  lang: 'vi' | 'en';
  invoice: Invoice;
  onBack: () => void;
  onConfirmPayment: (invoiceId: string) => void;
}

export default function PaymentDetailsView({ lang, invoice, onBack, onConfirmPayment }: PaymentDetailsViewProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  // Hardcoded Vietnamese banking details matching Image 5
  const bankName = "Vietcombank";
  const accountNumber = "12345678";
  const accountHolder = "BAN QUAN LY LUXLIVING";
  const transferContent = `${invoice.id} ${invoice.month}`.toUpperCase();

  const managementFee = invoice.rent;
  const electricityFee = invoice.electricity;
  const waterFee = invoice.water;
  const parkingFee = 0;
  const otherFee = invoice.other || invoice.fee || 0;
  const totalAmountVnd = invoice.total;

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleConfirm = () => {
    setIsSuccessModalOpen(true);
  };

  const closeSuccessAndConfirm = () => {
    setIsSuccessModalOpen(false);
    onConfirmPayment(invoice.id);
  };

  return (
    <div className="min-h-screen bg-[#ffffff] flex flex-col -mt-8 -mx-6 md:-mx-10 animate-in fade-in duration-200">
      
      {/* Header Bar */}
      <header className="bg-[#ffffff] border-b border-[#e7e8e9] sticky top-0 z-50 shadow-sm">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <button 
            onClick={onBack}
            className="flex items-center text-brand-primary hover:bg-[#f3f4f5] p-2 rounded-full transition-colors active:scale-95"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          <h1 className="font-bold text-lg text-brand-primary tracking-tight">
            {lang === 'vi' ? 'Chi tiết thanh toán' : 'Payment Details'}
          </h1>
          
          <div className="w-9"></div> {/* Flex spacer to balance layout */}
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-6 flex items-start justify-center">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Bank QR and info */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            <section className="bg-[#ffffff] rounded-2xl p-6 md:p-8 shadow-[0px_4px_20px_rgba(26,43,75,0.05)] border border-[#e7e8e9] relative overflow-hidden">
              {/* Top ambient glow */}
              <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-brand-secondary-container rounded-full blur-3xl opacity-15 pointer-events-none"></div>

              <h2 className="text-xl font-bold text-brand-primary mb-2">
                {lang === 'vi' ? 'Hướng dẫn chuyển khoản' : 'Bank Transfer Instructions'}
              </h2>
              <p className="text-sm text-on-surface-variant leading-relaxed mb-8">
                {lang === 'vi' 
                  ? 'Vui lòng quét mã QR hoặc chuyển khoản theo thông tin bên dưới. Hệ thống sẽ tự động ghi nhận sau 5-10 phút.' 
                  : 'Please scan the QR code or transfer to the account below. The payment is verified automatically in 5-10 mins.'
                }
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center border border-[#e7e8e9] rounded-2xl p-4 bg-brand-surface-bg">
                {/* QR Code Column */}
                <div className="flex flex-col items-center justify-center p-4 bg-[#ffffff] rounded-xl border border-transparent hover:border-[#c5c6cf] transition-all group shadow-sm">
                  <div className="bg-white p-3 rounded-2xl border border-[#e7e8e9] mb-4 relative overflow-hidden shadow-inner">
                    <img 
                      className="w-40 h-40 object-contain" 
                      alt="Payment QR Code" 
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuAkZyV6_eARk7RayvIQLJVrwcgr5H7n0FXslyxFZf_73J1wRN5TMbYSfoHz1GThIjR71MEYcx-FdWS0Bz-6n_Hie1CnB38vXA5fmOzPlMFQuKzIwbMYkyufLyqgcBNJtRFg7xkWDHD_8j39OCw0zfCyZa9uuZWeA0-Mkr_vL_-yYmmnhuWyf9pP6086K2JKJJqAODsgRaQJRqOhT26frp1uBvwzqZx7QxEUNEWDBarsV-b9Il9lYie_ZuAw3wbStPnriQ1pNViWKmgG" 
                    />
                    <div className="absolute inset-0 bg-brand-primary/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl">
                      <QrCode className="text-brand-primary w-8 h-8" />
                    </div>
                  </div>
                  
                  <span className="text-xs font-bold text-brand-primary flex items-center gap-1.5 uppercase tracking-wider text-center">
                    <Camera className="w-4 h-4 text-brand-primary" />
                    {lang === 'vi' ? 'Quét mã bằng ứng dụng ngân hàng' : 'Scan with your banking app'}
                  </span>
                </div>

                {/* Account Details Column */}
                <div className="flex flex-col gap-5">
                  {/* Bank Name */}
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">
                      {lang === 'vi' ? 'Ngân hàng thụ hưởng' : 'Beneficiary Bank'}
                    </span>
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-brand-surface-bg flex items-center justify-center text-brand-primary border border-[#e7e8e9]">
                        <CreditCard className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-sm font-extrabold text-brand-primary">{bankName}</span>
                    </div>
                  </div>

                  {/* Account Number */}
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">
                      {lang === 'vi' ? 'Số tài khoản' : 'Account Number'}
                    </span>
                    <div className="flex items-center justify-between bg-[#ffffff] px-4 py-2.5 rounded-xl border border-[#e7e8e9] focus-within:border-brand-primary transition-all">
                      <span className="text-base font-extrabold text-brand-primary font-mono tracking-wider">{accountNumber}</span>
                      <button 
                        onClick={() => handleCopy(accountNumber, 'account')}
                        className="text-brand-primary hover:text-brand-primary-container p-1.5 rounded-lg hover:bg-brand-surface-bg transition-colors active:scale-90"
                        title={lang === 'vi' ? 'Sao chép' : 'Copy'}
                      >
                        {copiedField === 'account' ? (
                          <Check className="w-4 h-4 text-[#2e7d32]" />
                        ) : (
                          <Copy className="w-4 h-4 text-on-surface-variant" />
                        )}
                      </button>
                    </div>
                    <span className="text-[11px] text-on-surface-variant font-semibold mt-0.5 uppercase">
                      {lang === 'vi' ? 'Chủ tài khoản' : 'Holder'}: {accountHolder}
                    </span>
                  </div>

                  {/* Transfer Description */}
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider flex items-center gap-1">
                      {lang === 'vi' ? 'Nội dung chuyển khoản' : 'Transfer Description'}
                      <AlertTriangle className="w-3 h-3 text-[#ba1a1a]" />
                    </span>
                    <div className="flex items-center justify-between bg-brand-secondary-container/10 border border-brand-secondary-container px-4 py-2.5 rounded-xl hover:bg-brand-secondary-container/20 transition-all cursor-pointer">
                      <span className="text-sm font-black text-brand-secondary font-mono uppercase">{transferContent}</span>
                      <button 
                        onClick={() => handleCopy(transferContent, 'content')}
                        className="text-brand-secondary p-1.5 rounded-lg hover:bg-brand-secondary-container/20 transition-colors active:scale-90"
                        title={lang === 'vi' ? 'Sao chép' : 'Copy content'}
                      >
                        {copiedField === 'content' ? (
                          <Check className="w-4 h-4 text-[#2e7d32]" />
                        ) : (
                          <Copy className="w-4 h-4 text-brand-secondary" />
                        )}
                      </button>
                    </div>
                    <p className="text-[10px] font-bold text-[#ba1a1a] mt-1 italic">
                      {lang === 'vi' 
                        ? '* Vui lòng nhập chính xác nội dung này để hệ thống tự động xác nhận.' 
                        : '* Please enter this content EXACTLY for automated instant verification.'
                      }
                    </p>
                  </div>

                </div>
              </div>

            </section>
          </div>

          {/* Right Column: Statement Summary */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <aside className="bg-[#ffffff] rounded-2xl p-6 shadow-[0px_4px_20px_rgba(26,43,75,0.05)] border border-[#e7e8e9]">
              <header className="flex items-center justify-between border-b border-[#e7e8e9] pb-4 mb-4">
                <h3 className="font-bold text-sm text-brand-primary">
                  {lang === 'vi' ? 'Thông tin hóa đơn' : 'Statement Invoice'}
                </h3>
                <span className="bg-[#ffdad6] text-[#93000a] text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                  {lang === 'vi' ? 'Chưa thanh toán' : 'Unpaid'}
                </span>
              </header>

              <div className="flex flex-col gap-1 mb-6">
                <span className="text-xs text-on-surface-variant font-medium">
                  {lang === 'vi' ? 'Tổng số tiền thanh toán' : 'Total Payable Amount'}
                </span>
                <div className="text-2xl font-black text-brand-primary font-mono flex items-baseline">
                  {totalAmountVnd.toLocaleString('en-US')}
                  <span className="text-xs font-bold text-on-surface-variant ml-1">VND</span>
                </div>
                <div className="text-xs font-semibold text-brand-secondary bg-brand-secondary-container/10 border border-brand-secondary-container/20 rounded-lg px-2 py-1.5 mt-1">
                  {invoice.month}
                </div>
              </div>

              {/* Breakdown List */}
              <ul className="flex flex-col gap-3 font-medium text-sm text-on-surface pt-4 border-t border-[#e7e8e9]">
                <li className="flex justify-between items-center text-xs">
                  <span className="text-on-surface-variant">{lang === 'vi' ? 'Phí quản lý (Tháng 10)' : 'Management Fee (Oct)'}</span>
                  <span className="font-bold text-brand-primary font-mono">{managementFee.toLocaleString()}</span>
                </li>
                <li className="flex justify-between items-center text-xs">
                  <span className="text-on-surface-variant">{lang === 'vi' ? 'Tiền điện sinh hoạt' : 'Electricity Bill'}</span>
                  <span className="font-bold text-brand-primary font-mono">{electricityFee.toLocaleString()}</span>
                </li>
                <li className="flex justify-between items-center text-xs">
                  <span className="text-on-surface-variant">{lang === 'vi' ? 'Tiền nước sinh hoạt' : 'Water Bill'}</span>
                  <span className="font-bold text-brand-primary font-mono">{waterFee.toLocaleString()}</span>
                </li>
                <li className="flex justify-between items-center text-xs">
                  <span className="text-on-surface-variant">{lang === 'vi' ? 'Phí gửi xe (2 Ô tô)' : 'Parking Fee (2 Cars)'}</span>
                  <span className="font-bold text-brand-primary font-mono">{parkingFee.toLocaleString()}</span>
                </li>
                <li className="flex justify-between items-center text-xs">
                  <span className="text-on-surface-variant">{lang === 'vi' ? 'Dịch vụ khác' : 'Other services'}</span>
                  <span className="font-bold text-brand-primary font-mono">{otherFee.toLocaleString()}</span>
                </li>
              </ul>
            </aside>

            {/* Confirmation actions stick to bottom */}
            <div className="flex flex-col gap-3">
              <button 
                onClick={handleConfirm}
                className="w-full bg-brand-primary hover:bg-brand-primary-container text-[#ffffff] font-bold text-sm py-4 rounded-xl flex items-center justify-center gap-2 active:scale-[0.98] transition-all shadow-md shadow-brand-primary/15"
              >
                <CheckCircle2 className="w-5 h-5 text-brand-secondary-container" />
                <span>{lang === 'vi' ? 'TÔI ĐÃ THANH TOÁN' : 'I HAVE MADE THE TRANSFER'}</span>
              </button>
              
              <button 
                onClick={onBack}
                className="w-full bg-transparent text-brand-primary hover:bg-[#f3f4f5] font-semibold text-sm py-3 rounded-xl flex items-center justify-center transition-all"
              >
                {lang === 'vi' ? 'Hủy giao dịch' : 'Cancel transaction'}
              </button>
            </div>
          </div>

        </div>
      </main>

      {/* SUCCESS MODAL DIALOG */}
      {isSuccessModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#191c1d]/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#ffffff] rounded-2xl max-w-sm w-full p-6 text-center shadow-2xl border border-[#e7e8e9] animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-brand-secondary-container/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-10 h-10 text-brand-secondary" />
            </div>
            
            <h3 className="text-xl font-bold text-brand-primary mb-2">
              {lang === 'vi' ? 'Thành công!' : 'Payment Sent!'}
            </h3>
            
            <p className="text-xs text-on-surface-variant mb-6 leading-relaxed">
              {lang === 'vi' 
                ? 'Thông báo chuyển khoản của bạn đã được gửi. Hệ thống sẽ kiểm tra và đối soát giao dịch trong 5-10 phút.' 
                : 'Your payment notification has been submitted. The system will verify and clear the transaction within 5-10 minutes.'
              }
            </p>

            <button 
              onClick={closeSuccessAndConfirm}
              className="w-full bg-brand-primary hover:bg-brand-primary-container text-[#ffffff] font-bold py-3 rounded-xl transition-all shadow-sm"
            >
              {lang === 'vi' ? 'Hoàn thành' : 'Understood'}
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

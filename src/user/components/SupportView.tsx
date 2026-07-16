import React, { useState } from 'react';
import { HelpCircle, MessageSquare, Send, CheckCircle2, Bot, User, Phone, Mail } from 'lucide-react';

interface SupportViewProps {
  lang: 'vi' | 'en';
}

interface Message {
  sender: 'user' | 'bot';
  text: string;
  time: string;
}

export default function SupportView({ lang }: SupportViewProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'bot',
      text: lang === 'vi' 
        ? 'Xin chào! Tôi là Trợ lý LuxLiving. Tôi có thể hỗ trợ gì cho bạn hôm nay về thanh toán, sửa chữa kỹ thuật hoặc tiện ích?' 
        : 'Hello! I am the LuxLiving Virtual Concierge. How can I help you today regarding invoices, repairs, or amenities?',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputText, setInputText] = useState('');

  const faqs = [
    {
      q: lang === 'vi' ? 'Cách thanh toán hóa đơn?' : 'How do I pay invoices?',
      a: lang === 'vi' 
        ? 'Bạn có thể chuyển khoản ngân hàng qua mã QR trong mục "Thanh toán". Hệ thống sẽ ghi nhận tự động sau 5-10 phút.' 
        : 'You can complete a bank transfer via the QR code or account details in the "Payments" tab. It clears in 5-10 minutes.'
    },
    {
      q: lang === 'vi' ? 'Mất bao lâu để xử lý sửa chữa?' : 'How long do repairs take?',
      a: lang === 'vi' 
        ? 'Đối với các sự cố khẩn cấp (High/Urgent), đội kỹ thuật sẽ có mặt trong vòng 1-2 tiếng. Sự cố thông thường sẽ xử lý trong ngày.' 
        : 'For urgent issues (High priority), our team responds within 1-2 hours. Routine issues are resolved within 24 hours.'
    },
    {
      q: lang === 'vi' ? 'Đăng ký gửi xe ô tô thứ hai?' : 'How to register a second car?',
      a: lang === 'vi' 
        ? 'Vui lòng mang theo bản sao đăng ký xe và hợp đồng thuê phòng đến trực tiếp Văn phòng Ban Quản lý tại tầng G để làm tờ khai.' 
        : 'Please bring your vehicle registration copy and lease agreement to the Management Office on floor G to register.'
    }
  ];

  const handleSend = (e?: React.FormEvent, customText?: string) => {
    if (e) e.preventDefault();
    const text = customText || inputText;
    if (!text.trim()) return;

    const userMsg: Message = {
      sender: 'user',
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');

    // Simulated Bot Reply
    setTimeout(() => {
      let replyText = lang === 'vi'
        ? 'Cảm ơn bạn đã nhắn tin. Tôi đã ghi nhận câu hỏi và sẽ chuyển thông tin cho Ban Quản lý LuxLiving để phản hồi bạn sớm nhất.'
        : 'Thank you for your message. I have recorded your inquiry and forwarded it to the LuxLiving Management Desk.';

      // Smart FAQs matches
      const lowercaseText = text.toLowerCase();
      if (lowercaseText.includes('pay') || lowercaseText.includes('thanh toan') || lowercaseText.includes('hoa don') || lowercaseText.includes('bill')) {
        replyText = lang === 'vi'
          ? 'Để thanh toán hóa đơn, bạn hãy vào mục "Thanh toán", chọn hóa đơn muốn thanh toán và quét mã QR ngân hàng.'
          : 'To pay your bills, navigate to the "Payments" tab, select your invoice, and complete the QR transfer.';
      } else if (lowercaseText.includes('sửa') || lowercaseText.includes('fix') || lowercaseText.includes('hỏng') || lowercaseText.includes('repair')) {
        replyText = lang === 'vi'
          ? 'Nếu có thiết bị hỏng hóc, hãy gửi thông tin và ảnh mẫu qua mục "Sửa chữa" để kỹ thuật viên kịp thời kiểm tra.'
          : 'For any faulty fixtures, submit descriptions and photos via the "Maintenance" tab for technician assignment.';
      }

      const botReply: Message = {
        sender: 'bot',
        text: replyText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, botReply]);
    }, 1200);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div>
        <h2 className="text-3xl font-bold text-brand-primary tracking-tight">
          {lang === 'vi' ? 'Hỗ trợ cư dân' : 'Resident Support'}
        </h2>
        <p className="text-on-surface-variant font-medium mt-2">
          {lang === 'vi' ? 'Liên hệ Ban Quản lý hoặc chat trực tuyến với trợ lý kỹ thuật LuxLiving.' : 'Connect directly with the LuxLiving front desk or consult our FAQ database.'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Interactive Chat Box */}
        <div className="lg:col-span-7 bg-[#ffffff] rounded-2xl shadow-[0px_4px_20px_rgba(26,43,75,0.05)] border border-[#e7e8e9] overflow-hidden flex flex-col h-[500px]">
          {/* Support Desk Info Bar */}
          <div className="bg-brand-primary p-4 flex items-center justify-between text-[#ffffff]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-brand-primary-container flex items-center justify-center">
                <Bot className="text-brand-secondary-container w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold">LuxLiving Concierge</p>
                <p className="text-[10px] text-brand-secondary-container font-semibold uppercase tracking-wider">{lang === 'vi' ? 'Trực tuyến 24/7' : 'Online 24/7'}</p>
              </div>
            </div>
            
            <div className="hidden sm:flex items-center gap-4 text-xs font-mono text-brand-secondary-container font-bold">
              <span className="flex items-center gap-1">
                <Phone className="w-3.5 h-3.5" /> 1900-1111
              </span>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-brand-surface-bg">
            {messages.map((m, idx) => {
              const isBot = m.sender === 'bot';
              return (
                <div key={idx} className={`flex gap-3 max-w-[85%] ${isBot ? 'mr-auto' : 'ml-auto flex-row-reverse'}`}>
                  <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center border ${
                    isBot ? 'bg-brand-primary border-[#e7e8e9] text-brand-secondary-container' : 'bg-brand-secondary-container border-brand-secondary text-brand-secondary'
                  }`}>
                    {isBot ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                  </div>

                  <div className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                    isBot 
                      ? 'bg-[#ffffff] text-brand-primary rounded-tl-none border border-[#e7e8e9] shadow-sm' 
                      : 'bg-brand-primary text-[#ffffff] rounded-tr-none shadow-sm'
                  }`}>
                    <p>{m.text}</p>
                    <span className={`text-[9px] block mt-1.5 font-mono ${isBot ? 'text-on-surface-variant' : 'text-brand-secondary-container'}`}>{m.time}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Chat Input Field Form */}
          <form onSubmit={handleSend} className="p-4 bg-[#ffffff] border-t border-[#e7e8e9] flex gap-2">
            <input 
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 bg-brand-surface-bg border border-[#c5c6cf] rounded-xl px-4 py-3 text-xs text-on-surface focus:border-brand-primary"
              placeholder={lang === 'vi' ? "Nhập câu hỏi của bạn tại đây..." : "Type your message..."}
            />
            <button 
              type="submit"
              className="bg-brand-primary hover:bg-brand-primary-container text-[#ffffff] p-3 rounded-xl active:scale-95 transition-all shadow-md shrink-0"
            >
              <Send className="w-4.5 h-4.5" />
            </button>
          </form>
        </div>

        {/* Right Column: FAQ List & Helpdesk contacts */}
        <div className="lg:col-span-5 space-y-6">
          <h3 className="font-bold text-lg text-brand-primary">
            {lang === 'vi' ? 'Câu hỏi thường gặp' : 'Help Desk & FAQs'}
          </h3>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div 
                key={idx}
                onClick={() => handleSend(undefined, faq.q)}
                className="bg-[#ffffff] rounded-2xl p-4 border border-[#e7e8e9] hover:border-brand-secondary transition-all cursor-pointer shadow-sm group text-left"
              >
                <div className="flex items-center gap-2 text-xs font-bold text-brand-primary group-hover:text-brand-secondary transition-colors mb-2">
                  <HelpCircle className="w-4.5 h-4.5" />
                  <span>{faq.q}</span>
                </div>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>

          {/* Contact Directory Section */}
          <div className="bg-brand-primary text-[#ffffff] rounded-2xl p-5 shadow-sm space-y-3">
            <h4 className="font-bold text-sm text-brand-secondary-container uppercase tracking-wider">{lang === 'vi' ? 'Thông tin liên hệ trực tiếp' : 'Direct Contacts'}</h4>
            <div className="text-xs space-y-2 font-medium">
              <p className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-brand-secondary-container" />
                <span>Hotline: 1900-1111 (08:00 - 18:00)</span>
              </p>
              <p className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-brand-secondary-container" />
                <span>Email: care@luxliving.com</span>
              </p>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}

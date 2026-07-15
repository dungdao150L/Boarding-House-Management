import React from "react";
import {
  LayoutDashboard,
  Home,
  Users,
  FileText,
  Zap,
  Receipt,
  DollarSign,
  Wrench,
  LogOut,
  KeyRound,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

export type SidebarTab =
  | "dashboard"
  | "rooms"
  | "room-detail"
  | "tenants"
  | "contracts"
  | "utilities"
  | "invoices"
  | "payments"
  | "maintenance";

interface SidebarProps {
  activeTab: SidebarTab;
  onTabChange: (tab: SidebarTab) => void;
  onLogout: () => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

export default function Sidebar({
  activeTab,
  onTabChange,
  onLogout,
  collapsed,
  setCollapsed
}: SidebarProps) {
  const menuItems = [
    { id: "dashboard", label: "Tổng quan", icon: LayoutDashboard },
    { id: "rooms", label: "Quản lý phòng", icon: Home },
    { id: "tenants", label: "Người thuê", icon: Users },
    { id: "contracts", label: "Hợp đồng", icon: FileText },
    { id: "utilities", label: "Điện nước", icon: Zap },
    { id: "invoices", label: "Hóa đơn", icon: Receipt },
    { id: "payments", label: "Thanh toán", icon: DollarSign },
    { id: "maintenance", label: "Bảo trì", icon: Wrench }
  ] as const;

  return (
    <aside
      className={`fixed top-0 left-0 z-40 h-screen transition-all duration-300 border-r border-[#d1c5b4]/20 bg-[#101828] text-[#d9e3f6] flex flex-col ${
        collapsed ? "w-20" : "w-64"
      }`}
    >
      {/* Brand logo section */}
      <div className="p-5 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-9 h-9 bg-[#c9a45c] rounded-lg flex items-center justify-center text-[#101828] shrink-0 font-bold shadow-md">
            <KeyRound className="w-5 h-5 text-white" />
          </div>
          {!collapsed && (
            <div className="flex flex-col whitespace-nowrap">
              <span className="text-sm font-bold tracking-wider text-white uppercase">
                LUMI Residence
              </span>
              <span className="text-[10px] text-[#e8c176]/70 font-mono tracking-widest uppercase">
                Premier Living
              </span>
            </div>
          )}
        </div>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 rounded-md hover:bg-white/10 text-gray-400 hover:text-white hidden md:block"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* User Information */}
      <div className={`p-4 border-b border-white/5 flex items-center gap-3 ${collapsed ? "justify-center" : ""}`}>
        <div className="relative shrink-0">
          <img
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&auto=format&fit=crop"
            alt="Admin Profile"
            className="w-10 h-10 rounded-full border border-[#c9a45c] object-cover shadow-sm"
          />
          <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-[#101828] rounded-full"></div>
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <h4 className="text-sm font-semibold text-white truncate">Phạm Minh Trang</h4>
            <p className="text-xs text-[#e8c176] font-mono">Quản lý cao cấp</p>
          </div>
        )}
      </div>

      {/* Navigation menu items */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = activeTab === item.id || (item.id === "rooms" && activeTab === "room-detail");
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium transition-all group ${
                isActive
                  ? "bg-[#c9a45c] text-white font-semibold shadow-sm"
                  : "text-gray-400 hover:bg-white/5 hover:text-white"
              } ${collapsed ? "justify-center" : ""}`}
              title={collapsed ? item.label : undefined}
            >
              <Icon className={`w-5 h-5 shrink-0 transition-transform ${isActive ? "" : "group-hover:scale-105"}`} />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* Logout button */}
      <div className="p-3 border-t border-white/5">
        <button
          onClick={onLogout}
          className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-all ${
            collapsed ? "justify-center" : ""
          }`}
          title={collapsed ? "Đăng xuất" : undefined}
        >
          <LogOut className="w-5 h-5 shrink-0" />
          {!collapsed && <span>Đăng xuất</span>}
        </button>
      </div>
    </aside>
  );
}

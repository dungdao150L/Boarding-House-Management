import React, { useCallback, useEffect, useState } from "react";
import LoginView from "./components/LoginView";
import ResidentPortal from "./user/App";
import Sidebar, { SidebarTab } from "./components/Sidebar";
import DashboardView from "./components/DashboardView";
import RoomManagementView from "./components/RoomManagementView";
import RoomDetailView from "./components/RoomDetailView";
import TenantManagementView from "./components/TenantManagementView";
import ContractManagementView from "./components/ContractManagementView";
import UtilityManagementView from "./components/UtilityManagementView";
import InvoiceManagementView from "./components/InvoiceManagementView";
import PaymentManagementView from "./components/PaymentManagementView";
import MaintenanceView from "./components/MaintenanceView";

import { api, RegisterPayload } from "./api/client";
import {
  billingDefaults,
  buildTransactions,
  buildUtilities,
  enrichRoomsWithContracts,
  mapContract,
  mapInvoice,
  mapRoom,
  mapTenant,
  toApiRoomStatus,
  toIsoDate,
} from "./api/mappers";
import { INITIAL_MAINTENANCE } from "./data";
import {
  Contract,
  Invoice,
  MaintenanceRequest,
  PaymentTransaction,
  RentalRequest,
  Room,
  RoomStatus,
  Tenant,
  UtilityRecord,
} from "./types";

type CurrentUser = {
  id: number;
  role: string;
  tenantId?: number;
  username: string;
};

function canAccessManagement(user: CurrentUser | null) {
  return user?.role === "admin";
}

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [loginError, setLoginError] = useState("");
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(false);
  const [dataError, setDataError] = useState("");

  const [activeTab, setActiveTab] = useState<SidebarTab>("dashboard");
  const [selectedRoomId, setSelectedRoomId] = useState<string>("");
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);

  const [rooms, setRooms] = useState<Room[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [utilities, setUtilities] = useState<UtilityRecord[]>([]);
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
  const [rentalRequests, setRentalRequests] = useState<RentalRequest[]>([]);
  const [maintenance, setMaintenance] = useState<MaintenanceRequest[]>(INITIAL_MAINTENANCE);

  const clearManagementData = useCallback(() => {
    setRooms([]);
    setTenants([]);
    setContracts([]);
    setInvoices([]);
    setUtilities([]);
    setTransactions([]);
    setRentalRequests([]);
    setDataError("");
    setDataLoading(false);
  }, []);

  const loadData = useCallback(async () => {
    setDataLoading(true);
    setDataError("");

    try {
      const [roomRows, contractRows, invoiceRows, requestRows] = await Promise.all([
        api.listRooms(),
        api.listContracts(),
        api.listInvoices(),
        api.listRentalRequests(),
      ]);

      const mappedContracts = contractRows.map(mapContract);
      const mappedRooms = enrichRoomsWithContracts(roomRows.map(mapRoom), mappedContracts);
      const tenantRows = await api.listTenants();
      const mappedTenants = tenantRows.map((tenant) => mapTenant(tenant, mappedContracts));
      const mappedInvoices = invoiceRows.map((invoice) => mapInvoice(invoice, mappedContracts));

      setContracts(mappedContracts);
      setRooms(mappedRooms);
      setTenants(mappedTenants);
      setInvoices(mappedInvoices);
      setUtilities(buildUtilities(mappedContracts, mappedInvoices));
      setTransactions(buildTransactions(mappedInvoices));
      setRentalRequests(requestRows);
    } catch (error) {
      setDataError(error instanceof Error ? error.message : "Không tải được dữ liệu backend");
    } finally {
      setDataLoading(false);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("boarding_house_token");
    if (!token) return;

    api.getMe()
      .then((user) => {
        setCurrentUser(user);
        setIsLoggedIn(true);
        if (canAccessManagement(user)) {
          return loadData();
        }
        clearManagementData();
        return undefined;
      })
      .catch(() => {
        api.clearAuthToken();
        setIsLoggedIn(false);
      });
  }, [clearManagementData, loadData]);

  const handleLogin = async (username: string, password: string) => {
    setLoading(true);
    setLoginError("");

    try {
      const result = await api.login(username, password);
      api.setAuthToken(result.token);
      setCurrentUser(result.user);
      setIsLoggedIn(true);
      if (canAccessManagement(result.user)) {
        await loadData();
      } else {
        clearManagementData();
      }
    } catch (error) {
      setLoginError(error instanceof Error ? error.message : "ÄÄƒng nháº­p tháº¥t báº¡i");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (payload: RegisterPayload) => {
    setLoading(true);
    setLoginError("");

    try {
      await api.register(payload);
    } catch (error) {
      setLoginError(error instanceof Error ? error.message : "KhÃ´ng Ä‘Äƒng kÃ½ Ä‘Æ°á»£c tÃ i khoáº£n");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    api.clearAuthToken();
    setCurrentUser(null);
    setIsLoggedIn(false);
    clearManagementData();
    setActiveTab("dashboard");
  };

  const handleRoomSelect = (roomId: string) => {
    setSelectedRoomId(roomId);
    setActiveTab("room-detail");
  };

  const handleAddRoom = async (newRoom: Room) => {
    try {
      await api.createRoom({
        area: newRoom.area,
        description: newRoom.type,
        floor: newRoom.floor,
        name: newRoom.id,
        price: newRoom.rentPrice,
        status: "available",
      });
      await loadData();
    } catch (error) {
      alert(error instanceof Error ? error.message : "KhÃ´ng táº¡o Ä‘Æ°á»£c phÃ²ng");
      throw error;
    }
  };

  const handleUpdateRoomStatus = async (roomId: string, status: RoomStatus) => {
    const room = rooms.find((item) => item.id === roomId);
    if (!room?.backendId) return;

    try {
      await api.updateRoom(room.backendId, { status: toApiRoomStatus(status) });
      await loadData();
    } catch (error) {
      alert(error instanceof Error ? error.message : "KhÃ´ng cáº­p nháº­t Ä‘Æ°á»£c tráº¡ng thÃ¡i phÃ²ng");
    }
  };

  const handleAddAsset = (roomId: string, asset: string) => {
    setRooms((prev) =>
      prev.map((room) =>
        room.id === roomId ? { ...room, assets: [...(room.assets || []), asset] } : room,
      ),
    );
  };

  const handleRemoveAsset = (roomId: string, assetIndex: number) => {
    setRooms((prev) =>
      prev.map((room) =>
        room.id === roomId
          ? {
              ...room,
              assets: (room.assets || []).filter((_, idx) => idx !== assetIndex),
            }
          : room,
      ),
    );
  };

  const handleAddTenant = async (newTenant: Tenant) => {
    try {
      const room = rooms.find((item) => item.id === newTenant.roomNumber);
      if (!room?.backendId) {
        throw new Error("KhÃ´ng tÃ¬m tháº¥y phÃ²ng tÆ°Æ¡ng á»©ng trong database. HÃ£y táº¡o phÃ²ng trÆ°á»›c hoáº·c nháº­p Ä‘Ãºng sá»‘ phÃ²ng.");
      }

      const tenant = await api.createTenant({
        email: newTenant.email || undefined,
        fullName: newTenant.name,
        identityNumber: newTenant.idCard || undefined,
        phone: newTenant.phone,
      });

      await api.createContract({
        deposit: 0,
        endDate: undefined,
        monthlyRent: room.rentPrice,
        roomId: room.backendId,
        startDate: toIsoDate(newTenant.contractStart),
        tenantId: tenant.id,
      });

      await loadData();
    } catch (error) {
      alert(error instanceof Error ? error.message : "KhÃ´ng táº¡o Ä‘Æ°á»£c ngÆ°á»i thuÃª");
      throw error;
    }
  };

  const handleApproveRentalRequest = async (request: RentalRequest) => {
    try {
      const tenant = await api.createTenant({
        email: request.email || undefined,
        fullName: request.fullName || request.username,
        phone: request.phone || "Chưa cập nhật",
        userId: request.userId,
      });

      await api.createContract({
        deposit: 0,
        monthlyRent: request.roomPrice,
        roomId: request.roomId,
        startDate: new Date().toISOString().slice(0, 10),
        tenantId: tenant.id,
      });

      await api.updateRentalRequestStatus(request.id, { status: "approved", tenantId: tenant.id });
      await loadData();
      alert("Đã duyệt yêu cầu thuê phòng. Người dùng cần đăng xuất rồi đăng nhập lại để nhận phòng.");
    } catch (error) {
      alert(error instanceof Error ? error.message : "Không duyệt được yêu cầu thuê phòng");
    }
  };

  const handleRejectRentalRequest = async (request: RentalRequest) => {
    try {
      await api.updateRentalRequestStatus(request.id, { status: "rejected" });
      await loadData();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Không từ chối được yêu cầu thuê phòng");
    }
  };

  const handleRemoveTenant = async (id: string) => {
    const tenant = tenants.find((item) => item.id === id);
    if (!tenant?.backendId) return;

    try {
      const activeContract = contracts.find(
        (contract) => contract.backendTenantId === tenant.backendId && contract.status === "Äang hiá»‡u lá»±c",
      );
      const hasAnyContract = contracts.some((contract) => contract.backendTenantId === tenant.backendId);

      if (activeContract?.backendId) {
        await api.endContract(activeContract.backendId);
      }

      if (hasAnyContract) {
        await loadData();
        alert("NgÆ°á»i thuÃª Ä‘Ã£ cÃ³ há»£p Ä‘á»“ng nÃªn khÃ´ng xÃ³a cá»©ng khá»i database. Há»£p Ä‘á»“ng Ä‘ang hiá»‡u lá»±c Ä‘Ã£ Ä‘Æ°á»£c káº¿t thÃºc.");
        return;
      }

      await api.deleteTenant(tenant.backendId);
      await loadData();
    } catch (error) {
      alert(error instanceof Error ? error.message : "KhÃ´ng xÃ³a Ä‘Æ°á»£c ngÆ°á»i thuÃª");
    }
  };

  const handleAddContract = async (newContract: Contract) => {
    const room = rooms.find((item) => item.id === newContract.roomNumber);
    const tenant = tenants.find((item) => item.name.toLowerCase() === newContract.tenantName.toLowerCase());

    if (!room?.backendId || !tenant?.backendId) {
      alert("KhÃ´ng tÃ¬m tháº¥y phÃ²ng hoáº·c ngÆ°á»i thuÃª tÆ°Æ¡ng á»©ng trong database");
      return;
    }

    try {
      await api.createContract({
        deposit: newContract.deposit,
        endDate: toIsoDate(newContract.endDate),
        monthlyRent: newContract.monthlyRent,
        roomId: room.backendId,
        startDate: toIsoDate(newContract.startDate),
        tenantId: tenant.backendId,
      });
      await loadData();
    } catch (error) {
      alert(error instanceof Error ? error.message : "KhÃ´ng táº¡o Ä‘Æ°á»£c há»£p Ä‘á»“ng");
    }
  };

  const handleTerminateContract = async (id: string) => {
    const contract = contracts.find((item) => item.id === id);
    if (!contract?.backendId) return;

    try {
      await api.endContract(contract.backendId);
      await loadData();
      alert(`ÄÃ£ thanh lÃ½ há»£p Ä‘á»“ng ${id} thÃ nh cÃ´ng.`);
    } catch (error) {
      alert(error instanceof Error ? error.message : "KhÃ´ng thanh lÃ½ Ä‘Æ°á»£c há»£p Ä‘á»“ng");
    }
  };

  const handleUpdateUtility = async (updated: UtilityRecord) => {
    const activeContract = contracts.find(
      (contract) =>
        contract.roomNumber === updated.roomNumber &&
        (contract.status === "Đang hiệu lực" || contract.status === "Äang hiá»‡u lá»±c"),
    );

    if (!activeContract?.backendId) {
      alert("Phòng này chưa có hợp đồng đang hiệu lực");
      return;
    }

    const electricityUsage = Math.max(0, updated.currElectricity - updated.prevElectricity);
    const waterUsage = Math.max(0, updated.currWater - updated.prevWater);
    const month = new Date().toISOString().slice(0, 7);
    const existingInvoice = invoices.find(
      (invoice) => invoice.backendContractId === activeContract.backendId && invoice.billingMonth === month,
    );

    try {
      const payload = {
        contractId: activeContract.backendId,
        electricityUnitPrice: billingDefaults.electricityUnitPrice,
        electricityUsage,
        month,
        serviceFee: billingDefaults.serviceFee,
        waterUnitPrice: billingDefaults.waterUnitPrice,
        waterUsage,
      };

      if (existingInvoice?.backendId) {
        await api.updateInvoice(existingInvoice.backendId, payload);
      } else {
        await api.createInvoice(payload);
      }

      await loadData();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Không tạo được hóa đơn điện nước");
      throw error;
    }
  };

  const handleMarkAsPaid = async (invoiceId: string) => {
    const invoice = invoices.find((item) => item.id === invoiceId);
    if (!invoice?.backendId) return;

    try {
      await api.markInvoicePaid(invoice.backendId);
      await loadData();
      alert(`ÄÃ£ gáº¡ch ná»£ hÃ³a Ä‘Æ¡n ${invoiceId} thÃ nh cÃ´ng.`);
    } catch (error) {
      alert(error instanceof Error ? error.message : "KhÃ´ng cáº­p nháº­t Ä‘Æ°á»£c thanh toÃ¡n");
    }
  };

  const handleSendReminder = (invoiceId: string) => {
    alert(`ÄÃ£ giáº£ láº­p gá»­i thÃ´ng bÃ¡o nháº¯c ná»£ cho hÃ³a Ä‘Æ¡n ${invoiceId}.`);
  };

  const handleAddTransaction = (newTrx: PaymentTransaction) => {
    setTransactions((prev) => [newTrx, ...prev]);
  };

  const handleApproveTransaction = (id: string) => {
    setTransactions((prev) =>
      prev.map((transaction) => (transaction.id === id ? { ...transaction, status: "ÄÃ£ xÃ¡c nháº­n" } : transaction)),
    );
  };

  const handleAddMaintenanceRequest = (newReq: MaintenanceRequest) => {
    setMaintenance((prev) => [newReq, ...prev]);
  };

  const handleUpdateMaintenanceStatus = (id: string, newStatus: MaintenanceRequest["status"]) => {
    setMaintenance((prev) =>
      prev.map((request) => (request.id === id ? { ...request, status: newStatus } : request)),
    );
  };

  const renderActiveView = () => {
    if (dataLoading) {
      return (
        <div className="rounded-xl border border-[#d1c5b4]/30 bg-white p-8 text-center font-semibold text-[#101828]">
          Đang tải dữ liệu từ backend...
        </div>
      );
    }

    switch (activeTab) {
      case "dashboard":
        return (
          <DashboardView
            rooms={rooms}
            tenants={tenants}
            transactions={transactions}
            maintenance={maintenance}
            onNavigateToTab={(tab) => setActiveTab(tab)}
            onNavigateToRoom={handleRoomSelect}
            onUpdateMaintenanceStatus={handleUpdateMaintenanceStatus}
          />
        );
      case "rooms":
        return <RoomManagementView rooms={rooms} onRoomSelect={handleRoomSelect} onAddRoom={handleAddRoom} />;
      case "room-detail":
        return (
          <RoomDetailView
            roomId={selectedRoomId}
            rooms={rooms}
            tenants={tenants}
            contracts={contracts}
            invoices={invoices}
            utilities={utilities}
            maintenance={maintenance}
            onBack={() => setActiveTab("rooms")}
            onUpdateRoomStatus={handleUpdateRoomStatus}
            onAddAsset={handleAddAsset}
            onRemoveAsset={handleRemoveAsset}
          />
        );
      case "tenants":
        return (
          <TenantManagementView
            tenants={tenants}
            rentalRequests={rentalRequests}
            onAddTenant={handleAddTenant}
            onApproveRentalRequest={handleApproveRentalRequest}
            onRejectRentalRequest={handleRejectRentalRequest}
            onRemoveTenant={handleRemoveTenant}
            onNavigateToRoom={handleRoomSelect}
          />
        );
      case "contracts":
        return (
          <ContractManagementView
            contracts={contracts}
            onAddContract={handleAddContract}
            onTerminateContract={handleTerminateContract}
            onNavigateToRoom={handleRoomSelect}
          />
        );
      case "utilities":
        return (
          <UtilityManagementView
            utilities={utilities}
            onUpdateUtility={handleUpdateUtility}
            onNavigateToRoom={handleRoomSelect}
          />
        );
      case "invoices":
        return (
          <InvoiceManagementView
            invoices={invoices}
            onMarkAsPaid={handleMarkAsPaid}
            onSendReminder={handleSendReminder}
            onNavigateToRoom={handleRoomSelect}
          />
        );
      case "payments":
        return (
          <PaymentManagementView
            transactions={transactions}
            onAddTransaction={handleAddTransaction}
            onApproveTransaction={handleApproveTransaction}
            onNavigateToRoom={handleRoomSelect}
          />
        );
      case "maintenance":
        return (
          <MaintenanceView
            maintenance={maintenance}
            onAddRequest={handleAddMaintenanceRequest}
            onUpdateStatus={handleUpdateMaintenanceStatus}
            onNavigateToRoom={handleRoomSelect}
          />
        );
      default:
        return (
          <div className="rounded-xl border border-[#d1c5b4]/20 bg-white p-8 text-center">
            <h3 className="text-xl font-bold">Vui lòng quay lại Dashboard</h3>
          </div>
        );
    }
  };

  if (!isLoggedIn) {
    return <LoginView error={loginError} loading={loading} onLogin={handleLogin} onRegister={handleRegister} />;
  }

  if (!canAccessManagement(currentUser)) {
    return <ResidentPortal currentUser={currentUser} onLogout={handleLogout} />;
  }

  return (
    <div className="min-h-screen bg-[#f7f4ef] text-[#121c2a] flex">
      <Sidebar
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
        onLogout={handleLogout}
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
      />

      <main
        className={`flex-1 min-h-screen p-6 md:p-8 transition-all duration-300 ${
          sidebarCollapsed ? "ml-20" : "ml-64"
        }`}
      >
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex flex-col gap-2 rounded-xl border border-[#d1c5b4]/20 bg-white px-4 py-3 text-sm text-[#4e4639] shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <span>
              Đang dùng dữ liệu backend thật
              {currentUser ? ` - ${currentUser.username} (${currentUser.role})` : ""}
            </span>
            <button
              className="self-start rounded-lg border border-[#d1c5b4]/40 px-3 py-1.5 text-xs font-bold uppercase text-[#775a19] hover:bg-[#f7f4ef] sm:self-auto"
              onClick={loadData}
            >
              Tải lại dữ liệu
            </button>
          </div>

          {dataError && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
              {dataError}
            </div>
          )}

          {renderActiveView()}
        </div>
      </main>
    </div>
  );
}


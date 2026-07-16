import React, { useEffect, useState } from "react";
import { Calculator, CheckCircle, Clock, Droplet, Save, Zap } from "lucide-react";
import { UtilityRecord } from "../types";

interface UtilityManagementViewProps {
  utilities: UtilityRecord[];
  onUpdateUtility: (record: UtilityRecord) => Promise<void> | void;
  onNavigateToRoom: (roomId: string) => void;
}

export default function UtilityManagementView({
  utilities,
  onUpdateUtility,
  onNavigateToRoom,
}: UtilityManagementViewProps) {
  const [selectedRoomNumber, setSelectedRoomNumber] = useState("");
  const [currElecInput, setCurrElecInput] = useState<number>(0);
  const [currWaterInput, setCurrWaterInput] = useState<number>(0);
  const [isSaving, setIsSaving] = useState(false);

  const activeRecord = utilities.find((item) => item.roomNumber === selectedRoomNumber);
  const prevElec = activeRecord?.prevElectricity || 0;
  const prevWater = activeRecord?.prevWater || 0;
  const elecUsed = Math.max(0, currElecInput - prevElec);
  const waterUsed = Math.max(0, currWaterInput - prevWater);
  const electricityCost = elecUsed * 3500;
  const waterCost = waterUsed * 20000;
  const totalCost = electricityCost + waterCost;

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("vi-VN", { currency: "VND", style: "currency" }).format(value);

  useEffect(() => {
    if (utilities.length > 0 && !selectedRoomNumber) {
      setSelectedRoomNumber(utilities[0].roomNumber);
    }
  }, [utilities, selectedRoomNumber]);

  useEffect(() => {
    if (activeRecord) {
      setCurrElecInput(activeRecord.currElectricity || activeRecord.prevElectricity);
      setCurrWaterInput(activeRecord.currWater || activeRecord.prevWater);
    }
  }, [activeRecord]);

  const handleSave = async () => {
    if (!activeRecord || isSaving) return;

    if (currElecInput < prevElec || currWaterInput < prevWater) {
      alert("Chỉ số mới không được nhỏ hơn chỉ số cũ.");
      return;
    }

    setIsSaving(true);
    try {
      await onUpdateUtility({
        ...activeRecord,
        currElectricity: currElecInput,
        currWater: currWaterInput,
        status: "Đã chốt",
      });
      alert(`Đã tạo/cập nhật hóa đơn điện nước cho phòng ${selectedRoomNumber}.`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-[#101828] tracking-tight">Số liệu điện nước</h1>
        <p className="text-sm text-[#4e4639]/70 mt-1">
          Ghi nhận chỉ số điện nước hằng tháng và đồng bộ hóa đơn.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-150 shadow-sm lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <h3 className="font-bold text-lg text-[#101828]">Bảng chốt số kỳ này</h3>
            <span className="text-xs bg-amber-50 text-amber-800 font-mono font-bold px-2.5 py-1 rounded-full border border-amber-200">
              Điện 3.500đ/kWh - Nước 20.000đ/m³
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-[#d1c5b4]/20 text-gray-400 text-xs font-semibold uppercase bg-gray-50/50">
                  <th className="py-3 px-4">Phòng</th>
                  <th className="py-3 px-4">Khách thuê</th>
                  <th className="py-3 px-4 text-center">Chỉ số điện</th>
                  <th className="py-3 px-4 text-center">Chỉ số nước</th>
                  <th className="py-3 px-4 text-right">Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {utilities.map((record) => {
                  const electricity = record.currElectricity - record.prevElectricity;
                  const water = record.currWater - record.prevWater;
                  const isClosed = record.status === "Đã chốt";

                  return (
                    <tr
                      key={record.roomNumber}
                      onClick={() => setSelectedRoomNumber(record.roomNumber)}
                      className={`border-b border-gray-100 hover:bg-[#fcfbf9] transition-all cursor-pointer ${
                        selectedRoomNumber === record.roomNumber ? "bg-amber-50/20 border-l-4 border-l-[#c9a45c]" : ""
                      }`}
                    >
                      <td className="py-3.5 px-4">
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            onNavigateToRoom(record.roomNumber);
                          }}
                          className="font-bold text-[#775a19] hover:underline"
                        >
                          {record.roomNumber}
                        </button>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-[#101828]">{record.tenantName}</td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="text-xs text-gray-400">
                          Cũ: {record.prevElectricity} - Mới: {record.currElectricity}
                        </div>
                        <span className="font-semibold text-amber-700">({electricity} kWh)</span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="text-xs text-gray-400">
                          Cũ: {record.prevWater} - Mới: {record.currWater}
                        </div>
                        <span className="font-semibold text-indigo-700">({water} m³)</span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            isClosed
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                              : "bg-amber-50 text-amber-700 border border-amber-100"
                          }`}
                        >
                          {isClosed ? (
                            <>
                              <CheckCircle className="w-3 h-3" /> Đã chốt
                            </>
                          ) : (
                            <>
                              <Clock className="w-3 h-3" /> Chưa duyệt
                            </>
                          )}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-[#101828] text-white p-6 rounded-2xl border border-white/5 shadow-md flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-white/10 pb-3">
              <Calculator className="w-5 h-5 text-[#e8c176]" />
              <h3 className="font-bold text-base text-white uppercase tracking-wider">Chốt số & tạm tính</h3>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Chọn phòng</label>
              <select
                className="w-full h-11 px-3 bg-white/10 border border-white/20 rounded-xl text-sm font-semibold text-[#e8c176] focus:outline-none"
                value={selectedRoomNumber}
                onChange={(event) => setSelectedRoomNumber(event.target.value)}
              >
                {utilities.map((item) => (
                  <option key={item.roomNumber} value={item.roomNumber} className="text-[#101828]">
                    {item.roomNumber} - {item.tenantName}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-3 p-4 bg-white/5 rounded-xl border border-white/5">
              <div className="flex items-center gap-1.5 text-amber-400 text-xs font-bold uppercase tracking-wider">
                <Zap className="w-4 h-4" /> Điện tiêu thụ
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-gray-400 block mb-1">Chỉ số cũ</span>
                  <div className="h-10 px-3 bg-white/10 rounded-lg flex items-center font-mono font-bold">
                    {prevElec}
                  </div>
                </div>
                <div>
                  <span className="text-[#e8c176] block mb-1">Chỉ số mới *</span>
                  <input
                    type="number"
                    className="w-full h-10 px-3 bg-white/10 border border-white/20 rounded-lg font-mono font-bold text-white focus:outline-none focus:ring-1 focus:ring-[#c9a45c]"
                    value={currElecInput}
                    min={prevElec}
                    onChange={(event) => setCurrElecInput(Number(event.target.value))}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-3 p-4 bg-white/5 rounded-xl border border-white/5">
              <div className="flex items-center gap-1.5 text-indigo-400 text-xs font-bold uppercase tracking-wider">
                <Droplet className="w-4 h-4" /> Nước tiêu thụ
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-gray-400 block mb-1">Chỉ số cũ</span>
                  <div className="h-10 px-3 bg-white/10 rounded-lg flex items-center font-mono font-bold">
                    {prevWater}
                  </div>
                </div>
                <div>
                  <span className="text-[#e8c176] block mb-1">Chỉ số mới *</span>
                  <input
                    type="number"
                    className="w-full h-10 px-3 bg-white/10 border border-white/20 rounded-lg font-mono font-bold text-white focus:outline-none"
                    value={currWaterInput}
                    min={prevWater}
                    onChange={(event) => setCurrWaterInput(Number(event.target.value))}
                  />
                </div>
              </div>
            </div>

            <div className="bg-[#e8c176]/10 border border-[#e8c176]/20 p-4 rounded-xl text-xs space-y-2 text-[#d9e3f6]">
              <div className="flex justify-between gap-3">
                <span>Lượng điện dùng:</span>
                <span className="font-bold text-amber-300 font-mono">
                  {elecUsed} kWh x 3.500đ = {formatCurrency(electricityCost)}
                </span>
              </div>
              <div className="flex justify-between gap-3">
                <span>Lượng nước dùng:</span>
                <span className="font-bold text-indigo-300 font-mono">
                  {waterUsed} m³ x 20.000đ = {formatCurrency(waterCost)}
                </span>
              </div>
              <div className="flex justify-between gap-3 pt-2.5 border-t border-white/10 text-sm font-bold text-white">
                <span>Tổng điện nước tạm tính:</span>
                <span className="text-[#e8c176] font-mono">{formatCurrency(totalCost)}</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={isSaving || !activeRecord}
            className="w-full h-12 bg-[#c9a45c] hover:bg-[#e8c176] text-[#523a00] font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-sm tracking-wider uppercase bg-gradient-to-b from-white/10 to-transparent cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Save className="w-4 h-4" />
            {isSaving ? "Đang lưu..." : "Ghi nhận & chốt số"}
          </button>
        </div>
      </div>
    </div>
  );
}

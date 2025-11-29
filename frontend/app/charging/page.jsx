"use client";

import React, { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';

// Khởi tạo Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function ChargingDashboard() {
  const router = useRouter();
  
  const [viewState, setViewState] = useState('SELECT'); // 'SELECT' | 'CHARGING' | 'COMPLETED'
  
  // Dữ liệu
  const [stations, setStations] = useState([]);
  const [vehicles, setVehicles] = useState([]); // List chứa cả 6 xe
  const [loading, setLoading] = useState(true);

  // Selection
  const [selectedStationId, setSelectedStationId] = useState('');
  const [selectedVehicleId, setSelectedVehicleId] = useState('');

  // Session Sạc
  const [chargingSession, setChargingSession] = useState({
    batteryLevel: 0,
    maxBattery: 100,
    power: 0,
    energyAdded: 0,
    duration: 0,
    cost: 0,
    pricePerKwh: 3500
  });

  const intervalRef = useRef(null);

  // --- 1. LOAD DỮ LIỆU ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // A. Lấy danh sách TRẠM
        const { data: tramData } = await supabase
          .from('tram')
          .select('id, ten, dia_chi')
          .eq('trang_thai', 'hoat_dong');
        if (tramData) setStations(tramData);

        // B. Lấy danh sách TOÀN BỘ XE (Để bạn chọn test)
        const { data: xeData } = await supabase
          .from('xe')
          .select('id, name, bien_so, pin_phan_tram, dung_luong_pin_wh')
          .order('name', { ascending: true }); // Sắp xếp theo tên
        
        if (xeData) {
          setVehicles(xeData);
        }

        // C. (Option) Tự động chọn xe nếu user đang có chuyến đi
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: tripData } = await supabase
            .from('chuyen_di')
            .select('xe_id')
            .eq('nguoi_dung_id', user.id)
            .eq('trang_thai', 'IN_PROGRESS')
            .maybeSingle();

          // Nếu đang đi chuyến nào thì auto-select xe đó cho tiện
          if (tripData && tripData.xe_id) {
            setSelectedVehicleId(tripData.xe_id);
            // Cập nhật % pin ban đầu theo xe đó
            const currentCar = xeData?.find(x => x.id === tripData.xe_id);
            if (currentCar) {
               setChargingSession(prev => ({...prev, batteryLevel: currentCar.pin_phan_tram || 0}));
            }
          }
        }

      } catch (error) {
        console.error("Lỗi tải dữ liệu:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // --- 2. XỬ LÝ SẠC ---
  
  // Khi chọn xe từ dropdown, cập nhật lại % pin hiển thị ban đầu
  const handleSelectVehicle = (e) => {
    const vId = e.target.value;
    setSelectedVehicleId(vId);
    
    const selectedCar = vehicles.find(v => v.id === vId);
    if (selectedCar) {
      setChargingSession(prev => ({
        ...prev, 
        batteryLevel: selectedCar.pin_phan_tram || 0, // Lấy pin thực tế từ DB
        energyAdded: 0,
        cost: 0,
        duration: 0
      }));
    }
  };

  const startCharging = () => {
    if (!selectedStationId || !selectedVehicleId) return;
    setViewState('CHARGING');

    // Giả lập sạc: Mỗi giây tăng 1%
    intervalRef.current = setInterval(() => {
      setChargingSession(prev => {
        const newBattery = Math.min(prev.batteryLevel + 0.5, 100);
        
        // Tính toán số kWh nạp thêm (Giả sử dung lượng pin trung bình 2000Wh = 2kWh)
        // Mỗi 1% pin ~ 0.02 kWh
        const kwhAdded = (newBattery - prev.batteryLevel) * 0.02; 
        
        const newEnergy = prev.energyAdded + kwhAdded;
        const newCost = newEnergy * prev.pricePerKwh;

        if (newBattery >= 100) stopCharging();

        return {
          ...prev,
          batteryLevel: newBattery,
          energyAdded: newEnergy,
          cost: newCost,
          duration: prev.duration + 1,
          power: 22 + Math.random() // Giả lập dao động công suất ~22kW
        };
      });
    }, 1000);
  };

  const stopCharging = async () => {
    if (intervalRef.current) clearInterval(intervalRef.current);

    // QUAN TRỌNG: Lưu % Pin mới vào CSDL
    if (selectedVehicleId) {
      const finalPin = Math.round(chargingSession.batteryLevel);
      
      // Update bảng Xe
      await supabase
        .from('xe')
        .update({ pin_phan_tram: finalPin })
        .eq('id', selectedVehicleId);
      
      // Update bảng Vị trí (để map realtime thấy ngay)
      await supabase
        .from('vi_tri_xe')
        .update({ pin: finalPin })
        .eq('xe_id', selectedVehicleId);
    }
    
    setViewState('COMPLETED');
  };

  // --- 3. GIAO DIỆN ---
  
  // Format giây thành MM:SS
  const formatTime = (s) => `${Math.floor(s / 60).toString().padStart(2,'0')}:${(s % 60).toString().padStart(2,'0')}`;

  const renderSelect = () => (
    <div className="bg-white p-6 rounded-2xl shadow-lg max-w-md mx-auto mt-8 border border-gray-100">
      <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
        <span className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center mr-2 text-sm">1</span>
        Thiết lập trạm sạc
      </h2>
      
      <div className="space-y-4">
        {/* Dropdown chọn Xe */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Chọn xe cần sạc</label>
          <div className="relative">
            <select 
              className="w-full p-3 pl-10 border border-gray-300 rounded-xl bg-gray-50 focus:ring-2 focus:ring-green-500 outline-none appearance-none"
              value={selectedVehicleId}
              onChange={handleSelectVehicle}
            >
              <option value="">-- Vui lòng chọn xe --</option>
              {vehicles.map(xe => (
                <option key={xe.id} value={xe.id}>
                  {xe.name} - {xe.bien_so} ({xe.pin_phan_tram}%)
                </option>
              ))}
            </select>
            <div className="absolute left-3 top-3.5 text-gray-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v3.28a1 1 0 00.684.948l4.518 1.506a1 1 0 00.948-.684l.951-4.28A1 1 0 009.29 6H13" /></svg>
            </div>
          </div>
        </div>

        {/* Dropdown chọn Trạm */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Trạm sạc</label>
          <div className="relative">
            <select 
              className="w-full p-3 pl-10 border border-gray-300 rounded-xl bg-gray-50 focus:ring-2 focus:ring-green-500 outline-none appearance-none"
              value={selectedStationId}
              onChange={(e) => setSelectedStationId(e.target.value)}
            >
              <option value="">-- Chọn điểm sạc gần nhất --</option>
              {stations.map(tram => (
                <option key={tram.id} value={tram.id}>
                  {tram.ten}
                </option>
              ))}
            </select>
            <div className="absolute left-3 top-3.5 text-gray-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            </div>
          </div>
        </div>
      </div>

      <button 
        onClick={startCharging}
        disabled={!selectedStationId || !selectedVehicleId}
        className="w-full mt-6 py-4 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all shadow-lg shadow-green-200 flex items-center justify-center"
      >
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
        Bắt đầu sạc điện
      </button>
    </div>
  );

  const renderCharging = () => (
    <div className="max-w-md mx-auto mt-6 px-4">
      <div className="bg-gray-900 rounded-3xl p-6 text-white text-center shadow-2xl relative overflow-hidden">
        {/* Hiệu ứng nền */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-green-500 opacity-10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500 opacity-10 rounded-full blur-3xl"></div>

        <div className="relative z-10">
          <h3 className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-6">Đang kết nối trụ sạc</h3>
          
          {/* Vòng tròn Pin lớn */}
          <div className="relative w-64 h-64 mx-auto mb-8 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90 drop-shadow-2xl">
              <circle cx="128" cy="128" r="110" stroke="#374151" strokeWidth="12" fill="transparent" />
              <circle
                cx="128" cy="128" r="110"
                stroke="#10B981"
                strokeWidth="12"
                fill="transparent"
                strokeDasharray={2 * Math.PI * 110}
                strokeDashoffset={2 * Math.PI * 110 * (1 - chargingSession.batteryLevel / 100)}
                strokeLinecap="round"
                className="transition-all duration-700 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-7xl font-bold tracking-tighter">{Math.floor(chargingSession.batteryLevel)}<span className="text-2xl text-gray-400">%</span></span>
              <span className="text-green-400 text-sm font-medium mt-2 animate-pulse bg-green-900/30 px-3 py-1 rounded-full border border-green-500/30">⚡ Đang sạc nhanh</span>
            </div>
          </div>

          {/* Grid thông số */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="bg-gray-800/50 p-3 rounded-xl backdrop-blur-sm border border-gray-700">
               <p className="text-xs text-gray-400 mb-1">Công suất</p>
               <p className="text-xl font-bold font-mono">{chargingSession.power.toFixed(1)} kW</p>
            </div>
            <div className="bg-gray-800/50 p-3 rounded-xl backdrop-blur-sm border border-gray-700">
               <p className="text-xs text-gray-400 mb-1">Đã nạp</p>
               <p className="text-xl font-bold font-mono">{chargingSession.energyAdded.toFixed(2)} kWh</p>
            </div>
            <div className="bg-gray-800/50 p-3 rounded-xl backdrop-blur-sm border border-gray-700">
               <p className="text-xs text-gray-400 mb-1">Thời gian</p>
               <p className="text-xl font-bold font-mono">{formatTime(chargingSession.duration)}</p>
            </div>
            <div className="bg-gray-800/50 p-3 rounded-xl backdrop-blur-sm border border-gray-700">
               <p className="text-xs text-gray-400 mb-1">Tạm tính</p>
               <p className="text-xl font-bold text-green-400 font-mono">{Math.round(chargingSession.cost).toLocaleString()}</p>
            </div>
          </div>

          <button 
            onClick={stopCharging}
            className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/30 font-bold py-3 rounded-xl transition-all"
          >
            Ngắt kết nối
          </button>
        </div>
      </div>
    </div>
  );

  const renderCompleted = () => (
    <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md mx-auto mt-8 text-center animate-fade-in-up">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce-short">
        <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
      </div>
      <h2 className="text-2xl font-bold text-gray-900">Sạc thành công!</h2>
      <p className="text-gray-500 mt-2 mb-8">Xe của bạn đã sẵn sàng cho hành trình tiếp theo.</p>

      <div className="bg-gray-50 rounded-xl p-5 mb-8 space-y-3">
        <div className="flex justify-between items-center text-sm">
           <span className="text-gray-500">Mức pin cuối</span>
           <span className="font-bold text-gray-900 text-lg">{Math.round(chargingSession.batteryLevel)}%</span>
        </div>
        <div className="w-full border-t border-gray-200"></div>
        <div className="flex justify-between items-center text-sm">
           <span className="text-gray-500">Tổng thanh toán</span>
           <span className="font-bold text-green-600 text-xl">{Math.round(chargingSession.cost).toLocaleString()} đ</span>
        </div>
      </div>

      <div className="space-y-3">
        <button 
          onClick={() => {
             // Reset về ban đầu
             setViewState('SELECT');
             setChargingSession(prev => ({...prev, energyAdded: 0, cost: 0, duration: 0}));
          }}
          className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold"
        >
          Sạc xe khác
        </button>
        <button 
          onClick={() => router.push('/')}
          className="w-full py-3 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl font-medium"
        >
          Về trang chủ
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4">
      {/* Header đơn giản */}
      <div className="max-w-md mx-auto flex items-center mb-6">
        <button onClick={() => router.back()} className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
        </button>
        <h1 className="flex-1 text-center text-lg font-bold text-gray-800 mr-4">Trạm Sạc MakeGreen</h1>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center mt-20 space-y-4">
          <div className="w-10 h-10 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500 text-sm">Đang kết nối hệ thống trạm...</p>
        </div>
      ) : (
        <>
          {viewState === 'SELECT' && renderSelect()}
          {viewState === 'CHARGING' && renderCharging()}
          {viewState === 'COMPLETED' && renderCompleted()}
        </>
      )}
    </div>
  );
}
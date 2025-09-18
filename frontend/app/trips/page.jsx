"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import Link from 'next/link';

// Custom icons - cập nhật đường dẫn theo /public/images
const vehicleIcon = L.icon({
  iconUrl: '/images/motorcycle.png', // Icon xe máy
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
  shadowSize: [41, 41],
});

const startIcon = L.icon({
  iconUrl: '/images/green-flag.png', // Cờ xanh lá cho điểm đi
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [0, -41],
});

const endIcon = L.icon({
  iconUrl: '/images/red-flag.png', // Cờ đỏ cho điểm đến
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [0, -41],
});

// Hàm tính khoảng cách Haversine (giữ nguyên)
function haversineDistance(coords1, coords2) {
  const R = 6371;
  const dLat = (coords2[0] - coords1[0]) * Math.PI / 180;
  const dLng = (coords2[1] - coords1[1]) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(coords1[0] * Math.PI / 180) * Math.cos(coords2[0] * Math.PI / 180) *
            Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Component để điều chỉnh view bản đồ và fit bounds
function MapController({ position, path, tramThuePosition, tramTraPosition }) {
  const map = useMap();
  const prevPositionRef = useRef(position);

  // Smooth transition cho marker xe
  useEffect(() => {
    if (position && prevPositionRef.current) {
      const prevLatLng = prevPositionRef.current;
      const newLatLng = position;
      const steps = 10; // Số bước cho animation
      const deltaLat = (newLatLng[0] - prevLatLng[0]) / steps;
      const deltaLng = (newLatLng[1] - prevLatLng[1]) / steps;

      let step = 0;
      const animate = () => {
        if (step < steps) {
          const interpolatedLat = prevLatLng[0] + deltaLat * step;
          const interpolatedLng = prevLatLng[1] + deltaLng * step;
          map.panTo([interpolatedLat, interpolatedLng], { animate: true, duration: 0.1 });
          step++;
          requestAnimationFrame(animate);
        } else {
          map.setView(position, map.getZoom() || 15, { animate: true, duration: 0.5 });
          prevPositionRef.current = position;
        }
      };
      requestAnimationFrame(animate);
    } else {
      map.setView(position, 15, { animate: true });
      prevPositionRef.current = position;
    }
  }, [position, map]);

  // Fit bounds để hiển thị toàn bộ lộ trình, điểm đi và điểm đến
  useEffect(() => {
    if (path.length > 1 || tramThuePosition || tramTraPosition) {
      const bounds = L.latLngBounds(path);
      if (tramThuePosition) bounds.extend(tramThuePosition);
      if (tramTraPosition) bounds.extend(tramTraPosition);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    }
  }, [path, tramThuePosition, tramTraPosition, map]);

  return null;
}

export default function TripTrackingPage() {
  const [tripData, setTripData] = useState({
    vehicleName: "",
    licensePlate: "",
    startTime: "",
    distance: 0,
    totalDistance: 0,
    speed: 0,
    battery: 0,
    remainingKm: 0,
    position: [21.0285, 105.8412],
    xe_id: null,
    chuyen_di_id: null,
    nguoi_dung_id: null,
    tram_thue_position: null,
    tram_tra_position: null,
    pin_tieu_thu_per_km: 15,
    range_km: 100,
    isCompleted: false,
  });
  const [path, setPath] = useState([]);
  const [loading, setLoading] = useState(true);
  const [noTrip, setNoTrip] = useState(false);
  const channelsRef = useRef({ lichSuChannel: null, viTriChannel: null });
  const markerRef = useRef(null);
  const isAutoCompletingRef = useRef(false);

  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  // Fallback function để hoàn thành chuyến đi bằng Supabase nếu API không hoạt động
  const completeTripWithSupabase = async (chuyenDiId, pathData) => {
    try {
      const { error: updateError } = await supabase
        .from('chuyen_di')
        .update({
          trang_thai: 'COMPLETED',
          ket_thuc_luc: new Date().toISOString(),
          path: JSON.stringify(pathData),
        })
        .eq('id', chuyenDiId);

      if (updateError) throw updateError;

      const { error: deleteError } = await supabase
        .from('lich_su_vi_tri')
        .delete()
        .eq('chuyen_di_id', chuyenDiId);

      if (deleteError) console.error('Delete lich su error:', deleteError);

      console.log('Supabase complete successful');
      return true;
    } catch (error) {
      console.error('Supabase complete error:', error);
      return false;
    }
  };

  // Gọi API để hoàn thành chuyến đi, fallback sang Supabase nếu API fail
  const completeTripAPI = async (chuyenDiId, pathData) => {
    try {
      const response = await fetch(`/api/chuyen-di/${chuyenDiId}/complete`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: pathData }),
      });

      if (!response.ok) {
        console.warn(`API failed with status: ${response.status} ${response.statusText}`);
        console.log('Falling back to Supabase for trip completion');
        return await completeTripWithSupabase(chuyenDiId, pathData);
      }

      console.log('API complete successful');
      return true;
    } catch (error) {
      console.error('API complete error:', error);
      console.log('Falling back to Supabase for trip completion');
      return await completeTripWithSupabase(chuyenDiId, pathData);
    }
  };

  // Hàm tự động kết thúc chuyến - sử dụng useCallback để tránh stale closure
  const autoCompleteTrip = useCallback(async () => {
    if (isAutoCompletingRef.current) {
      console.log('Auto complete already in progress, skipping');
      return;
    }

    if (!tripData.chuyen_di_id || tripData.isCompleted || tripData.totalDistance === 0) {
      console.log('Auto complete skipped: no chuyen_di_id, already completed, or totalDistance=0');
      return;
    }

    console.log('Checking auto complete: distance=', tripData.distance, 'totalDistance=', tripData.totalDistance);

    if (tripData.distance < tripData.totalDistance) {
      console.log('Distance not reached yet');
      return;
    }

    isAutoCompletingRef.current = true;
    console.log('Starting auto complete process');

    const success = await completeTripAPI(tripData.chuyen_di_id, path);
    if (success) {
      if (channelsRef.current.lichSuChannel) supabase.removeChannel(channelsRef.current.lichSuChannel);
      if (channelsRef.current.viTriChannel) supabase.removeChannel(channelsRef.current.viTriChannel);

      setTripData(prev => ({ ...prev, isCompleted: true }));
      alert('Chuyến đi đã tự động hoàn thành khi đến đích!');
    } else {
      console.error('Failed to complete trip even with fallback');
      alert('Lỗi khi tự động hoàn thành chuyến đi. Vui lòng thử kết thúc thủ công.');
    }

    isAutoCompletingRef.current = false;
  }, [tripData.chuyen_di_id, tripData.isCompleted, tripData.distance, tripData.totalDistance, path]);

  // useEffect theo dõi distance và totalDistance để kiểm tra auto complete
  useEffect(() => {
    console.log('useEffect triggered - distance:', tripData.distance, 'total:', tripData.totalDistance, 'completed:', tripData.isCompleted);
    if (tripData.chuyen_di_id && !tripData.isCompleted && tripData.totalDistance > 0 && tripData.distance >= tripData.totalDistance) {
      console.log('Auto complete triggered by useEffect');
      autoCompleteTrip();
    }
  }, [tripData.distance, tripData.totalDistance, tripData.isCompleted, tripData.chuyen_di_id, autoCompleteTrip]);

  // Fetch và subscribe realtime
  useEffect(() => {
    const fetchAndSubscribe = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        window.location.href = '/login';
        return;
      }

      console.log('Fetching trip data for user:', user.id);

      const { data: chuyenDiData, error: chuyenError } = await supabase
        .from('chuyen_di')
        .select('*, don_thue!chuyen_di_don_thue_id_fkey(tram_thue_id, tram_tra_id)')
        .eq('nguoi_dung_id', user.id)
        .eq('trang_thai', 'PENDING')
        .single();

      if (chuyenError || !chuyenDiData) {
        console.error('No pending chuyen_di found:', chuyenError);
        setNoTrip(true);
        setLoading(false);
        return;
      }

      console.log('Found chuyen_di:', chuyenDiData.id);

      const startDate = new Date(chuyenDiData.bat_dau_luc);
      const formattedStartTime = `${startDate.getHours().toString().padStart(2, '0')}:${startDate.getMinutes().toString().padStart(2, '0')}`;

      setTripData(prev => ({
        ...prev,
        chuyen_di_id: chuyenDiData.id,
        xe_id: chuyenDiData.xe_id,
        nguoi_dung_id: user.id,
        startTime: formattedStartTime,
      }));

      const { data: xeData, error: xeError } = await supabase
        .from('xe')
        .select('name, bien_so, pin_tieu_thu_per_km, range_km')
        .eq('id', chuyenDiData.xe_id)
        .single();

      if (!xeError && xeData) {
        console.log('Xe data:', xeData);
        setTripData(prev => ({
          ...prev,
          vehicleName: xeData.name || 'Xe Vision',
          licensePlate: xeData.bien_so || '51F-123.45',
          pin_tieu_thu_per_km: xeData.pin_tieu_thu_per_km || 15,
          range_km: xeData.range_km || 100,
        }));
      } else {
        console.error('Xe error:', xeError);
      }

      let tramThuePosition = null;
      let tramTraPosition = null;
      if (chuyenDiData.don_thue?.tram_thue_id) {
        const { data: tramThueData } = await supabase
          .from('tram')
          .select('lat, lng, ten')
          .eq('id', chuyenDiData.don_thue.tram_thue_id)
          .single();
        if (tramThueData) {
          tramThuePosition = [Number(tramThueData.lat), Number(tramThueData.lng)];
          console.log('Tram thue position:', tramThuePosition);
        }
      }
      if (chuyenDiData.don_thue?.tram_tra_id) {
        const { data: tramTraData } = await supabase
          .from('tram')
          .select('lat, lng, ten')
          .eq('id', chuyenDiData.don_thue.tram_tra_id)
          .single();
        if (tramTraData) {
          tramTraPosition = [Number(tramTraData.lat), Number(tramTraData.lng)];
          console.log('Tram tra position:', tramTraPosition);
        }
      }

      let totalDistance = 0;
      if (tramThuePosition && tramTraPosition) {
        totalDistance = Math.round(haversineDistance(tramThuePosition, tramTraPosition) * 10) / 10;
        console.log('Calculated totalDistance:', totalDistance);
      } else {
        console.warn('Missing tram positions, totalDistance set to 0');
      }

      setTripData(prev => ({
        ...prev,
        tram_thue_position: tramThuePosition,
        tram_tra_position: tramTraPosition,
        totalDistance,
      }));

      let viTriData;
      const { data: existingViTri, error: viTriError } = await supabase
        .from('vi_tri_xe')
        .select('*')
        .eq('xe_id', chuyenDiData.xe_id)
        .single();

      if (viTriError || !existingViTri) {
        if (!tramThuePosition) {
          console.error('No tram_thue_position for default vi_tri_xe');
          setNoTrip(true);
          setLoading(false);
          return;
        }
        const { data: insertedViTri, error: insertError } = await supabase
          .from('vi_tri_xe')
          .insert({
            xe_id: chuyenDiData.xe_id,
            lat: tramThuePosition[0],
            lng: tramThuePosition[1],
            pin: 100,
            toc_do: 0,
            so_km: 0,
          })
          .select()
          .single();

        if (insertError || !insertedViTri) {
          console.error('Insert vi_tri error:', insertError);
          setNoTrip(true);
          setLoading(false);
          return;
        }
        viTriData = insertedViTri;
        console.log('Inserted default vi_tri_xe:', viTriData);
      } else {
        viTriData = existingViTri;
        console.log('Existing vi_tri_xe:', viTriData);
      }

      const currentPosition = [viTriData.lat || 21.0285, viTriData.lng || 105.8412];
      const currentRangeKm = xeData?.range_km || 100;
      const remainingKm = Math.round(((viTriData.pin || 100) / 100) * currentRangeKm);

      setTripData(prev => ({
        ...prev,
        position: currentPosition,
        battery: viTriData.pin || 100,
        speed: viTriData.toc_do || 0,
        distance: viTriData.so_km || 0,
        remainingKm,
        range_km: currentRangeKm,
      }));

      console.log('Initial tripData set: distance=', viTriData.so_km, 'totalDistance=', totalDistance);

      const { data: lichSuData, error: lichSuError } = await supabase
        .from('lich_su_vi_tri')
        .select('lat, lng, pin, toc_do, so_km, cap_nhat_luc')
        .eq('chuyen_di_id', chuyenDiData.id)
        .order('cap_nhat_luc', { ascending: true });

      if (!lichSuError && lichSuData && lichSuData.length > 0) {
        setPath(lichSuData.map(item => [item.lat, item.lng]));
        console.log('Loaded path from lich_su:', lichSuData.length, 'points');
      } else if (tramThuePosition) {
        setPath([tramThuePosition, currentPosition]);
        await supabase
          .from('lich_su_vi_tri')
          .insert({
            chuyen_di_id: chuyenDiData.id,
            lat: currentPosition[0],
            lng: currentPosition[1],
            pin: viTriData.pin || 100,
            toc_do: viTriData.toc_do || 0,
            so_km: viTriData.so_km || 0,
          });
        console.log('Initialized path and inserted first lich_su');
      } else {
        setPath([currentPosition]);
        console.log('Initialized path with current position only');
      }

      const lichSuChannel = supabase.channel('lich_su_vi_tri_changes')
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'lich_su_vi_tri',
          filter: `chuyen_di_id=eq.${chuyenDiData.id}`,
        }, (payload) => {
          console.log('Lich su payload received:', payload.new.so_km, 'vs total:', totalDistance);
          setTripData(prev => {
            if (prev.isCompleted) return prev;
            const newPosition = [payload.new.lat, payload.new.lng];
            const newDistance = payload.new.so_km;
            const updated = {
              ...prev,
              position: newPosition,
              battery: payload.new.pin,
              speed: payload.new.toc_do,
              distance: newDistance,
              remainingKm: Math.round((payload.new.pin / 100) * prev.range_km),
            };
            return updated;
          });
          setPath(prevPath => [...prevPath, [payload.new.lat, payload.new.lng]]);
        })
        .subscribe();

      channelsRef.current.lichSuChannel = lichSuChannel;

      const viTriChannel = supabase.channel('vi_tri_xe_changes')
        .on('postgres_changes', {
          event: 'UPDATE',
          schema: 'public',
          table: 'vi_tri_xe',
          filter: `xe_id=eq.${chuyenDiData.xe_id}`,
        }, (payload) => {
          console.log('Vi tri payload received:', payload.new.so_km, 'vs total:', totalDistance);
          setTripData(prev => {
            if (prev.isCompleted) return prev;
            const newPosition = [payload.new.lat, payload.new.lng];
            const newDistance = payload.new.so_km;
            const updated = {
              ...prev,
              position: newPosition,
              battery: payload.new.pin,
              speed: payload.new.toc_do,
              distance: newDistance,
              remainingKm: Math.round((payload.new.pin / 100) * prev.range_km),
            };
            return updated;
          });
          setPath(prevPath => {
            const lastPos = prevPath[prevPath.length - 1];
            const newPosition = [payload.new.lat, payload.new.lng];
            if (!lastPos || (Math.abs(lastPos[0] - newPosition[0]) > 0.0001 || Math.abs(lastPos[1] - newPosition[1]) > 0.0001)) {
              return [...prevPath, newPosition];
            }
            return prevPath;
          });
        })
        .subscribe();

      channelsRef.current.viTriChannel = viTriChannel;
      setLoading(false);

      return () => {
        if (channelsRef.current.lichSuChannel) supabase.removeChannel(channelsRef.current.lichSuChannel);
        if (channelsRef.current.viTriChannel) supabase.removeChannel(channelsRef.current.viTriChannel);
      };
    };
    fetchAndSubscribe();
  }, []);

  // Mô phỏng dữ liệu - cải thiện để di chuyển thực tế hơn
  useEffect(() => {
    if (!tripData.chuyen_di_id || tripData.isCompleted || !tripData.tram_thue_position || !tripData.tram_tra_position) return;

    const interval = setInterval(async () => {
      const prevDistance = tripData.distance;
      const progress = prevDistance / tripData.totalDistance;
      const newDistance = Math.min(prevDistance + (Math.random() * 0.3), tripData.totalDistance); // Tăng 0.2-0.5 km
      const deltaKm = newDistance - prevDistance;
      const newSpeed = 15 + Math.random() * 15; // Tốc độ 15-30 km/h
      const pinGiam = (deltaKm / 100) * tripData.pin_tieu_thu_per_km;
      const newBattery = Math.max(20, tripData.battery - pinGiam);
      const newRemainingKm = Math.round((newBattery / 100) * tripData.range_km);

      // Di chuyển tuyến tính từ tram_thue đến tram_tra
      const deltaLat = (tripData.tram_tra_position[0] - tripData.tram_thue_position[0]) * (deltaKm / tripData.totalDistance);
      const deltaLng = (tripData.tram_tra_position[1] - tripData.tram_thue_position[1]) * (deltaKm / tripData.totalDistance);
      const newLat = tripData.position[0] + deltaLat + (Math.random() * 0.0002 - 0.0001); // Nhiễu nhỏ
      const newLng = tripData.position[1] + deltaLng + (Math.random() * 0.0002 - 0.0001);

      await supabase
        .from('vi_tri_xe')
        .update({
          lat: newLat,
          lng: newLng,
          pin: Math.round(newBattery),
          toc_do: Math.round(newSpeed),
          so_km: newDistance,
          cap_nhat_luc: new Date().toISOString(),
        })
        .eq('xe_id', tripData.xe_id);

      await supabase
        .from('lich_su_vi_tri')
        .insert({
          chuyen_di_id: tripData.chuyen_di_id,
          lat: newLat,
          lng: newLng,
          pin: Math.round(newBattery),
          toc_do: Math.round(newSpeed),
          so_km: newDistance,
        });

      console.log('Simulation update: newDistance=', newDistance.toFixed(1), 'total=', tripData.totalDistance, 'position=', [newLat.toFixed(4), newLng.toFixed(4)]);

      setTripData(prev => ({
        ...prev,
        position: [newLat, newLng],
        distance: parseFloat(newDistance.toFixed(1)),
        speed: Math.round(newSpeed),
        battery: newBattery,
        remainingKm: newRemainingKm,
      }));
    }, 2000); // Cập nhật mỗi 2s

    return () => clearInterval(interval);
  }, [tripData.distance, tripData.battery, tripData.position, tripData.chuyen_di_id, tripData.xe_id, tripData.pin_tieu_thu_per_km, tripData.range_km, tripData.isCompleted, tripData.totalDistance, tripData.tram_thue_position, tripData.tram_tra_position]);

  // Animate marker
  useEffect(() => {
    if (markerRef.current) {
      markerRef.current.setLatLng(tripData.position);
      // Thêm hiệu ứng nhẹ khi di chuyển
      if (markerRef.current._icon) {
        markerRef.current._icon.style.transition = 'transform 0.5s ease-in-out';
      }
    }
  }, [tripData.position]);

  // Kết thúc chuyến thủ công
  const endTrip = async () => {
    if (tripData.isCompleted) {
      alert('Chuyến đi đã tự động hoàn thành!');
      return;
    }
    if (confirm('Bạn có chắc chắn muốn kết thúc chuyến đi?')) {
      const success = await completeTripAPI(tripData.chuyen_di_id, path);
      if (success) {
        if (channelsRef.current.lichSuChannel) supabase.removeChannel(channelsRef.current.lichSuChannel);
        if (channelsRef.current.viTriChannel) supabase.removeChannel(channelsRef.current.viTriChannel);

        setTripData(prev => ({ ...prev, isCompleted: true }));
        alert('Chuyến đi đã kết thúc! Cảm ơn bạn đã sử dụng dịch vụ.');
      } else {
        console.error('Failed to complete trip even with fallback');
        alert('Lỗi khi kết thúc chuyến đi. Vui lòng thử lại.');
      }
    }
  };

  // Các hàm khác
  const contactSupport = () => {
    alert('Đang kết nối với bộ phận hỗ trợ khách hàng...\nHotline: 1900-1234');
  };

  const reportIssue = async () => {
    if (tripData.isCompleted) {
      alert('Chuyến đi đã hoàn thành, không thể báo sự cố nữa.');
      return;
    }
    const issues = ['Xe bị hỏng', 'Pin yếu', 'Sự cố khác'];
    const issue = prompt('Vui lòng mô tả sự cố:\n1. Xe bị hỏng\n2. Pin yếu\n3. Sự cố khác\n\nNhập số tương ứng (1-3):');
    if (issue && issue >= 1 && issue <= 3) {
      const { data: chuyenDiData } = await supabase
        .from('chuyen_di')
        .select('xe_id')
        .eq('nguoi_dung_id', tripData.nguoi_dung_id)
        .eq('trang_thai', 'PENDING')
        .single();

      if (chuyenDiData) {
        const { error } = await supabase
          .from('su_co')
          .insert({
            xe_id: chuyenDiData.xe_id,
            nguoi_bao_cao_id: tripData.nguoi_dung_id,
            muc_do: 'MEDIUM',
            mo_ta: issues[issue - 1],
          });

        if (!error) {
          alert(`Đã ghi nhận sự cố: ${issues[issue - 1]}\nChúng tôi sẽ liên hệ với bạn sớm nhất.`);
        } else {
          alert('Lỗi khi báo sự cố.');
        }
      }
    }
  };

  // Giao diện khi không có chuyến đi
  if (noTrip || tripData.isCompleted) {
    return (
      <div className="bg-gray-50 min-h-screen font-inter flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-lg text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {tripData.isCompleted ? 'Chuyến đi đã hoàn thành!' : 'Không có chuyến đi đang diễn ra'}
          </h1>
          <p className="text-gray-600 mb-6">
            {tripData.isCompleted ? 'Cảm ơn bạn đã sử dụng dịch vụ.' : 'Vui lòng đặt xe để theo dõi chuyến đi.'}
          </p>
          <Link href="/vehicles">
            <button className="bg-emerald-500 hover:bg-emerald-600 text-white font-medium py-3 px-6 rounded-lg transition-colors">
              Đặt xe ngay
            </button>
          </Link>
        </div>
      </div>
    );
  }

  // Giao diện loading
  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen font-inter flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-lg text-center">
          <h1 className="text-xl font-semibold text-gray-900 mb-4">Đang tải dữ liệu chuyến đi...</h1>
          <div className="animate-spin w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen font-inter">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-100">
        <div className="flex items-center justify-between px-4 py-3">
          <Link href="/">
            <button className="p-2 -ml-2 rounded-lg hover:bg-gray-100 transition-colors">
              <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          </Link>
          <h1 className="text-lg font-semibold text-gray-900">Theo dõi chuyến đi</h1>
          <button className="p-2 -mr-2 rounded-lg hover:bg-gray-100 transition-colors relative">
            <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-5 5v-5zM9 7H4l5-5v5z" />
            </svg>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
          </button>
        </div>
      </div>

      {/* Trip Info */}
      <div className="bg-white mx-4 mt-4 rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">{tripData.vehicleName}</h2>
              <p className="text-sm text-gray-600">{tripData.licensePlate}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-gray-900">{tripData.startTime}</p>
            <p className="text-xs text-gray-500">Bắt đầu</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-500 mb-1">Quãng đường đã đi</p>
            <p className="text-lg font-semibold text-gray-900">{tripData.distance} km</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-500 mb-1">Tổng quãng đường</p>
            <p className="text-lg font-semibold text-gray-900">{tripData.totalDistance} km</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-500 mb-1">Tốc độ</p>
            <p className="text-lg font-semibold text-gray-900">{tripData.speed} km/h</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-500 mb-1">Tiến độ</p>
            <p className="text-lg font-semibold text-gray-900">
              {tripData.totalDistance > 0 ? Math.round((tripData.distance / tripData.totalDistance) * 100) : 0}%
            </p>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-gray-500">Mức pin</p>
            <p className="text-sm font-medium text-gray-900">{Math.round(tripData.battery)}%</p>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div
              className="h-2 rounded-full bg-gradient-to-r from-emerald-500 to-green-400 transition-all duration-300"
              style={{ width: `${tripData.battery}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-500 mt-1">Còn khoảng {tripData.remainingKm}km</p>
        </div>
      </div>

      {/* Map - cải thiện để theo dõi thực tế và mượt hơn */}
      <div className="mx-4 mt-4 rounded-xl overflow-hidden shadow-sm border border-gray-100 h-[60vh]">
        <MapContainer center={tripData.position} zoom={15} className="w-full h-full">
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <MapController
            position={tripData.position}
            path={path}
            tramThuePosition={tripData.tram_thue_position}
            tramTraPosition={tripData.tram_tra_position}
          />
          {/* Marker xe máy */}
          <Marker position={tripData.position} icon={vehicleIcon} ref={markerRef}>
            <Popup autoClose={false} closeOnClick={false}>
              <div className="text-sm">
                <p><strong>Xe:</strong> {tripData.vehicleName} ({tripData.licensePlate})</p>
                <p><strong>Pin:</strong> {Math.round(tripData.battery)}%</p>
                <p><strong>Tốc độ:</strong> {tripData.speed} km/h</p>
                <p><strong>Quãng đường:</strong> {tripData.distance} km</p>
              </div>
            </Popup>
          </Marker>
          {/* Đường đi thực tế (đã đi) - xanh dương đậm, mượt */}
          {path.length > 1 && (
            <Polyline
              positions={path}
              color="#1e90ff"
              weight={5}
              opacity={0.8}
              smoothFactor={2}
            />
          )}
          {/* Đường dự kiến đến điểm đến - xanh lá, nét đứt */}
          {tripData.tram_tra_position && !tripData.isCompleted && (
            <Polyline
              positions={[tripData.position, tripData.tram_tra_position]}
              color="#32cd32"
              weight={3}
              opacity={0.6}
              dashArray="10, 10"
              smoothFactor={2}
            />
          )}
          {/* Marker điểm đi (trạm thuê) - cờ xanh lá */}
          {tripData.tram_thue_position && (
            <Marker position={tripData.tram_thue_position} icon={startIcon}>
              <Popup>
                <div className="text-sm">
                  <p><strong>Điểm đi:</strong> Trạm thuê</p>
                  <p>Tọa độ: {tripData.tram_thue_position[0].toFixed(4)}, {tripData.tram_thue_position[1].toFixed(4)}</p>
                </div>
              </Popup>
            </Marker>
          )}
          {/* Marker điểm đến (trạm trả) - cờ đỏ */}
          {tripData.tram_tra_position && (
            <Marker position={tripData.tram_tra_position} icon={endIcon}>
              <Popup>
                <div className="text-sm">
                  <p><strong>Điểm đến:</strong> Trạm trả</p>
                  <p>Tọa độ: {tripData.tram_tra_position[0].toFixed(4)}, {tripData.tram_tra_position[1].toFixed(4)}</p>
                </div>
              </Popup>
            </Marker>
          )}
        </MapContainer>
      </div>

      {/* Control Panel */}
      <div className="bg-white mx-4 mt-4 mb-6 rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={endTrip}
            disabled={tripData.isCompleted}
            className="bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-lg transition-colors flex flex-col items-center space-y-1"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 10h6v6H9z" />
            </svg>
            <span className="text-xs">Kết thúc</span>
          </button>
          <button
            onClick={contactSupport}
            disabled={tripData.isCompleted}
            className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-lg transition-colors flex flex-col items-center space-y-1"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            <span className="text-xs">Hỗ trợ</span>
          </button>
          <button
            onClick={reportIssue}
            disabled={tripData.isCompleted}
            className="bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-lg transition-colors flex flex-col items-center space-y-1"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <span className="text-xs">Báo sự cố</span>
          </button>
        </div>
      </div>
    </div>
  );
}
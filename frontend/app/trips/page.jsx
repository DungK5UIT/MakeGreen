"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import Link from 'next/link';

// Custom icons - cập nhật đường dẫn theo /public/images
const vehicleIcon = L.icon({
  iconUrl: '/images/trips/motorcycle.png', // Icon xe máy
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
  shadowSize: [41, 41],
});

const startIcon = L.icon({
  iconUrl: '/images/trips/green-flag.png', // Cờ xanh lá cho điểm đi
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [0, -41],
});

const endIcon = L.icon({
  iconUrl: '/images/trips/red-flag.png', // Cờ đỏ cho điểm đến
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [0, -41],
});

// Hàm tính khoảng cách Haversine
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
  const [isTripStarted, setIsTripStarted] = useState(false); // State to track if trip has started
  const channelsRef = useRef({ lichSuChannel: null, viTriChannel: null });
  const markerRef = useRef(null);
  const isAutoCompletingRef = useRef(false);

  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  // Structured logging function with improved formatting
  const logMessage = (type, message, details = {}) => {
    const timestamp = new Date().toISOString();
    const typeColor = type === 'success' ? '#22c55e' : type === 'error' ? '#ef4444' : type === 'info' ? '#3b82f6' : '#f59e0b';
    console.log(
      `%c[${type.toUpperCase()}] %c${timestamp} %c- ${message}`,
      `color: ${typeColor}; font-weight: bold;`,
      'color: #6b7280; font-style: italic;',
      `color: ${typeColor};`,
      details
    );
  };

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

      const { error: updateXeError } = await supabase
        .from('xe')
        .update({ trang_thai: 'AVAILABLE' })
        .eq('id', tripData.xe_id);

      if (updateXeError) logMessage('error', 'Failed to update xe to AVAILABLE', { error: updateXeError });
      else logMessage('success', 'Updated xe to AVAILABLE via Supabase');
      if (deleteError) logMessage('error', 'Failed to delete lich_su_vi_tri', { error: deleteError });

      logMessage('success', 'Trip completed successfully via Supabase', { chuyenDiId });
      return true;
    } catch (error) {
      logMessage('error', 'Failed to complete trip via Supabase', { error, chuyenDiId });
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
        logMessage('warning', `API failed with status: ${response.status}`, { statusText: response.statusText });
        logMessage('info', 'Falling back to Supabase for trip completion', { chuyenDiId });
        return await completeTripWithSupabase(chuyenDiId, pathData);
      }

      logMessage('success', 'Trip completed successfully via API', { chuyenDiId });
      return true;
    } catch (error) {
      logMessage('error', 'API complete error', { error, chuyenDiId });
      logMessage('info', 'Falling back to Supabase for trip completion', { chuyenDiId });
      return await completeTripWithSupabase(chuyenDiId, pathData);
    }
  };

  // Fallback function để ghi sự cố bằng Supabase nếu API không hoạt động
  const reportIssueWithSupabase = async (xeId, nguoiBaoCaoId, mucDo, moTa) => {
    try {
      const { data, error } = await supabase
        .from('su_co')
        .insert({
          xe_id: xeId,
          nguoi_bao_cao_id: nguoiBaoCaoId,
          muc_do: mucDo,
          mo_ta: moTa,
        })
        .select()
        .single();

      if (error) throw error;

      logMessage('success', 'Issue reported successfully via Supabase', { suCoId: data.id });
      return true;
    } catch (error) {
      logMessage('error', 'Failed to report issue via Supabase', { error });
      return false;
    }
  };

  // Hàm tự động kết thúc chuyến
  const autoCompleteTrip = useCallback(async () => {
    if (isAutoCompletingRef.current) {
      logMessage('info', 'Auto complete already in progress, skipping', { chuyenDiId: tripData.chuyen_di_id });
      return;
    }

    if (!tripData.chuyen_di_id || tripData.isCompleted || tripData.totalDistance === 0) {
      logMessage('info', 'Auto complete skipped', {
        chuyenDiId: tripData.chuyen_di_id,
        isCompleted: tripData.isCompleted,
        totalDistance: tripData.totalDistance,
      });
      return;
    }

    logMessage('info', 'Checking auto complete conditions', {
      distance: tripData.distance,
      totalDistance: tripData.totalDistance,
    });

    if (tripData.distance < tripData.totalDistance) {
      logMessage('info', 'Distance not reached yet', {
        distance: tripData.distance,
        totalDistance: tripData.totalDistance,
      });
      return;
    }

    isAutoCompletingRef.current = true;
    logMessage('info', 'Starting auto complete process', { chuyenDiId: tripData.chuyen_di_id });

    const success = await completeTripAPI(tripData.chuyen_di_id, path);
    if (success) {
      if (channelsRef.current.lichSuChannel) supabase.removeChannel(channelsRef.current.lichSuChannel);
      if (channelsRef.current.viTriChannel) supabase.removeChannel(channelsRef.current.viTriChannel);

      setTripData(prev => ({ ...prev, isCompleted: true }));
      alert('Chuyến đi đã tự động hoàn thành khi đến đích!');
      logMessage('success', 'Trip auto-completed successfully', { chuyenDiId: tripData.chuyen_di_id });
    } else {
      logMessage('error', 'Failed to complete trip even with fallback', { chuyenDiId: tripData.chuyen_di_id });
      alert('Lỗi khi tự động hoàn thành chuyến đi. Vui lòng thử kết thúc thủ công.');
    }

    isAutoCompletingRef.current = false;
  }, [tripData.chuyen_di_id, tripData.isCompleted, tripData.distance, tripData.totalDistance, path]);

  // useEffect theo dõi distance và totalDistance để kiểm tra auto complete
  useEffect(() => {
    logMessage('info', 'Monitoring distance for auto complete', {
      distance: tripData.distance,
      totalDistance: tripData.totalDistance,
      isCompleted: tripData.isCompleted,
    });
    if (tripData.chuyen_di_id && !tripData.isCompleted && tripData.totalDistance > 0 && tripData.distance >= tripData.totalDistance) {
      logMessage('info', 'Triggering auto complete due to distance reached', {
        distance: tripData.distance,
        totalDistance: tripData.totalDistance,
      });
      autoCompleteTrip();
    }
  }, [tripData.distance, tripData.totalDistance, tripData.isCompleted, tripData.chuyen_di_id, autoCompleteTrip]);

  // Fetch và subscribe realtime
  useEffect(() => {
    const fetchAndSubscribe = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        logMessage('error', 'User not authenticated, redirecting to login', {});
        window.location.href = '/login';
        return;
      }

      logMessage('info', 'Fetching trip data for user', { userId: user.id });

      const { data: chuyenDiData, error: chuyenError } = await supabase
        .from('chuyen_di')
        .select('*, don_thue!chuyen_di_don_thue_id_fkey(tram_thue_id, tram_tra_id)')
        .eq('nguoi_dung_id', user.id)
        .eq('trang_thai', 'PENDING')
        .single();

      if (chuyenError || !chuyenDiData) {
        logMessage('error', 'No pending chuyen_di found', { error: chuyenError });
        setNoTrip(true);
        setLoading(false);
        return;
      }

      logMessage('success', 'Found pending chuyen_di', { chuyenDiId: chuyenDiData.id });

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
        logMessage('success', 'Fetched vehicle data', { xeId: chuyenDiData.xe_id, name: xeData.name });
        setTripData(prev => ({
          ...prev,
          vehicleName: xeData.name || 'Xe Vision',
          licensePlate: xeData.bien_so || '51F-123.45',
          pin_tieu_thu_per_km: xeData.pin_tieu_thu_per_km || 15,
          range_km: xeData.range_km || 100,
        }));
      } else {
        logMessage('error', 'Failed to fetch vehicle data', { error: xeError });
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
          logMessage('success', 'Fetched tram thue position', { position: tramThuePosition });
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
          logMessage('success', 'Fetched tram tra position', { position: tramTraPosition });
        }
      }

      let totalDistance = 0;
      if (tramThuePosition && tramTraPosition) {
        totalDistance = Math.round(haversineDistance(tramThuePosition, tramTraPosition) * 10) / 10;
        logMessage('success', 'Calculated total distance', { totalDistance });
      } else {
        logMessage('warning', 'Missing tram positions, totalDistance set to 0', {});
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
          logMessage('error', 'No tram_thue_position for default vi_tri_xe', {});
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
          logMessage('error', 'Failed to insert vi_tri_xe', { error: insertError });
          setNoTrip(true);
          setLoading(false);
          return;
        }
        viTriData = insertedViTri;
        logMessage('success', 'Inserted default vi_tri_xe', { viTriData });
      } else {
        viTriData = existingViTri;
        logMessage('success', 'Fetched existing vi_tri_xe', { viTriData });
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

      logMessage('success', 'Initial trip data set', {
        distance: viTriData.so_km,
        totalDistance,
        position: currentPosition,
      });

      const { data: lichSuData, error: lichSuError } = await supabase
        .from('lich_su_vi_tri')
        .select('lat, lng, pin, toc_do, so_km, cap_nhat_luc')
        .eq('chuyen_di_id', chuyenDiData.id)
        .order('cap_nhat_luc', { ascending: true });

      if (!lichSuError && lichSuData && lichSuData.length > 0) {
        setPath(lichSuData.map(item => [item.lat, item.lng]));
        logMessage('success', 'Loaded path from lich_su_vi_tri', { points: lichSuData.length });
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
        logMessage('success', 'Initialized path and inserted first lich_su_vi_tri', { position: currentPosition });
      } else {
        setPath([currentPosition]);
        logMessage('success', 'Initialized path with current position only', { position: currentPosition });
      }

      const lichSuChannel = supabase.channel('lich_su_vi_tri_changes')
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'lich_su_vi_tri',
          filter: `chuyen_di_id=eq.${chuyenDiData.id}`,
        }, (payload) => {
          logMessage('info', 'Received lich_su_vi_tri update', {
            so_km: payload.new.so_km,
            totalDistance,
            position: [payload.new.lat, payload.new.lng],
          });
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
          logMessage('info', 'Received vi_tri_xe update', {
            so_km: payload.new.so_km,
            totalDistance,
            position: [payload.new.lat, payload.new.lng],
          });
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

  // Hàm bắt đầu chuyến đi
const startTrip = async () => {
  if (isTripStarted) {
    logMessage('info', 'Trip already started', { chuyenDiId: tripData.chuyen_di_id });
    alert('Chuyến đi đã được bắt đầu!');
    return;
  }

  if (!tripData.tram_thue_position) {
    logMessage('error', 'No tram_thue_position to reset', {});
    alert('Không có vị trí trạm thuê để bắt đầu!');
    return;
  }

  // Reset vi_tri_xe về tram_thue_position
  const resetPosition = tripData.tram_thue_position;
  try {
    const { error: updateError } = await supabase
      .from('vi_tri_xe')
      .update({
        lat: resetPosition[0],
        lng: resetPosition[1],
        pin: 100,  // Optional: reset pin nếu cần
        toc_do: 0,
        so_km: 0,  // Reset distance
        cap_nhat_luc: new Date().toISOString(),
      })
      .eq('xe_id', tripData.xe_id);

    if (updateError) throw updateError;

    // Insert lich_su_vi_tri đầu tiên nếu chưa có
    const { data: existingLichSu } = await supabase
      .from('lich_su_vi_tri')
      .select('*')
      .eq('chuyen_di_id', tripData.chuyen_di_id)
      .limit(1);

    if (!existingLichSu || existingLichSu.length === 0) {
      await supabase
        .from('lich_su_vi_tri')
        .insert({
          chuyen_di_id: tripData.chuyen_di_id,
          lat: resetPosition[0],
          lng: resetPosition[1],
          pin: 100,
          toc_do: 0,
          so_km: 0,
        });
    }

    // Cập nhật state local để bản đồ refresh
    setTripData(prev => ({
      ...prev,
      position: resetPosition,
      distance: 0,
      battery: 100,
      speed: 0,
      remainingKm: prev.range_km,
    }));
    setPath([resetPosition]);  // Reset path về chỉ cờ xanh

    setIsTripStarted(true);
    logMessage('success', 'Trip started and position reset to tram_thue', { position: resetPosition });
    alert('Chuyến đi đã bắt đầu! Vị trí xe đã reset về trạm thuê.');
  } catch (error) {
    logMessage('error', 'Failed to reset position and start trip', { error });
    alert('Lỗi khi bắt đầu chuyến đi. Vui lòng thử lại.');
  }
};

  // Mô phỏng dữ liệu - chỉ chạy khi chuyến đi đã bắt đầu
  useEffect(() => {
    if (!isTripStarted || !tripData.chuyen_di_id || tripData.isCompleted || !tripData.tram_thue_position || !tripData.tram_tra_position) return;

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

      logMessage('info', 'Simulation update', {
        newDistance: newDistance.toFixed(1),
        totalDistance: tripData.totalDistance,
        position: [newLat.toFixed(4), newLng.toFixed(4)],
        battery: newBattery.toFixed(1),
        speed: newSpeed.toFixed(1),
      });

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
  }, [isTripStarted, tripData.distance, tripData.battery, tripData.position, tripData.chuyen_di_id, tripData.xe_id, tripData.pin_tieu_thu_per_km, tripData.range_km, tripData.isCompleted, tripData.totalDistance, tripData.tram_thue_position, tripData.tram_tra_position]);

  // Animate marker
  useEffect(() => {
    if (markerRef.current) {
      markerRef.current.setLatLng(tripData.position);
      if (markerRef.current._icon) {
        markerRef.current._icon.style.transition = 'transform 0.5s ease-in-out';
      }
    }
  }, [tripData.position]);

  // Kết thúc chuyến thủ công
  const endTrip = async () => {
    if (tripData.isCompleted) {
      logMessage('info', 'Trip already completed', { chuyenDiId: tripData.chuyen_di_id });
      alert('Chuyến đi đã tự động hoàn thành!');
      return;
    }
    if (confirm('Bạn có chắc chắn muốn kết thúc chuyến đi?')) {
      const success = await completeTripAPI(tripData.chuyen_di_id, path);
      if (success) {
        if (channelsRef.current.lichSuChannel) supabase.removeChannel(channelsRef.current.lichSuChannel);
        if (channelsRef.current.viTriChannel) supabase.removeChannel(channelsRef.current.viTriChannel);

        setTripData(prev => ({ ...prev, isCompleted: true }));
        logMessage('success', 'Trip manually completed', { chuyenDiId: tripData.chuyen_di_id });
        alert('Chuyến đi đã kết thúc! Cảm ơn bạn đã sử dụng dịch vụ.');
      } else {
        logMessage('error', 'Failed to complete trip manually', { chuyenDiId: tripData.chuyen_di_id });
        alert('Lỗi khi kết thúc chuyến đi. Vui lòng thử lại.');
      }
    }
  };

  // Hàm liên hệ hỗ trợ
  const contactSupport = () => {
    logMessage('info', 'Contact support initiated', { userId: tripData.nguoi_dung_id });
    alert('Đang kết nối với bộ phận hỗ trợ khách hàng...\nHotline: 1900-1234');
  };

  // Hàm báo sự cố với fallback sang Supabase
  const reportIssue = async () => {
    if (tripData.isCompleted) {
      logMessage('info', 'Cannot report issue, trip already completed', { chuyenDiId: tripData.chuyen_di_id });
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
        const moTa = issues[issue - 1];
        const mucDo = 'MEDIUM';
        const nguoiBaoCaoId = tripData.nguoi_dung_id;
        const xeId = chuyenDiData.xe_id;

        try {
          const params = new URLSearchParams();
          params.append('xeId', xeId);
          params.append('nguoiBaoCaoId', nguoiBaoCaoId);
          params.append('mucDo', mucDo);
          params.append('moTa', moTa);

          const response = await fetch('http://localhost:8080/api/su-co', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: params.toString(),
          });

          if (!response.ok) {
            logMessage('warning', `API failed with status: ${response.status}`, { statusText: response.statusText });
            logMessage('info', 'Falling back to Supabase for issue report');
            const fallbackSuccess = await reportIssueWithSupabase(xeId, nguoiBaoCaoId, mucDo, moTa);
            if (!fallbackSuccess) {
              throw new Error('Fallback to Supabase also failed');
            }
          } else {
            const result = await response.json();
            logMessage('success', 'Issue reported successfully via API', {
              issue: moTa,
              xeId,
              userId: nguoiBaoCaoId,
              suCoId: result.id,
            });
          }

          alert(`Đã ghi nhận sự cố: ${moTa}\nChúng tôi sẽ liên hệ với bạn sớm nhất.`);

          // Tự động hoàn thành chuyến đi sau khi báo sự cố thành công
          const completeSuccess = await completeTripAPI(tripData.chuyen_di_id, path);
          if (completeSuccess) {
            if (channelsRef.current.lichSuChannel) supabase.removeChannel(channelsRef.current.lichSuChannel);
            if (channelsRef.current.viTriChannel) supabase.removeChannel(channelsRef.current.viTriChannel);
            setTripData(prev => ({ ...prev, isCompleted: true }));
            logMessage('success', 'Trip completed automatically after issue report', { chuyenDiId: tripData.chuyen_di_id });
            alert('Chuyến đi đã được hoàn thành do báo sự cố.');
          } else {
            logMessage('error', 'Failed to complete trip after issue report', { chuyenDiId: tripData.chuyen_di_id });
            alert('Lỗi khi hoàn thành chuyến đi sau báo sự cố. Vui lòng thử kết thúc thủ công.');
          }
        } catch (error) {
          logMessage('error', 'Failed to report issue', { error: error.message });
          alert(`Lỗi khi báo sự cố: ${error.message}`);
        }
      } else {
        logMessage('error', 'No active trip found for issue reporting', { userId: tripData.nguoi_dung_id });
        alert('Không tìm thấy chuyến đi đang hoạt động.');
      }
    } else {
      logMessage('warning', 'Invalid issue selection', { input: issue });
      alert('Lựa chọn không hợp lệ.');
    }
  };

  // Giao diện khi không có chuyến đi hoặc chuyến đi đã hoàn thành
  if (noTrip || tripData.isCompleted) {
    return (
      <div className="bg-gray-50 min-h-screen font-inter flex items-center justify-center px-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-md w-full">
          <div className="mb-6">
            {tripData.isCompleted ? (
              <svg className="w-16 h-16 mx-auto text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <svg className="w-16 h-16 mx-auto text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">
            {tripData.isCompleted ? 'Chuyến đi đã hoàn thành!' : 'Không có chuyến đi đang diễn ra'}
          </h1>
          <p className="text-gray-600 mb-8">
            {tripData.isCompleted ? 'Cảm ơn bạn đã sử dụng dịch vụ. Chúng tôi mong được phục vụ bạn lần sau!' : 'Vui lòng đặt xe để bắt đầu một chuyến đi mới.'}
          </p>
          <Link href="/vehicles">
            <button className="bg-emerald-500 hover:bg-emerald-600 text-white font-medium py-3 px-6 rounded-xl transition-colors w-full">
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
      <div className="bg-gray-50 min-h-screen font-inter flex items-center justify-center px-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-md w-full">
          <div className="mb-6">
            <div className="animate-spin w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full mx-auto"></div>
          </div>
          <h1 className="text-xl font-semibold text-gray-900 mb-3">Đang tải dữ liệu chuyến đi...</h1>
          <p className="text-gray-600">Vui lòng chờ trong giây lát.</p>
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

      {/* Map */}
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
          {path.length > 1 && (
            <Polyline
              positions={path}
              color="#1e90ff"
              weight={5}
              opacity={0.8}
              smoothFactor={2}
            />
          )}
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
        <div className="grid grid-cols-4 gap-3">
          <button
            onClick={startTrip}
            disabled={isTripStarted || tripData.isCompleted}
            className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-lg transition-colors flex flex-col items-center space-y-1"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-6.752-3.584v7.168l6.752-3.584z" />
            </svg>
            <span className="text-xs">Bắt đầu</span>
          </button>
          <button
            onClick={endTrip}
            disabled={!isTripStarted || tripData.isCompleted}
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
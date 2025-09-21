import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

let simulationInterval = null;
const SIMULATION_KEY = 'trip_simulation';

// Hàm tính khoảng cách Haversine
export function haversineDistance(coords1, coords2) {
  const R = 6371;
  const dLat = (coords2[0] - coords1[0]) * Math.PI / 180;
  const dLng = (coords2[1] - coords1[1]) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(coords1[0] * Math.PI / 180) * Math.cos(coords2[0] * Math.PI / 180) *
            Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export const startSimulation = async (chuyenDiId, xeId, tramThuePosition, tramTraPosition, totalDistance, pinTieuThuPerKm, rangeKm) => {
  const existingSimulation = localStorage.getItem(SIMULATION_KEY);
  if (existingSimulation === chuyenDiId.toString()) {
    console.log('Simulation already running for chuyen_di_id:', chuyenDiId);
    return;
  }

  localStorage.setItem(SIMULATION_KEY, chuyenDiId.toString());

  let { data: viTriData } = await supabase
    .from('vi_tri_xe')
    .select('*')
    .eq('xe_id', xeId)
    .single();

  // Luôn reset vị trí về tramThuePosition để đảm bảo bắt đầu từ cờ xanh
  const resetPosition = tramThuePosition;
  const resetBattery = 100;
  const resetDistance = 0;
  const resetSpeed = 0;

  if (viTriData) {
    // Update nếu đã tồn tại
    const { error: updateError } = await supabase
      .from('vi_tri_xe')
      .update({
        lat: resetPosition[0],
        lng: resetPosition[1],
        pin: resetBattery,
        toc_do: resetSpeed,
        so_km: resetDistance,
        cap_nhat_luc: new Date().toISOString(),
      })
      .eq('xe_id', xeId);

    if (updateError) {
      console.error('Failed to reset vi_tri_xe:', updateError);
      return; // Dừng nếu lỗi
    }

    viTriData = {
      ...viTriData,
      lat: resetPosition[0],
      lng: resetPosition[1],
      pin: resetBattery,
      toc_do: resetSpeed,
      so_km: resetDistance,
    };
    console.log('Reset vi_tri_xe to tram_thue_position:', resetPosition);
  } else {
    // Insert nếu chưa tồn tại
    console.error('No vi_tri_xe found, initializing with tram_thue_position');
    const { data: insertedViTri, error: insertError } = await supabase
      .from('vi_tri_xe')
      .insert({
        xe_id: xeId,
        lat: resetPosition[0],
        lng: resetPosition[1],
        pin: resetBattery,
        toc_do: resetSpeed,
        so_km: resetDistance,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Failed to insert vi_tri_xe:', insertError);
      return; // Dừng nếu lỗi
    }

    viTriData = insertedViTri;
  }

  let currentDistance = resetDistance;
  let currentBattery = resetBattery;
  let currentPosition = [resetPosition[0], resetPosition[1]];

  // Insert lịch sử vị trí đầu tiên nếu cần (để path bắt đầu từ cờ xanh)
  const { data: existingLichSu } = await supabase
    .from('lich_su_vi_tri')
    .select('*')
    .eq('chuyen_di_id', chuyenDiId)
    .limit(1);

  if (!existingLichSu || existingLichSu.length === 0) {
    await supabase
      .from('lich_su_vi_tri')
      .insert({
        chuyen_di_id: chuyenDiId,
        lat: currentPosition[0],
        lng: currentPosition[1],
        pin: Math.round(currentBattery),
        toc_do: resetSpeed,
        so_km: parseFloat(currentDistance.toFixed(1)),
      });
    console.log('Inserted initial lich_su_vi_tri at tram_thue_position');
  }

  simulationInterval = setInterval(async () => {
    const { data: chuyenDi } = await supabase
      .from('chuyen_di')
      .select('trang_thai')
      .eq('id', chuyenDiId)
      .single();

    if (!chuyenDi || chuyenDi.trang_thai === 'COMPLETED') {
      console.log('Trip completed or not found, stopping simulation');
      stopSimulation();
      return;
    }

    const progress = currentDistance / totalDistance;
    const deltaKm = Math.min(Math.random() * 0.3 + 0.2, totalDistance - currentDistance);
    currentDistance += deltaKm;
    const newSpeed = 15 + Math.random() * 15;
    const pinGiam = (deltaKm / 100) * pinTieuThuPerKm;
    currentBattery = Math.max(20, currentBattery - pinGiam);

    const deltaLat = (tramTraPosition[0] - tramThuePosition[0]) * (deltaKm / totalDistance);
    const deltaLng = (tramTraPosition[1] - tramThuePosition[1]) * (deltaKm / totalDistance);
    const newLat = currentPosition[0] + deltaLat + (Math.random() * 0.0002 - 0.0001);
    const newLng = currentPosition[1] + deltaLng + (Math.random() * 0.0002 - 0.0001);
    currentPosition = [newLat, newLng];

    await supabase
      .from('vi_tri_xe')
      .update({
        lat: newLat,
        lng: newLng,
        pin: Math.round(currentBattery),
        toc_do: Math.round(newSpeed),
        so_km: parseFloat(currentDistance.toFixed(1)),
        cap_nhat_luc: new Date().toISOString(),
      })
      .eq('xe_id', xeId);

    await supabase
      .from('lich_su_vi_tri')
      .insert({
        chuyen_di_id: chuyenDiId,
        lat: newLat,
        lng: newLng,
        pin: Math.round(currentBattery),
        toc_do: Math.round(newSpeed),
        so_km: parseFloat(currentDistance.toFixed(1)),
      });

    console.log('Simulation update: newDistance=', currentDistance.toFixed(1), 'total=', totalDistance, 'position=', [newLat.toFixed(4), newLng.toFixed(4)]);

    if (currentDistance >= totalDistance) {
      await supabase
        .from('chuyen_di')
        .update({
          trang_thai: 'COMPLETED',
          ket_thuc_luc: new Date().toISOString(),
          path: JSON.stringify([...(await supabase.from('lich_su_vi_tri').select('lat, lng').eq('chuyen_di_id', chuyenDiId)).data.map(item => [item.lat, item.lng])]),
        })
        .eq('id', chuyenDiId);
      stopSimulation();
    }
  }, 2000);

  console.log('Simulation started for chuyen_di_id:', chuyenDiId);
};

export const stopSimulation = () => {
  if (simulationInterval) {
    clearInterval(simulationInterval);
    simulationInterval = null;
    localStorage.removeItem(SIMULATION_KEY);
    console.log('Simulation stopped');
  }
};

export const checkAndStartSimulation = async () => {
  const chuyenDiId = localStorage.getItem(SIMULATION_KEY);
  if (!chuyenDiId) return;

  const { data: chuyenDiData } = await supabase
    .from('chuyen_di')
    .select('*, don_thue!chuyen_di_don_thue_id_fkey(tram_thue_id, tram_tra_id)')
    .eq('id', chuyenDiId)
    .eq('trang_thai', 'PENDING')
    .single();

  if (!chuyenDiData) {
    localStorage.removeItem(SIMULATION_KEY);
    return;
  }

  const { data: xeData } = await supabase
    .from('xe')
    .select('pin_tieu_thu_per_km, range_km')
    .eq('id', chuyenDiData.xe_id)
    .single();

  let tramThuePosition = null;
  let tramTraPosition = null;
  let totalDistance = 0;

  if (chuyenDiData.don_thue?.tram_thue_id) {
    const { data: tramThueData } = await supabase
      .from('tram')
      .select('lat, lng')
      .eq('id', chuyenDiData.don_thue.tram_thue_id)
      .single();
    if (tramThueData) tramThuePosition = [Number(tramThueData.lat), Number(tramThueData.lng)];
  }

  if (chuyenDiData.don_thue?.tram_tra_id) {
    const { data: tramTraData } = await supabase
      .from('tram')
      .select('lat, lng')
      .eq('id', chuyenDiData.don_thue.tram_tra_id)
      .single();
    if (tramTraData) tramTraPosition = [Number(tramTraData.lat), Number(tramTraData.lng)];
  }

  if (tramThuePosition && tramTraPosition) {
    totalDistance = Math.round(haversineDistance(tramThuePosition, tramTraPosition) * 10) / 10;
  }

  if (tramThuePosition && tramTraPosition) {
    startSimulation(
      chuyenDiId,
      chuyenDiData.xe_id,
      tramThuePosition,
      tramTraPosition,
      totalDistance,
      xeData?.pin_tieu_thu_per_km || 15,
      xeData?.range_km || 100
    );
  }
};
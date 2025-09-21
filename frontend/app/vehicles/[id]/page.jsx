// app/vehicles/[id]/page.js
'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';
import Link from "next/link";

export default function VehicleDetail({ params }) {
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchVehicle = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('xe')
          .select('*')
          .eq('id', params.id)
          .single();

        if (error) throw error;

        const processedVehicle = {
          ...data,
          price: Number(data.price) || 0,
          deposit: Number(data.deposit) || 0,
          rating: Number(data.rating) || 0,
          range_km: Number(data.range_km) || 0,
          top_speed_kmh: Number(data.top_speed_kmh) || 0,
          weight_kg: Number(data.weight_kg) || 0,
          so_km: Number(data.so_km) || 0,
          pin_phan_tram: Number(data.pin_phan_tram) || 0,
        };

        setVehicle(processedVehicle);
      } catch (err) {
        setError(err.message);
        console.error('Lỗi fetch xe chi tiết:', err);
      } finally {
        setLoading(false);
      }
    };

    if (params?.id) {
      fetchVehicle();
    }
  }, [params.id]);

  if (loading) return <div className="text-center py-12">Đang tải...</div>;
  if (error) return <div className="text-center py-12 text-red-500">Lỗi: {error}</div>;
  if (!vehicle) return <div className="max-w-7xl mx-auto px-4 py-12">Không tìm thấy xe.</div>;

  // Làm sạch URL ảnh
  const cleanImageUrls = vehicle.image_urls?.map(url => url.trim()) || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid lg:grid-cols-2 gap-12">
        {/* Gallery */}
        <div>
          <div className="rounded-2xl mb-4 relative overflow-hidden">
            {cleanImageUrls[0] ? (
              <img 
                src={cleanImageUrls[0]} 
                alt={vehicle.name}
                className="w-full h-96 object-cover"
              />
            ) : (
              <div className="bg-gradient-to-br from-primary/20 to-secondary/20 rounded-2xl h-96 flex items-center justify-center">
                <svg className="w-32 h-32 text-primary" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L13.09 8.26L22 9L13.09 9.74L12 16L10.91 9.74L2 9L10.91 8.26L12 2Z"/>
                </svg>
              </div>
            )}
            <div className="absolute bottom-4 right-4 bg-white px-3 py-1 rounded-full text-sm font-medium">
              Pin: {vehicle.pin_phan_tram}% | {vehicle.so_km.toLocaleString()}km đã đi
            </div>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {cleanImageUrls.slice(1, 5).map((url, idx) => (
              <div key={idx} className="rounded-lg overflow-hidden">
                <img 
                  src={url} 
                  alt={`${vehicle.name} ${idx + 2}`}
                  className="w-full h-20 object-cover hover:scale-105 transition-transform cursor-pointer"
                />
              </div>
            ))}
            {/* Hiển thị placeholder nếu không đủ 4 ảnh phụ */}
            {Array.from({ length: Math.max(0, 4 - (cleanImageUrls.length - 1)) }).map((_, idx) => (
              <div key={`empty-${idx}`} className="bg-neutral-200 rounded-lg h-20"></div>
            ))}
          </div>
        </div>

        {/* Info */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold">{vehicle.name}</h1>
            <div className="flex items-center">
              <span className="text-xl">
                {"★".repeat(Math.floor(vehicle.rating)) + (vehicle.rating % 1 >= 0.5 ? "★" : "☆").slice(0, 5 - Math.floor(vehicle.rating))}
              </span>
              <span className="text-neutral-600 ml-2">
                {vehicle.rating.toFixed(1)} (124 đánh giá)
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-6">
            <span className="badge badge-success">{vehicle.range_km}km tầm hoạt động</span>
            <span className="badge badge-warning">{vehicle.battery}</span>
            <span className="badge badge-success">{vehicle.top_speed_kmh}km/h tốc độ tối đa</span>
            {vehicle.pin_phan_tram > 0 && (
              <span className="badge badge-info">Pin: {vehicle.pin_phan_tram}%</span>
            )}
          </div>

          <div className="bg-neutral-100 rounded-2xl p-6 mb-6">
            <h3 className="text-xl font-semibold mb-4">Bảng giá thuê</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Theo giờ (tối thiểu 4h)</span>
                <span className="font-semibold">{Math.round(vehicle.price / 6).toLocaleString("vi-VN")}đ/giờ</span>
              </div>
              <div className="flex justify-between">
                <span>Theo ngày (24h)</span>
                <span className="font-semibold text-primary">{vehicle.price.toLocaleString("vi-VN")}đ/ngày</span>
              </div>
              <div className="flex justify-between">
                <span>Theo tuần (7 ngày)</span>
                <span className="font-semibold">{(vehicle.price * 6).toLocaleString("vi-VN")}đ/tuần</span>
              </div>
              <hr className="my-3" />
              <div className="flex justify-between text-lg">
                <span>Phí cọc</span>
                <span className="font-semibold">{vehicle.deposit.toLocaleString("vi-VN")}đ</span>
              </div>
            </div>
          </div>

          <div className="bg-white border border-neutral-200 rounded-2xl p-6 mb-6">
            <h3 className="text-xl font-semibold mb-4">Thông số kỹ thuật</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-neutral-600">Hãng:</span><span className="font-medium ml-2">{vehicle.brand}</span></div>
              <div><span className="text-neutral-600">Model:</span><span className="font-medium ml-2">{vehicle.model}</span></div>
              <div><span className="text-neutral-600">Tầm hoạt động:</span><span className="font-medium ml-2">{vehicle.range_km}km</span></div>
              <div><span className="text-neutral-600">Tốc độ tối đa:</span><span className="font-medium ml-2">{vehicle.top_speed_kmh}km/h</span></div>
              <div><span className="text-neutral-600">Thời gian sạc:</span><span className="font-medium ml-2">{vehicle.charge_time}</span></div>
              <div><span className="text-neutral-600">Trọng lượng:</span><span className="font-medium ml-2">{vehicle.weight_kg}kg</span></div>
              <div><span className="text-neutral-600">Trạng thái:</span><span className="font-medium ml-2">{vehicle.trang_thai === 'AVAILABLE' ? 'Còn xe' : 'Hết xe'}</span></div>
            </div>
          </div>

          {vehicle.trang_thai === 'AVAILABLE' ? (
            <Link href={`/booking?vehicleId=${vehicle.id}`} className="w-full block text-center bg-primary hover:bg-primary-hover text-white py-4 rounded-2xl font-semibold text-lg transition-colors">
              Chọn thời gian & địa điểm
            </Link>
          ) : (
            <div className="w-full block text-center bg-neutral-300 cursor-not-allowed text-neutral-500 py-4 rounded-2xl font-semibold text-lg">
              Xe hiện không khả dụng
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
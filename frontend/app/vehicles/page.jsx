'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import VehicleCard from '@/components/VehicleCard';

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState([]);
  const [filters, setFilters] = useState({
    search: '',
    price: 'Tất cả',
    range: 'Tất cả',
    battery: 'Tất cả'
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        setLoading(true);
        let query = supabase
          .from('xe')
          .select('*');

        // Áp dụng bộ lọc
        if (filters.search) {
          query = query.ilike('name', `%${filters.search}%`);
        }

        if (filters.price !== 'Tất cả') {
          // Chuyển price từ string sang number để so sánh
          query = query.order('price', { ascending: true }); // để đảm bảo Supabase cast đúng
          if (filters.price === 'Dưới 100k') query = query.lte('price::numeric', 100000);
          else if (filters.price === '100k - 150k') query = query.gte('price::numeric', 100000).lte('price::numeric', 150000);
          else if (filters.price === 'Trên 150k') query = query.gt('price::numeric', 150000);
        }

        if (filters.range !== 'Tất cả') {
          // range_km cũng là string → ép kiểu
          if (filters.range === 'Dưới 80km') query = query.lte('range_km::numeric', 80);
          else if (filters.range === '80-120km') query = query.gte('range_km::numeric', 80).lte('range_km::numeric', 120);
          else if (filters.range === 'Trên 120km') query = query.gt('range_km::numeric', 120);
        }

        if (filters.battery !== 'Tất cả') {
          query = query.eq('battery', filters.battery);
        }

        const { data, error } = await query;
        if (error) throw error;

        // Ép kiểu dữ liệu cần thiết để hiển thị và tính toán sau này
        const processedData = data.map(v => ({
          ...v,
          price: Number(v.price) || 0,
          deposit: Number(v.deposit) || 0,
          rating: Number(v.rating) || 0,
          range_km: Number(v.range_km) || 0,
          top_speed_kmh: Number(v.top_speed_kmh) || 0,
          weight_kg: Number(v.weight_kg) || 0,
          so_km: Number(v.so_km) || 0,
          pin_phan_tram: Number(v.pin_phan_tram) || 0,
        }));

        setVehicles(processedData || []);
      } catch (err) {
        setError(err.message);
        console.error('Lỗi fetch xe:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchVehicles();
  }, [filters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  if (loading) return <div className="text-center py-12">Đang tải...</div>;
  if (error) return <div className="text-center py-12 text-red-500">Lỗi: {error}</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Search & Filter */}
      <div className="bg-white rounded-2xl card-shadow p-6 mb-8">
        <div className="grid md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">Tìm kiếm</label>
            <input 
              type="text" 
              name="search"
              placeholder="Tên xe, hãng..." 
              className="w-full px-4 py-2 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent" 
              onChange={handleFilterChange}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">Giá/Ngày</label>
            <select 
              name="price"
              className="w-full px-4 py-2 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
              onChange={handleFilterChange}
            >
              <option>Tất cả</option>
              <option>Dưới 100k</option>
              <option>100k - 150k</option>
              <option>Trên 150k</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">Tầm hoạt động</label>
            <select 
              name="range"
              className="w-full px-4 py-2 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
              onChange={handleFilterChange}
            >
              <option>Tất cả</option>
              <option>Dưới 80km</option>
              <option>80-120km</option>
              <option>Trên 120km</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">Pin</label>
            <select 
              name="battery"
              className="w-full px-4 py-2 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
              onChange={handleFilterChange}
            >
              <option>Tất cả</option>
              <option>Pin đổi được</option>
              <option>Pin cố định</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {vehicles.length > 0 ? (
          vehicles.map(v => <VehicleCard key={v.id} vehicle={v} />)
        ) : (
          <div className="col-span-full text-center py-12 text-neutral-500">Không có xe phù hợp</div>
        )}
      </div>
    </div>
  );
}
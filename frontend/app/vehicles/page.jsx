'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import VehicleCard from '@/components/VehicleCard';

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState([]);
  const [stations, setStations] = useState([]);
  const [filters, setFilters] = useState({
    search: '',
    price: 'Tất cả',
    range: 'Tất cả',
    battery: 'Tất cả',
    tram: 'Tất cả'
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStations = async () => {
      try {
        const { data, error } = await supabase
          .from('tram')
          .select('id, ten')
          .order('ten', { ascending: true });

        if (error) throw error;
        setStations(data || []);
      } catch (err) {
        console.error('Lỗi fetch trạm:', err);
      }
    };

    fetchStations();
  }, []);

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        setLoading(true);
        let query;
        if (filters.tram !== 'Tất cả') {
          query = supabase
            .from('xe')
            .select('*, tram_xe!inner(*)');
        } else {
          query = supabase
            .from('xe')
            .select('*');
        }

        // Áp dụng bộ lọc tìm kiếm
        if (filters.search) {
          query = query.ilike('name', `%${filters.search}%`);
        }

        // Áp dụng bộ lọc giá
        if (filters.price !== 'Tất cả') {
          if (filters.price === 'Dưới 100k') {
            query = query.lte('price', 100000);
          } else if (filters.price === '100k - 150k') {
            query = query.gte('price', 100000).lte('price', 150000);
          } else if (filters.price === 'Trên 150k') {
            query = query.gt('price', 150000);
          }
        }

        // Áp dụng bộ lọc tầm hoạt động
        if (filters.range !== 'Tất cả') {
          if (filters.range === 'Dưới 80km') {
            query = query.lte('range_km', 80);
          } else if (filters.range === '80-120km') {
            query = query.gte('range_km', 80).lte('range_km', 120);
          } else if (filters.range === 'Trên 120km') {
            query = query.gt('range_km', 120);
          }
        }

        // Áp dụng bộ lọc pin
        if (filters.battery !== 'Tất cả') {
          query = query.eq('battery', filters.battery);
        }

        // Áp dụng bộ lọc trạm
        if (filters.tram !== 'Tất cả') {
          query = query.eq('tram_xe.tram_id', filters.tram);
        }

        // Sắp xếp theo giá
        query = query.order('price', { ascending: true });

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

  const handleResetFilters = () => {
    setFilters({
      search: '',
      price: 'Tất cả',
      range: 'Tất cả',
      battery: 'Tất cả',
      tram: 'Tất cả'
    });
  };

  if (loading) return <div className="text-center py-12">Đang tải...</div>;
  if (error) return <div className="text-center py-12 text-red-500">Lỗi: {error}</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Search & Filter */}
      <div className="bg-white rounded-2xl card-shadow p-6 mb-8">
        <div className="grid md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">Tìm kiếm</label>
            <input 
              type="text" 
              name="search"
              value={filters.search}
              placeholder="Tên xe, hãng..." 
              className="w-full px-4 py-2 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent" 
              onChange={handleFilterChange}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">Giá/Ngày</label>
            <select 
              name="price"
              value={filters.price}
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
              value={filters.range}
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
              value={filters.battery}
              className="w-full px-4 py-2 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
              onChange={handleFilterChange}
            >
              <option>Tất cả</option>
              <option>Pin đổi được</option>
              <option>Pin cố định</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">Trạm</label>
            <select 
              name="tram"
              value={filters.tram}
              className="w-full px-4 py-2 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
              onChange={handleFilterChange}
            >
              <option>Tất cả</option>
              {stations.map(station => (
                <option key={station.id} value={station.id}>{station.ten}</option>
              ))}
            </select>
          </div>
        </div>
        {/* Nút Reset */}
        <div className="mt-4 flex justify-end">
          <button 
            onClick={handleResetFilters}
            className="px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary-dark transition"
          >
            Reset bộ lọc
          </button>
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
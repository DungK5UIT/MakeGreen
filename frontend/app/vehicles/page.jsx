import VehicleCard from "@/components/VehicleCard";
import { vehicles } from "@/data/vehicles";

export default function VehiclesPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Search & Filter (static demo) */}
      <div className="bg-white rounded-2xl card-shadow p-6 mb-8">
        <div className="grid md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">Tìm kiếm</label>
            <input type="text" placeholder="Tên xe, hãng..." className="w-full px-4 py-2 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent" />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">Giá/Ngày</label>
            <select className="w-full px-4 py-2 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent">
              <option>Tất cả</option>
              <option>Dưới 100k</option>
              <option>100k - 150k</option>
              <option>Trên 150k</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">Tầm hoạt động</label>
            <select className="w-full px-4 py-2 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent">
              <option>Tất cả</option>
              <option>Dưới 80km</option>
              <option>80-120km</option>
              <option>Trên 120km</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">Pin</label>
            <select className="w-full px-4 py-2 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent">
              <option>Tất cả</option>
              <option>Pin đổi được</option>
              <option>Pin cố định</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {vehicles.map(v => <VehicleCard key={v.slug} vehicle={v} />)}
      </div>
    </div>
  );
}

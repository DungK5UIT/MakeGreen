import Link from "next/link";

export default function VehicleCard({ vehicle }) {
  return (
    <div className="bg-white rounded-2xl card-shadow overflow-hidden">
      <div className="h-48 bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
        <svg className="w-24 h-24 text-primary" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2L13.09 8.26L22 9L13.09 9.74L12 16L10.91 9.74L2 9L10.91 8.26L12 2Z"/>
        </svg>
      </div>
      <div className="p-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xl font-semibold">{vehicle.name}</h3>
          <div className="flex items-center">
            <span className="rating-stars">{"★★★★★".slice(0, Math.round(vehicle.rating))}</span>
            <span className="text-sm text-neutral-600 ml-1">{vehicle.rating.toFixed(1)}</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="badge badge-success">{vehicle.range}km</span>
          <span className="badge badge-warning">{vehicle.battery}</span>
          <span className="badge badge-success">{vehicle.topSpeed}km/h</span>
        </div>
        <div className="text-sm text-neutral-600 mb-4">
          <p>📍 {vehicle.locations.join(", ")}</p>
          <p>💰 Cọc: {vehicle.deposit.toLocaleString("vi-VN")}đ</p>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <span className="text-2xl font-bold text-primary">{vehicle.price.toLocaleString("vi-VN")}đ</span>
            <span className="text-neutral-600">/ngày</span>
          </div>
          <Link href={`/vehicles/${vehicle.slug}`} className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-xl font-medium transition-colors">
            Xem chi tiết
          </Link>
        </div>
      </div>
    </div>
  );
}

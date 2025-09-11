import { vehicles } from "@/data/vehicles";
import Link from "next/link";

export function generateStaticParams() {
  return vehicles.map(v => ({ slug: v.slug }));
}

export default function VehicleDetail({ params }) {
  const vehicle = vehicles.find(v => v.slug === params.slug);
  if (!vehicle) return <div className="max-w-7xl mx-auto px-4 py-12">Không tìm thấy xe.</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid lg:grid-cols-2 gap-12">
        {/* Gallery */}
        <div>
          <div className="bg-gradient-to-br from-primary/20 to-secondary/20 rounded-2xl h-96 flex items-center justify-center mb-4">
            <svg className="w-32 h-32 text-primary" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L13.09 8.26L22 9L13.09 9.74L12 16L10.91 9.74L2 9L10.91 8.26L12 2Z"/>
            </svg>
          </div>
          <div className="grid grid-cols-4 gap-2">
            <div className="bg-neutral-200 rounded-lg h-20"></div>
            <div className="bg-neutral-200 rounded-lg h-20"></div>
            <div className="bg-neutral-200 rounded-lg h-20"></div>
            <div className="bg-neutral-200 rounded-lg h-20"></div>
          </div>
        </div>

        {/* Info */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold">{vehicle.name}</h1>
            <div className="flex items-center">
              <span className="rating-stars text-xl">★★★★★</span>
              <span className="text-neutral-600 ml-2">{vehicle.rating.toFixed(1)} (124 đánh giá)</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-6">
            <span className="badge badge-success">{vehicle.range}km tầm hoạt động</span>
            <span className="badge badge-warning">{vehicle.battery}</span>
            <span className="badge badge-success">{vehicle.topSpeed}km/h tốc độ tối đa</span>
          </div>

          <div className="bg-neutral-100 rounded-2xl p-6 mb-6">
            <h3 className="text-xl font-semibold mb-4">Bảng giá thuê</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Theo giờ (tối thiểu 4h)</span>
                <span className="font-semibold">{(vehicle.price/6).toLocaleString("vi-VN")}đ/giờ</span>
              </div>
              <div className="flex justify-between">
                <span>Theo ngày (24h)</span>
                <span className="font-semibold text-primary">{vehicle.price.toLocaleString("vi-VN")}đ/ngày</span>
              </div>
              <div className="flex justify-between">
                <span>Theo tuần (7 ngày)</span>
                <span className="font-semibold">{(vehicle.price*6).toLocaleString("vi-VN")}đ/tuần</span>
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
              <div><span className="text-neutral-600">Tầm hoạt động:</span><span className="font-medium ml-2">{vehicle.range}km</span></div>
              <div><span className="text-neutral-600">Tốc độ tối đa:</span><span className="font-medium ml-2">{vehicle.topSpeed}km/h</span></div>
              <div><span className="text-neutral-600">Thời gian sạc:</span><span className="font-medium ml-2">{vehicle.chargeTime}</span></div>
              <div><span className="text-neutral-600">Trọng lượng:</span><span className="font-medium ml-2">{vehicle.weight}</span></div>
            </div>
          </div>

          <Link href="/booking" className="w-full block text-center bg-primary hover:bg-primary-hover text-white py-4 rounded-2xl font-semibold text-lg transition-colors">
            Chọn thời gian & địa điểm
          </Link>
        </div>
      </div>
    </div>
  );
}

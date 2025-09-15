'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from "next/link";
import VehicleCard from '@/components/VehicleCard';

export default function HomePage() {
  const [featuredVehicles, setFeaturedVehicles] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Lấy 3 xe nổi bật
        const { data: vehiclesData, error: vehiclesError } = await supabase
          .from('v_fe_vehicle_cards')
          .select('*')
          .limit(3);
        
        // Lấy đánh giá (3 review mới nhất)
        const { data: reviewsData, error: reviewsError } = await supabase
          .from('danh_gia')
          .select(`
            so_sao,
            binh_luan,
            nguoi_dung:nguoi_dung!inner(ho_ten)
          `)
          .order('tao_luc', { ascending: false })
          .limit(3);

        if (vehiclesError) throw vehiclesError;
        if (reviewsError) throw reviewsError;

        setFeaturedVehicles(vehiclesData || []);
        setReviews(reviewsData || []);
      } catch (err) {
        setError(err.message);
        console.error('Lỗi fetch dữ liệu:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return (
    <div className="text-center py-20">
      <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
    </div>
  );
  
  if (error) return (
    <div className="text-center py-20 text-red-500">Lỗi: {error}</div>
  );

  return (
    <div id="home">
      {/* Hero */}
      <section className="hero-gradient text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl lg:text-6xl font-bold mb-6 leading-tight">
                Thuê xe điện dễ,<br />
                <span className="text-secondary">đi xanh hơn</span> mỗi ngày
              </h1>
              <p className="text-xl mb-8 opacity-90 leading-relaxed">
                Khám phá thành phố với xe điện thân thiện môi trường. 
                Tiện lợi, tiết kiệm và an toàn cho mọi chuyến đi.
              </p>
              <Link href="/vehicles" className="inline-block bg-white text-primary hover:bg-neutral-100 px-8 py-4 rounded-2xl font-semibold text-lg transition-colors card-shadow">
                Đặt xe ngay
              </Link>
            </div>
          <div className="text-center">
  <div className="bg-white/10 backdrop-blur-sm rounded-3xl">
    <img 
      src="/images/xe.jpg" 
      alt="Xe Image" 
      className="w-120 h-120 mx-auto object-cover"
    />
  </div>
</div>
          </div>
        </div>
      </section>

      {/* Benefits (giữ nguyên static) */}
      <section className="py-20 bg-neutral-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">Tại sao chọn MakeGreen?</h2>
            <p className="text-xl text-neutral-600">Trải nghiệm thuê xe điện tốt nhất tại Việt Nam</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { title: "Tiết kiệm chi phí", desc: "Giá thuê hợp lý, tiết kiệm xăng và phí bảo dưỡng", tone: "primary" },
              { title: "An toàn & Tiện lợi", desc: "Xe được bảo dưỡng định kỳ, đặt xe online 24/7", tone: "secondary" },
              { title: "Thân thiện môi trường", desc: "Zero emission, góp phần bảo vệ không khí sạch", tone: "success" },
              { title: "Bảo hiểm toàn diện", desc: "Bảo hiểm tai nạn và trộm cắp cho mọi chuyến đi", tone: "warning" },
            ].map((b, i) => (
              <div key={i} className="bg-white p-8 rounded-2xl card-shadow text-center">
                <div className={`w-16 h-16 bg-${b.tone}/10 rounded-2xl flex items-center justify-center mx-auto mb-6`}>
                  <svg className={`w-8 h-8 text-${b.tone}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-3">{b.title}</h3>
                <p className="text-neutral-600">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured - ĐÃ SỬA: Lấy dữ liệu từ Supabase */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">Xe điện nổi bật</h2>
            <p className="text-xl text-neutral-600">Khám phá dòng xe điện hiện đại và tiết kiệm</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredVehicles.map(vehicle => (
              <VehicleCard key={vehicle.slug} vehicle={vehicle} />
            ))}
          </div>

          <div className="text-center mt-12">
            <Link href="/vehicles" className="bg-primary hover:bg-primary-hover text-white px-8 py-3 rounded-xl font-medium transition-colors">
              Xem tất cả xe điện
            </Link>
          </div>
        </div>
      </section>

      {/* Process (giữ nguyên static) */}
      <section className="py-20 bg-neutral-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">Quy trình thuê xe đơn giản</h2>
            <p className="text-xl text-neutral-600">Chỉ 4 bước để có xe điện cho chuyến đi của bạn</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {["Tìm & Chọn xe","Đặt xe online","Xác minh eKYC","Nhận xe & Đi"].map((title, i)=> (
              <div key={i} className="text-center">
                <div className="w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center mx-auto mb-6 text-xl font-bold">{i+1}</div>
                <h3 className="text-xl font-semibold mb-3">{title}</h3>
                <p className="text-neutral-600">{["Duyệt danh sách xe điện và chọn xe phù hợp với nhu cầu","Chọn thời gian và địa điểm nhận xe thuận tiện","Upload CCCD và selfie để xác minh nhanh chóng","Quét QR code để mở khóa và bắt đầu hành trình xanh"][i]}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews - ĐÃ SỬA: Lấy dữ liệu từ Supabase */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">Khách hàng nói gì về MakeGreen</h2>
            <p className="text-xl text-neutral-600">Hơn 10,000+ khách hàng hài lòng</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {reviews.map((review, i) => {
              const initials = review.nguoi_dung.ho_ten
                ? review.nguoi_dung.ho_ten.split(' ').map(n => n[0]).join('').slice(0, 2)
                : 'ND';
              
              return (
                <div key={i} className="bg-white p-8 rounded-2xl card-shadow">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-semibold mr-4">
                      {initials}
                    </div>
                    <div>
                      <h4 className="font-semibold">{review.nguoi_dung.ho_ten || 'Người dùng'}</h4>
                      <div className="rating-stars">
                        {"★★★★★".slice(0, Math.round(review.so_sao))}
                      </div>
                    </div>
                  </div>
                  <p className="text-neutral-600">"{review.binh_luan}"</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
import Link from "next/link";

export default function HomePage() {
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
              <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8">
                <svg className="w-64 h-64 mx-auto text-white/80" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L13.09 8.26L22 9L13.09 9.74L12 16L10.91 9.74L2 9L10.91 8.26L12 2Z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
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

      {/* Featured */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">Xe điện nổi bật</h2>
            <p className="text-xl text-neutral-600">Khám phá dòng xe điện hiện đại và tiết kiệm</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {["VinFast Klara S", "Pega NewTech", "Yadea G5"].map((name, i) => (
              <div key={name} className="bg-white rounded-2xl card-shadow overflow-hidden">
                <div className={`h-48 bg-gradient-to-br from-${i===0?"primary":"secondary"}/20 to-${i===2?"primary":"secondary"}/20 flex items-center justify-center`}>
                  <svg className={`w-24 h-24 ${i===1?"text-secondary": i===2?"text-success":"text-primary"}`} fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2L13.09 8.26L22 9L13.09 9.74L12 16L10.91 9.74L2 9L10.91 8.26L12 2Z"/>
                  </svg>
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-semibold">{name}</h3>
                    <div className="flex items-center">
                      <span className="rating-stars">★★★★★</span>
                      <span className="text-sm text-neutral-600 ml-1">{(4.5 + i*0.2).toFixed(1)}</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="badge badge-success">{[120,80,100][i]}km tầm hoạt động</span>
                    <span className={`badge ${i===1?"badge-warning":"badge-success"}`}>{i===1?"Pin cố định":"Pin đổi được"}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-2xl font-bold text-primary">{[150000,120000,140000][i].toLocaleString("vi-VN")}đ</span>
                      <span className="text-neutral-600">/ngày</span>
                    </div>
                    <Link href={`/vehicles/${["klara-s","pega-newtech","yadea-g5"][i]}`} className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-xl font-medium transition-colors">
                      Xem chi tiết
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link href="/vehicles" className="bg-primary hover:bg-primary-hover text-white px-8 py-3 rounded-xl font-medium transition-colors">
              Xem tất cả xe điện
            </Link>
          </div>
        </div>
      </section>

      {/* Process */}
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

      {/* Reviews */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">Khách hàng nói gì về MakeGreen</h2>
            <p className="text-xl text-neutral-600">Hơn 10,000+ khách hàng hài lòng</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { initials: "AN", name: "Anh Nguyễn", rating: "★★★★★", text: "Xe điện MakeGreen rất tiện lợi, pin trâu và giá cả hợp lý. Đặc biệt thích dịch vụ giao xe tận nơi."},
              { initials: "LH", name: "Linh Hoàng", rating: "★★★★★", text: "App đặt xe rất dễ sử dụng, eKYC nhanh chóng. Xe luôn sạch sẽ và được bảo dưỡng tốt."},
              { initials: "MT", name: "Minh Tuấn", rating: "★★★★☆", text: "Dịch vụ tốt, hỗ trợ khách hàng nhiệt tình. Sẽ tiếp tục sử dụng cho các chuyến đi sau."}
            ].map((r)=> (
              <div key={r.name} className="bg-white p-8 rounded-2xl card-shadow">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-semibold mr-4">{r.initials}</div>
                  <div>
                    <h4 className="font-semibold">{r.name}</h4>
                    <div className="rating-stars">{r.rating}</div>
                  </div>
                </div>
                <p className="text-neutral-600">"{r.text}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export default function NewsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-12">
        <h1 className="text-3xl lg:text-4xl font-bold mb-4">Tin tức & Cẩm nang</h1>
        <p className="text-xl text-neutral-600">Cập nhật thông tin và mẹo sử dụng xe điện</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="space-y-8">
            <article className="bg-white rounded-2xl card-shadow overflow-hidden">
              <div className="h-48 bg-gradient-to-br from-primary/20 to-secondary/20"></div>
              <div className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className="badge badge-success">Mẹo sử dụng</span>
                  <span className="text-sm text-neutral-600">15/03/2024</span>
                </div>
                <h2 className="text-xl font-semibold mb-3">5 mẹo tiết kiệm pin xe điện hiệu quả</h2>
                <p className="text-neutral-600 mb-4">Khám phá những cách đơn giản để tối ưu hóa thời gian sử dụng pin xe điện, giúp bạn đi xa hơn với mỗi lần sạc...</p>
                <a href="#" className="text-primary font-medium hover:text-primary-hover">Đọc tiếp →</a>
              </div>
            </article>

            <article className="bg-white rounded-2xl card-shadow overflow-hidden">
              <div className="h-48 bg-gradient-to-br from-secondary/20 to-success/20"></div>
              <div className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className="badge badge-warning">Địa điểm</span>
                  <span className="text-sm text-neutral-600">12/03/2024</span>
                </div>
                <h2 className="text-xl font-semibold mb-3">Top 10 điểm giao nhận xe thuận tiện tại TP.HCM</h2>
                <p className="text-neutral-600 mb-4">Danh sách các địa điểm giao nhận xe MakeGreen được khách hàng đánh giá cao về độ thuận tiện và an toàn...</p>
                <a href="#" className="text-primary font-medium hover:text-primary-hover">Đọc tiếp →</a>
              </div>
            </article>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl card-shadow p-6">
            <h3 className="font-semibold mb-4">Chủ đề phổ biến</h3>
            <div className="space-y-2">
              <a href="#" className="block px-3 py-2 rounded-lg hover:bg-neutral-100 text-sm">Mẹo sử dụng xe điện</a>
              <a href="#" className="block px-3 py-2 rounded-lg hover:bg-neutral-100 text-sm">Bảo dưỡng xe điện</a>
              <a href="#" className="block px-3 py-2 rounded-lg hover:bg-neutral-100 text-sm">Địa điểm giao nhận</a>
              <a href="#" className="block px-3 py-2 rounded-lg hover:bg-neutral-100 text-sm">Chính sách thuê xe</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

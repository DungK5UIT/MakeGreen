export default function SupportPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-12">
        <h1 className="text-3xl lg:text-4xl font-bold mb-4">Hỗ trợ khách hàng</h1>
        <p className="text-xl text-neutral-600">Chúng tôi luôn sẵn sàng hỗ trợ bạn 24/7</p>
      </div>

      {/* Contact Info */}
      <div className="grid md:grid-cols-2 gap-8 mb-12">
        <div className="bg-white rounded-2xl card-shadow p-8 text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
            </svg>
          </div>
          <h3 className="text-xl font-semibold mb-2">Hotline</h3>
          <p className="text-2xl font-bold text-primary mb-2">1900 1234</p>
          <p className="text-neutral-600">Hỗ trợ 24/7</p>
        </div>

        <div className="bg-white rounded-2xl card-shadow p-8 text-center">
          <div className="w-16 h-16 bg-secondary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
            </svg>
          </div>
          <h3 className="text-xl font-semibold mb-2">Email</h3>
          <p className="text-lg font-medium text-secondary mb-2">support@makegreen.vn</p>
          <p className="text-neutral-600">Phản hồi trong 2h</p>
        </div>
      </div>

      {/* FAQ */}
      <div className="bg-white rounded-2xl card-shadow p-8">
        <h2 className="text-2xl font-bold mb-6">Câu hỏi thường gặp</h2>
        <div className="space-y-4">
          <div className="border border-neutral-200 rounded-xl p-6">
            <h3 className="font-semibold mb-2">Làm thế nào để đặt xe điện?</h3>
            <p className="text-neutral-600">Bạn có thể đặt xe trực tiếp trên website hoặc app MakeGreen. Chọn xe, thời gian, địa điểm và hoàn tất thanh toán.</p>
          </div>
          <div className="border border-neutral-200 rounded-xl p-6">
            <h3 className="font-semibold mb-2">Tôi cần giấy tờ gì để thuê xe?</h3>
            <p className="text-neutral-600">Bạn cần có CCCD/CMND và hoàn thành eKYC trực tuyến. Không cần bằng lái xe máy.</p>
          </div>
          <div className="border border-neutral-200 rounded-xl p-6">
            <h3 className="font-semibold mb-2">Xe hết pin giữa đường thì sao?</h3>
            <p className="text-neutral-600">Liên hệ hotline 1900 1234, chúng tôi sẽ hỗ trợ đổi pin hoặc cứu hộ miễn phí trong vòng 30 phút.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

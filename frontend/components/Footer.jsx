import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-neutral-900 text-white py-12 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center mr-3">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
                </svg>
              </div>
              <span className="text-xl font-semibold">MakeGreen</span>
            </div>
            <p className="text-neutral-400 mb-4">Thuê xe điện dễ, đi xanh hơn mỗi ngày</p>
            <div className="flex space-x-4">
              <a href="#" className="text-neutral-400 hover:text-white">Facebook</a>
              <a href="#" className="text-neutral-400 hover:text-white">Instagram</a>
              <a href="#" className="text-neutral-400 hover:text-white">Zalo</a>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Dịch vụ</h3>
            <ul className="space-y-2 text-neutral-400">
              <li><a href="#" className="hover:text-white">Thuê xe điện</a></li>
              <li><a href="#" className="hover:text-white">Giao xe tận nơi</a></li>
              <li><a href="#" className="hover:text-white">Bảo hiểm xe</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Hỗ trợ</h3>
            <ul className="space-y-2 text-neutral-400">
              <li><a href="#" className="hover:text-white">Câu hỏi thường gặp</a></li>
              <li><a href="#" className="hover:text-white">Hướng dẫn sử dụng</a></li>
              <li><a href="#" className="hover:text-white">Liên hệ</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Liên hệ</h3>
            <div className="space-y-2 text-neutral-400">
              <p>📞 1900 1234</p>
              <p>✉️ support@makegreen.vn</p>
              <p>📍 123 Nguyễn Huệ, Q1, TP.HCM</p>
            </div>
          </div>
        </div>

        <hr className="border-neutral-700 my-8" />

        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="text-neutral-400">© 2024 MakeGreen. Tất cả quyền được bảo lưu.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="text-neutral-400 hover:text-white text-sm">Điều khoản sử dụng</a>
            <a href="#" className="text-neutral-400 hover:text-white text-sm">Chính sách bảo mật</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

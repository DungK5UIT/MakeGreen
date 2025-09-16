import React from 'react';

const Step6Confirmation = ({ bookingId, total, status, message, router }) => {
  console.log('Step6Confirmation - Total:', total.toLocaleString('vi-VN'), 'Status:', status, 'Message:', message); // Debug log

  const depositAmount = total * 0.5; // 50% tiền cọc

  return (
    <div>
      <div className="text-center mb-8">
        <div className={`w-20 h-20 ${status === 'SUCCESS' ? 'bg-green-100' : 'bg-red-100'} rounded-full flex items-center justify-center mx-auto mb-4`}>
          <svg className={`w-10 h-10 ${status === 'SUCCESS' ? 'text-green-600' : 'text-red-600'}`} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{status === 'SUCCESS' ? 'Thanh toán thành công!' : 'Thanh toán thất bại'}</h2>
        <p className="text-gray-600">{message || 'Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi'}</p>
      </div>
      <div className="bg-gray-50 rounded-2xl p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Thông tin đơn hàng</h3>
        <div className="grid md:grid-cols-2 gap-6">
          {/* CỘT TRÁI */}
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-600">Mã đơn hàng</p>
              <p className="font-semibold text-gray-900">#{bookingId}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Tổng tiền</p>
              <p className="font-bold text-primary text-lg">{total.toLocaleString("vi-VN")}đ</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Trạng thái đơn hàng</p>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Đã xác nhận
              </span>
            </div>
          </div>

          {/* CỘT PHẢI — ĐÃ THÊM SỐ TIỀN THANH TOÁN NGAY DƯỚI TRẠNG THÁI THANH TOÁN */}
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-600">Trạng thái thanh toán</p>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status === 'SUCCESS' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {status === 'SUCCESS' ? 'Đã thanh toán' : 'Thất bại'}
              </span>
            </div>
            <div>
              <p className="text-sm text-gray-600">Số tiền đã thanh toán</p>
              <p className="font-bold text-green-600 text-lg">{depositAmount.toLocaleString("vi-VN")}đ</p>
            </div>
          </div>
        </div>
      </div>
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <div className="p-4 border border-gray-200 rounded-xl">
          <div className="flex items-center mb-3">
            <svg className="w-5 h-5 text-blue-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"></path>
              <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"></path>
            </svg>
            <h4 className="font-medium text-gray-900">Email xác nhận</h4>
          </div>
          <p className="text-sm text-gray-600">Chúng tôi đã gửi email xác nhận đến địa chỉ của bạn với đầy đủ thông tin đơn hàng.</p>
        </div>
        <div className="p-4 border border-gray-200 rounded-xl">
          <div className="flex items-center mb-3">
            <svg className="w-5 h-5 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"></path>
            </svg>
            <h4 className="font-medium text-gray-900">Liên hệ hỗ trợ</h4>
          </div>
          <p className="text-sm text-gray-600">Hotline: <span className="font-medium">1900 1234</span><br />Email: support@carental.com</p>
        </div>
      </div>
      <div className="p-4 bg-yellow-50 rounded-xl">
        <div className="flex items-start">
          <svg className="w-5 h-5 text-yellow-600 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"></path>
          </svg>
          <div>
            <p className="text-sm text-yellow-800 font-medium">Lưu ý quan trọng:</p>
            <ul className="text-sm text-yellow-700 mt-1 space-y-1">
              <li>• Vui lòng có mặt đúng giờ tại địa điểm nhận xe</li>
              <li>• Mang theo CMND/CCCD và GPLX gốc</li>
              <li>• Kiểm tra kỹ xe trước khi nhận</li>
              <li>• Liên hệ hotline nếu có thay đổi lịch trình</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step6Confirmation;
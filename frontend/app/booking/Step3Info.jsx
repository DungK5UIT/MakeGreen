import React, { useEffect } from 'react';

const Step3Info = ({ customerInfo, setCustomerInfo, isLoggedIn, onSkip }) => {

  const handleChange = (field) => (e) => {
    setCustomerInfo((prev) => ({ ...prev, [field]: e.target.value }));
  };

  if (isLoggedIn) {
    return (
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Thông tin khách hàng</h2>
        <p className="text-gray-600">
          Thông tin của bạn đã được tải từ tài khoản. Đang chuyển tới bước thanh toán…
        </p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Thông tin khách hàng</h2>
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Họ và tên *</label>
          <input
            type="text"
            placeholder="Nhập họ và tên"
            value={customerInfo.fullName}
            onChange={handleChange('fullName')}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Số điện thoại *</label>
          <input
            type="tel"
            placeholder="Nhập số điện thoại"
            value={customerInfo.phone}
            onChange={handleChange('phone')}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
          <input
            type="email"
            placeholder="Nhập địa chỉ email"
            value={customerInfo.email}
            onChange={handleChange('email')}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Số CMND/CCCD *</label>
          <input
            type="text"
            placeholder="Nhập số CMND/CCCD"
            value={customerInfo.idNumber}
            onChange={handleChange('idNumber')}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Số GPLX *</label>
          <input
            type="text"
            placeholder="Nhập số giấy phép lái xe"
            value={customerInfo.licenseNumber}
            onChange={handleChange('licenseNumber')}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
      </div>

      <div className="mt-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Ghi chú</label>
        <textarea
          rows="4"
          placeholder="Nhập ghi chú (nếu có)"
          value={customerInfo.notes}
          onChange={handleChange('notes')}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
        />
      </div>

      <div className="mt-6 p-4 bg-yellow-50 rounded-xl">
        <div className="flex items-start">
          <svg className="w-5 h-5 text-yellow-600 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          <div>
            <p className="text-sm text-yellow-800 font-medium">Lưu ý quan trọng:</p>
            <p className="text-sm text-yellow-700 mt-1">
              Vui lòng chuẩn bị sẵn CMND/CCCD và GPLX gốc khi nhận xe. Thông tin phải khớp với giấy tờ thực tế.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step3Info;

// app/booking/Step5Payment.jsx
import React from 'react';

const Step5Payment = () => {
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Thanh toán</h2>
      
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Chọn phương thức thanh toán</h3>
              <div className="space-y-3">
                <label className="flex items-center p-4 border border-gray-200 rounded-xl cursor-pointer hover:border-primary transition-colors">
                  <input type="radio" name="payment" value="vnpay" className="w-4 h-4 text-primary border-gray-300 focus:ring-primary" />
                  <div className="ml-3 flex items-center">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                      <span className="text-blue-600 font-bold text-sm">VNP</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">VNPay</p>
                      <p className="text-sm text-gray-500">Thanh toán qua VNPay</p>
                    </div>
                  </div>
                </label>
                <label className="flex items-center p-4 border border-gray-200 rounded-xl cursor-pointer hover:border-primary transition-colors">
                  <input type="radio" name="payment" value="momo" className="w-4 h-4 text-primary border-gray-300 focus:ring-primary" />
                  <div className="ml-3 flex items-center">
                    <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center mr-3">
                      <span className="text-pink-600 font-bold text-sm">M</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">MoMo</p>
                      <p className="text-sm text-gray-500">Ví điện tử MoMo</p>
                    </div>
                  </div>
                </label>
                <label className="flex items-center p-4 border border-gray-200 rounded-xl cursor-pointer hover:border-primary transition-colors">
                  <input type="radio" name="payment" value="banking" className="w-4 h-4 text-primary border-gray-300 focus:ring-primary" />
                  <div className="ml-3 flex items-center">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                      <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z"></path>
                        <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd"></path>
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Internet Banking</p>
                      <p className="text-sm text-gray-500">Chuyển khoản ngân hàng</p>
                    </div>
                  </div>
                </label>
                <label className="flex items-center p-4 border border-gray-200 rounded-xl cursor-pointer hover:border-primary transition-colors">
                  <input type="radio" name="payment" value="cash" className="w-4 h-4 text-primary border-gray-300 focus:ring-primary" />
                  <div className="ml-3 flex items-center">
                    <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center mr-3">
                      <svg className="w-5 h-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z"></path>
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd"></path>
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Tiền mặt</p>
                      <p className="text-sm text-gray-500">Thanh toán khi nhận xe</p>
                    </div>
                  </div>
                </label>
              </div>
            </div>

            <div className="p-4 bg-blue-50 rounded-xl">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-blue-600 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"></path>
                </svg>
                <div>
                  <p className="text-sm text-blue-800 font-medium">Chính sách thanh toán:</p>
                  <ul className="text-sm text-blue-700 mt-1 space-y-1">
                    <li>• Thanh toán trước 50% giá trị đơn hàng</li>
                    <li>• Số tiền còn lại thanh toán khi nhận xe</li>
                    <li>• Hoàn tiền 100% nếu hủy trước 24h</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-gray-50 rounded-2xl p-6 sticky top-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Chi tiết đơn hàng</h3>
            
            <div className="space-y-3 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Thuê xe (2 ngày)</span>
                <span className="font-medium">1.200.000đ</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Phí giao nhận</span>
                <span className="font-medium">50.000đ</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Bảo hiểm</span>
                <span className="font-medium">100.000đ</span>
              </div>
              <div className="border-t pt-3">
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-900">Tổng cộng</span>
                  <span className="font-bold text-primary text-lg">1.350.000đ</span>
                </div>
              </div>
            </div>

            <div className="text-sm text-gray-600 mb-4">
              <p className="font-medium mb-2">Thanh toán ngay: <span className="text-primary">675.000đ</span></p>
              <p>Thanh toán khi nhận xe: <span className="font-medium">675.000đ</span></p>
            </div>

            <div className="p-3 bg-green-50 rounded-lg">
              <div className="flex items-center">
                <svg className="w-4 h-4 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                </svg>
                <span className="text-sm text-green-800 font-medium">Bảo hiểm toàn diện</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step5Payment;
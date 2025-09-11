"use client";

import { useEffect, useState } from "react";

export default function BookingPage() {
  const [step, setStep] = useState(1);
  const totalSteps = 6;

  useEffect(() => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const start = document.getElementById("start-date");
    const end = document.getElementById("end-date");
    if (start) start.value = today.toISOString().split("T")[0];
    if (end) end.value = tomorrow.toISOString().split("T")[0];
  }, []);

  const next = () => {
    setStep((s) => Math.min(s + 1, totalSteps));
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Stepper */}
      <div className="flex items-center justify-center mb-8">
        <div className="flex items-center space-x-4">
          {[
            "Thời gian", "Địa điểm", "Thông tin", "eKYC", "Thanh toán", "Xác nhận"
          ].map((label, i) => {
            const n = i + 1;
            const cls = n < step ? "stepper-completed" : n === step ? "stepper-active" : "stepper-inactive";
            return (
              <div key={label} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${cls}`}>{n}</div>
                <span className="ml-2 text-sm font-medium">{label}</span>
                {i < totalSteps - 1 && <div className="w-8 h-0.5 bg-neutral-300 ml-4"></div>}
              </div>
            );
          })}
        </div>
      </div>

      {/* Card */}
      <div className="bg-white rounded-2xl card-shadow p-8">
        {step < 6 ? (
          <>
            <h2 className="text-2xl font-bold mb-6">Chọn thời gian thuê xe</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Ngày bắt đầu</label>
                <input id="start-date" type="date" className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Giờ bắt đầu</label>
                <select className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent">
                  <option>08:00</option><option>09:00</option><option>10:00</option><option>11:00</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Ngày kết thúc</label>
                <input id="end-date" type="date" className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Giờ kết thúc</label>
                <select className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent">
                  <option>18:00</option><option>19:00</option><option>20:00</option><option>21:00</option>
                </select>
              </div>
            </div>

            <div className="bg-neutral-100 rounded-xl p-6 mt-8">
              <h3 className="font-semibold mb-4">Tóm tắt chi phí</h3>
              <div className="space-y-2">
                <div className="flex justify-between"><span>VinFast Klara S (2 ngày)</span><span>300.000đ</span></div>
                <div className="flex justify-between"><span>Phí cọc</span><span>2.000.000đ</span></div>
                <hr className="my-2" />
                <div className="flex justify-between font-semibold text-lg"><span>Tổng cộng</span><span className="text-primary">2.300.000đ</span></div>
              </div>
            </div>

            <div className="flex justify-between mt-8">
              <a href="/vehicles" className="px-6 py-3 border border-neutral-300 text-neutral-700 rounded-xl font-medium hover:bg-neutral-50 transition-colors">Quay lại</a>
              <button onClick={next} className="px-8 py-3 bg-primary hover:bg-primary-hover text-white rounded-xl font-medium transition-colors">
                Tiếp tục
              </button>
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-success rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-success mb-4">Đặt xe thành công!</h2>
            <p className="text-xl text-neutral-600 mb-6">Mã đơn hàng: <strong>MG240315001</strong></p>
            <div className="bg-neutral-100 rounded-xl p-6 mb-8 text-left max-w-md mx-auto">
              <h3 className="font-semibold mb-4">Thông tin đặt xe</h3>
              <div className="space-y-2 text-sm">
                <p><strong>Xe:</strong> VinFast Klara S</p>
                <p><strong>Thời gian:</strong> 15/03/2024 08:00 - 17/03/2024 18:00</p>
                <p><strong>Địa điểm nhận:</strong> 123 Nguyễn Huệ, Q1</p>
                <p><strong>Tổng tiền:</strong> 2.300.000đ</p>
              </div>
            </div>
            <div className="space-y-4">
              <a href="/account" className="block w-full bg-primary hover:bg-primary-hover text-white py-3 rounded-xl font-medium transition-colors">Xem chi tiết trong tài khoản</a>
              <a href="/" className="block w-full border border-neutral-300 text-neutral-700 py-3 rounded-xl font-medium hover:bg-neutral-50 transition-colors">Về trang chủ</a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function AccountPage() {
  const router = useRouter();
  const [tab, setTab] = useState("profile");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const auth = localStorage.getItem("mg_auth");
    if (!auth) {
      router.push("/login"); // Redirect nếu chưa login
    }
  }, [router]);

  const navItem = (id, label) => (
    <button
      onClick={() => setTab(id)}
      className={`block w-full text-left px-4 py-2 rounded-xl ${tab === id ? "bg-primary text-white" : "text-neutral-700 hover:bg-neutral-100"}`}
    >
      {label}
    </button>
  );

  const handleLogout = async () => {
    setLoading(true);
    setError(null);

    const userId = localStorage.getItem("userId");
    const accessToken = localStorage.getItem("token");

    if (!userId || !accessToken) {
      setError("Không tìm thấy thông tin đăng nhập.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("http://localhost:8080/api/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          accessToken,
        }),
      });

      if (response.ok) {
        // Backend set INACTIVE và invalidate session
        localStorage.clear();
        window.dispatchEvent(new Event("mg-auth-changed"));
        router.push("/login"); // Redirect về login sau logout
      } else {
        const data = await response.json();
        setError(data.message || "Đăng xuất thất bại.");
      }
    } catch (err) {
      setError("Lỗi kết nối server. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl card-shadow p-6">
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-white">AN</span>
              </div>
              <h3 className="font-semibold">Anh Nguyễn</h3>
              <p className="text-sm text-neutral-600">Thành viên từ 2024</p>
            </div>
            <nav className="space-y-2">
              {navItem("profile", "Hồ sơ & eKYC")}
              {navItem("trips", "Chuyến đi")}
              {navItem("invoices", "Hóa đơn")}
              {navItem("favorites", "Yêu thích")}
              {navItem("payment", "Thanh toán")}
            </nav>
            {/* Logout button */}
            <div className="mt-6">
              {error && (
                <div className="bg-red-50 text-red-700 p-4 rounded-xl text-sm mb-4">
                  {error}
                </div>
              )}
              <button
                onClick={handleLogout}
                disabled={loading}
                className="w-full bg-red-500 hover:bg-red-600 disabled:opacity-70 text-white py-3 px-4 rounded-xl font-semibold text-lg transition-colors"
              >
                {loading ? "Đang đăng xuất..." : "Đăng xuất"}
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          {tab === "profile" && (
            <div className="bg-white rounded-2xl card-shadow p-8">
              <h2 className="text-2xl font-bold mb-6">Hồ sơ cá nhân</h2>
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">Họ và tên</label>
                  <input type="text" defaultValue="Nguyễn Văn Anh" className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">Số điện thoại</label>
                  <input type="tel" defaultValue="0901234567" className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">Email</label>
                  <input type="email" defaultValue="anh.nguyen@email.com" className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">Ngày sinh</label>
                  <input type="date" defaultValue="1995-05-15" className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent" />
                </div>
              </div>

              <div className="bg-success/10 border border-success/20 rounded-xl p-6 mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-success mb-1">Trạng thái eKYC: Đã xác minh ✓</h3>
                    <p className="text-sm text-neutral-600">CCCD và selfie đã được xác minh thành công</p>
                  </div>
                  <span className="badge badge-success">Hoàn tất</span>
                </div>
              </div>

              <button className="bg-primary hover:bg-primary-hover text-white px-6 py-3 rounded-xl font-medium transition-colors">
                Cập nhật thông tin
              </button>
            </div>
          )}

          {tab === "trips" && (
            <div className="bg-white rounded-2xl card-shadow p-8">
              <h2 className="text-2xl font-bold mb-6">Chuyến đi của tôi</h2>
              <div className="space-y-4">
                <div className="border border-neutral-200 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-semibold">VinFast Klara S</h3>
                      <p className="text-sm text-neutral-600">15/03/2024 - 17/03/2024</p>
                    </div>
                    <span className="badge badge-success">Hoàn thành</span>
                  </div>
                  <div className="text-sm text-neutral-600">
                    <p>📍 Nhận: Quận 1, TP.HCM</p>
                    <p>💰 Tổng: 300.000đ</p>
                  </div>
                </div>

                <div className="border border-neutral-200 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-semibold">Pega NewTech</h3>
                      <p className="text-sm text-neutral-600">20/03/2024 - 22/03/2024</p>
                    </div>
                    <span className="badge badge-warning">Sắp tới</span>
                  </div>
                  <div className="text-sm text-neutral-600 mb-4">
                    <p>📍 Nhận: Quận 2, TP.HCM</p>
                    <p>💰 Tổng: 240.000đ</p>
                  </div>
                  <button className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium">
                    Xem QR nhận xe
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
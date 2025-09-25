"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";

export default function AccountPage() {
  const router = useRouter();
  const [tab, setTab] = useState("profile");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userInfo, setUserInfo] = useState({
    ho_ten: localStorage.getItem("ho_ten") || "Người dùng",
    sdt: localStorage.getItem("sdt") || "",
    email: localStorage.getItem("email") || "",
    ngay_sinh: "",
  });
  const [chuyenDis, setChuyenDis] = useState([]);
  const [invoicesLoading, setInvoicesLoading] = useState(true);
  const [invoicesError, setInvoicesError] = useState(null);

  useEffect(() => {
    const checkAuthAndFetchUser = async () => {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        router.push("/login");
        return;
      }

      // Fetch dữ liệu từ bảng nguoi_dung
      const { data, error } = await supabase
        .from("nguoi_dung")
        .select("ho_ten, sdt, email")
        .eq("id", user.id)
        .single();

      if (error) {
        setError("Lỗi tải thông tin người dùng: " + error.message);
      } else if (data) {
        setUserInfo({
          ho_ten: data.ho_ten || localStorage.getItem("ho_ten") || "Người dùng",
          sdt: data.sdt || localStorage.getItem("sdt") || "",
          email: data.email || localStorage.getItem("email") || "",
          ngay_sinh: "",
        });
      }

      // Fetch lịch sử chuyến đi
      await fetchChuyenDi(user.id);
    };

    checkAuthAndFetchUser();
  }, [router]);

  const fetchChuyenDi = async (userId) => {
    setInvoicesLoading(true);
    setInvoicesError(null);
    try {
      const response = await fetch("http://localhost:8080/api/chuyen-di");
      if (!response.ok) {
        throw new Error("Failed to fetch chuyen di");
      }
      const data = await response.json();
      
      const userTrips = data.filter((item) => item.nguoiDungId === userId);

      const tripsWithDetails = await Promise.all(userTrips.map(async (trip) => {
        try {
          // Fetch tên xe
          const carResponse = await fetch(`http://localhost:8080/api/xe/${trip.xeId}`);
          const carData = await carResponse.json();
          const tenXe = carData.name || "Xe không xác định";

          // Fetch thông tin đơn thuê để lấy tiền cọc và chi phí ước tính
          const donThueResponse = await fetch(`http://localhost:8080/api/donthue/${trip.donThueId}`);
          const donThueData = await donThueResponse.json();
          
          return {
            ...trip, 
            tenXe: tenXe,
            soTienCoc: donThueData.soTienCoc,
            chiPhiUocTinh: donThueData.chiPhiUocTinh
          };
        } catch (detailError) {
          console.error("Lỗi lấy thông tin chi tiết chuyến đi:", detailError);
          return { ...trip, tenXe: "Xe không xác định", soTienCoc: null, chiPhiUocTinh: null };
        }
      }));

      setChuyenDis(tripsWithDetails);
    } catch (err) {
      setInvoicesError("Lỗi tải lịch sử chuyến đi: " + err.message);
    } finally {
      setInvoicesLoading(false);
    }
  };

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
        localStorage.clear();
        window.dispatchEvent(new Event("mg-auth-changed"));
        router.push("/login");
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

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setError("Phiên đăng nhập không hợp lệ.");
      setLoading(false);
      return;
    }

    const { error: updateError } = await supabase
      .from("nguoi_dung")
      .update({
        ho_ten: userInfo.ho_ten,
        sdt: userInfo.sdt,
        email: userInfo.email,
      })
      .eq("id", user.id);

    if (updateError) {
      setError("Lỗi cập nhật thông tin: " + updateError.message);
    } else {
      localStorage.setItem("ho_ten", userInfo.ho_ten);
      localStorage.setItem("sdt", userInfo.sdt);
      alert("Cập nhật thành công!");
    }

    setLoading(false);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl card-shadow p-6">
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-white">
                  {userInfo.ho_ten ? userInfo.ho_ten.charAt(0).toUpperCase() : "U"}
                </span>
              </div>
              <h3 className="font-semibold">{userInfo.ho_ten || "Người dùng"}</h3>
              <p className="text-sm text-neutral-600">Thành viên từ 2024</p>
            </div>
            <nav className="space-y-2">
              {navItem("profile", "Hồ sơ & eKYC")}
              {navItem("invoices", "Lịch sử thuê")}
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
              <form onSubmit={handleUpdateProfile}>
                <div className="grid md:grid-cols-2 gap-6 mb-8">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">Họ và tên</label>
                    <input
                      type="text"
                      value={userInfo.ho_ten}
                      onChange={(e) => setUserInfo({ ...userInfo, ho_ten: e.target.value })}
                      className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">Số điện thoại</label>
                    <input
                      type="tel"
                      value={userInfo.sdt}
                      onChange={(e) => setUserInfo({ ...userInfo, sdt: e.target.value })}
                      className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">Email</label>
                    <input
                      type="email"
                      value={userInfo.email}
                      onChange={(e) => setUserInfo({ ...userInfo, email: e.target.value })}
                      className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
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

                <button
                  type="submit"
                  disabled={loading}
                  className="bg-primary hover:bg-primary-hover disabled:opacity-70 text-white px-6 py-3 rounded-xl font-medium transition-colors"
                >
                  {loading ? "Đang cập nhật..." : "Cập nhật thông tin"}
                </button>
              </form>
            </div>
          )}

          {tab === "invoices" && (
            <div className="bg-white rounded-2xl card-shadow p-8">
              <h2 className="text-2xl font-bold mb-6">Lịch sử thuê xe</h2>
              
              {invoicesError && (
                <div className="bg-red-50 text-red-700 p-4 rounded-xl text-sm mb-6">
                  {invoicesError}
                </div>
              )}

              {invoicesLoading ? (
                <div className="text-center py-8 text-neutral-600">Đang tải dữ liệu...</div>
              ) : chuyenDis.length === 0 ? (
                <div className="text-center py-8 text-neutral-600">Bạn chưa có chuyến đi nào</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full table-auto">
                    <thead>
                      <tr className="bg-neutral-120 text-left text-sm font-semibold text-neutral-700">
                        <th className="px-4 py-3 rounded-tl-xl">Tên xe đã thuê</th>
                        <th className="px-8 py-3">Tiền cọc</th>
                        <th className="px-8 py-3">Chi phí ước tính</th>
                        <th className="px-4 py-3">Tổng chi phí</th>
                        <th className="px-4 py-3">Trạng thái</th>
                        <th className="px-4 py-3">Thời gian bắt đầu</th>
                        <th className="px-4 py-3 rounded-tr-xl">Thời gian kết thúc</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-200">
                      {chuyenDis.map((chuyen) => (
                        <tr key={chuyen.id} className="hover:bg-neutral-50">
                          <td className="px-4 py-3 text-sm">{chuyen.tenXe}</td>
                          <td className="px-4 py-3 text-sm">
                            {chuyen.soTienCoc ? `${chuyen.soTienCoc.toLocaleString('vi-VN')} đ` : '—'}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {chuyen.chiPhiUocTinh ? `${chuyen.chiPhiUocTinh.toLocaleString('vi-VN')} đ` : '—'}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {chuyen.tongChiPhi ? `${chuyen.tongChiPhi.toLocaleString('vi-VN')} đ` : '—'}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              chuyen.trangThai === 'HOAN_THANH' ? 'bg-success/10 text-success' :
                              chuyen.trangThai === 'DANG_DI' ? 'bg-warning/10 text-warning' :
                              'bg-neutral-100 text-neutral-700'
                            }`}>
                              {chuyen.trangThai}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {chuyen.batDauLuc ? new Date(chuyen.batDauLuc).toLocaleString('vi-VN') : '—'}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {chuyen.ketThucLuc ? new Date(chuyen.ketThucLuc).toLocaleString('vi-VN') : '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
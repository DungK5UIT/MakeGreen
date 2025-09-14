"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";

export default function RegisterPage() {
  const router = useRouter();
  const [showPw, setShowPw] = useState(false);
  const [showPw2, setShowPw2] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState(null);

  const onSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setSuccessMessage(null);

    const form = new FormData(e.currentTarget);
    const fullName = form.get("fullName")?.toString().trim();
    const phone = form.get("phone")?.toString().trim();
    const email = form.get("email")?.toString().trim();
    const password = form.get("password")?.toString();
    const confirm = form.get("confirm")?.toString();
    const agree = form.get("agree") === "on";

    const nextErrors = {};
    if (!fullName) nextErrors.fullName = "Vui lòng nhập họ và tên";
    if (!phone || !/^\+?84[1-9]\d{8}$/.test(phone)) nextErrors.phone = "SĐT không hợp lệ (VD: +84912345678 hoặc 84912345678)";
    if (!email || !/.+@.+\..+/.test(email)) nextErrors.email = "Email không hợp lệ";
    if (!password || password.length < 6) nextErrors.password = "Mật khẩu tối thiểu 6 ký tự";
    if (password !== confirm) nextErrors.confirm = "Mật khẩu nhập lại không khớp";
    if (!agree) nextErrors.agree = "Bạn cần đồng ý Điều khoản & Chính sách";

    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("http://localhost:8080/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          fullName,
          phone, // Gửi phone để lưu sau khi đăng ký
        }),
      });

      const data = await response.json();

      if (response.ok) {
        if (data.accessToken) {
          // Đăng ký thành công, có token (confirmation tắt)
          localStorage.setItem("mg_auth", "1");
          localStorage.setItem("token", data.accessToken);
          localStorage.setItem("userId", data.userId);
          localStorage.setItem("email", data.email);
          localStorage.setItem("roles", JSON.stringify(data.roles));
          window.dispatchEvent(new Event("mg-auth-changed"));
          router.push("/account");
        } else {
          // Confirmation bật, cần xác nhận email
          setSuccessMessage("Đăng ký thành công! Vui lòng kiểm tra email để xác nhận tài khoản.");
          setTimeout(() => router.push("/login"), 3000);
        }
      } else {
        setErrors({ api: data.message || "Đăng ký thất bại. Vui lòng thử lại." });
      }
    } catch (err) {
      setErrors({ api: "Lỗi kết nối server. Vui lòng thử lại sau." });
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = () => {
    setLoading(true);
    setErrors({});
    setTimeout(() => {
      localStorage.setItem("mg_auth", "1");
      window.dispatchEvent(new Event("mg-auth-changed"));
      router.push("/account");
      setLoading(false);
    }, 1000);
  };

  const loginWithFacebook = () => {
    setLoading(true);
    setErrors({});
    setTimeout(() => {
      localStorage.setItem("mg_auth", "1");
      window.dispatchEvent(new Event("mg-auth-changed"));
      router.push("/account");
      setLoading(false);
    }, 1000);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-primary/5 via-white to-secondary/5 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-neutral-900 mb-2">Tạo tài khoản</h1>
          <p className="text-neutral-600">Bắt đầu hành trình xanh ngay hôm nay</p>
        </div>
        <div className="bg-white rounded-3xl card-shadow p-8">
          <form className="space-y-6" onSubmit={onSubmit} noValidate>
            {successMessage && (
              <div className="bg-green-50 text-green-700 p-4 rounded-xl text-sm">
                {successMessage}
              </div>
            )}
            {errors.api && (
              <div className="bg-red-50 text-red-700 p-4 rounded-xl text-sm">
                {errors.api}
              </div>
            )}
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-neutral-700 mb-2">
                Họ và tên
              </label>
              <input
                id="fullName"
                name="fullName"
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent ${
                  errors.fullName ? "border-red-400" : "border-neutral-300"
                }`}
                placeholder="Nguyễn Văn A"
              />
              {errors.fullName && <p className="mt-1 text-sm text-red-500">{errors.fullName}</p>}
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-neutral-700 mb-2">
                Số điện thoại
              </label>
              <input
                id="phone"
                name="phone"
                inputMode="tel"
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent ${
                  errors.phone ? "border-red-400" : "border-neutral-300"
                }`}
                placeholder="+84901234567"
              />
              {errors.phone && <p className="mt-1 text-sm text-red-500">{errors.phone}</p>}
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-2">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent ${
                  errors.email ? "border-red-400" : "border-neutral-300"
                }`}
                placeholder="email@example.com"
              />
              {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-neutral-700 mb-2">
                Mật khẩu
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPw ? "text" : "password"}
                  className={`w-full pr-12 px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent ${
                    errors.password ? "border-red-400" : "border-neutral-300"
                  }`}
                  placeholder="Tối thiểu 6 ký tự"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-4 flex items-center"
                  onClick={() => setShowPw((v) => !v)}
                  aria-label={showPw ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                >
                  {showPw ? (
                    <svg className="h-5 w-5 text-neutral-400 hover:text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"/>
                    </svg>
                  ) : (
                    <svg className="h-5 w-5 text-neutral-400 hover:text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                    </svg>
                  )}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password}</p>}
            </div>
            <div>
              <label htmlFor="confirm" className="block text-sm font-medium text-neutral-700 mb-2">
                Nhập lại mật khẩu
              </label>
              <div className="relative">
                <input
                  id="confirm"
                  name="confirm"
                  type={showPw2 ? "text" : "password"}
                  className={`w-full pr-12 px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent ${
                    errors.confirm ? "border-red-400" : "border-neutral-300"
                  }`}
                  placeholder="Nhập lại đúng mật khẩu"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-4 flex items-center"
                  onClick={() => setShowPw2((v) => !v)}
                  aria-label={showPw2 ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                >
                  {showPw2 ? (
                    <svg className="h-5 w-5 text-neutral-400 hover:text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"/>
                    </svg>
                  ) : (
                    <svg className="h-5 w-5 text-neutral-400 hover:text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                    </svg>
                  )}
                </button>
              </div>
              {errors.confirm && <p className="mt-1 text-sm text-red-500">{errors.confirm}</p>}
            </div>
            <div>
              <label className="inline-flex items-center gap-2 text-sm text-neutral-700">
                <input type="checkbox" name="agree" className="h-4 w-4 text-primary focus:ring-primary border-neutral-300 rounded" />
                Tôi đồng ý{" "}
                <a href="#" className="text-primary hover:text-primary-hover">Điều khoản sử dụng</a> &nbsp;và&nbsp;
                <a href="#" className="text-primary hover:text-primary-hover">Chính sách bảo mật</a>.
              </label>
              {errors.agree && <p className="mt-1 text-sm text-red-500">{errors.agree}</p>}
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary-hover disabled:opacity-70 text-white py-3 px-4 rounded-xl font-semibold text-lg transition-colors"
            >
              {loading ? "Đang tạo tài khoản..." : "Đăng ký"}
            </button>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-neutral-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-neutral-500">Hoặc đăng ký nhanh</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={loginWithGoogle}
                className="w-full inline-flex justify-center items-center px-4 py-3 border border-neutral-300 rounded-xl bg-white text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" aria-hidden="true">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Google
              </button>
              <button
                type="button"
                onClick={loginWithFacebook}
                className="w-full inline-flex justify-center items-center px-4 py-3 border border-neutral-300 rounded-xl bg-white text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="#1877F2" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                Facebook
              </button>
            </div>
          </form>
          <div className="mt-8 text-center text-sm text-neutral-600">
            Đã có tài khoản?{" "}
            <Link href="/login" className="font-medium text-primary hover:text-primary-hover">
              Đăng nhập
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
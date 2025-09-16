"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { supabase } from "../../lib/supabase"; // Adjust path if necessary

export default function LoginPage() {
  const router = useRouter();
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const emailOrPhone = e.target.login.value.trim();
    const password = e.target.password.value;

    // Validate input: ưu tiên email, nếu là phone thì báo lỗi vì backend chỉ hỗ trợ email
    if (!emailOrPhone.includes("@")) {
      setError("Vui lòng nhập email hợp lệ (hiện tại chỉ hỗ trợ đăng nhập bằng email).");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("http://localhost:8080/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: emailOrPhone,
          password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Set Supabase session
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: data.accessToken,
          refresh_token: data.refreshToken, // Assuming refreshToken is returned in response
        });
        if (sessionError) {
          throw new Error("Lỗi thiết lập phiên đăng nhập: " + sessionError.message);
        }

        // Lưu thông tin vào localStorage
        localStorage.setItem("mg_auth", "1");
        localStorage.setItem("token", data.accessToken);
        localStorage.setItem("refreshToken", data.refreshToken); // Store refreshToken
        localStorage.setItem("userId", data.userId);
        localStorage.setItem("email", data.email);
        localStorage.setItem("roles", JSON.stringify(data.roles));

        // Trigger sự kiện để Header.js cập nhật
        window.dispatchEvent(new Event("mg-auth-changed"));

        // Chuyển hướng tới /account
        router.push("/account");
      } else {
        // Xử lý lỗi từ backend
        setError(data.message || "Đăng nhập thất bại. Vui lòng thử lại.");
      }
    } catch (err) {
      setError("Lỗi kết nối server hoặc thiết lập phiên: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = () => {
    setLoading(true);
    setError(null);
    // TODO: Thêm logic đăng nhập Google thực tế với Supabase
    setTimeout(() => {
      localStorage.setItem("mg_auth", "1");
      window.dispatchEvent(new Event("mg-auth-changed"));
      router.push("/account");
      setLoading(false);
    }, 1200);
  };

  const loginWithFacebook = () => {
    setLoading(true);
    setError(null);
    // TODO: Thêm logic đăng nhập Facebook thực tế với Supabase
    setTimeout(() => {
      localStorage.setItem("mg_auth", "1");
      window.dispatchEvent(new Event("mg-auth-changed"));
      router.push("/account");
      setLoading(false);
    }, 1200);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-primary/5 via-white to-secondary/5 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {/* Logo & Heading */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-neutral-900 mb-2">Chào mừng trở lại!</h1>
          <p className="text-neutral-600">Đăng nhập để tiếp tục hành trình xanh</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl card-shadow p-8">
          <form className="space-y-6" onSubmit={onSubmit}>
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 text-red-700 p-4 rounded-xl text-sm">
                {error}
              </div>
            )}

            {/* Email */}
            <div>
              <label htmlFor="login" className="block text-sm font-medium text-neutral-700 mb-2">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                  </svg>
                </div>
                <input
                  id="login"
                  name="login"
                  type="email"
                  required
                  className="w-full pl-12 pr-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="email@example.com"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-neutral-700 mb-2">
                Mật khẩu
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                  </svg>
                </div>
                <input
                  id="password"
                  name="password"
                  type={show ? "text" : "password"}
                  required
                  className="w-full pl-12 pr-12 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Nhập mật khẩu của bạn"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-4 flex items-center"
                  onClick={() => setShow(!show)}
                  aria-label={show ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                >
                  {show ? (
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
            </div>

            {/* Remember & Forgot */}
            <div className="flex items-center justify-between">
              <label className="inline-flex items-center gap-2 text-sm text-neutral-700 select-none">
                <input type="checkbox" className="h-4 w-4 text-primary focus:ring-primary border-neutral-300 rounded" />
                Ghi nhớ đăng nhập
              </label>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  alert("Tính năng quên mật khẩu sẽ sớm có!");
                }}
                className="text-sm font-medium text-primary hover:text-primary-hover"
              >
                Quên mật khẩu?
              </a>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary-hover disabled:opacity-70 text-white py-3 px-4 rounded-xl font-semibold text-lg transition-colors"
            >
              {loading ? "Đang đăng nhập..." : "Đăng nhập"}
            </button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-neutral-300" />
              </div>
            </div>          
          </form>

          {/* Benefits */}
          <div className="mt-8 bg-white/80 backdrop-blur-sm rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-center mb-4">Tại sao chọn MakeGreen?</h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-2">
                  <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"/>
                  </svg>
                </div>
                <p className="text-xs font-medium text-neutral-700">Tiết kiệm</p>
              </div>
              <div>
                <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center mx-auto mb-2">
                  <svg className="w-6 h-6 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                  </svg>
                </div>
                <p className="text-xs font-medium text-neutral-700">Thân thiện</p>
              </div>
              <div>
                <div className="w-12 h-12 bg-success/10 rounded-xl flex items-center justify-center mx-auto mb-2">
                  <svg className="w-6 h-6 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                  </svg>
                </div>
                <p className="text-xs font-medium text-neutral-700">An toàn</p>
              </div>
            </div>
          </div>

          {/* Sign up link */}
          <div className="mt-8 text-center text-sm text-neutral-600">
            Chưa có tài khoản?{" "}
            <a href="/register" className="font-medium text-primary hover:text-primary-hover">Đăng ký ngay</a>
          </div>
        </div>
      </div>
    </main>
  );
}
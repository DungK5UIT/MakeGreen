"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { supabase } from "../../lib/supabase"; // Adjust path if necessary

export default function RegisterPage() {
  const router = useRouter();
  const [showPw, setShowPw] = useState(false);
  const [showPw2, setShowPw2] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState(null);
  const [email, setEmail] = useState(""); // Lưu email cho resend

  const onSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setSuccessMessage(null);

    const form = new FormData(e.currentTarget);
    const fullName = (form.get("fullName") || "").toString().trim();
    const emailRaw = (form.get("email") || "").toString().trim();
    const email = emailRaw.toLowerCase();
    const password = (form.get("password") || "").toString();
    const confirm = (form.get("confirm") || "").toString();
    const agree = form.get("agree") === "on";

    const nextErrors = {};
    if (!fullName) nextErrors.fullName = "Vui lòng nhập họ và tên";
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) nextErrors.email = "Email không hợp lệ";
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, fullName }),
      });

      let data = {};
      try {
        data = await response.json();
      } catch (_) {
        // ignore parse error
      }

      console.log("Signup response:", data); // Debug log

      if (response.status === 429) {
        setErrors({
          api: "Quá nhiều yêu cầu gửi email. Vui lòng thử lại sau vài phút.",
        });
        setLoading(false);
        return;
      }

      if (response.status === 500 && data.msg?.includes("Error sending confirmation email")) {
        setErrors({
          api: "Lỗi gửi email xác nhận. Vui lòng kiểm tra cấu hình email hoặc thử lại sau.",
        });
        setLoading(false);
        return;
      }

      if (response.ok) {
        setSuccessMessage(data.message || "Đăng ký thành công! Vui lòng kiểm tra email để xác nhận tài khoản.");
        setEmail(email); // Lưu email cho resend
        if (data.accessToken) {
          // Nếu có tokens (confirmation tắt), login ngay
          const { error: sessionError } = await supabase.auth.setSession({
            access_token: data.accessToken,
            refresh_token: data.refreshToken,
          });
          if (sessionError) {
            console.error("Session error:", sessionError);
          } else {
            localStorage.setItem("mg_auth", "1");
            localStorage.setItem("token", data.accessToken);
            localStorage.setItem("refreshToken", data.refreshToken);
            localStorage.setItem("userId", data.userId || "unknown");
            localStorage.setItem("email", data.email);
            localStorage.setItem("roles", JSON.stringify(data.roles || []));
            window.dispatchEvent(new Event("mg-auth-changed"));
            router.push("/account");
            return;
          }
        }
        // Unconfirmed: Redirect login sau 1.5s
        setTimeout(() => router.push("/login"), 1500);
      } else {
        if (response.status === 409 || response.status === 422) {
          setErrors({
            api: data?.message || "Email đã được đăng ký. Vui lòng đăng nhập hoặc khôi phục mật khẩu.",
          });
        } else {
          setErrors({
            api: data?.message || "Đăng ký thất bại. Vui lòng thử lại.",
          });
        }
      }
    } catch (err) {
      console.error("Signup error:", err);
      setErrors({ api: "Lỗi kết nối server. Vui lòng thử lại sau." });
    } finally {
      setLoading(false);
    }
  };

  const resendConfirmation = async () => {
    if (!email) return;
    setLoading(true);
    try {
      const response = await fetch("http://localhost:8080/api/auth/resend-confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      console.log("Resend response:", data);
      if (response.ok) {
        setSuccessMessage(data.message || "Email xác nhận đã gửi lại thành công!");
      } else {
        setErrors({ api: data.message || "Gửi lại email thất bại." });
      }
    } catch (err) {
      setErrors({ api: "Lỗi kết nối server. Vui lòng thử lại sau." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-primary/5 via-white to-secondary/5 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-neutral-900 mb-2">Tạo tài khoản</h1>
          <p className="text-neutral-600">Bắt đầu hành trình xanh ngay hôm nay</p>
        </div>

        <div className="bg-white rounded-3xl card-shadow p-3">
          <form className="space-y-6" onSubmit={onSubmit} noValidate>
            {successMessage && (
              <div className="bg-green-50 text-green-700 p-4 rounded-xl text-sm" aria-live="polite">
                {successMessage}
              </div>
            )}
            {errors.api && (
              <div className="bg-red-50 text-red-700 p-4 rounded-xl text-sm" aria-live="assertive">
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
                autoComplete="name"
              />
              {errors.fullName && <p className="mt-1 text-sm text-red-500">{errors.fullName}</p>}
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
                autoComplete="email"
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
                  autoComplete="new-password"
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
                  autoComplete="new-password"
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
            </div>
          </form>

          {successMessage && (
            <div className="mt-4 text-center">
              <button
                onClick={resendConfirmation}
                disabled={loading}
                className="text-sm font-medium text-primary hover:text-primary-hover disabled:opacity-70"
              >
                Gửi lại email xác nhận
              </button>
            </div>
          )}

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
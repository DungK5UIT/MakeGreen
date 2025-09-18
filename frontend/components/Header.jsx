"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation"; // Thêm useRouter
import { useEffect, useState } from "react";
import Image from 'next/image';

const NavLink = ({ href, children, onClick, isTrips, isAuthed }) => { // Thêm props isTrips và isAuthed
  const pathname = usePathname();
  const router = useRouter(); // Thêm router
  const active = pathname === href || pathname.startsWith(`${href}/`);

  const handleClick = (e) => {
    if (isTrips && !isAuthed) {
      e.preventDefault(); // Ngăn navigation mặc định
      router.push("/login"); // Redirect đến login
    }
    if (onClick) onClick(); // Gọi onClick nếu có (cho mobile menu)
  };

  return (
    <Link
      href={href}
      onClick={handleClick}
      className={`transition-colors ${
        active ? "text-primary" : "text-neutral-600 hover:text-primary"
      }`}
    >
      {children}
    </Link>
  );
};

export default function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [isAuthed, setIsAuthed] = useState(false);

  // đọc trạng thái đăng nhập từ localStorage
  const syncAuthFromStorage = () => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem("mg_auth") === "1";
  };

  // init + đóng menu khi đổi route
  useEffect(() => {
    setIsAuthed(syncAuthFromStorage());
    setOpen(false);
  }, [pathname]);

  // lắng nghe thay đổi từ tab khác
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === "mg_auth") {
        setIsAuthed(e.newValue === "1");
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // cho phép trang khác bắn sự kiện tuỳ chỉnh nếu muốn
  useEffect(() => {
    const onCustom = () => setIsAuthed(syncAuthFromStorage());
    window.addEventListener("mg-auth-changed", onCustom);
    return () => window.removeEventListener("mg-auth-changed", onCustom);
  }, []);

  return (
    <header className="bg-white shadow-sm sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center" aria-label="MakeGreen - về trang chủ">
            <Image
              src="/images/Logo.png"
              alt="Logo"
              width={70}
              height={70}
            />
            <span className="text-xl font-semibold text-neutral-900">MakeGreen</span>
          </Link>

          <nav className="hidden md:flex items-center space-x-8">
            <NavLink href="/vehicles" isAuthed={isAuthed}>Xe điện</NavLink>
            <NavLink href="/trips" isTrips={true} isAuthed={isAuthed}>Chuyến đi</NavLink> {/* Thêm isTrips và isAuthed */}
            <NavLink href="/news" isAuthed={isAuthed}>Tin tức</NavLink>
            <NavLink href="/support" isAuthed={isAuthed}>Hỗ trợ</NavLink>
          </nav>

          <div className="hidden md:flex items-center space-x-4">
            {!isAuthed ? (
              <>
                <NavLink href="/login" isAuthed={isAuthed}>Đăng nhập</NavLink>
                <Link
                  href="/vehicles"
                  className="bg-primary hover:bg-primary-hover text-white px-6 py-2 rounded-xl font-medium transition-colors"
                >
                  Đặt xe ngay
                </Link>
              </>
            ) : (
              <>
                <NavLink href="/account" isAuthed={isAuthed}>Tài khoản</NavLink>
                <Link
                  href="/vehicles"
                  className="bg-primary hover:bg-primary-hover text-white px-6 py-2 rounded-xl font-medium transition-colors"
                >
                  Đặt xe ngay
                </Link>
              </>
            )}
          </div>

          <button
            className="md:hidden p-2"
            onClick={() => setOpen(!open)}
            aria-label="Mở menu"
            aria-expanded={open}
            aria-controls="mobile-menu"
          >
            <svg className="w-6 h-6 text-neutral-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {open ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"/>
              )}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {open && (
          <div id="mobile-menu" className="md:hidden pb-4 space-y-3">
            <NavLink href="/vehicles" onClick={() => setOpen(false)} isAuthed={isAuthed}>Xe điện</NavLink>
            <NavLink href="/trips" onClick={() => setOpen(false)} isTrips={true} isAuthed={isAuthed}>Chuyến đi</NavLink> {/* Thêm isTrips và isAuthed */}
            <NavLink href="/news" onClick={() => setOpen(false)} isAuthed={isAuthed}>Tin tức</NavLink>
            <NavLink href="/support" onClick={() => setOpen(false)} isAuthed={isAuthed}>Hỗ trợ</NavLink>

            <div className="flex gap-3 pt-1">
              {!isAuthed ? (
                <>
                  <Link
                    href="/login"
                    className="flex-1 text-center border border-neutral-300 text-neutral-700 rounded-xl py-2"
                    onClick={() => setOpen(false)}
                  >
                    Đăng nhập
                  </Link>
                  <Link
                    href="/vehicles"
                    className="flex-1 text-center bg-primary text-white rounded-xl py-2"
                    onClick={() => setOpen(false)}
                  >
                    Đặt xe ngay
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/account"
                    className="flex-1 text-center border border-neutral-300 text-neutral-700 rounded-xl py-2"
                    onClick={() => setOpen(false)}
                  >
                    Tài khoản
                  </Link>
                  <Link
                    href="/vehicles"
                    className="flex-1 text-center bg-primary text-white rounded-xl py-2"
                    onClick={() => setOpen(false)}
                  >
                    Đặt xe ngay
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
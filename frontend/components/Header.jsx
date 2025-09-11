"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const NavLink = ({ href, children }) => {
  const pathname = usePathname();
  const active = pathname === href;
  return (
    <Link
      href={href}
      className={`transition-colors ${active ? "text-primary" : "text-neutral-600 hover:text-primary"}`}
    >
      {children}
    </Link>
  );
};

export default function Header() {
  const [open, setOpen] = useState(false);
  return (
    <header className="bg-white shadow-sm sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center mr-3">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
              </svg>
            </div>
            <span className="text-xl font-semibold text-neutral-900">MakeGreen</span>
          </Link>

          <nav className="hidden md:flex space-x-8">
            <NavLink href="/vehicles">Xe điện</NavLink>
            <NavLink href="/news">Tin tức</NavLink>
            <NavLink href="/support">Hỗ trợ</NavLink>
          </nav>

          <div className="hidden md:flex items-center space-x-4">
            <Link href="/account" className="text-neutral-600 hover:text-primary transition-colors">Tài khoản</Link>
            <Link href="/booking" className="bg-primary hover:bg-primary-hover text-white px-6 py-2 rounded-xl font-medium transition-colors">Đặt xe ngay</Link>
          </div>

          <button className="md:hidden" onClick={()=>setOpen(!open)} aria-label="Menu">
            <svg className="w-6 h-6 text-neutral-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"/>
            </svg>
          </button>
        </div>

        {open && (
          <div className="md:hidden pb-4 space-y-3">
            <Link href="/vehicles" className="block text-neutral-600 hover:text-primary">Xe điện</Link>
            <Link href="/news" className="block text-neutral-600 hover:text-primary">Tin tức</Link>
            <Link href="/support" className="block text-neutral-600 hover:text-primary">Hỗ trợ</Link>
            <div className="flex gap-3">
              <Link href="/account" className="flex-1 text-center border border-neutral-300 text-neutral-700 rounded-xl py-2">Tài khoản</Link>
              <Link href="/booking" className="flex-1 text-center bg-primary text-white rounded-xl py-2">Đặt xe ngay</Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  FaCar, FaUsers, FaFileContract, FaRoute, FaPercent, FaTags, FaMapMarkerAlt,
  FaTools, FaExclamationTriangle, FaStar, FaHistory, FaBolt
} from 'react-icons/fa';

const sections = [
  { href: '/admin', key: 'dashboard', label: 'Dashboard', icon: <FaCar className="w-5" /> },
  { href: '/admin/xe', key: 'xe', label: 'Bảng xe', icon: <FaCar className="w-5" /> },
  { href: '/admin/nguoidung', key: 'nguoi_dung', label: 'Người dùng', icon: <FaUsers className="w-5" /> },
  { href: '/admin/donthue', key: 'don_thue', label: 'Đơn thuê', icon: <FaFileContract className="w-5" /> },
  { href: '/admin/chuyendi', key: 'chuyen_di', label: 'Chuyến đi', icon: <FaRoute className="w-5" /> },
  { href: '/admin/baotri', key: 'bao_tri', label: 'Bảo trì', icon: <FaTools className="w-5" /> },
  { href: '/admin/suco', key: 'su_co', label: 'Sự cố', icon: <FaExclamationTriangle className="w-5" /> },
];

export default function Sidebar({ sidebarOpen, setSidebarOpen }) {
  const pathname = usePathname();

  const isActive = (href) => {
    // active when exact or when current path starts with href (for nested routes)
    if (href === '/admin') return pathname === '/admin';
    return pathname.startsWith(href);
  };

  const sidebarItemClass = (active) =>
    `sidebar-item p-3 rounded-xl cursor-pointer transition-all ${
      active
        ? 'bg-blue-600 text-white'
        : 'text-gray-700 dark:text-gray-300 hover:text-white hover:bg-gradient-to-br from-blue-600 to-blue-700'
    }`;

  return (
    <aside
      className={`fixed left-0 top-16 h-full w-64 bg-white dark:bg-gray-800 shadow-lg transition-transform duration-300 z-40 overflow-y-auto
      ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
    >
      <div className="p-6 space-y-2">
        <div className="flex items-center space-x-3 mb-4 lg:hidden">
          <div className="w-8 h-8 bg-blue-600 rounded-lg grid place-items-center text-white"><FaBolt className="text-sm"/></div>
          <span className="font-bold text-gray-800 dark:text-white">EV Rental Admin</span>
        </div>
        {sections.map((s) => (
          <Link key={s.href} href={s.href} onClick={() => setSidebarOpen(false)}>
            <div className={sidebarItemClass(isActive(s.href))}>
              <div className="flex items-center">
                {s.icon}
                <span className="ml-3 font-medium">{s.label}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </aside>
  );
}

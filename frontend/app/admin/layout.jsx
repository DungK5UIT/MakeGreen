'use client';

import { useEffect, useState } from 'react';
import Sidebar from './components/sidebar';
import Header from './components/header';

export default function AdminLayout({ children }) {
  const [theme, setTheme] = useState('light');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const t = typeof window !== 'undefined' ? localStorage.getItem('theme') || 'light' : 'light';
    setTheme(t);
  }, []);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem('theme', theme);
    }
  }, [theme]);

  return (
    <div className="min-h-screen bg-[var(--bg-secondary)] text-[var(--text-primary)]">
      <style jsx global>{`
        :root {
          --primary-blue: #3b82f6;
          --primary-blue-dark: #1d4ed8;
          --secondary-blue: #e0f2fe;
          --text-primary: #1f2937;
          --text-secondary: #6b7280;
          --bg-primary: #ffffff;
          --bg-secondary: #f8fafc;
          --border-color: #e5e7eb;
        }
        [data-theme='dark'] {
          --text-primary: #f9fafb;
          --text-secondary: #d1d5db;
          --bg-primary: #1f2937;
          --bg-secondary: #111827;
          --border-color: #374151;
        }
        .stat-card { background: var(--bg-primary); border: 1px solid var(--border-color); }
        .table-row:hover { background-color: var(--secondary-blue); }
      `}</style>

      <Header theme={theme} setTheme={setTheme} setSidebarOpen={setSidebarOpen} />

      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Overlay mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} aria-hidden />
      )}

      <main className="lg:ml-64 pt-16 min-h-screen">{children}</main>
    </div>
  );
}

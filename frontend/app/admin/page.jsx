'use client';

import { useEffect, useRef } from 'react';
import useChart from './components/useChart';
import { FaCar, FaUsers, FaFileContract, FaDollarSign, FaExclamationTriangle, FaUserPlus } from 'react-icons/fa';

export default function AdminDashboardPage() {
  const Chart = useChart();
  const revenueRef = useRef(null);
  const rentalRef = useRef(null);
  const statusRef = useRef(null);
  const chartInstances = useRef([]);

  useEffect(() => {
    if (!Chart) return;
    chartInstances.current.forEach((c) => c?.destroy());
    const list = [];

    if (revenueRef.current) {
      list.push(new Chart(revenueRef.current, {
        type: 'line',
        data: {
          labels: ['T1','T2','T3','T4','T5','T6','T7','T8','T9','T10','T11','T12'],
          datasets: [{ label: 'Doanh thu (triệu đồng)', data: [180,220,190,250,280,320,290,350,380,420,450,480],
            borderColor: '#3b82f6', backgroundColor: 'rgba(59,130,246,0.1)', tension: 0.4, fill: true }]}
      }));
    }
    if (rentalRef.current) {
      list.push(new Chart(rentalRef.current, {
        type: 'bar',
        data: { labels: ['CN','T2','T3','T4','T5','T6','T7'], datasets: [{ label: 'Lượt thuê', data: [280,320,290,350,380,420,340], backgroundColor: '#10b981', borderRadius: 8 }]}
      }));
    }
    if (statusRef.current) {
      list.push(new Chart(statusRef.current, {
        type: 'doughnut',
        data: { labels: ['Hoạt động','Đang thuê','Bảo trì','Sự cố'], datasets: [{ data: [245,127,18,8],
          backgroundColor: ['#10b981','#3b82f6','#f59e0b','#ef4444'], borderWidth: 0 }]}
      }));
    }

    chartInstances.current = list;
    return () => { chartInstances.current.forEach((c) => c?.destroy()); chartInstances.current = []; };
  }, [Chart]);

  return (
    <div className="p-6">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Dashboard Tổng Quan</h2>
        <p className="text-gray-600 dark:text-gray-400">Thống kê và phân tích hoạt động hệ thống thuê xe điện</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { title: 'Tổng số xe', value: '398', delta: '↗ 245 hoạt động', icon: <FaCar />, tone: 'blue' },
          { title: 'Người dùng', value: '12,847', delta: '↗ +324 tháng này', icon: <FaUsers />, tone: 'green' },
          { title: 'Đơn thuê hoạt động', value: '127', delta: '↗ +12 hôm nay', icon: <FaFileContract />, tone: 'purple' },
          { title: 'Doanh thu tháng', value: '2.4B', delta: '↗ +18% so với tháng trước', icon: <FaDollarSign />, tone: 'yellow' },
        ].map((c, i) => (
          <div key={i} className="stat-card p-6 rounded-xl shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{c.title}</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{c.value}</p>
                <div className="flex items-center mt-2">
                  <span className="text-green-600 text-sm font-medium">{c.delta}</span>
                </div>
              </div>
              <div className={`w-14 h-14 rounded-xl grid place-items-center ${
                c.tone==='blue'?'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400':
                c.tone==='green'?'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400':
                c.tone==='purple'?'bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400':
                'bg-yellow-100 dark:bg-yellow-900 text-yellow-600 dark:text-yellow-400'
              }`}>{c.icon}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="stat-card p-6 rounded-xl shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Doanh thu theo tháng</h3>
          <div className="relative h-[300px]"><canvas ref={revenueRef} /></div>
        </div>
        <div className="stat-card p-6 rounded-xl shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Lượt thuê xe theo ngày</h3>
          <div className="relative h-[300px]"><canvas ref={rentalRef} /></div>
        </div>
      </div>

      {/* Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="stat-card p-6 rounded-xl shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Trạng thái xe</h3>
          <div className="relative h-[300px]"><canvas ref={statusRef} /></div>
        </div>
        <div className="stat-card p-6 rounded-xl shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Hoạt động gần đây</h3>
          <div className="space-y-4 max-h-80 overflow-y-auto">
            {[
              { iconBg: 'bg-blue-100 dark:bg-blue-900', icon: <FaCar className="text-blue-600 dark:text-blue-400" />, text: 'Xe Pega NewTech 001 được thuê bởi Nguyễn Văn A', time: '2 phút trước' },
              { iconBg: 'bg-green-100 dark:bg-green-900', icon: <FaDollarSign className="text-green-600 dark:text-green-400" />, text: 'Thanh toán 450,000đ hoàn thành', time: '5 phút trước' },
              { iconBg: 'bg-red-100 dark:bg-red-900', icon: <FaExclamationTriangle className="text-red-600 dark:text-red-400" />, text: 'Sự cố xe Yadea G5 003 được báo cáo', time: '10 phút trước' },
              { iconBg: 'bg-purple-100 dark:bg-purple-900', icon: <FaUserPlus className="text-purple-600 dark:text-purple-400" />, text: 'Người dùng mới đăng ký: Trần Thị B', time: '15 phút trước' },
            ].map((a, i) => (
              <div key={i} className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className={`w-10 h-10 ${a.iconBg} rounded-full grid place-items-center`}>{a.icon}</div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{a.text}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{a.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

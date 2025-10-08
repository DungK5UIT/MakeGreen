'use client';

import { useEffect, useRef, useState } from 'react';
import useChart from './components/useChart';
import { FaCar, FaUsers, FaFileContract, FaDollarSign, FaExclamationTriangle, FaUserPlus } from 'react-icons/fa';

export default function AdminDashboardPage() {
  const Chart = useChart();
  const revenueRef = useRef(null);
  const rentalRef = useRef(null);
  const statusRef = useRef(null);
  const chartInstances = useRef([]);

  const [stats, setStats] = useState({
    totalXe: 0,
    totalUsers: 0,
    activeRentals: 0,
    monthlyRevenue: '0',
    todayRentals: 0,
    monthRentals: 0,
    yearRentals: 0,
  });

  const [revenueData, setRevenueData] = useState([0,0,0,0,0,0,0,0,0,0,0,0]);
  const [rentalWeekData, setRentalWeekData] = useState([0,0,0,0,0,0,0]);
  const [statusData, setStatusData] = useState([0,0,0,0]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch vehicles
        const xeRes = await fetch('http://localhost:8080/api/xe');
        const xeData = await xeRes.json();
        const totalXe = xeData.length;

        // Compute status
        const hoatDong = xeData.filter(x => x.trangThai === 'HOAT_DONG').length; // Assume statuses
        const dangThue = xeData.filter(x => x.trangThai === 'DANG_THUE').length;
        const baoTri = xeData.filter(x => x.trangThai === 'BAO_TRI').length;
        const suCo = xeData.filter(x => x.trangThai === 'SU_CO').length;
        setStatusData([hoatDong, dangThue, baoTri, suCo]);

        // Fetch users
        const usersRes = await fetch('http://localhost:8080/api/nguoidung');
        const usersData = await usersRes.json();
        const totalUsers = usersData.length;

        // Fetch rentals (DonThue)
        const donThueRes = await fetch('http://localhost:8080/api/donthue');
        const donThueData = await donThueRes.json();

        // Assume trangThai 'DANG_THUE' for active
        const activeRentals = donThueData.filter(d => d.trangThai === 'DANG_THUE').length;

        // Fetch trips (ChuyenDi) for revenue
        const chuyenDiRes = await fetch('http://localhost:8080/api/chuyen-di');
        const chuyenDiData = await chuyenDiRes.json();

        // Compute revenue this month, assume tongChiPhi is number
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        const monthlyRevenue = chuyenDiData
          .filter(c => {
            if (!c.ketThucLuc) return false;
            const endDate = new Date(c.ketThucLuc);
            return endDate.getMonth() === currentMonth && endDate.getFullYear() === currentYear;
          })
          .reduce((sum, c) => sum + (c.tongChiPhi || 0), 0)
          .toLocaleString();

        // Compute rentals by day, month, year based on batDauLuc in DonThue
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const monthStart = new Date(currentYear, currentMonth, 1);
        const yearStart = new Date(currentYear, 0, 1);

        const todayRentals = donThueData.filter(d => {
          if (!d.batDauLuc) return false;
          const startDate = new Date(d.batDauLuc);
          return startDate >= todayStart;
        }).length;

        const monthRentals = donThueData.filter(d => {
          if (!d.batDauLuc) return false;
          const startDate = new Date(d.batDauLuc);
          return startDate >= monthStart;
        }).length;

        const yearRentals = donThueData.filter(d => {
          if (!d.batDauLuc) return false;
          const startDate = new Date(d.batDauLuc);
          return startDate >= yearStart;
        }).length;

        setStats({
          totalXe,
          totalUsers,
          activeRentals,
          monthlyRevenue,
          todayRentals,
          monthRentals,
          yearRentals,
        });

        // Compute revenue per month for chart
        const monthlyRevenues = Array(12).fill(0);
        chuyenDiData.forEach(c => {
          if (c.ketThucLuc) {
            const endDate = new Date(c.ketThucLuc);
            if (endDate.getFullYear() === currentYear) {
              monthlyRevenues[endDate.getMonth()] += c.tongChiPhi || 0;
            }
          }
        });
        setRevenueData(monthlyRevenues);

        // Compute rentals last 7 days
        const weekRentals = Array(7).fill(0);
        const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7']; // Adjust based on locale
        for (let i = 6; i >= 0; i--) {
          const day = new Date(now);
          day.setDate(now.getDate() - i);
          const dayStart = new Date(day.getFullYear(), day.getMonth(), day.getDate());
          const dayEnd = new Date(dayStart);
          dayEnd.setDate(dayEnd.getDate() + 1);
          weekRentals[6 - i] = donThueData.filter(d => {
            if (!d.batDauLuc) return false;
            const startDate = new Date(d.batDauLuc);
            return startDate >= dayStart && startDate < dayEnd;
          }).length;
        }
        setRentalWeekData(weekRentals);

      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (!Chart) return;
    chartInstances.current.forEach((c) => c?.destroy());
    const list = [];

    if (revenueRef.current) {
      list.push(new Chart(revenueRef.current, {
        type: 'line',
        data: {
          labels: ['T1','T2','T3','T4','T5','T6','T7','T8','T9','T10','T11','T12'],
          datasets: [{ label: 'Doanh thu (triệu đồng)', data: revenueData.map(d => d / 1000000),
            borderColor: '#3b82f6', backgroundColor: 'rgba(59,130,246,0.1)', tension: 0.4, fill: true }]}
      }));
    }
    if (rentalRef.current) {
      list.push(new Chart(rentalRef.current, {
        type: 'bar',
        data: { labels: ['CN','T2','T3','T4','T5','T6','T7'], datasets: [{ label: 'Lượt thuê', data: rentalWeekData, backgroundColor: '#10b981', borderRadius: 8 }]}
      }));
    }
    if (statusRef.current) {
      list.push(new Chart(statusRef.current, {
        type: 'doughnut',
        data: { labels: ['Hoạt động','Đang thuê','Bảo trì','Sự cố'], datasets: [{ data: statusData,
          backgroundColor: ['#10b981','#3b82f6','#f59e0b','#ef4444'], borderWidth: 0 }]}
      }));
    }

    chartInstances.current = list;
    return () => { chartInstances.current.forEach((c) => c?.destroy()); chartInstances.current = []; };
  }, [Chart, revenueData, rentalWeekData, statusData]);

  return (
    <div className="p-6">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Dashboard Tổng Quan</h2>
        <p className="text-gray-600 dark:text-gray-400">Thống kê và phân tích hoạt động hệ thống thuê xe điện</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {[
          { title: 'Tổng số xe', value: stats.totalXe.toString(), delta: `↗ ${stats.totalXe > 0 ? Math.round((stats.totalXe * 0.615) ) : 0} hoạt động`, icon: <FaCar />, tone: 'blue' },
          { title: 'Người dùng', value: stats.totalUsers.toLocaleString(), delta: '↗ +324 tháng này', icon: <FaUsers />, tone: 'green' },
          { title: 'Đơn thuê hoạt động', value: stats.activeRentals.toString(), delta: '↗ +12 hôm nay', icon: <FaFileContract />, tone: 'purple' },
          { title: 'Doanh thu tháng', value: stats.monthlyRevenue, delta: '↗ +18% so với tháng trước', icon: <FaDollarSign />, tone: 'yellow' },
          { title: 'Xe thuê hôm nay', value: stats.todayRentals.toString(), delta: '↗ +2 so với hôm qua', icon: <FaFileContract />, tone: 'blue' },
          { title: 'Xe thuê tháng này', value: stats.monthRentals.toString(), delta: '↗ +50 so với tháng trước', icon: <FaFileContract />, tone: 'green' },
          { title: 'Xe thuê năm nay', value: stats.yearRentals.toString(), delta: '↗ +800 so với năm ngoái', icon: <FaFileContract />, tone: 'purple' },
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
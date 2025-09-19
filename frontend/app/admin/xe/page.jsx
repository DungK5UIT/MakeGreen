'use client';

import { useState } from 'react';
import VehicleTable from '../components/VehicleModal';
import VehicleModal from '../components/VehicleTable';
import { FaEdit } from 'react-icons/fa';

export default function XePage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  return (
    <div className="p-6">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Quản lý Xe</h2>
          <p className="text-gray-600 dark:text-gray-400">Quản lý thông tin và trạng thái các xe điện</p>
        </div>
        <button
          onClick={() => { setIsCreating(true); setModalOpen(true); }}
          className="mt-4 sm:mt-0 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-colors shadow-sm"
        >
          <span className="inline-flex items-center"><FaEdit className="mr-2" /> Thêm xe mới</span>
        </button>
      </div>

      {/* Search & filters (demo) */}
      <div className="stat-card p-4 rounded-xl shadow-sm mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            placeholder="Tìm kiếm theo tên, model, biển số..."
            className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
          <select className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
            <option>Tất cả trạng thái</option>
            <option>Hoạt động</option>
            <option>Đang thuê</option>
            <option>Bảo trì</option>
            <option>Sự cố</option>
          </select>
          <select className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
            <option>Tất cả hãng</option>
            <option>VinFast</option>
            <option>Honda</option>
            <option>Yamaha</option>
          </select>
        </div>
      </div>

      <VehicleTable onOpenModal={(creating) => { setIsCreating(creating); setModalOpen(true); }} />

      <VehicleModal open={modalOpen} onClose={() => setModalOpen(false)} isCreating={isCreating} />
    </div>
  );
}

'use client';

import { FaCar, FaEdit, FaEye, FaStar, FaStarHalfAlt, FaTrash } from 'react-icons/fa';

export default function VehicleTable({ onOpenModal }) {
  return (
    <div className="stat-card rounded-xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              {['Xe', 'Pin', 'Số km', 'Trạng thái', 'Giá thuê', 'Đánh giá', 'Thao tác'].map((h) => (
                <th key={h} className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
            {/* Row 1 */}
            <tr className="table-row hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-xl grid place-items-center mr-4">
                    <FaCar className="text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-900 dark:text-white">VF-001</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">VinFast Klara S</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2 mr-3">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '85%' }} />
                  </div>
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">85%</span>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">12,450 km</td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">Đang thuê</span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">15,000đ/giờ</td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="flex text-yellow-400">
                    <FaStar /> <FaStar /> <FaStar /> <FaStar /> <FaStarHalfAlt />
                  </div>
                  <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">4.5</span>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div className="flex space-x-2">
                  <button onClick={() => onOpenModal(false)} className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900 transition-colors" aria-label="Xem"><FaEye /></button>
                  <button onClick={() => onOpenModal(false)} className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 p-2 rounded-lg hover:bg-green-50 dark:hover:bg-green-900 transition-colors" aria-label="Sửa"><FaEdit /></button>
                  <button onClick={() => confirm('Bạn có chắc chắn muốn xóa xe này?') && alert('Chức năng xóa sẽ được triển khai!')} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900 transition-colors" aria-label="Xóa"><FaTrash /></button>
                </div>
              </td>
            </tr>

            {/* Row 2 */}
            <tr className="table-row hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-xl grid place-items-center mr-4">
                    <FaCar className="text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-900 dark:text-white">VF-002</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Honda Vision</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2 mr-3">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '92%' }} />
                  </div>
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">92%</span>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">8,230 km</td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">Sẵn sàng</span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">12,000đ/giờ</td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="flex text-yellow-400">
                    <FaStar /> <FaStar /> <FaStar /> <FaStar />
                  </div>
                  <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">4.2</span>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div className="flex space-x-2">
                  <button onClick={() => onOpenModal(false)} className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900 transition-colors" aria-label="Xem"><FaEye /></button>
                  <button onClick={() => onOpenModal(false)} className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 p-2 rounded-lg hover:bg-green-50 dark:hover:bg-green-900 transition-colors" aria-label="Sửa"><FaEdit /></button>
                  <button onClick={() => confirm('Bạn có chắc chắn muốn xóa xe này?') && alert('Chức năng xóa sẽ được triển khai!')} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900 transition-colors" aria-label="Xóa"><FaTrash /></button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Pagination (static demo) */}
      <div className="bg-white dark:bg-gray-800 px-6 py-4 flex items-center justify-between border-t border-gray-200 dark:border-gray-600">
        <div className="hidden sm:block text-sm text-gray-700 dark:text-gray-300">
          Hiển thị <span className="font-medium">1</span> đến <span className="font-medium">10</span> của <span className="font-medium">398</span> xe
        </div>
        <div className="flex gap-2">
          {[1, 2, 3].map((p) => (
            <button key={p} className={`px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 ${p === 1 ? 'bg-gray-100 dark:bg-gray-700' : 'bg-white dark:bg-gray-800'} text-sm font-medium text-gray-700 dark:text-gray-300`}>{p}</button>
          ))}
          <button className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-500 dark:text-gray-400">→</button>
        </div>
      </div>
    </div>
  );
}

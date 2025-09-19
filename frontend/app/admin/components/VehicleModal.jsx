'use client';

export default function VehicleModal({ open, onClose, isCreating }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={(e) => e.currentTarget === e.target && onClose()}>
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">{isCreating ? 'Thêm xe mới' : 'Chi tiết xe'}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" aria-label="Đóng">✕</button>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { label: 'Tên xe', type: 'text', defaultValue: 'VF-001' },
              { label: 'Hãng', type: 'text', defaultValue: 'VinFast' },
              { label: 'Model', type: 'text', defaultValue: 'Klara S' },
              { label: 'Tầm hoạt động (km)', type: 'number', defaultValue: 120 },
              { label: 'Tốc độ tối đa (km/h)', type: 'number', defaultValue: 50 },
              { label: 'Pin (%)', type: 'number', defaultValue: 85 },
              { label: 'Số km đã đi', type: 'number', defaultValue: 12450 },
              { label: 'Giá thuê (đ/giờ)', type: 'number', defaultValue: 15000 },
              { label: 'Tiền cọc (đ)', type: 'number', defaultValue: 500000 },
            ].map((f, i) => (
              <div key={i}>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{f.label}</label>
                <input
                  type={f.type}
                  defaultValue={isCreating ? (f.type === 'number' ? 0 : '') : f.defaultValue}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            ))}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Trạng thái</label>
              <select className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white" defaultValue="Đang thuê">
                <option>Hoạt động</option>
                <option>Đang thuê</option>
                <option>Bảo trì</option>
                <option>Sự cố</option>
              </select>
            </div>
          </div>
          <div className="mt-6 flex justify-end gap-3">
            <button onClick={onClose} className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 font-medium transition-colors">
              Hủy
            </button>
            <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors">
              Lưu thay đổi
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

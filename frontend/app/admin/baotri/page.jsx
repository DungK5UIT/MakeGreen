'use client';

import { useState, useEffect } from 'react';
import { FaWrench, FaEdit, FaEye, FaTrash, FaPlus, FaCar } from 'react-icons/fa';

export default function BaoTriPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isViewOnly, setIsViewOnly] = useState(false);
  const [selectedBaoTri, setSelectedBaoTri] = useState(null);
  const [refreshTable, setRefreshTable] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  const handleOpenModal = (creating, baoTri = null, viewOnly = false) => {
    setIsCreating(creating);
    setSelectedBaoTri(baoTri);
    setIsViewOnly(viewOnly);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setRefreshTable(prev => prev + 1);
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Quản lý Bảo Trì</h2>
          <p className="text-gray-600 dark:text-gray-400">Theo dõi và quản lý lịch bảo trì xe điện</p>
        </div>
        <button
          onClick={() => handleOpenModal(true)}
          className="mt-4 sm:mt-0 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-colors shadow-sm"
        >
          <span className="inline-flex items-center"><FaPlus className="mr-2" /> Thêm bảo trì</span>
        </button>
      </div>

      {/* Search */}
      <div className="stat-card p-4 rounded-xl shadow-sm mb-6">
        <input
          type="text"
          placeholder="Tìm theo ID xe..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        />
      </div>

      <BaoTriTable
        onOpenModal={handleOpenModal}
        refreshKey={refreshTable}
        searchQuery={searchQuery}
      />

      <BaoTriModal
        open={modalOpen}
        onClose={handleCloseModal}
        isCreating={isCreating}
        isViewOnly={isViewOnly}
        selectedBaoTri={selectedBaoTri}
      />
    </div>
  );
}

function BaoTriTable({ onOpenModal, refreshKey, searchQuery }) {
  const [baoTris, setBaoTris] = useState([]);
  const [filteredBaoTris, setFilteredBaoTris] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBaoTris();
  }, [refreshKey]);

  useEffect(() => {
    applyFilters();
  }, [baoTris, searchQuery]);

  const fetchBaoTris = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8080/api/bao-tri');
      if (!response.ok) throw new Error('Failed to fetch maintenance records');
      const data = await response.json();
      setBaoTris(data);
    } catch (error) {
      console.error('Error fetching maintenance:', error);
      alert('Lỗi khi tải dữ liệu bảo trì');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filteredData = baoTris;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filteredData = filteredData.filter(baoTri =>
        (baoTri.xeId?.toLowerCase() || '').includes(query)
      );
    }
    setFilteredBaoTris(filteredData);
  };

  const handleDelete = async (id) => {
    if (!confirm('Bạn có chắc chắn muốn xóa bản ghi bảo trì này?')) return;
    try {
      const response = await fetch(`http://localhost:8080/api/bao-tri/${id}`, { method: 'DELETE' });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Không thể xóa');
      }
      fetchBaoTris();
    } catch (error) {
      console.error('Error deleting maintenance:', error);
      alert(`Lỗi: ${error.message}`);
    }
  };

  if (loading) return <p className="text-center py-4">Đang tải dữ liệu...</p>;

  return (
    <div className="stat-card rounded-xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              {['Xe ID', 'Trạng thái', 'Lịch hẹn', 'Bắt đầu', 'Kết thúc', 'Nội dung', 'Thao tác'].map((h) => (
                <th key={h} className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
            {filteredBaoTris.map((bt) => (
              <tr key={bt.id} className="hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                  {bt.xeId || 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-3 py-1 inline-flex text-xs rounded-full ${
                    bt.trangThai === 'HOAN_THANH' ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' :
                    bt.trangThai === 'DANG_XU_LY' ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200' :
                    'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200'
                  }`}>
                    {bt.trangThai || 'N/A'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                  {bt.lichHen ? new Date(bt.lichHen).toLocaleString('vi-VN') : '—'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                  {bt.batDauLuc ? new Date(bt.batDauLuc).toLocaleString('vi-VN') : '—'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                  {bt.ketThucLuc ? new Date(bt.ketThucLuc).toLocaleString('vi-VN') : '—'}
                </td>
                <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300 max-w-xs truncate">
                  {bt.noiDung || '—'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button onClick={() => onOpenModal(false, bt, true)} className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900" aria-label="Xem"><FaEye /></button>
                    <button onClick={() => onOpenModal(false, bt, false)} className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 p-2 rounded-lg hover:bg-green-50 dark:hover:bg-green-900" aria-label="Sửa"><FaEdit /></button>
                    <button onClick={() => handleDelete(bt.id)} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900" aria-label="Xóa"><FaTrash /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredBaoTris.length === 0 && !loading && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">Không có dữ liệu bảo trì</div>
      )}
    </div>
  );
}

function BaoTriModal({ open, onClose, isCreating, isViewOnly, selectedBaoTri }) {
  const [formData, setFormData] = useState({
    xeId: '',
    trangThai: '',
    lichHen: '',
    batDauLuc: '',
    ketThucLuc: '',
    noiDung: '',
  });

  useEffect(() => {
    if (!isCreating && selectedBaoTri) {
      // Chuyển ZonedDateTime sang định dạng ISO string cho input datetime-local
      const toLocalISOString = (dateStr) => {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        const offset = d.getTimezoneOffset();
        d.setMinutes(d.getMinutes() - offset);  // Adjust to local time without changing value
        return d.toISOString().slice(0, 16); // "YYYY-MM-DDTHH:mm" in local time
      };

      setFormData({
        xeId: selectedBaoTri.xeId || '',
        trangThai: selectedBaoTri.trangThai || '',
        lichHen: toLocalISOString(selectedBaoTri.lichHen),
        batDauLuc: toLocalISOString(selectedBaoTri.batDauLuc),
        ketThucLuc: toLocalISOString(selectedBaoTri.ketThucLuc),
        noiDung: selectedBaoTri.noiDung || '',
      });
    } else {
      setFormData({
        xeId: '',
        trangThai: '',
        lichHen: '',
        batDauLuc: '',
        ketThucLuc: '',
        noiDung: '',
      });
    }
  }, [isCreating, selectedBaoTri, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate xeId là UUID hợp lệ
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(formData.xeId)) {
      alert('Xe ID phải là UUID hợp lệ!');
      return;
    }

    // Tự động set batDauLuc nếu trangThai là DANG_XU_LY và chưa set
    let adjustedFormData = { ...formData };
    const now = new Date().toISOString().slice(0, 16); // Current local time in YYYY-MM-DDTHH:mm
    if (adjustedFormData.trangThai === 'DANG_XU_LY' && !adjustedFormData.batDauLuc) {
      adjustedFormData.batDauLuc = now;
    }
    if (adjustedFormData.trangThai === 'HOAN_THANH' && !adjustedFormData.ketThucLuc) {
      adjustedFormData.ketThucLuc = now;
    }
    if (adjustedFormData.trangThai === 'HOAN_THANH' && adjustedFormData.batDauLuc && !adjustedFormData.ketThucLuc) {
      adjustedFormData.ketThucLuc = now;
    }

    const params = new URLSearchParams();
    Object.entries(adjustedFormData).forEach(([key, value]) => {
      if (value !== '' && value !== null && value !== undefined) {
        // Chuyển datetime-local sang ISO string với múi giờ local (giả định UTC+7)
        if (['lichHen', 'batDauLuc', 'ketThucLuc'].includes(key) && value) {
          const localDate = new Date(value);
          const offset = 7 * 60; // UTC+7 in minutes
          const zonedDate = new Date(localDate.getTime() + offset * 60 * 1000);
          params.append(key, zonedDate.toISOString());
        } else {
          params.append(key, value);
        }
      }
    });

    try {
      let response;
      if (isCreating) {
        response = await fetch(`http://localhost:8080/api/bao-tri?${params.toString()}`, {
          method: 'POST',
        });
      } else {
        response = await fetch(`http://localhost:8080/api/bao-tri/${selectedBaoTri.id}?${params.toString()}`, {
          method: 'PUT',
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Lỗi khi lưu bảo trì');
      }

      onClose();
    } catch (error) {
      console.error('Error saving maintenance:', error);
      alert(`Lỗi: ${error.message}`);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={(e) => e.currentTarget === e.target && onClose()}>
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            {isCreating ? 'Thêm bảo trì mới' : isViewOnly ? 'Chi tiết bảo trì' : 'Chỉnh sửa bảo trì'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" aria-label="Đóng">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">ID Xe (UUID)</label>
              <input
                name="xeId"
                value={formData.xeId}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
                disabled={isViewOnly}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Trạng thái</label>
              <select
                name="trangThai"
                value={formData.trangThai}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                disabled={isViewOnly}
              >
                <option value="">Chọn trạng thái</option>
                <option value="CHO_XU_LY">Chờ xử lý</option>
                <option value="DANG_XU_LY">Đang xử lý</option>
                <option value="HOAN_THANH">Hoàn thành</option>
                <option value="HUY">Hủy</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Lịch hẹn (UTC+7)</label>
              <input
                name="lichHen"
                type="datetime-local"
                value={formData.lichHen}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                disabled={isViewOnly}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Bắt đầu lúc</label>
              <input
                name="batDauLuc"
                type="datetime-local"
                value={formData.batDauLuc}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                disabled={isViewOnly}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Kết thúc lúc</label>
              <input
                name="ketThucLuc"
                type="datetime-local"
                value={formData.ketThucLuc}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                disabled={isViewOnly}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nội dung</label>
              <textarea
                name="noiDung"
                value={formData.noiDung}
                onChange={handleChange}
                rows="3"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                disabled={isViewOnly}
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 font-medium"
            >
              {isViewOnly ? 'Đóng' : 'Hủy'}
            </button>
            {!isViewOnly && (
              <button
                type="submit"
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium"
              >
                Lưu
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
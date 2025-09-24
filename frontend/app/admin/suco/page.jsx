'use client';

import { useState, useEffect } from 'react';
import { FaExclamationTriangle, FaEdit, FaEye, FaTrash, FaPlus } from 'react-icons/fa';

export default function SuCoPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isViewOnly, setIsViewOnly] = useState(false);
  const [selectedSuCo, setSelectedSuCo] = useState(null);
  const [refreshTable, setRefreshTable] = useState(0);

  // Thêm state cho các bộ lọc
  const [searchQuery, setSearchQuery] = useState('');
  const [mucDoFilter, setMucDoFilter] = useState('all');
  const [trangThaiFilter, setTrangThaiFilter] = useState('all'); // Đổi từ daXuLyFilter thành trangThaiFilter

  const handleOpenModal = (creating, suCo = null, viewOnly = false) => {
    setIsCreating(creating);
    setSelectedSuCo(suCo);
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
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Quản lý Sự Cố</h2>
          <p className="text-gray-600 dark:text-gray-400">Quản lý thông tin các sự cố của xe</p>
        </div>
        <button
          onClick={() => handleOpenModal(true)}
          className="mt-4 sm:mt-0 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-colors shadow-sm"
        >
          <span className="inline-flex items-center"><FaPlus className="mr-2" /> Thêm sự cố mới</span>
        </button>
      </div>

      {/* Search & filters */}
      <div className="stat-card p-4 rounded-xl shadow-sm mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            placeholder="Tìm kiếm theo ID xe, mô tả..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
          <select
            value={mucDoFilter}
            onChange={(e) => setMucDoFilter(e.target.value)}
            className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="all">Tất cả mức độ</option>
            <option value="LOW">LOW</option>
            <option value="MEDIUM">MEDIUM</option>
            <option value="HIGH">HIGH</option>
          </select>
          <select
            value={trangThaiFilter}
            onChange={(e) => setTrangThaiFilter(e.target.value)}
            className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="DAXULY">Đã xử lý</option>
            <option value="CHUAXULY">Chưa xử lý</option>
          </select>
        </div>
      </div>

      <SuCoTable
        onOpenModal={handleOpenModal}
        refreshKey={refreshTable}
        searchQuery={searchQuery}
        mucDoFilter={mucDoFilter}
        trangThaiFilter={trangThaiFilter}
      />

      <SuCoModal open={modalOpen} onClose={handleCloseModal} isCreating={isCreating} isViewOnly={isViewOnly} selectedSuCo={selectedSuCo} />
    </div>
  );
}

function SuCoTable({ onOpenModal, refreshKey, searchQuery, mucDoFilter, trangThaiFilter }) {
  const [suCos, setSuCos] = useState([]);
  const [filteredSuCos, setFilteredSuCos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSuCos();
  }, [refreshKey]);

  useEffect(() => {
    applyFilters();
  }, [suCos, searchQuery, mucDoFilter, trangThaiFilter]);

  const fetchSuCos = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8080/api/su-co');
      if (!response.ok) throw new Error('Failed to fetch su co');
      const data = await response.json();
      setSuCos(data);
    } catch (error) {
      console.error('Error fetching su co:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filteredData = suCos;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filteredData = filteredData.filter(suCo =>
        (suCo.xeId?.toString() || '').includes(query) ||
        (suCo.moTa?.toLowerCase() || '').includes(query)
      );
    }

    if (mucDoFilter !== 'all') {
      filteredData = filteredData.filter(suCo => suCo.mucDo === mucDoFilter);
    }

    if (trangThaiFilter !== 'all') {
      filteredData = filteredData.filter(suCo => suCo.trangThai === trangThaiFilter);
    }

    setFilteredSuCos(filteredData);
  };

  const handleDelete = async (id) => {
    if (!confirm('Bạn có chắc chắn muốn xóa sự cố này?')) return;
    try {
      const response = await fetch(`http://localhost:8080/api/su-co/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete su co');
      fetchSuCos();
    } catch (error) {
      console.error('Error deleting su co:', error);
      alert('Lỗi khi xóa sự cố');
    }
  };

  if (loading) return <p className="text-center py-4">Đang tải dữ liệu...</p>;

  return (
    <div className="stat-card rounded-xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              {['ID Sự Cố', 'Xe', 'Mức Độ', 'Mô Tả', 'Trạng Thái', 'Thao Tác'].map((h) => (
                <th key={h} className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
            {filteredSuCos.map((suCo) => (
              <tr key={suCo.id} className="table-row hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{suCo.id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{suCo.xeId}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${suCo.mucDo === 'HIGH' ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200' : suCo.mucDo === 'MEDIUM' ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200' : 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'}`}>
                    {suCo.mucDo || 'N/A'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{suCo.moTa || 'N/A'}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${suCo.trangThai === 'DAXULY' ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'}`}>
                    {suCo.trangThai === 'DAXULY' ? 'Đã xử lý' : 'Chưa xử lý'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button onClick={() => onOpenModal(false, suCo, true)} className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900 transition-colors" aria-label="Xem"><FaEye /></button>
                    <button onClick={() => onOpenModal(false, suCo, false)} className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 p-2 rounded-lg hover:bg-green-50 dark:hover:bg-green-900 transition-colors" aria-label="Sửa"><FaEdit /></button>
                    <button onClick={() => handleDelete(suCo.id)} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900 transition-colors" aria-label="Xóa"><FaTrash /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SuCoModal({ open, onClose, isCreating, isViewOnly, selectedSuCo }) {
  const [formData, setFormData] = useState({
    xeId: '',
    nguoiBaoCaoId: '',
    mucDo: '',
    moTa: '',
    trangThai: 'CHUAXULY', // Mặc định là CHUAXULY
  });

  useEffect(() => {
    if (!isCreating && selectedSuCo) {
      setFormData({
        xeId: selectedSuCo.xeId || '',
        nguoiBaoCaoId: selectedSuCo.nguoiBaoCaoId || '',
        mucDo: selectedSuCo.mucDo || '',
        moTa: selectedSuCo.moTa || '',
        trangThai: selectedSuCo.trangThai || 'CHUAXULY',
      });
    } else {
      setFormData({
        xeId: '',
        nguoiBaoCaoId: '',
        mucDo: '',
        moTa: '',
        trangThai: 'CHUAXULY',
      });
    }
  }, [isCreating, selectedSuCo, open]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === 'trangThai') {
      setFormData((prev) => ({
        ...prev,
        trangThai: checked ? 'DAXULY' : 'CHUAXULY',
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    Object.entries(formData).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        params.append(key, value);
      }
    });

    try {
      let response;
      if (isCreating) {
        response = await fetch(`http://localhost:8080/api/su-co?${params.toString()}`, { method: 'POST' });
      } else {
        params.append('daXuLy', formData.trangThai === 'DAXULY'); // Gửi daXuLy dựa trên trangThai
        response = await fetch(`http://localhost:8080/api/su-co/${selectedSuCo.id}?${params.toString()}`, { method: 'PUT' });
      }
      if (!response.ok) throw new Error('Failed to save su co');
      onClose();
    } catch (error) {
      console.error('Error saving su co:', error);
      alert('Lỗi khi lưu sự cố');
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={(e) => e.currentTarget === e.target && onClose()}>
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">{isCreating ? 'Thêm sự cố mới' : (isViewOnly ? 'Thông tin chi tiết sự cố' : 'Chỉnh sửa sự cố')}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" aria-label="Đóng">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">ID Xe</label>
              <input name="xeId" value={formData.xeId} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white" required disabled={isViewOnly} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">ID Người Báo Cáo</label>
              <input name="nguoiBaoCaoId" value={formData.nguoiBaoCaoId} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white" disabled={isViewOnly} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Mức Độ</label>
              <select name="mucDo" value={formData.mucDo} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white" required disabled={isViewOnly}>
                <option value="">Chọn mức độ</option>
                <option value="LOW">LOW</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HIGH">HIGH</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Trạng Thái</label>
              <input
                name="trangThai"
                type="checkbox"
                checked={formData.trangThai === 'DAXULY'}
                onChange={handleChange}
                className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                disabled={isViewOnly}
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">{formData.trangThai === 'DAXULY' ? 'Đã xử lý' : 'Chưa xử lý'}</span>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Mô Tả</label>
              <textarea name="moTa" value={formData.moTa} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white" required disabled={isViewOnly} />
            </div>
          </div>
          <div className="mt-6 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 font-medium transition-colors">
              {isViewOnly ? 'Đóng' : 'Hủy'}
            </button>
            {!isViewOnly && (
              <button type="submit" className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors">
                Lưu thay đổi
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
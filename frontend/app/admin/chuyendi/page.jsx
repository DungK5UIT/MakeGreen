'use client';

import { useState, useEffect } from 'react';
import { FaRoad, FaEdit, FaEye, FaTrash, FaPlus } from 'react-icons/fa';

export default function ChuyenDiPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isViewOnly, setIsViewOnly] = useState(false);
  const [selectedChuyenDi, setSelectedChuyenDi] = useState(null);
  const [refreshTable, setRefreshTable] = useState(0);

  // Thêm state cho các bộ lọc
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const handleOpenModal = (creating, chuyenDi = null, viewOnly = false) => {
    setIsCreating(creating);
    setSelectedChuyenDi(chuyenDi);
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
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Quản lý Chuyến Đi</h2>
          <p className="text-gray-600 dark:text-gray-400">Quản lý thông tin các chuyến đi</p>
        </div>
        <button
          onClick={() => handleOpenModal(true)}
          className="mt-4 sm:mt-0 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-colors shadow-sm"
        >
          <span className="inline-flex items-center"><FaPlus className="mr-2" /> Thêm chuyến đi mới</span>
        </button>
      </div>

      {/* Search & filters */}
      <div className="stat-card p-4 rounded-xl shadow-sm mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            placeholder="Tìm kiếm theo ID đơn thuê, ID người dùng, ID xe..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="ONGOING">ONGOING</option>
            <option value="COMPLETED">COMPLETED</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>
        </div>
      </div>

      <ChuyenDiTable
        onOpenModal={handleOpenModal}
        refreshKey={refreshTable}
        searchQuery={searchQuery}
        statusFilter={statusFilter}
      />

      <ChuyenDiModal open={modalOpen} onClose={handleCloseModal} isCreating={isCreating} isViewOnly={isViewOnly} selectedChuyenDi={selectedChuyenDi} />
    </div>
  );
}

function ChuyenDiTable({ onOpenModal, refreshKey, searchQuery, statusFilter }) {
  const [chuyenDis, setChuyenDis] = useState([]);
  const [filteredChuyenDis, setFilteredChuyenDis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchChuyenDis();
  }, [refreshKey]);

  useEffect(() => {
    applyFilters();
  }, [chuyenDis, searchQuery, statusFilter]);

  const fetchChuyenDis = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8080/api/chuyen-di');
      if (!response.ok) throw new Error('Failed to fetch chuyen di');
      const data = await response.json();
      setChuyenDis(data);
    } catch (error) {
      console.error('Error fetching chuyen di:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filteredData = chuyenDis;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filteredData = filteredData.filter(chuyenDi =>
        (chuyenDi.donThueId?.toString() || '').includes(query) ||
        (chuyenDi.nguoiDungId?.toString() || '').includes(query) ||
        (chuyenDi.xeId?.toString() || '').includes(query)
      );
    }

    if (statusFilter !== 'all') {
      filteredData = filteredData.filter(chuyenDi => chuyenDi.trangThai === statusFilter);
    }

    setFilteredChuyenDis(filteredData);
    setCurrentPage(1); // Reset về trang đầu khi thay đổi bộ lọc
  };

  const handleDelete = async (id) => {
    if (!confirm('Bạn có chắc chắn muốn xóa chuyến đi này?')) return;
    try {
      const response = await fetch(`http://localhost:8080/api/chuyen-di/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete chuyen di');
      fetchChuyenDis();
    } catch (error) {
      console.error('Error deleting chuyen di:', error);
      alert('Lỗi khi xóa chuyến đi');
    }
  };

  const handleComplete = async (id, path) => {
    try {
      const response = await fetch(`http://localhost:8080/api/chuyen-di/${id}/complete`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(path),
      });
      if (!response.ok) throw new Error('Failed to complete chuyen di');
      fetchChuyenDis();
    } catch (error) {
      console.error('Error completing chuyen di:', error);
      alert('Lỗi khi hoàn thành chuyến đi');
    }
  };

  // Tính toán dữ liệu phân trang
  const totalPages = Math.ceil(filteredChuyenDis.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = filteredChuyenDis.slice(startIndex, startIndex + itemsPerPage);

  // Tạo danh sách các số trang
  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  if (loading) return <p className="text-center py-4">Đang tải dữ liệu...</p>;

  return (
    <div className="stat-card rounded-xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              {['ID Chuyến Đi', 'Đơn Thuê', 'Người Dùng', 'Xe', 'Trạng Thái', 'Tổng Chi Phí', 'Thao Tác'].map((h) => (
                <th key={h} className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
            {currentItems.map((chuyenDi) => (
              <tr key={chuyenDi.id} className="table-row hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{chuyenDi.id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{chuyenDi.donThueId}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{chuyenDi.nguoiDungId}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{chuyenDi.xeId}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${chuyenDi.trangThai === 'COMPLETED' ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' : chuyenDi.trangThai === 'ONGOING' ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200' : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'}`}>
                    {chuyenDi.trangThai || 'N/A'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{chuyenDi.tongChiPhi ? `${chuyenDi.tongChiPhi.toLocaleString()}đ` : 'N/A'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button onClick={() => onOpenModal(false, chuyenDi, true)} className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900 transition-colors" aria-label="Xem"><FaEye /></button>
                    <button onClick={() => onOpenModal(false, chuyenDi, false)} className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 p-2 rounded-lg hover:bg-green-50 dark:hover:bg-green-900 transition-colors" aria-label="Sửa"><FaEdit /></button>
                    <button onClick={() => handleDelete(chuyenDi.id)} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900 transition-colors" aria-label="Xóa"><FaTrash /></button>
                    {chuyenDi.trangThai !== 'COMPLETED' && (
                      <button onClick={() => handleComplete(chuyenDi.id, chuyenDi.path || '')} className="text-purple-600 hover:text-purple-900 dark:text-purple-400 dark:hover:text-purple-300 p-2 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900 transition-colors" aria-label="Hoàn thành">✅</button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Phân trang động */}
      <div className="bg-white dark:bg-gray-800 px-6 py-4 flex items-center justify-between border-t border-gray-200 dark:border-gray-600">
        <div className="hidden sm:block text-sm text-gray-700 dark:text-gray-300">
          Hiển thị {startIndex + 1} - {Math.min(startIndex + itemsPerPage, filteredChuyenDis.length)} của {filteredChuyenDis.length} chuyến đi
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-500 dark:text-gray-400 disabled:opacity-50"
          >
            ←
          </button>
          {pageNumbers.map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 ${page === currentPage ? 'bg-gray-100 dark:bg-gray-700' : 'bg-white dark:bg-gray-800'} text-sm font-medium text-gray-700 dark:text-gray-300`}
            >
              {page}
            </button>
          ))}
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-500 dark:text-gray-400 disabled:opacity-50"
          >
            →
          </button>
        </div>
      </div>
    </div>
  );
}

function ChuyenDiModal({ open, onClose, isCreating, isViewOnly, selectedChuyenDi }) {
  const [formData, setFormData] = useState({
    donThueId: '',
    nguoiDungId: '',
    xeId: '',
    trangThai: '',
    batDauLuc: '',
    ketThucLuc: '',
    tongChiPhi: '',
    path: '',
  });

  useEffect(() => {
    if (!isCreating && selectedChuyenDi) {
      setFormData({
        donThueId: selectedChuyenDi.donThueId || '',
        nguoiDungId: selectedChuyenDi.nguoiDungId || '',
        xeId: selectedChuyenDi.xeId || '',
        trangThai: selectedChuyenDi.trangThai || '',
        batDauLuc: selectedChuyenDi.batDauLuc ? new Date(selectedChuyenDi.batDauLuc).toISOString().slice(0, 16) : '',
        ketThucLuc: selectedChuyenDi.ketThucLuc ? new Date(selectedChuyenDi.ketThucLuc).toISOString().slice(0, 16) : '',
        tongChiPhi: selectedChuyenDi.tongChiPhi || '',
        path: selectedChuyenDi.path || '',
      });
    } else {
      setFormData({
        donThueId: '',
        nguoiDungId: '',
        xeId: '',
        trangThai: '',
        batDauLuc: '',
        ketThucLuc: '',
        tongChiPhi: '',
        path: '',
      });
    }
  }, [isCreating, selectedChuyenDi, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
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
        response = await fetch(`http://localhost:8080/api/chuyen-di?${params.toString()}`, { method: 'POST' });
      } else {
        response = await fetch(`http://localhost:8080/api/chuyen-di/${selectedChuyenDi.id}?${params.toString()}`, { method: 'PUT' });
      }
      if (!response.ok) throw new Error('Failed to save chuyen di');
      onClose();
    } catch (error) {
      console.error('Error saving chuyen di:', error);
      alert('Lỗi khi lưu chuyến đi');
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={(e) => e.currentTarget === e.target && onClose()}>
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">{isCreating ? 'Thêm chuyến đi mới' : (isViewOnly ? 'Thông tin chi tiết chuyến đi' : 'Chỉnh sửa chuyến đi')}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" aria-label="Đóng">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">ID Đơn Thuê</label>
              <input name="donThueId" value={formData.donThueId} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white" required disabled={isViewOnly} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">ID Người Dùng</label>
              <input name="nguoiDungId" value={formData.nguoiDungId} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white" required disabled={isViewOnly} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">ID Xe</label>
              <input name="xeId" value={formData.xeId} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white" required disabled={isViewOnly} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Trạng Thái</label>
              <select name="trangThai" value={formData.trangThai} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white" disabled={isViewOnly}>
                <option value="">Chọn trạng thái</option>
                <option value="ONGOING">ONGOING</option>
                <option value="COMPLETED">COMPLETED</option>
                <option value="CANCELLED">CANCELLED</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Bắt Đầu Lúc</label>
              <input name="batDauLuc" type="datetime-local" value={formData.batDauLuc} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white" disabled={isViewOnly} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Kết Thúc Lúc</label>
              <input name="ketThucLuc" type="datetime-local" value={formData.ketThucLuc} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white" disabled={isViewOnly} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tổng Chi Phí (đ)</label>
              <input name="tongChiPhi" type="number" value={formData.tongChiPhi} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white" disabled={isViewOnly} />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Đường dẫn</label>
              <textarea name="path" value={formData.path} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white" disabled={isViewOnly} />
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
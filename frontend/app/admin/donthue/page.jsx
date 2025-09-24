'use client';

import { useState, useEffect } from 'react';
import { FaFileAlt, FaEdit, FaEye, FaTrash, FaPlus } from 'react-icons/fa';

export default function DonThuePage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isViewOnly, setIsViewOnly] = useState(false);
  const [selectedDonThue, setSelectedDonThue] = useState(null);
  const [refreshTable, setRefreshTable] = useState(0);

  // Thêm state cho các bộ lọc
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const handleOpenModal = (creating, donThue = null, viewOnly = false) => {
    setIsCreating(creating);
    setSelectedDonThue(donThue);
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
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Quản lý Đơn Thuê</h2>
          <p className="text-gray-600 dark:text-gray-400">Quản lý thông tin các đơn thuê xe</p>
        </div>
        <button
          onClick={() => handleOpenModal(true)}
          className="mt-4 sm:mt-0 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-colors shadow-sm"
        >
          <span className="inline-flex items-center"><FaPlus className="mr-2" /> Thêm đơn thuê mới</span>
        </button>
      </div>

      {/* Search & filters */}
      <div className="stat-card p-4 rounded-xl shadow-sm mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            placeholder="Tìm kiếm theo ID người dùng, ID xe..."
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
            <option value="PENDING">PENDING</option>
            <option value="CONFIRMED">CONFIRMED</option>
            <option value="CANCELLED">CANCELLED</option>
            <option value="COMPLETED">COMPLETED</option>
          </select>
        </div>
      </div>

      <DonThueTable
        onOpenModal={handleOpenModal}
        refreshKey={refreshTable}
        searchQuery={searchQuery}
        statusFilter={statusFilter}
      />

      <DonThueModal open={modalOpen} onClose={handleCloseModal} isCreating={isCreating} isViewOnly={isViewOnly} selectedDonThue={selectedDonThue} />
    </div>
  );
}

function DonThueTable({ onOpenModal, refreshKey, searchQuery, statusFilter }) {
  const [donThues, setDonThues] = useState([]);
  const [filteredDonThues, setFilteredDonThues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchDonThues();
  }, [refreshKey]);

  useEffect(() => {
    applyFilters();
  }, [donThues, searchQuery, statusFilter]);

  const fetchDonThues = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8080/api/donthue');
      if (!response.ok) throw new Error('Failed to fetch don thue');
      const data = await response.json();
      setDonThues(data);
    } catch (error) {
      console.error('Error fetching don thue:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filteredData = donThues;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filteredData = filteredData.filter(donThue =>
        (donThue.nguoiDungId?.toString() || '').includes(query) ||
        (donThue.xeId?.toString() || '').includes(query)
      );
    }

    if (statusFilter !== 'all') {
      filteredData = filteredData.filter(donThue => donThue.trangThai === statusFilter);
    }

    setFilteredDonThues(filteredData);
    setCurrentPage(1); // Reset về trang đầu khi thay đổi bộ lọc
  };

  const handleDelete = async (id) => {
    if (!confirm('Bạn có chắc chắn muốn xóa đơn thuê này?')) return;
    try {
      const response = await fetch(`http://localhost:8080/api/donthue/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete don thue');
      fetchDonThues();
    } catch (error) {
      console.error('Error deleting don thue:', error);
      alert('Lỗi khi xóa đơn thuê');
    }
  };

  // Tính toán dữ liệu phân trang
  const totalPages = Math.ceil(filteredDonThues.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = filteredDonThues.slice(startIndex, startIndex + itemsPerPage);

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
              {['ID Đơn Thuê', 'Người Dùng', 'Xe', 'Trạng Thái', 'Chi Phí Ước Tính', 'Thao Tác'].map((h) => (
                <th key={h} className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
            {currentItems.map((donThue) => (
              <tr key={donThue.id} className="table-row hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{donThue.id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{donThue.nguoiDungId}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{donThue.xeId}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${donThue.trangThai === 'CONFIRMED' ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' : donThue.trangThai === 'PENDING' ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200' : donThue.trangThai === 'CANCELLED' ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200' : 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'}`}>
                    {donThue.trangThai || 'N/A'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{donThue.chiPhiUocTinh ? `${donThue.chiPhiUocTinh.toLocaleString()}đ` : 'N/A'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button onClick={() => onOpenModal(false, donThue, true)} className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900 transition-colors" aria-label="Xem"><FaEye /></button>
                    <button onClick={() => onOpenModal(false, donThue, false)} className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 p-2 rounded-lg hover:bg-green-50 dark:hover:bg-green-900 transition-colors" aria-label="Sửa"><FaEdit /></button>
                    <button onClick={() => handleDelete(donThue.id)} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900 transition-colors" aria-label="Xóa"><FaTrash /></button>
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
          Hiển thị {startIndex + 1} - {Math.min(startIndex + itemsPerPage, filteredDonThues.length)} của {filteredDonThues.length} đơn thuê
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

function DonThueModal({ open, onClose, isCreating, isViewOnly, selectedDonThue }) {
  const [formData, setFormData] = useState({
    nguoiDungId: '',
    xeId: '',
    batDauLuc: '',
    ketThucLuc: '',
    trangThai: '',
    soTienCoc: '',
    chiPhiUocTinh: '',
    tramThueId: '',
    tramTraId: '',
  });

  useEffect(() => {
    if (!isCreating && selectedDonThue) {
      setFormData({
        nguoiDungId: selectedDonThue.nguoiDungId || '',
        xeId: selectedDonThue.xeId || '',
        batDauLuc: selectedDonThue.batDauLuc ? new Date(selectedDonThue.batDauLuc).toISOString().slice(0, 16) : '',
        ketThucLuc: selectedDonThue.ketThucLuc ? new Date(selectedDonThue.ketThucLuc).toISOString().slice(0, 16) : '',
        trangThai: selectedDonThue.trangThai || '',
        soTienCoc: selectedDonThue.soTienCoc || '',
        chiPhiUocTinh: selectedDonThue.chiPhiUocTinh || '',
        tramThueId: selectedDonThue.tramThueId || '',
        tramTraId: selectedDonThue.tramTraId || '',
      });
    } else {
      setFormData({
        nguoiDungId: '',
        xeId: '',
        batDauLuc: '',
        ketThucLuc: '',
        trangThai: '',
        soTienCoc: '',
        chiPhiUocTinh: '',
        tramThueId: '',
        tramTraId: '',
      });
    }
  }, [isCreating, selectedDonThue, open]);

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
        response = await fetch(`http://localhost:8080/api/donthue?${params.toString()}`, { method: 'POST' });
      } else {
        response = await fetch(`http://localhost:8080/api/donthue/${selectedDonThue.id}?${params.toString()}`, { method: 'PUT' });
      }
      if (!response.ok) throw new Error('Failed to save don thue');
      onClose();
    } catch (error) {
      console.error('Error saving don thue:', error);
      alert('Lỗi khi lưu đơn thuê');
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={(e) => e.currentTarget === e.target && onClose()}>
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">{isCreating ? 'Thêm đơn thuê mới' : (isViewOnly ? 'Thông tin chi tiết đơn thuê' : 'Chỉnh sửa đơn thuê')}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" aria-label="Đóng">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">ID Người Dùng</label>
              <input name="nguoiDungId" value={formData.nguoiDungId} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white" required disabled={isViewOnly} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">ID Xe</label>
              <input name="xeId" value={formData.xeId} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white" required disabled={isViewOnly} />
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
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Trạng Thái</label>
              <select name="trangThai" value={formData.trangThai} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white" disabled={isViewOnly}>
                <option value="">Chọn trạng thái</option>
                <option value="PENDING">PENDING</option>
                <option value="CONFIRMED">CONFIRMED</option>
                <option value="CANCELLED">CANCELLED</option>
                <option value="COMPLETED">COMPLETED</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Số Tiền Cọc (đ)</label>
              <input name="soTienCoc" type="number" value={formData.soTienCoc} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white" disabled={isViewOnly} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Chi Phí Ước Tính (đ)</label>
              <input name="chiPhiUocTinh" type="number" value={formData.chiPhiUocTinh} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white" disabled={isViewOnly} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">ID Trạm Thuê</label>
              <input name="tramThueId" value={formData.tramThueId} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white" required disabled={isViewOnly} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">ID Trạm Trả</label>
              <input name="tramTraId" value={formData.tramTraId} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white" required disabled={isViewOnly} />
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
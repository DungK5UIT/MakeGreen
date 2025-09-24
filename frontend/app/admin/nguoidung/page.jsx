'use client';

import { useState, useEffect } from 'react';
import { FaUser, FaEdit, FaEye, FaTrash, FaPlus } from 'react-icons/fa';

export default function NguoiDungPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isViewOnly, setIsViewOnly] = useState(false);
  const [selectedNguoiDung, setSelectedNguoiDung] = useState(null);
  const [refreshTable, setRefreshTable] = useState(0);

  // Thêm state cho các bộ lọc
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');

  const handleOpenModal = (creating, nguoiDung = null, viewOnly = false) => {
    setIsCreating(creating);
    setSelectedNguoiDung(nguoiDung);
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
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Quản lý Người Dùng</h2>
          <p className="text-gray-600 dark:text-gray-400">Quản lý thông tin và vai trò của người dùng</p>
        </div>
        <button
          onClick={() => handleOpenModal(true)}
          className="mt-4 sm:mt-0 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-colors shadow-sm"
        >
          <span className="inline-flex items-center"><FaPlus className="mr-2" /> Thêm người dùng mới</span>
        </button>
      </div>

      {/* Search & filters */}
      <div className="stat-card p-4 rounded-xl shadow-sm mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            placeholder="Tìm kiếm theo email, số điện thoại, họ tên..."
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
            <option value="true">Kích hoạt</option>
            <option value="false">Chưa kích hoạt</option>
          </select>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="all">Tất cả vai trò</option>
            <option value="USER">USER</option>
            <option value="ADMIN">ADMIN</option>
          </select>
        </div>
      </div>

      <NguoiDungTable
        onOpenModal={handleOpenModal}
        refreshKey={refreshTable}
        searchQuery={searchQuery}
        statusFilter={statusFilter}
        roleFilter={roleFilter}
      />

      <NguoiDungModal open={modalOpen} onClose={handleCloseModal} isCreating={isCreating} isViewOnly={isViewOnly} selectedNguoiDung={selectedNguoiDung} />
    </div>
  );
}

function NguoiDungTable({ onOpenModal, refreshKey, searchQuery, statusFilter, roleFilter }) {
  const [nguoiDungs, setNguoiDungs] = useState([]);
  const [filteredNguoiDungs, setFilteredNguoiDungs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchNguoiDungs();
  }, [refreshKey]);

  useEffect(() => {
    applyFilters();
  }, [nguoiDungs, searchQuery, statusFilter, roleFilter]);

  const fetchNguoiDungs = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8080/api/nguoidung');
      if (!response.ok) throw new Error('Failed to fetch users');
      const data = await response.json();
      setNguoiDungs(data);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filteredData = nguoiDungs;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filteredData = filteredData.filter(nguoiDung =>
        (nguoiDung.email?.toLowerCase() || '').includes(query) ||
        (nguoiDung.sdt?.toLowerCase() || '').includes(query) ||
        (nguoiDung.hoTen?.toLowerCase() || '').includes(query)
      );
    }

    if (statusFilter !== 'all') {
      filteredData = filteredData.filter(nguoiDung => nguoiDung.enabled.toString() === statusFilter);
    }

    if (roleFilter !== 'all') {
      filteredData = filteredData.filter(nguoiDung =>
        nguoiDung.vaiTros?.some(vaiTro => vaiTro.ten === roleFilter)
      );
    }

    setFilteredNguoiDungs(filteredData);
    setCurrentPage(1); // Reset về trang đầu khi thay đổi bộ lọc
  };

  const handleDelete = async (id) => {
    if (!confirm('Bạn có chắc chắn muốn xóa người dùng này?')) return;
    try {
      const response = await fetch(`http://localhost:8080/api/nguoidung/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete user');
      fetchNguoiDungs();
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Lỗi khi xóa người dùng');
    }
  };

  // Tính toán dữ liệu phân trang
  const totalPages = Math.ceil(filteredNguoiDungs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = filteredNguoiDungs.slice(startIndex, startIndex + itemsPerPage);

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
              {['Người dùng', 'Email', 'Số điện thoại', 'Trạng thái', 'Vai trò', 'Thao tác'].map((h) => (
                <th key={h} className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
            {currentItems.map((nguoiDung) => (
              <tr key={nguoiDung.id} className="table-row hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-xl grid place-items-center mr-4">
                      <FaUser className="text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-gray-900 dark:text-white">{nguoiDung.hoTen || 'N/A'}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{nguoiDung.email || 'N/A'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{nguoiDung.sdt || 'N/A'}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${nguoiDung.enabled ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'}`}>
                    {nguoiDung.enabled ? 'Kích hoạt' : 'Chưa kích hoạt'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                  {nguoiDung.vaiTros?.map(v => v.ten).join(', ') || 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button onClick={() => onOpenModal(false, nguoiDung, true)} className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900 transition-colors" aria-label="Xem"><FaEye /></button>
                    <button onClick={() => onOpenModal(false, nguoiDung, false)} className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 p-2 rounded-lg hover:bg-green-50 dark:hover:bg-green-900 transition-colors" aria-label="Sửa"><FaEdit /></button>
                    <button onClick={() => handleDelete(nguoiDung.id)} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900 transition-colors" aria-label="Xóa"><FaTrash /></button>
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
          Hiển thị {startIndex + 1} - {Math.min(startIndex + itemsPerPage, filteredNguoiDungs.length)} của {filteredNguoiDungs.length} người dùng
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

function NguoiDungModal({ open, onClose, isCreating, isViewOnly, selectedNguoiDung }) {
  const [formData, setFormData] = useState({
    email: '',
    sdt: '',
    hoTen: '',
    trangThai: '',
    enabled: false,
    vaiTros: '',
  });

  useEffect(() => {
    if (!isCreating && selectedNguoiDung) {
      setFormData({
        email: selectedNguoiDung.email || '',
        sdt: selectedNguoiDung.sdt || '',
        hoTen: selectedNguoiDung.hoTen || '',
        trangThai: selectedNguoiDung.trangThai || '',
        enabled: selectedNguoiDung.enabled ?? false,
        vaiTros: selectedNguoiDung.vaiTros?.map(v => v.ten).join(', ') || '',
      });
    } else {
      setFormData({
        email: '',
        sdt: '',
        hoTen: '',
        trangThai: '',
        enabled: false,
        vaiTros: '',
      });
    }
  }, [isCreating, selectedNguoiDung, open]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const dataToSend = {
      ...formData,
      vaiTros: formData.vaiTros ? formData.vaiTros.split(',').map(role => role.trim()) : null,
    };

    const params = new URLSearchParams();
    Object.entries(dataToSend).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        if (Array.isArray(value)) {
          value.forEach(v => params.append(key, v));
        } else {
          params.append(key, value);
        }
      }
    });

    try {
      let response;
      if (isCreating) {
        response = await fetch(`http://localhost:8080/api/nguoidung?${params.toString()}`, { method: 'POST' });
      } else {
        response = await fetch(`http://localhost:8080/api/nguoidung/${selectedNguoiDung.id}?${params.toString()}`, { method: 'PUT' });
      }
      if (!response.ok) throw new Error('Failed to save user');
      onClose();
    } catch (error) {
      console.error('Error saving user:', error);
      alert('Lỗi khi lưu người dùng');
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={(e) => e.currentTarget === e.target && onClose()}>
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">{isCreating ? 'Thêm người dùng mới' : (isViewOnly ? 'Thông tin chi tiết người dùng' : 'Chỉnh sửa người dùng')}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" aria-label="Đóng">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
              <input name="email" value={formData.email} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white" required disabled={isViewOnly} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Số điện thoại</label>
              <input name="sdt" value={formData.sdt} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white" required disabled={isViewOnly} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Họ tên</label>
              <input name="hoTen" value={formData.hoTen} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white" required disabled={isViewOnly} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Trạng thái</label>
              <input name="trangThai" value={formData.trangThai} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white" disabled={isViewOnly} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Kích hoạt</label>
              <input name="enabled" type="checkbox" checked={formData.enabled} onChange={handleChange} className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500" disabled={isViewOnly} />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Vai trò (phân cách bằng dấu phẩy)</label>
              <textarea name="vaiTros" value={formData.vaiTros} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white" disabled={isViewOnly} />
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
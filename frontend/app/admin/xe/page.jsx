'use client';

import { useState, useEffect } from 'react';
import { FaCar, FaEdit, FaEye, FaStar, FaStarHalfAlt, FaTrash, FaPlus } from 'react-icons/fa';

export default function XePage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isViewOnly, setIsViewOnly] = useState(false);
  const [selectedXe, setSelectedXe] = useState(null);
  const [refreshTable, setRefreshTable] = useState(0);

  // Thêm state cho các bộ lọc
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [brandFilter, setBrandFilter] = useState('all');

  const handleOpenModal = (creating, xe = null, viewOnly = false) => {
    setIsCreating(creating);
    setSelectedXe(xe);
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
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Quản lý Xe</h2>
          <p className="text-gray-600 dark:text-gray-400">Quản lý thông tin và trạng thái các xe điện</p>
        </div>
        <button
          onClick={() => handleOpenModal(true)}
          className="mt-4 sm:mt-0 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-colors shadow-sm"
        >
          <span className="inline-flex items-center"><FaPlus className="mr-2" /> Thêm xe mới</span>
        </button>
      </div>

      {/* Search & filters (đã sửa đổi) */}
      <div className="stat-card p-4 rounded-xl shadow-sm mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            placeholder="Tìm kiếm theo tên, model, biển số..."
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
            <option value="AVAILABLE">AVAILABLE</option>
            <option value="UNAVAILABLE">UNAVAILABLE</option>
            <option value="MAINTENANCE">MAINTENANCE</option>
          </select>
          <select
            value={brandFilter}
            onChange={(e) => setBrandFilter(e.target.value)}
            className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="all">Tất cả hãng</option>
            {/* Tùy chỉnh danh sách hãng dựa trên dữ liệu thực tế */}
            <option value="VinFast">VinFast</option>
            <option value="Pega">Pega</option>
            <option value="Yadea">Yadea</option>
            {/* Bạn có thể thêm các hãng khác ở đây */}
          </select>
        </div>
      </div>

      <VehicleTable
        onOpenModal={handleOpenModal}
        refreshKey={refreshTable}
        searchQuery={searchQuery}
        statusFilter={statusFilter}
        brandFilter={brandFilter}
      />

      <VehicleModal open={modalOpen} onClose={handleCloseModal} isCreating={isCreating} isViewOnly={isViewOnly} selectedXe={selectedXe} />
    </div>
  );
}

function VehicleTable({ onOpenModal, refreshKey, searchQuery, statusFilter, brandFilter }) {
  const [xes, setXes] = useState([]);
  const [filteredXes, setFilteredXes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchXes();
  }, [refreshKey]);

  useEffect(() => {
    applyFilters();
  }, [xes, searchQuery, statusFilter, brandFilter]);

  const fetchXes = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8080/api/xe');
      if (!response.ok) throw new Error('Failed to fetch vehicles');
      const data = await response.json();
      setXes(data);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filteredData = xes;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filteredData = filteredData.filter(xe =>
        (xe.name?.toLowerCase() || '').includes(query) ||
        (xe.model?.toLowerCase() || '').includes(query) ||
        (xe.bienSo?.toLowerCase() || '').includes(query) ||
        (xe.tinhTrang?.toLowerCase() || '').includes(query) // Thêm tìm kiếm theo tình trạng
      );
    }

    if (statusFilter !== 'all') {
      filteredData = filteredData.filter(xe => xe.trangThai === statusFilter);
    }

    if (brandFilter !== 'all') {
      filteredData = filteredData.filter(xe => xe.brand === brandFilter);
    }

    setFilteredXes(filteredData);
  };

  const handleDelete = async (id) => {
    if (!confirm('Bạn có chắc chắn muốn xóa xe này?')) return;
    try {
      const response = await fetch(`http://localhost:8080/api/xe/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete vehicle');
      alert('Xóa xe thành công!');
      fetchXes();
    } catch (error) {
      console.error('Error deleting vehicle:', error);
      alert('Lỗi khi xóa xe');
    }
  };

  if (loading) return <p className="text-center py-4">Đang tải dữ liệu...</p>;

  return (
    <div className="stat-card rounded-xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              {['Xe', 'Pin', 'Số km đã đi', 'Trạng thái', 'Tình trạng', 'Giá thuê', 'Đánh giá', 'Thao tác'].map((h) => ( // Thêm cột Tình trạng
                <th key={h} className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
            {filteredXes.map((xe) => (
              <tr key={xe.id} className="table-row hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-xl grid place-items-center mr-4">
                      <FaCar className="text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-gray-900 dark:text-white">{xe.bienSo || 'N/A'}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{xe.brand} {xe.model}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2 mr-3">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: `${xe.pinPhanTram || 0}%` }} />
                    </div>
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{xe.pinPhanTram || 0}%</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{xe.soKm || 0} km</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    xe.trangThai === 'AVAILABLE' ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' :
                    xe.trangThai === 'UNAVAILABLE' ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200' :
                    xe.trangThai === 'MAINTENANCE' ? 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200' :
                    'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200'
                  }`}>{xe.trangThai || 'N/A'}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{xe.tinhTrang || 'N/A'}</td> {/* Thêm hiển thị tình trạng */}
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{xe.price ? `${xe.price.toLocaleString()}đ/giờ` : 'N/A'}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex text-yellow-400">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <span key={i}>
                          {i < Math.floor(xe.rating || 0) ? <FaStar /> : (i < Math.ceil(xe.rating || 0) ? <FaStarHalfAlt /> : <FaStar className="text-gray-300" />)}
                        </span>
                      ))}
                    </div>
                    <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">{xe.rating || 'N/A'}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button onClick={() => onOpenModal(false, xe, true)} className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900 transition-colors" aria-label="Xem"><FaEye /></button>
                    <button onClick={() => onOpenModal(false, xe, false)} className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 p-2 rounded-lg hover:bg-green-50 dark:hover:bg-green-900 transition-colors" aria-label="Sửa"><FaEdit /></button>
                    <button onClick={() => handleDelete(xe.id)} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900 transition-colors" aria-label="Xóa"><FaTrash /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination (static demo) */}
      <div className="bg-white dark:bg-gray-800 px-6 py-4 flex items-center justify-between border-t border-gray-200 dark:border-gray-600">
        <div className="hidden sm:block text-sm text-gray-700 dark:text-gray-300">
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

function VehicleModal({ open, onClose, isCreating, isViewOnly, selectedXe }) {
  const [formData, setFormData] = useState({
    bienSo: '',
    trangThai: '',
    pinPhanTram: null,
    soKm: null,
    name: '',
    brand: '',
    model: '',
    rangeKm: null,
    topSpeedKmh: null,
    battery: '',
    price: null,
    deposit: null,
    rating: null,
    chargeTime: '',
    weightKg: null,
    dungLuongPinWh: null,
    pinTieuThuPerKm: null,
    tinhTrang: '', // Thêm trường tình trạng mới
  });

  useEffect(() => {
    if (!isCreating && selectedXe) {
      setFormData({
        bienSo: selectedXe.bienSo || '',
        trangThai: selectedXe.trangThai || '',
        pinPhanTram: selectedXe.pinPhanTram || null,
        soKm: selectedXe.soKm || null,
        name: selectedXe.name || '',
        brand: selectedXe.brand || '',
        model: selectedXe.model || '',
        rangeKm: selectedXe.rangeKm || null,
        topSpeedKmh: selectedXe.topSpeedKmh || null,
        battery: selectedXe.battery || '',
        price: selectedXe.price || null,
        deposit: selectedXe.deposit || null,
        rating: selectedXe.rating || null,
        chargeTime: selectedXe.chargeTime || '',
        weightKg: selectedXe.weightKg || null,
        dungLuongPinWh: selectedXe.dungLuongPinWh || null,
        pinTieuThuPerKm: selectedXe.pinTieuThuPerKm || null,
        tinhTrang: selectedXe.tinhTrang || '', // Thêm trường tình trạng mới
      });
    } else {
      setFormData({
        bienSo: '',
        trangThai: '',
        pinPhanTram: null,
        soKm: null,
        name: '',
        brand: '',
        model: '',
        rangeKm: null,
        topSpeedKmh: null,
        battery: '',
        price: null,
        deposit: null,
        rating: null,
        chargeTime: '',
        weightKg: null,
        dungLuongPinWh: null,
        pinTieuThuPerKm: null,
        tinhTrang: '', // Thêm trường tình trạng mới
      });
    }
  }, [isCreating, selectedXe, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: ['pinPhanTram', 'soKm', 'rangeKm', 'topSpeedKmh', 'price', 'deposit', 'rating', 'weightKg', 'dungLuongPinWh', 'pinTieuThuPerKm'].includes(name)
        ? (value === '' ? null : parseFloat(value))
        : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const dataToSend = {
      ...formData,
    };

    // Lọc bỏ các trường null hoặc undefined để tránh gửi giá trị không cần thiết
    Object.keys(dataToSend).forEach(key => {
      if (dataToSend[key] === null || dataToSend[key] === undefined) {
        delete dataToSend[key];
      }
    });

    try {
      let response;
      if (isCreating) {
        response = await fetch('http://localhost:8080/api/xe', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(dataToSend),
        });
      } else {
        response = await fetch(`http://localhost:8080/api/xe/${selectedXe.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(dataToSend),
        });
      }
      if (!response.ok) {
        const errorText = await response.text(); // Đọc nội dung phản hồi để debug
        console.error('Response error:', errorText);
        throw new Error('Failed to save vehicle');
      }
      alert(isCreating ? 'Thêm xe thành công!' : 'Cập nhật xe thành công!');
      onClose();
    } catch (error) {
      console.error('Error saving vehicle:', error);
      alert('Lỗi khi lưu xe');
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={(e) => e.currentTarget === e.target && onClose()}>
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">{isCreating ? 'Thêm xe mới' : (isViewOnly ? 'Thông tin chi tiết xe' : 'Chỉnh sửa xe')}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" aria-label="Đóng">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Biển số</label>
              <input name="bienSo" value={formData.bienSo} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white" required disabled={isViewOnly} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Trạng thái</label>
              <select name="trangThai" value={formData.trangThai} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white" required disabled={isViewOnly}>
                <option value="">Chọn trạng thái</option>
                <option value="AVAILABLE">Sẵn sàng</option>
                <option value="UNAVAILABLE">Không sẵn sàng</option>
                <option value="MAINTENANCE">Bảo trì</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Pin (%)</label>
              <input name="pinPhanTram" type="number" value={formData.pinPhanTram || ''} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white" disabled={isViewOnly} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Số km</label>
              <input name="soKm" type="number" value={formData.soKm || ''} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white" disabled={isViewOnly} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tên xe</label>
              <input name="name" value={formData.name} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white" disabled={isViewOnly} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Hãng</label>
              <input name="brand" value={formData.brand} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white" disabled={isViewOnly} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Model</label>
              <input name="model" value={formData.model} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white" disabled={isViewOnly} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tầm hoạt động (km)</label>
              <input name="rangeKm" type="number" value={formData.rangeKm || ''} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white" disabled={isViewOnly} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tốc độ tối đa (km/h)</label>
              <input name="topSpeedKmh" type="number" value={formData.topSpeedKmh || ''} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white" disabled={isViewOnly} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Battery</label>
              <input name="battery" value={formData.battery} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white" disabled={isViewOnly} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Giá thuê</label>
              <input name="price" type="number" value={formData.price || ''} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white" disabled={isViewOnly} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tiền cọc</label>
              <input name="deposit" type="number" value={formData.deposit || ''} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white" disabled={isViewOnly} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Đánh giá</label>
              <input name="rating" type="number" step="0.1" value={formData.rating || ''} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white" disabled={isViewOnly} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Thời gian sạc</label>
              <input name="chargeTime" value={formData.chargeTime} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white" disabled={isViewOnly} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Trọng lượng (kg)</label>
              <input name="weightKg" type="number" value={formData.weightKg || ''} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white" disabled={isViewOnly} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Dung lượng pin (Wh)</label>
              <input name="dungLuongPinWh" type="number" value={formData.dungLuongPinWh || ''} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white" disabled={isViewOnly} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Pin tiêu thụ/km</label>
              <input name="pinTieuThuPerKm" type="number" step="0.1" value={formData.pinTieuThuPerKm || ''} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white" disabled={isViewOnly} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tình trạng</label> {/* Thêm input cho tình trạng */}
              <input name="tinhTrang" value={formData.tinhTrang} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white" disabled={isViewOnly} />
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